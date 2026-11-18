import crypto from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";
import { Browser, freshEnv } from "./helpers";

freshEnv();

type Auth = Awaited<ReturnType<typeof import("@/server/auth").getAuth>>;
let auth: Auth;
let A: typeof import("@/server/audit");
let raw: () => import("better-sqlite3").Database;
const PASSWORD = "un-bon-mot-de-passe";

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { db } = await import("@/server/db");
  const { hashPassword } = await import("better-auth/crypto");
  A = await import("@/server/audit");
  raw = db;
  auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  await server.addPerson(auth, { name: "Ada Admin", email: "ada@exemple.ch", role: "admin", passwordHash: hash });
  await server.addPerson(auth, { name: "Bob Membre", email: "bob@exemple.ch", role: "user", passwordHash: hash });
});

const last = () => A.listAudit({ limit: 1 })[0];

/** The 6-digit code an authenticator app shows now (RFC 6238). */
function totp(base32: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

describe("the audit log records security events", () => {
  test("a successful sign-in, with the address and the device", async () => {
    const browser = new Browser(auth.handler);
    const res = await browser.fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7, 10.0.0.1", "user-agent": "Mozilla/5.0 (Macintosh; Mac OS X) Safari/605" },
      body: JSON.stringify({ email: "bob@exemple.ch", password: PASSWORD }),
    });
    expect(res.status).toBe(200);
    const row = last();
    expect(row).toMatchObject({ action: "connexion.reussie", ok: true, actorEmail: "bob@exemple.ch", ip: "203.0.113.7" });
    expect(row.detail).toMatchObject({ methode: "mot de passe" });
    expect(row.userAgent).toContain("Safari");
  });

  test("a wrong password, without ever writing the password", async () => {
    const browser = new Browser(auth.handler);
    const res = await browser.post("/api/auth/sign-in/email", { email: "Bob@Exemple.ch", password: "pas-le-bon-mot-de-passe" });
    expect(res.status).toBe(401);
    const row = last();
    expect(row).toMatchObject({ action: "connexion.echouee", ok: false, actorEmail: "bob@exemple.ch" });
    expect(JSON.stringify(row)).not.toContain("pas-le-bon");
  });

  test("an admin route refused to an admin without a second factor", async () => {
    const browser = new Browser(auth.handler);
    await browser.post("/api/auth/sign-in/email", { email: "ada@exemple.ch", password: PASSWORD });
    expect((await browser.fetch("/api/auth/admin/list-users")).status).toBe(403);
    expect(last()).toMatchObject({ action: "admin.refus", ok: false, actorEmail: "ada@exemple.ch", target: "/admin/list-users" });
  });

  test("a role changed by a trusted admin, with who and what", async () => {
    const browser = new Browser(auth.handler);
    await browser.post("/api/auth/sign-in/email", { email: "ada@exemple.ch", password: PASSWORD });
    raw().prepare('update "user" set "twoFactorEnabled" = 1 where email = ?').run("ada@exemple.ch");
    const bob = raw().prepare('select id from "user" where email = ?').get("bob@exemple.ch") as { id: string };
    const res = await browser.post("/api/auth/admin/set-role", { userId: bob.id, role: "admin" });
    expect(res.status).toBe(200);
    expect(last()).toMatchObject({ action: "admin.role_change", ok: true, actorEmail: "ada@exemple.ch", target: bob.id, detail: { role: "admin" } });
  });
});

describe("the second factor, from switching it on to signing in with it", () => {
  test("switching it on is not mistaken for a sign-in, and the sign-in shows both steps", async () => {
    const { hashPassword } = await import("better-auth/crypto");
    const server = await import("@/server/auth");
    await server.addPerson(auth, { name: "Chloé", email: "chloe@exemple.ch", role: "user", passwordHash: await hashPassword(PASSWORD) });
    const browser = new Browser(auth.handler);
    await browser.post("/api/auth/sign-in/email", { email: "chloe@exemple.ch", password: PASSWORD });
    const enabled = (await (await browser.post("/api/auth/two-factor/enable", { password: PASSWORD })).json()) as { totpURI: string };
    const secret = new URL(enabled.totpURI).searchParams.get("secret")!;
    expect(last().action).toBe("2fa.demarree");
    expect((await browser.post("/api/auth/two-factor/verify-totp", { code: totp(secret) })).status).toBe(200);
    expect(last()).toMatchObject({ action: "2fa.activee", ok: true, actorEmail: "chloe@exemple.ch" });

    const again = new Browser(auth.handler);
    const first = (await (await again.post("/api/auth/sign-in/email", { email: "chloe@exemple.ch", password: PASSWORD })).json()) as { twoFactorRedirect?: boolean };
    expect(first.twoFactorRedirect).toBe(true);
    expect(last()).toMatchObject({ action: "connexion.2fa_demandee", ok: true });
    expect((await again.post("/api/auth/two-factor/verify-totp", { code: "000000" === totp(secret) ? "111111" : "000000" })).status).toBe(401);
    expect(last()).toMatchObject({ action: "connexion.echouee", ok: false, detail: { methode: "code 2FA" } });
    expect((await again.post("/api/auth/two-factor/verify-totp", { code: totp(secret) })).status).toBe(200);
    expect(last()).toMatchObject({ action: "connexion.reussie", ok: true, actorEmail: "chloe@exemple.ch", detail: { methode: "code 2FA" } });
  });
});

describe("the audit log cannot be rewritten", () => {
  test("the database refuses to change or delete a recent line", () => {
    const seq = last().seq;
    expect(() => raw().prepare("update audit_log set actor_email = 'x' where seq = ?").run(seq)).toThrow(/append-only/);
    expect(() => raw().prepare("delete from audit_log where seq = ?").run(seq)).toThrow(/kept/);
  });

  test("the chain is intact, and a line forged in the file breaks it", () => {
    expect(A.verifyAudit()).toMatchObject({ ok: true });
    const victim = A.listAudit({ limit: 1000 }).at(-1)!;
    // Someone with the database file but not AUTH_SECRET: drops the guard, edits, puts it back.
    raw().exec("drop trigger audit_log_no_update");
    raw().prepare("update audit_log set actor_email = 'quelquun@ailleurs.ch' where seq = ?").run(victim.seq);
    expect(A.verifyAudit()).toEqual({ ok: false, rows: expect.any(Number), brokenAt: victim.seq });
    raw().prepare("update audit_log set actor_email = ? where seq = ?").run(victim.actorEmail, victim.seq);
    expect(A.verifyAudit()).toMatchObject({ ok: true });
  });

  test("filters by family, person and failures", () => {
    expect(A.listAudit({ action: "connexion" }).every((r) => r.action.startsWith("connexion"))).toBe(true);
    expect(A.listAudit({ actor: "BOB@exemple.ch" }).every((r) => r.actorEmail === "bob@exemple.ch")).toBe(true);
    expect(A.listAudit({ failures: true }).every((r) => !r.ok)).toBe(true);
    // A % in the filter is a character, not a wildcard.
    expect(A.listAudit({ action: "%" })).toEqual([]);
  });
});
