import { beforeAll, describe, expect, test } from "vitest";
import { Browser, freshEnv } from "./helpers";

freshEnv();

type Auth = Awaited<ReturnType<typeof import("@/server/auth").getAuth>>;
let auth: Auth;
let setTwoFactor: (email: string, on: boolean) => void;
const PASSWORD = "un-bon-mot-de-passe";

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { db } = await import("@/server/db");
  const { hashPassword } = await import("better-auth/crypto");
  auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  await server.addPerson(auth, { name: "Ada Admin", email: "ada@exemple.ch", role: "admin", passwordHash: hash });
  await server.addPerson(auth, { name: "Bob Membre", email: "bob@exemple.ch", role: "user", passwordHash: hash });
  setTwoFactor = (email, on) => void db().prepare('update "user" set "twoFactorEnabled" = ? where email = ?').run(on ? 1 : 0, email);
});

async function signedIn(email: string) {
  const browser = new Browser(auth.handler);
  const res = await browser.post("/api/auth/sign-in/email", { email, password: PASSWORD });
  expect(res.status).toBe(200);
  return browser;
}

describe("who may use the admin", async () => {
  const { isTrustedAdmin, adminNeedsTwoFactor } = await import("@/server/db");

  test("an admin role alone is not enough", () => {
    expect(isTrustedAdmin({ id: "a", role: "admin" })).toBe(false);
    expect(isTrustedAdmin({ id: "a", role: "admin", twoFactorEnabled: false })).toBe(false);
    expect(adminNeedsTwoFactor({ id: "a", role: "admin", twoFactorEnabled: false })).toBe(true);
  });

  test("an admin with a second factor is trusted, a member never is", () => {
    expect(isTrustedAdmin({ id: "a", role: "admin", twoFactorEnabled: true })).toBe(true);
    expect(isTrustedAdmin({ id: "b", role: "user", twoFactorEnabled: true })).toBe(false);
    expect(adminNeedsTwoFactor({ id: "b", role: "user" })).toBe(false);
  });
});

describe("the admin routes of the account service", () => {
  test("an admin without a second factor is refused", async () => {
    setTwoFactor("ada@exemple.ch", false);
    const browser = await signedIn("ada@exemple.ch");
    const res = await browser.fetch("/api/auth/admin/list-users");
    expect(res.status).toBe(403);
    const created = await browser.post("/api/auth/admin/create-user", { name: "Intrus", email: "intrus@exemple.ch", password: PASSWORD, role: "admin" });
    expect(created.status).toBe(403);
  });

  test("the same admin is let in once the second factor is on", async () => {
    // Signed in before switching it on: the rule reads the account as it is now, not as it was.
    setTwoFactor("ada@exemple.ch", false);
    const browser = await signedIn("ada@exemple.ch");
    setTwoFactor("ada@exemple.ch", true);
    const res = await browser.fetch("/api/auth/admin/list-users");
    expect(res.status).toBe(200);
  });

  test("a member is refused, with or without a second factor", async () => {
    setTwoFactor("bob@exemple.ch", false);
    const browser = await signedIn("bob@exemple.ch");
    expect((await browser.fetch("/api/auth/admin/list-users")).status).toBe(403);
    setTwoFactor("bob@exemple.ch", true);
    expect((await browser.fetch("/api/auth/admin/list-users")).status).toBe(403);
  });
});
