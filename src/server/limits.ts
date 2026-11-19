import "server-only";
import { audit } from "./audit";
import { db } from "./db";

/**
 * Limits that survive a restart: every count lives in the database, not in memory.
 *
 * - hit(): a number of requests per address and per window, for the public forms.
 * - Locks on password sign-in, per email address typed (existing or not, so a lock tells
 *   nothing about who has an account):
 *   - LOCK_AFTER wrong passwords from one address (an IPv6 /64) within LOCK_WINDOW lock that
 *     address out of this account for LOCK_DURATION. One machine cannot lock the real person out.
 *   - LOCK_AFTER_ANY wrong passwords from all addresses together lock the account for everyone:
 *     the ceiling on guesses spread over many addresses.
 *   Each try is reserved before the password is checked (reserveTry), so a burst of parallel
 *   requests cannot all slip past the count. A passkey still signs in during a lock and ends
 *   it, and so does an admin who sets a new password or unblocks the account.
 */

export const LOCK_AFTER = 10;
export const LOCK_AFTER_ANY = 50;
export const LOCK_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
export const LOCKED_MESSAGE = "Trop de mots de passe faux pour ce compte. Réessaie dans 15 minutes, ou connecte-toi avec une clé d'accès.";

/** The source that stands for every address: an account-wide lock. */
const EVERYWHERE = "*";

let ready = false;
function conn() {
  const c = db();
  if (!ready) {
    c.exec(`
      create table if not exists rate_hit (key text not null, at integer not null);
      create index if not exists rate_hit_key_at on rate_hit (key, at);
      create table if not exists login_try (email text not null, source text not null, at integer not null);
      create index if not exists login_try_email_at on login_try (email, at);
      create index if not exists login_try_at on login_try (at);
      create table if not exists login_lock (email text not null, source text not null, until integer not null, primary key (email, source));
    `);
    ready = true;
  }
  return c;
}

const off = () => process.env.RATE_LIMIT === "off";
const normal = (email: string) => email.trim().toLowerCase();

/** Counts this request: true when it is one too many for this key in the window. */
export function hit(key: string, max: number, windowMs: number, now = Date.now()) {
  if (off()) return false;
  const c = conn();
  return c.transaction(() => {
    c.prepare("delete from rate_hit where key = ? and at <= ?").run(key, now - windowMs);
    const { n } = c.prepare("select count(*) as n from rate_hit where key = ?").get(key) as { n: number };
    // Refused requests are not stored: a robot that keeps knocking cannot push the window forward forever.
    if (n >= max) return true;
    c.prepare("insert into rate_hit (key, at) values (?, ?)").run(key, now);
    // Now and then, every old row leaves (keys that never come back would stay otherwise).
    if (Math.random() < 0.01) c.prepare("delete from rate_hit where at <= ?").run(now - 24 * 3600_000);
    return false;
  }).immediate();
}

/** The end of the lock that applies to this address from this source, or null when password sign-in is open. */
export function lockedUntil(email: string, source = EVERYWHERE, now = Date.now()) {
  if (off()) return null;
  const row = conn()
    .prepare("select max(until) as until from login_lock where email = ? and source in (?, ?) and until > ?")
    .get(normal(email), EVERYWHERE, source, now) as { until: number | null };
  return row.until;
}

export type TryResult = { ok: true; id: number } | { ok: false; until: number };

/**
 * Before the password is checked: refuses while a lock applies, otherwise counts the try as a
 * wrong one right away (settleTry takes it back if it was not). Sets the locks it reaches.
 */
export function reserveTry(email: string, source: string, headers?: Headers | null, now = Date.now()): TryResult {
  if (off()) return { ok: true, id: 0 };
  const c = conn();
  const address = normal(email);
  const result = c.transaction(() => {
    c.prepare("delete from login_try where at <= ?").run(now - LOCK_WINDOW_MS);
    c.prepare("delete from login_lock where until <= ?").run(now);
    const until = lockedUntil(address, source, now);
    if (until) return { ok: false as const, until, locked: [] as string[] };
    const id = Number(c.prepare("insert into login_try (email, source, at) values (?, ?, ?)").run(address, source, now).lastInsertRowid);
    const count = (where: string, ...args: unknown[]) => (c.prepare(`select count(*) as n from login_try where email = ? ${where}`).get(address, ...args) as { n: number }).n;
    const lock = (from: string) => c.prepare("insert into login_lock (email, source, until) values (?, ?, ?) on conflict(email, source) do update set until = excluded.until").run(address, from, now + LOCK_DURATION_MS);
    const locked: string[] = [];
    if (count("and source = ?", source) >= LOCK_AFTER) {
      lock(source);
      locked.push("adresse");
    }
    if (count("") >= LOCK_AFTER_ANY) {
      lock(EVERYWHERE);
      locked.push("toutes les adresses");
    }
    return { ok: true as const, id, locked };
  }).immediate();
  for (const portee of result.locked)
    audit({ action: "compte.verrouille", ok: false, actorEmail: address, detail: { portee, essais: portee === "adresse" ? LOCK_AFTER : LOCK_AFTER_ANY, minutes: LOCK_DURATION_MS / 60_000 }, headers });
  return result.ok ? { ok: true, id: result.id } : { ok: false, until: result.until };
}

/**
 * After the password was checked: a right one starts every count of this address again, a
 * wrong one stays counted, anything else (a malformed request, an error) is taken back.
 */
export function settleTry(email: string, id: number, outcome: "right" | "wrong" | "other") {
  if (off() || !id) return;
  if (outcome === "right") return clearLoginFailures(email);
  if (outcome === "other") conn().prepare("delete from login_try where rowid = ?").run(id);
}

/** Lifts every lock and count of this address: a right password, a passkey, or an admin who stepped in. */
export function clearLoginFailures(email: string) {
  if (off()) return;
  const c = conn();
  const address = normal(email);
  c.prepare("delete from login_try where email = ?").run(address);
  c.prepare("delete from login_lock where email = ?").run(address);
}
