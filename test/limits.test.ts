import { beforeAll, describe, expect, test, vi } from "vitest";
import { Browser, freshEnv } from "./helpers";

freshEnv();
// The limits are on only in production by default: these tests switch them on.
process.env.RATE_LIMIT = "on";

const PASSWORD = "un-bon-mot-de-passe";
type Auth = Awaited<ReturnType<typeof import("@/server/auth").getAuth>>;

/** A new copy of the server modules on the same database, as after a restart of the service. */
async function restart() {
  delete (globalThis as { __compteAuth?: unknown }).__compteAuth;
  vi.resetModules();
  const server = await import("@/server/auth");
  return server.getAuth();
}

let auth: Auth;
beforeAll(async () => {
  const server = await import("@/server/auth");
  const { hashPassword } = await import("better-auth/crypto");
  auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  await server.addPerson(auth, { name: "Clara", email: "clara@exemple.ch", role: "user", passwordHash: hash });
  await server.addPerson(auth, { name: "Dan", email: "dan@exemple.ch", role: "user", passwordHash: hash });
  await server.addPerson(auth, { name: "Eve", email: "eve@exemple.ch", role: "user", passwordHash: hash });
});

const signIn = (a: Auth, email: string, password: string, ip: string) =>
  new Browser(a.handler).fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, password }),
  });

