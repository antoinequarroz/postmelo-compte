import "server-only";
import crypto from "node:crypto";
import { db } from "./db";
import { clientIp } from "./ip";
import { derivedKey } from "./secret";

/**
 * The audit log: who signed in, who failed, who changed, deleted or exported what.
 *
 * Append-only: SQLite triggers refuse every UPDATE, and every DELETE of a row younger than the
 * retention. Each row is chained to the previous one by an HMAC keyed from AUTH_SECRET, so a row
 * changed, removed or inserted directly in the database file breaks the chain (verifyAudit).
 */

export const RETENTION_DAYS = 365;

export type AuditInput = {
  action: string;
  ok?: boolean;
  actorId?: string | null;
  actorEmail?: string | null;
  target?: string | null;
  detail?: Record<string, unknown> | null;
  headers?: Headers | null;
};

export type AuditRow = {
  seq: number;
  at: string;
  action: string;
  ok: boolean;
  actorId: string | null;
  actorEmail: string | null;
  target: string | null;
  detail: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
};

type Stored = {
  seq: number;
  at: string;
  action: string;
  ok: number;
  actor_id: string | null;
  actor_email: string | null;
  target: string | null;
  detail: string | null;
  ip: string | null;
  user_agent: string | null;
  prev: string;
  hash: string;
};

const GENESIS = "genesis";
let ready = false;

function conn() {
  const c = db();
  if (!ready) {
    c.exec(`
      create table if not exists audit_log (
        seq integer primary key autoincrement,
        at text not null,
        action text not null,
        ok integer not null,
        actor_id text,
        actor_email text,
        target text,
        detail text,
        ip text,
        user_agent text,
        prev text not null,
        hash text not null
      );
      create index if not exists audit_log_at on audit_log (at);
      create index if not exists audit_log_actor on audit_log (actor_id);
      create index if not exists audit_log_action on audit_log (action);
      create trigger if not exists audit_log_no_update before update on audit_log
        begin select raise(abort, 'audit_log is append-only'); end;
      create trigger if not exists audit_log_no_early_delete before delete on audit_log
        when old.at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-${RETENTION_DAYS} days')
        begin select raise(abort, 'audit_log rows are kept ${RETENTION_DAYS} days'); end;
    `);
    ready = true;
  }
  return c;
}

/** The fields a row's HMAC covers, in a fixed order. */
const sign = (prev: string, r: Omit<Stored, "seq" | "prev" | "hash">) =>
  crypto
    .createHmac("sha256", derivedKey("audit-log"))
    .update(JSON.stringify([prev, r.at, r.action, r.ok, r.actor_id, r.actor_email, r.target, r.detail, r.ip, r.user_agent]))
    .digest("hex");

const cut = (v: string | null | undefined, max: number) => (v ? v.slice(0, max) : null);

/** Writes one line. Never throws: an audit failure is reported in the server log, the request goes on. */
export function audit(input: AuditInput) {
  try {
    const c = conn();
    const row = {
      at: new Date().toISOString(),
      action: input.action.slice(0, 80),
      ok: input.ok === false ? 0 : 1,
      actor_id: cut(input.actorId, 120),
      actor_email: cut(input.actorEmail?.toLowerCase(), 200),
      target: cut(input.target, 300),
      detail: input.detail ? JSON.stringify(input.detail).slice(0, 4000) : null,
      ip: cut(clientIp(input.headers), 64),
      user_agent: cut(input.headers?.get("user-agent"), 300),
    };
    c.transaction(() => {
      const last = c.prepare("select hash from audit_log order by seq desc limit 1").get() as { hash: string } | undefined;
      const prev = last?.hash ?? GENESIS;
      c.prepare(
        "insert into audit_log (at, action, ok, actor_id, actor_email, target, detail, ip, user_agent, prev, hash) values (@at, @action, @ok, @actor_id, @actor_email, @target, @detail, @ip, @user_agent, @prev, @hash)",
      ).run({ ...row, prev, hash: sign(prev, row) });
    }).immediate();
    // Now and then, rows past the retention leave (the triggers allow nothing younger).
    if (Math.random() < 0.002) purgeAudit();
  } catch (e) {
    console.error("audit", input.action, e);
  }
}

/** Removes the rows older than the retention. The oldest row left keeps its link: it becomes the anchor. */
export function purgeAudit() {
  conn().prepare(`delete from audit_log where at <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-${RETENTION_DAYS} days')`).run();
}

/** Walks the whole chain: ok, or the first row that does not match what was written. */
export function verifyAudit(): { ok: true; rows: number } | { ok: false; rows: number; brokenAt: number } {
  const rows = conn().prepare("select * from audit_log order by seq").all() as Stored[];
  let prev: string | null = null;
  for (const r of rows) {
    // The first row left may follow purged ones: its own "prev" is the anchor.
    const expectedPrev: string = prev ?? r.prev;
    if (r.prev !== expectedPrev || sign(r.prev, r) !== r.hash) return { ok: false, rows: rows.length, brokenAt: r.seq };
    prev = r.hash;
  }
  return { ok: true, rows: rows.length };
}

const toRow = (r: Stored): AuditRow => ({
  seq: r.seq,
  at: r.at,
  action: r.action,
  ok: r.ok === 1,
  actorId: r.actor_id,
  actorEmail: r.actor_email,
  target: r.target,
  detail: r.detail ? (JSON.parse(r.detail) as Record<string, unknown>) : null,
  ip: r.ip,
  userAgent: r.user_agent,
});

/** The latest lines, newest first, optionally for one family of actions, one person or failures only. */
export function listAudit(filter: { action?: string; actor?: string; failures?: boolean; limit?: number } = {}) {
  const where: string[] = [];
  const args: unknown[] = [];
  if (filter.action) {
    where.push("action like ? escape '\\'");
    args.push(filter.action.replace(/[\\%_]/g, (m) => "\\" + m) + "%");
  }
  if (filter.actor) {
    where.push("(actor_id = ? or actor_email = ?)");
    args.push(filter.actor, filter.actor.toLowerCase());
  }
  if (filter.failures) where.push("ok = 0");
  const limit = Math.min(Math.max(filter.limit ?? 200, 1), 1000);
  const sql = `select * from audit_log ${where.length ? "where " + where.join(" and ") : ""} order by seq desc limit ${limit}`;
  return (conn().prepare(sql).all(...args) as Stored[]).map(toRow);
}
