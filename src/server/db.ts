import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const dataDir = () => path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? "./data");

const globalForDb = globalThis as unknown as { __compteDb?: { dir: string; conn: Database.Database } };

/**
 * One SQLite file for everything: the tables of Better Auth (people, sessions, passkeys,
 * OpenID Connect clients and tokens) and ours (who may open which tool).
 */
export function db() {
  const dir = dataDir();
  if (globalForDb.__compteDb?.dir === dir) return globalForDb.__compteDb.conn;
  fs.mkdirSync(dir, { recursive: true });
  const conn = new Database(path.join(dir, "compte.db"));
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");
  conn.exec(`
    -- Members allowed to open a tool with their account. Admins always may.
    create table if not exists tool_access (
      tool text not null,
      user_id text not null,
      primary key (tool, user_id)
    );
  `);
  globalForDb.__compteDb = { dir, conn };
  return conn;
}

// ---- Who may open which tool

type Person = { id: string; role?: string | null; twoFactorEnabled?: boolean | null };

export const isAdmin = (person: Person) => person.role === "admin";

/**
 * May this person use the admin (CRM, people, tool access)? An admin role is not enough:
 * the account must also be protected by a second factor, so a leaked password alone opens nothing.
 */
export const isTrustedAdmin = (person: Person) => isAdmin(person) && person.twoFactorEnabled === true;

/** The admin's account still needs its second factor before the admin opens. */
export const adminNeedsTwoFactor = (person: Person) => isAdmin(person) && !isTrustedAdmin(person);

export function mayOpenTool(tool: string, person: Person) {
  if (isAdmin(person)) return true;
  return !!db().prepare("select 1 from tool_access where tool = ? and user_id = ?").get(tool, person.id);
}

/** tool id → ids of the members it is open to (admins are not listed: they always may). */
export function accessByTool() {
  const rows = db().prepare("select tool, user_id from tool_access").all() as { tool: string; user_id: string }[];
  const map: Record<string, string[]> = {};
  for (const r of rows) (map[r.tool] ??= []).push(r.user_id);
  return map;
}

export function setToolAccess(tool: string, userId: string, allowed: boolean) {
  if (allowed) db().prepare("insert or ignore into tool_access (tool, user_id) values (?, ?)").run(tool, userId);
  else db().prepare("delete from tool_access where tool = ? and user_id = ?").run(tool, userId);
}

export const forgetPerson = (userId: string) => db().prepare("delete from tool_access where user_id = ?").run(userId);
