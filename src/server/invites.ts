import "server-only";
import crypto from "node:crypto";
import { db } from "./db";

/**
 * Sign-up by invitation. While the service is not open to everyone, an account is created only
 * from an invitation link that an admin made for one e-mail address:
 *
 * - the link carries a random token; only its SHA-256 is stored, so the database alone opens nothing;
 * - it works once, for 7 days, and an admin can withdraw it before;
 * - the account takes the address of the invitation, never one typed on the page. The link reaches
 *   that address (the admin sends it there), so opening it is the proof the address is the person's.
 */

export const INVITE_DAYS = 7;
const DAY = 24 * 3600_000;

export type Invite = {
  id: string;
  email: string;
  name: string;
  created_by: string;
  created_at: number;
  expires_at: number;
  used_at: number | null;
  used_by: string | null;
  revoked_at: number | null;
};

let ready = false;
function conn() {
  const c = db();
  if (!ready) {
    c.exec(`
      create table if not exists invitation (
        id text primary key,
        token_hash text not null unique,
        email text not null,
        name text not null default '',
        created_by text not null,
        created_at integer not null,
        expires_at integer not null,
        used_at integer,
        used_by text,
        revoked_at integer
      );
      create index if not exists invitation_email on invitation (email);
    `);
    ready = true;
  }
  return c;
}

const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const COLUMNS = "id, email, name, created_by, created_at, expires_at, used_at, used_by, revoked_at";
export const normalEmail = (email: string) => email.trim().toLowerCase();
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;

/** Makes a new invitation, and withdraws the open ones for the same address. The token is shown once. */
export function createInvite(input: { email: string; name?: string; createdBy: string }, now = Date.now()) {
  const email = normalEmail(input.email);
  if (!validEmail(email)) throw new Error("Cette adresse e-mail n'est pas valide.");
  const token = crypto.randomBytes(32).toString("base64url");
  const id = crypto.randomUUID();
  const c = conn();
  c.transaction(() => {
    c.prepare("update invitation set revoked_at = ? where email = ? and used_at is null and revoked_at is null").run(now, email);
    c.prepare("insert into invitation (id, token_hash, email, name, created_by, created_at, expires_at) values (?, ?, ?, ?, ?, ?, ?)").run(id, hash(token), email, (input.name ?? "").trim().slice(0, 80), input.createdBy, now, now + INVITE_DAYS * DAY);
  })();
  return { id, token, email, expiresAt: now + INVITE_DAYS * DAY };
}

/** The invitation this token opens, while it is still valid, or null. */
export function findInvite(token: unknown, now = Date.now()): Invite | null {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const row = conn().prepare(`select ${COLUMNS} from invitation where token_hash = ?`).get(hash(token)) as Invite | undefined;
  return row && row.used_at == null && row.revoked_at == null && row.expires_at > now ? row : null;
}

/**
 * Takes the invitation for one sign-up: true for exactly one caller, even when the same link is
 * sent twice at once. Give it back with releaseInvite when the account could not be made after all.
 */
export function claimInvite(id: string, now = Date.now()) {
  return conn().prepare("update invitation set used_at = ? where id = ? and used_at is null and revoked_at is null and expires_at > ?").run(now, id, now).changes === 1;
}

export function releaseInvite(id: string) {
  conn().prepare("update invitation set used_at = null where id = ? and used_by is null").run(id);
}

export function inviteUsedBy(id: string, userId: string) {
  conn().prepare("update invitation set used_by = ? where id = ?").run(userId, id);
}

/** Withdraws an invitation that was not used yet. */
export function revokeInvite(id: string, now = Date.now()) {
  return conn().prepare("update invitation set revoked_at = ? where id = ? and used_at is null and revoked_at is null").run(now, id).changes === 1;
}

/** The invitations still waiting, newest first, for the admin. */
export function listOpenInvites(now = Date.now()) {
  return conn().prepare(`select ${COLUMNS} from invitation where used_at is null and revoked_at is null and expires_at > ? order by created_at desc`).all(now) as Invite[];
}

export const inviteById = (id: string) => conn().prepare(`select ${COLUMNS} from invitation where id = ?`).get(id) as Invite | undefined;
