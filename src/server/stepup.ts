import "server-only";
import crypto from "node:crypto";
import { symmetricDecrypt } from "better-auth/crypto";
import { audit } from "./audit";
import { db } from "./db";

/**
 * Shorter, stronger admin sessions.
 *
 * - The admin opens only with a session signed in less than ADMIN_SESSION_HOURS ago: a stolen
 *   cookie stops working for the admin long before the 30 days of a member's session.
 * - Sensitive actions (export, deletion, roles, passwords, tool access) also need a proof of
 *   presence from the last STEP_UP_MINUTES: a sign-in that recent, or the 6-digit code of the
 *   authenticator app typed again (confirmWithCode).
 */

export const ADMIN_SESSION_HOURS = 12;
export const STEP_UP_MINUTES = 10;
export const REAUTH_REQUIRED = "REAUTH_REQUIRED";
export const REAUTH_MESSAGE = "Confirme avec ton code de double authentification pour continuer.";

const MAX_TRIES = 5;
const TRY_WINDOW_MS = 5 * 60 * 1000;

export type SessionLike = { session: { token: string; createdAt: Date | string }; user: { id: string; email: string } };

let ready = false;
function conn() {
  const c = db();
  if (!ready) {
    c.exec(`
      -- Sessions (by the hash of their token) that confirmed the code recently.
      create table if not exists admin_stepup (token_hash text primary key, at integer not null);
      -- The last code step used per person: the same code never works twice.
      create table if not exists totp_last_step (user_id text primary key, step integer not null);
      -- Wrong codes per session, to stop guessing.
      create table if not exists stepup_failure (token_hash text not null, at integer not null);
    `);
    ready = true;
  }
  return c;
}

const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const ms = (d: Date | string) => (d instanceof Date ? d.getTime() : Date.parse(d));

/** Signed in recently enough to use the admin at all. */
export const adminSessionFresh = (s: SessionLike, now = Date.now()) => now - ms(s.session.createdAt) < ADMIN_SESSION_HOURS * 3600_000;

/** Proved presence in the last minutes: a fresh sign-in or the code typed again. */
export function recentlyConfirmed(s: SessionLike, now = Date.now()) {
  const window = STEP_UP_MINUTES * 60_000;
  if (now - ms(s.session.createdAt) < window) return true;
  const row = conn().prepare("select at from admin_stepup where token_hash = ?").get(hash(s.session.token)) as { at: number } | undefined;
  return !!row && now - row.at < window;
}

// ---- TOTP (RFC 6238), the same codes as the authenticator app shows for this account

function base32(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of input.replace(/=+$/, "").toUpperCase()) {
    const v = alphabet.indexOf(c);
    if (v < 0) throw new Error("base32");
    bits += v.toString(2).padStart(5, "0");
  }
  return Buffer.from((bits.match(/.{8}/g) ?? []).map((b) => parseInt(b, 2)));
}

function codeAt(key: Buffer, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

/** The step a code matches (now, or one period before or after for clock drift), or null. */
export function matchingStep(key: Buffer, code: string, now = Date.now()) {
  const current = Math.floor(now / 30_000);
  for (const step of [current, current - 1, current + 1]) {
    const expected = codeAt(key, step);
    if (code.length === 6 && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return step;
  }
  return null;
}

async function totpKey(userId: string, secretConfig: Parameters<typeof symmetricDecrypt>[0]["key"]) {
  const row = db().prepare('select secret from "twoFactor" where "userId" = ?').get(userId) as { secret: string } | undefined;
  if (!row) return null;
  const secret = await symmetricDecrypt({ key: secretConfig, data: row.secret });
  // Secrets imported from elsewhere are stored as "base32:<secret>", generated ones as they are.
  return secret.startsWith("base32:") ? base32(secret.slice(7)) : Buffer.from(secret);
}

export type ConfirmResult = { ok: true } | { ok: false; error: string; status: number };

/** Checks the code of the authenticator app and marks this session as confirmed for a few minutes. */
export async function confirmWithCode(s: SessionLike, rawCode: unknown, secretConfig: Parameters<typeof symmetricDecrypt>[0]["key"], headers?: Headers): Promise<ConfirmResult> {
  const c = conn();
  const token = hash(s.session.token);
  const now = Date.now();
  c.prepare("delete from stepup_failure where at < ?").run(now - TRY_WINDOW_MS);
  const tries = (c.prepare("select count(*) as n from stepup_failure where token_hash = ?").get(token) as { n: number }).n;
  const log = (ok: boolean, why?: string) =>
    audit({ action: ok ? "admin.confirmation" : "admin.confirmation_echouee", ok, actorId: s.user.id, actorEmail: s.user.email, detail: why ? { erreur: why } : null, headers });
  if (tries >= MAX_TRIES) {
    log(false, "TOO_MANY_ATTEMPTS");
    return { ok: false, error: "Trop de codes faux. Attends quelques minutes.", status: 429 };
  }
  const code = typeof rawCode === "string" ? rawCode.replace(/\s/g, "") : "";
  const key = await totpKey(s.user.id, secretConfig);
  if (!key) return { ok: false, error: "La double authentification n'est pas activée sur ce compte.", status: 400 };
  const step = /^\d{6}$/.test(code) ? matchingStep(key, code, now) : null;
  const last = c.prepare("select step from totp_last_step where user_id = ?").get(s.user.id) as { step: number } | undefined;
  if (step === null || (last && step <= last.step)) {
    c.prepare("insert into stepup_failure (token_hash, at) values (?, ?)").run(token, now);
    log(false, step === null ? "INVALID_CODE" : "CODE_ALREADY_USED");
    return { ok: false, error: step === null ? "Ce code n'est pas le bon." : "Ce code a déjà servi : attends le suivant.", status: 400 };
  }
  c.transaction(() => {
    c.prepare("insert into totp_last_step (user_id, step) values (?, ?) on conflict(user_id) do update set step = excluded.step").run(s.user.id, step);
    c.prepare("insert into admin_stepup (token_hash, at) values (?, ?) on conflict(token_hash) do update set at = excluded.at").run(token, now);
    c.prepare("delete from stepup_failure where token_hash = ?").run(token);
  })();
  log(true);
  return { ok: true };
}