describe("the address of the person", async () => {
  const { clientIp, limitKey } = await import("@/server/ip");
  const h = (init: Record<string, string>) => new Headers(init);

  test("is the last address of X-Forwarded-For, the one Caddy wrote", () => {
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.7" }))).toBe("203.0.113.7");
    // A client that writes its own header cannot pick its address: Caddy's comes last.
    expect(clientIp(h({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" }))).toBe("203.0.113.7");
    expect(clientIp(h({ "x-forwarded-for": "::ffff:198.51.100.2" }))).toBe("198.51.100.2");
  });

  test("never comes from X-Real-IP or from garbage", () => {
    expect(clientIp(h({ "x-real-ip": "1.2.3.4" }))).toBeNull();
    expect(clientIp(h({ "x-forwarded-for": "pas-une-adresse" }))).toBeNull();
    expect(clientIp(h({ "x-forwarded-for": "1.2.3.4, " }))).toBe("1.2.3.4");
    expect(clientIp(null)).toBeNull();
  });

  test("an IPv6 counts by its /64, so a new address in the same network does not get fresh tries", () => {
    expect(limitKey("2001:db8:1:2::1")).toBe(limitKey("2001:db8:1:2:ffff::9"));
    expect(limitKey("2001:db8:1:2::1")).not.toBe(limitKey("2001:db8:1:3::1"));
    expect(limitKey("203.0.113.7")).toBe("203.0.113.7");
    expect(limitKey(null)).toBe("sans-adresse");
  });
});

describe("the limits of the public forms", () => {
  test("hold after a restart", async () => {
    const { hit } = await import("@/server/limits");
    const now = Date.now();
    for (let i = 0; i < 3; i++) expect(hit("test|203.0.113.9", 3, 60_000, now + i)).toBe(false);
    expect(hit("test|203.0.113.9", 3, 60_000, now + 3)).toBe(true);
    vi.resetModules();
    const again = await import("@/server/limits");
    expect(again.hit("test|203.0.113.9", 3, 60_000, now + 4)).toBe(true);
    // Another address is not affected, and the window ends.
    expect(again.hit("test|203.0.113.10", 3, 60_000, now + 4)).toBe(false);
    expect(again.hit("test|203.0.113.9", 3, 60_000, now + 60_001)).toBe(false);
  });
});

describe("sign-in tries per address", () => {
  test("the 6th try in a minute from one address is refused, even after a restart", async () => {
    for (let i = 0; i < 5; i++) expect((await signIn(auth, "dan@exemple.ch", "faux-mot-de-passe", "198.51.100.50")).status).toBe(401);
    expect((await signIn(auth, "dan@exemple.ch", PASSWORD, "198.51.100.50")).status).toBe(429);
    // The count lives in the database file, not in the memory of the process.
    const { db } = await import("@/server/db");
    const row = db().prepare('select count from "rateLimit" where key = ?').get("198.51.100.50|/sign-in/email") as { count: number } | undefined;
    expect(row?.count).toBe(5);
    auth = await restart();
    expect((await signIn(auth, "dan@exemple.ch", PASSWORD, "198.51.100.50")).status).toBe(429);
    // The person, from another address, is not blocked by someone else's tries.
    expect((await signIn(auth, "dan@exemple.ch", PASSWORD, "198.51.100.51")).status).toBe(200);
  });
});

describe("the locks of an account", () => {
  const ip = (n: number) => `192.0.${2 + Math.floor(n / 250)}.${(n % 250) + 1}`;

  test("one address that guesses 10 times is locked out of that account, the real person is not", async () => {
    const { reserveTry, settleTry, lockedUntil, LOCK_AFTER, LOCK_DURATION_MS } = await import("@/server/limits");
    const now = Date.now();
    for (let i = 0; i < LOCK_AFTER; i++) {
      const t = reserveTry("frank@exemple.ch", "203.0.113.66", null, now + i);
      expect(t.ok).toBe(true);
      if (t.ok) settleTry("frank@exemple.ch", t.id, "wrong");
    }
    expect(reserveTry("Frank@Exemple.ch", "203.0.113.66", null, now + 20).ok).toBe(false);
    expect(lockedUntil("frank@exemple.ch", "203.0.113.66", now + 20)).not.toBeNull();
    // Another address, the person's own, is still let in.
    expect(reserveTry("frank@exemple.ch", "198.51.100.77", null, now + 21).ok).toBe(true);
    // And the lock of the guessing address ends after 15 minutes.
    expect(lockedUntil("frank@exemple.ch", "203.0.113.66", now + LOCK_DURATION_MS + 30)).toBeNull();
  });

  test("a try that was neither right nor wrong is taken back", async () => {
    const { reserveTry, settleTry, LOCK_AFTER } = await import("@/server/limits");
    const now = Date.now();
    for (let i = 0; i < LOCK_AFTER + 5; i++) {
      const t = reserveTry("gina@exemple.ch", "203.0.113.70", null, now + i);
      expect(t.ok).toBe(true);
      if (t.ok) settleTry("gina@exemple.ch", t.id, "other");
    }
  });

  test("50 guesses spread over many addresses lock the account for everyone, even fired all at once", async () => {
    const { LOCK_AFTER_ANY } = await import("@/server/limits");
    // Every request leaves at the same moment: the count must not let them all through.
    const answers = await Promise.all(Array.from({ length: LOCK_AFTER_ANY + 10 }, (_, i) => signIn(auth, "clara@exemple.ch", "faux-mot-de-passe", ip(i))));
    const statuses = answers.map((r) => r.status);
    expect(statuses.filter((s) => s === 401)).toHaveLength(LOCK_AFTER_ANY);
    expect(statuses.filter((s) => s === 429)).toHaveLength(10);

    // The right password, from a new address, waits too, and a restart does not open the lock.
    const refused = await signIn(auth, "clara@exemple.ch", PASSWORD, ip(400));
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { code?: string }).code).toBe("ACCOUNT_LOCKED");
    auth = await restart();
    expect((await signIn(auth, "clara@exemple.ch", PASSWORD, ip(401))).status).toBe(429);

    const { listAudit } = await import("@/server/audit");
    const lock = listAudit({ action: "compte.verrouille", actor: "clara@exemple.ch" });
    expect(lock.map((r) => r.detail?.portee)).toEqual(["toutes les adresses"]);
    const refusals = listAudit({ action: "connexion.echouee", actor: "clara@exemple.ch" }).filter((r) => r.detail?.erreur === "ACCOUNT_LOCKED");
    expect(refusals).toHaveLength(12);
  });

  test("an admin who unblocks the account lifts the lock", async () => {
    const server = await import("@/server/auth");
    const { db } = await import("@/server/db");
    const { hashPassword } = await import("better-auth/crypto");
    await server.addPerson(auth, { name: "Ada", email: "ada@exemple.ch", role: "admin", passwordHash: await hashPassword(PASSWORD) });
    const admin = new Browser(auth.handler);
    const res = await admin.fetch("/api/auth/sign-in/email", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip(500) }, body: JSON.stringify({ email: "ada@exemple.ch", password: PASSWORD }) });
    expect(res.status).toBe(200);
    db().prepare('update "user" set "twoFactorEnabled" = 1 where email = ?').run("ada@exemple.ch");
    const clara = db().prepare('select id from "user" where email = ?').get("clara@exemple.ch") as { id: string };
    expect((await admin.post("/api/auth/admin/unban-user", { userId: clara.id })).status).toBe(200);
    expect((await signIn(auth, "clara@exemple.ch", PASSWORD, ip(402))).status).toBe(200);
  });

  test("an unknown address locks the same way, so a lock tells nothing about who has an account", async () => {
    const { reserveTry, settleTry, LOCK_AFTER_ANY } = await import("@/server/limits");
    const now = Date.now();
    for (let i = 0; i < LOCK_AFTER_ANY; i++) {
      const t = reserveTry("personne@exemple.ch", ip(600 + i), null, now + i);
      if (t.ok) settleTry("personne@exemple.ch", t.id, "wrong");
    }
    const refused = await signIn(auth, "personne@exemple.ch", "faux-mot-de-passe", ip(700));
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { code?: string }).code).toBe("ACCOUNT_LOCKED");
  });

  test("a right password starts the count again", async () => {
    for (let i = 0; i < 9; i++) expect((await signIn(auth, "eve@exemple.ch", "faux-mot-de-passe", ip(800 + i))).status).toBe(401);
    expect((await signIn(auth, "eve@exemple.ch", PASSWORD, ip(820))).status).toBe(200);
    const { db } = await import("@/server/db");
    expect((db().prepare("select count(*) as n from login_try where email = ?").get("eve@exemple.ch") as { n: number }).n).toBe(0);
  });
});
