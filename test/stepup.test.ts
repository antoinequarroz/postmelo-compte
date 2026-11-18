import crypto from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";
import { Browser, freshEnv, ISSUER_ORIGIN } from "./helpers";

freshEnv();

type Auth = Awaited<ReturnType<typeof import("@/server/auth").getAuth>>;
let auth: Auth;
let S: typeof import("@/server/stepup");
let raw: () => import("better-sqlite3").Database;
const PASSWORD = "un-bon-mot-de-passe";

/** The 6-digit code an authenticator app shows, now or a period later. */
function totp(base32: string, offset = 0) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offset));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

let browser: Browser;
let secret: string;
let bobId: string;

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { db } = await import("@/server/db");
  const { hashPassword } = await import("better-auth/crypto");
  S = await import("@/server/stepup");
  raw = db;
  auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  await server.addPerson(auth, { name: "Ada Admin", email: "ada@exemple.ch", role: "admin", passwordHash: hash });
  bobId = (await server.addPerson(auth, { name: "Bob Membre", email: "bob@exemple.ch", role: "user", passwordHash: hash })).id;
  // Ada switches her second factor on for real: QR secret, then the first code.
  browser = new Browser(auth.handler);
  await browser.post("/api/auth/sign-in/email", { email: "ada@exemple.ch", password: PASSWORD });
  const { totpURI } = (await (await browser.post("/api/auth/two-factor/enable", { password: PASSWORD })).json()) as { totpURI: string };
  secret = new URL(totpURI).searchParams.get("secret")!;
  expect((await browser.post("/api/auth/two-factor/verify-totp", { code: totp(secret) })).status).toBe(200);
});

/** Moves Ada's sessions back in time, as if she had signed in that long ago. */
const signedInAgo = (minutes: number) => {
  const at = new Date(Date.now() - minutes * 60_000);
  const col = raw().prepare('select "createdAt" as c from "session" limit 1').get() as { c: unknown };
  raw().prepare('update "session" set "createdAt" = ?').run(typeof col.c === "number" ? at.getTime() : at.toISOString());
};

async function currentSession() {
  const cookie = (browser as unknown as { jar: Map<string, string> }).jar;
  const headers = new Headers({ cookie: [...cookie].map(([k, v]) => `${k}=${v}`).join("; "), origin: ISSUER_ORIGIN });
  return (await auth.api.getSession({ headers }))!;
}

const setRole = (role: string) => browser.post("/api/auth/admin/set-role", { userId: bobId, role });

describe("sensitive admin actions need a recent proof of presence", () => {
  test("right after signing in, no code is asked", async () => {
    signedInAgo(1);
    expect((await setRole("admin")).status).toBe(200);
  });

  test("an hour later, changing a role asks for the code", async () => {
    signedInAgo(60);
    const res = await setRole("user");
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe("REAUTH_REQUIRED");
    // Reading stays possible without the code.
    expect((await browser.fetch("/api/auth/admin/list-users")).status).toBe(200);
  });

  test("a wrong code is refused, the right one opens 10 minutes, and it never works twice", async () => {
    const session = await currentSession();
    const { secretConfig } = await auth.$context;
    expect(await S.confirmWithCode(session, "000000" === totp(secret, -5) ? "111111" : totp(secret, -5), secretConfig)).toMatchObject({ ok: false, status: 400 });
    const code = totp(secret);
    expect(await S.confirmWithCode(session, code, secretConfig)).toEqual({ ok: true });
    expect((await setRole("user")).status).toBe(200);
    expect(await S.confirmWithCode(session, code, secretConfig)).toMatchObject({ ok: false, error: expect.stringMatching(/déjà servi/) });
  });

  test("five wrong codes in a row stop the guessing", async () => {
    const session = await currentSession();
    const { secretConfig } = await auth.$context;
    for (let i = 0; i < 4; i++) await S.confirmWithCode(session, "12345x", secretConfig);
    const blocked = await S.confirmWithCode(session, totp(secret, 1), secretConfig);
    expect(blocked).toMatchObject({ ok: false, status: 429 });
  });

  test("after 12 hours, the admin is closed until the next sign-in", async () => {
    signedInAgo(13 * 60);
    const res = await browser.fetch("/api/auth/admin/list-users");
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe("ADMIN_SESSION_EXPIRED");
  });
});

describe("the rules themselves", () => {
  const at = (minutesAgo: number) => ({ session: { token: "t-" + minutesAgo, createdAt: new Date(Date.now() - minutesAgo * 60_000) }, user: { id: "u", email: "u@x.ch" } });
  test("admin sessions last 12 hours, proofs of presence 10 minutes", () => {
    expect(S.adminSessionFresh(at(11 * 60))).toBe(true);
    expect(S.adminSessionFresh(at(12 * 60 + 1))).toBe(false);
    expect(S.recentlyConfirmed(at(9))).toBe(true);
    expect(S.recentlyConfirmed(at(11))).toBe(false);
  });

  test("a code matches its own period and the neighbours, nothing further", () => {
    const key = Buffer.from("une-cle-de-test-une-cle-de-test-");
    const now = Date.now();
    const step = Math.floor(now / 30000);
    const codeFor = (s: number) => {
      const c = Buffer.alloc(8);
      c.writeBigUInt64BE(BigInt(s));
      const h = crypto.createHmac("sha1", key).update(c).digest();
      const o = h[h.length - 1] & 15;
      return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
    };
    expect(S.matchingStep(key, codeFor(step), now)).toBe(step);
    expect(S.matchingStep(key, codeFor(step - 1), now)).toBe(step - 1);
    expect(S.matchingStep(key, codeFor(step + 3), now)).toBeNull();
  });
});
