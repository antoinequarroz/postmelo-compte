import "server-only";
import { audit } from "./audit";
import { db } from "./db";

/**
 * Limits that survive a restart: every count lives in the database, not in memory.
 *
 * - hit(): a number of requests per address and per window, for the public forms.
 * - Account lock: after LOCK_AFTER wrong passwords on one email address within LOCK_WINDOW,
 *   password sign-in for that address is refused for LOCK_DURATION, whatever address the
 *   attempts come from. The count is kept per email typed, existing or not, so a lock tells
 *   nothing about whether an account exists. A passkey still signs in during a lock.
 */

export const LOCK_AFTER = 10;
export const LOCK_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
export const LOCKED_MESSAGE = "Trop de mots de passe faux pour ce compte. Réessaie dans 15 minutes, ou connecte-toi avec une clé d'accès.";

let ready = false;
function conn() {
  const c = db();
  if (!ready) {
    c.exec(`
      create table if not exists rate_hit (key text not null, at integer not null);
      create index if not exists rate_hit_key_at on rate_hit (key, at);
      create table if not exists login_failure (email text not null, at integer not null);
      create index if not exists login_failure_email_at on login_failure (email, at);
      create table if not exists account_lock (email text primary key, until integer not null);
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

/** The end of the lock on this address, or null when password sign-in is open. */
export function lockedUntil(email: string, now = Date.now()) {
  if (off()) return null;
  const row = conn().prepare("select until from account_lock where email = ?").get(normal(email)) as { until: number } | undefined;
  return row && row.until > now ? row.until : null;
}

/** A wrong password for this address. Locks it at the LOCK_AFTER-th within the window; true when it just locked. */
export function recordLoginFailure(email: string, headers?: Headers | null, now = Date.now()) {
  if (off()) return false;
  const c = conn();
  const address = normal(email);
  if (!address) return false;
  const locked = c.transaction(() => {
    c.prepare("delete from login_failure where at <= ?").run(now - LOCK_WINDOW_MS);
    c.prepare("insert into login_failure (email, at) values (?, ?)").run(address, now);
    const { n } = c.prepare("select count(*) as n from login_failure where email = ?").get(address) as { n: number };
    if (n < LOCK_AFTER) return false;
    c.prepare("insert into account_lock (email, until) values (?, ?) on conflict(email) do update set until = excluded.until").run(address, now + LOCK_DURATION_MS);
    c.prepare("delete from login_failure where email = ?").run(address);
    return true;
  }).immediate();
  if (locked) audit({ action: "compte.verrouille", ok: false, actorEmail: address, detail: { essais: LOCK_AFTER, minutes: LOCK_DURATION_MS / 60_000 }, headers });
  return locked;
}

/** A right password: the count for this address starts again. */
export function clearLoginFailures(email: string) {
  if (off()) return;
  const c = conn();
  const address = normal(email);
  c.prepare("delete from login_failure where email = ?").run(address);
  c.prepare("delete from account_lock where email = ?").run(address);
}
