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

describe("the lock of an account", () => {
  test("10 wrong passwords from 10 addresses lock password sign-in, even with the right one", async () => {
    for (let i = 0; i < 10; i++) expect((await signIn(auth, "clara@exemple.ch", "faux-mot-de-passe", `192.0.2.${10 + i}`)).status).toBe(401);
    const refused = await signIn(auth, "clara@exemple.ch", PASSWORD, "192.0.2.99");
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { code?: string }).code).toBe("ACCOUNT_LOCKED");
    // A restart does not open it.
    auth = await restart();
    expect((await signIn(auth, "clara@exemple.ch", PASSWORD, "192.0.2.98")).status).toBe(429);

    const { listAudit } = await import("@/server/audit");
    const lock = listAudit({ action: "compte.verrouille" });
    expect(lock).toHaveLength(1);
    expect(lock[0].actorEmail).toBe("clara@exemple.ch");
    // Each refused try during the lock is written once.
    const refusals = listAudit({ action: "connexion.echouee", actor: "clara@exemple.ch" }).filter((r) => r.detail?.erreur === "ACCOUNT_LOCKED");
    expect(refusals).toHaveLength(2);
  });

  test("the lock ends after 15 minutes", async () => {
    const { lockedUntil, LOCK_DURATION_MS } = await import("@/server/limits");
    const until = lockedUntil("Clara@Exemple.ch");
    expect(until).not.toBeNull();
    expect(lockedUntil("clara@exemple.ch", Date.now() + LOCK_DURATION_MS + 1000)).toBeNull();
  });

  test("an unknown address locks the same way, so a lock tells nothing about who has an account", async () => {
    for (let i = 0; i < 10; i++) expect((await signIn(auth, "personne@exemple.ch", "faux-mot-de-passe", `192.0.2.${120 + i}`)).status).toBe(401);
    const refused = await signIn(auth, "personne@exemple.ch", "faux-mot-de-passe", "192.0.2.200");
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { code?: string }).code).toBe("ACCOUNT_LOCKED");
  });

  test("a right password starts the count again", async () => {
    for (let i = 0; i < 9; i++) expect((await signIn(auth, "eve@exemple.ch", "faux-mot-de-passe", `192.0.2.${140 + i}`)).status).toBe(401);
    expect((await signIn(auth, "eve@exemple.ch", PASSWORD, "192.0.2.160")).status).toBe(200);
    for (let i = 0; i < 9; i++) expect((await signIn(auth, "eve@exemple.ch", "faux-mot-de-passe", `192.0.2.${170 + i}`)).status).toBe(401);
    expect((await signIn(auth, "eve@exemple.ch", PASSWORD, "192.0.2.190")).status).toBe(200);
  });
});
