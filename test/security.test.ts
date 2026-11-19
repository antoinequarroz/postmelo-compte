import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { Browser, freshEnv, ISSUER_ORIGIN } from "./helpers";

/**
 * The protections every route must keep. A new API route makes this file fail until it is listed
 * below as an admin route (then it is tested like the others) or as a public one, with a reason.
 */

freshEnv();

// The routes read the request through next/headers: here, the headers of the request under test.
let current = new Headers();
vi.mock("next/headers", () => ({
  headers: async () => current,
  cookies: async () => ({ get: (name: string) => (current.get("cookie") ?? "").split("; ").map((c) => c.split("=")).find(([k]) => k === name)?.[1] }),
}));

const API = path.join(__dirname, "../src/app/api");
const PASSWORD = "un-bon-mot-de-passe";
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const EVIL = "https://pirate.example";

/** Routes for admins protected by a second factor only. */
const ADMIN_ROUTES = [
  "admin/acces",
  "admin/confirmer",
  "crm/[kind]",
  "crm/[kind]/[id]",
  "crm/export",
  "site/posts",
  "site/posts/[id]",
  "site/posts/[id]/traduire",
  "site/produits/[id]/[locale]",
];

/** Routes anyone may call, and why that is safe (each one is tested further down). */
const PUBLIC_ROUTES: Record<string, string> = {
  "auth/[...all]": "Better Auth: its admin routes are tested in admin-2fa.test.ts, its limits in limits.test.ts",
  contact: "the contact form: same origin (or the public site), limited per address",
  inscription: "sign-up from the pricing page: same origin, limited per address",
  demarrage: "creates the first admin of a brand-new installation, closed once an account exists",
  paiement: "a signed-in person starts a payment: same origin",
  "paiement/portail": "a signed-in person opens the Stripe portal: same origin",
  "stripe/webhook": "Stripe's calls: refused without a valid signature",
};

function routeDirs(dir = API, prefix = ""): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (!e.isDirectory()) return [];
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const here = fs.existsSync(path.join(dir, e.name, "route.ts")) ? [rel] : [];
    return [...here, ...routeDirs(path.join(dir, e.name), rel)];
  });
}

type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
const params = { params: Promise.resolve({ kind: "company", id: "inconnu", locale: "en" }) };

async function call(route: string, method: string, init: { cookie?: string; origin?: string | null; body?: unknown } = {}) {
  const mod = (await import(`@/app/api/${route}/route`)) as Partial<Record<string, Handler>>;
  const h = new Headers({ "content-type": "application/json", "x-pathname": `/api/${route}` });
  if (init.cookie) h.set("cookie", init.cookie);
  if (init.origin !== null && method !== "GET") h.set("origin", init.origin ?? ISSUER_ORIGIN);
  current = h;
  const req = new Request(`${ISSUER_ORIGIN}/api/${route}${route === "crm/export" ? "?quoi=clients" : ""}`, {
    method,
    headers: h,
    body: method === "GET" ? undefined : JSON.stringify(init.body ?? {}),
  });
  return mod[method]!(req, params);
}

const methodsOf = async (route: string) => {
  const mod = (await import(`@/app/api/${route}/route`)) as Record<string, unknown>;
  return METHODS.filter((m) => typeof mod[m] === "function");
};

/** Signs in through Better Auth and returns the cookie header a browser would send. */
async function cookieOf(email: string) {
  const { getAuth } = await import("@/server/auth");
  const auth = await getAuth();
  const res = await new Browser(auth.handler).post("/api/auth/sign-in/email", { email, password: PASSWORD });
  expect(res.status).toBe(200);
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

let member = "";
let admin = "";
let unconfirmed = "";
let noSecondFactor = "";
let stale = "";

/** The token of a session cookie, as the session table stores it. */
const tokenOf = (cookie: string) => decodeURIComponent(cookie.match(/compte\.session_token=([^;]+)/)![1]).split(".")[0];

/** Moves the sign-in of this session back in time. */
async function signedInAgo(cookie: string, minutes: number) {
  const { db } = await import("@/server/db");
  const at = new Date(Date.now() - minutes * 60_000);
  const col = db().prepare('select "createdAt" as c from "session" where token = ?').get(tokenOf(cookie)) as { c: unknown };
  db().prepare('update "session" set "createdAt" = ? where token = ?').run(typeof col.c === "number" ? at.getTime() : at.toISOString(), tokenOf(cookie));
}

/** Routes and methods that also need the code typed in the last 10 minutes. */
const SENSITIVE: [string, string][] = [
  ["crm/export", "GET"],
  ["crm/[kind]/[id]", "DELETE"],
  ["site/posts/[id]", "DELETE"],
  ["admin/acces", "POST"],
];

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { db } = await import("@/server/db");
  const { hashPassword } = await import("better-auth/crypto");
  const auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  const people: [string, string, "admin" | "user"][] = [
    ["Ada Admin", "ada@exemple.ch", "admin"],
    ["Bob Membre", "bob@exemple.ch", "user"],
    ["Cléo Admin", "cleo@exemple.ch", "admin"],
    ["Dan Admin", "dan@exemple.ch", "admin"],
    ["Eve Admin", "eve@exemple.ch", "admin"],
  ];
  for (const [name, email, role] of people) await server.addPerson(auth, { name, email, role, passwordHash: hash });
  member = await cookieOf("bob@exemple.ch");
  admin = await cookieOf("ada@exemple.ch");
  unconfirmed = await cookieOf("cleo@exemple.ch");
  noSecondFactor = await cookieOf("dan@exemple.ch");
  stale = await cookieOf("eve@exemple.ch");
  // Signed in before switching the second factor on (no code is asked then); Dan never switches it on.
  for (const email of ["ada@exemple.ch", "cleo@exemple.ch", "eve@exemple.ch"]) db().prepare('update "user" set "twoFactorEnabled" = 1 where email = ?').run(email);
  // Ada and Cléo signed in half an hour ago: past the 10 minutes, so a sensitive action needs the code.
  await signedInAgo(admin, 30);
  await signedInAgo(unconfirmed, 30);
  // Eve signed in 13 hours ago: past the 12 hours of an admin session.
  await signedInAgo(stale, 13 * 60);
  // Ada typed the code a moment ago: a fully trusted admin, so only the origin can refuse her.
  const { recentlyConfirmed } = await import("@/server/stepup");
  // (this first call creates the table of confirmations)
  recentlyConfirmed({ session: { token: tokenOf(admin), createdAt: new Date(0) }, user: { id: "", email: "" } });
  db().prepare("insert or replace into admin_stepup (token_hash, at) values (?, ?)").run(crypto.createHash("sha256").update(tokenOf(admin)).digest("hex"), Date.now());
});

describe("every API route is accounted for", () => {
  test("each route is listed as admin or public", () => {
    const known = new Set([...ADMIN_ROUTES, ...Object.keys(PUBLIC_ROUTES)]);
    const unlisted = routeDirs().filter((r) => !known.has(r));
    expect(unlisted, "new route: list it in ADMIN_ROUTES or PUBLIC_ROUTES of test/security.test.ts").toEqual([]);
    const gone = [...known].filter((r) => !routeDirs().includes(r));
    expect(gone).toEqual([]);
  });
});

describe.each(ADMIN_ROUTES)("admin route /api/%s", (route) => {
  test("refuses a visitor who is not signed in", async () => {
    for (const m of await methodsOf(route)) expect([401, 403], `${m} /api/${route}`).toContain((await call(route, m)).status);
  });

  test("refuses a signed-in member", async () => {
    for (const m of await methodsOf(route)) expect([401, 403], `${m} /api/${route}`).toContain((await call(route, m, { cookie: member })).status);
  });

  test("refuses an admin without a second factor", async () => {
    for (const m of await methodsOf(route)) expect((await call(route, m, { cookie: noSecondFactor })).status, `${m} /api/${route}`).toBe(403);
  });

  test("refuses an admin whose sign-in is more than 12 hours old", async () => {
    for (const m of await methodsOf(route)) expect((await call(route, m, { cookie: stale })).status, `${m} /api/${route}`).toBe(403);
  });

  test("asks an admin for the code before a sensitive action, and only then", async () => {
    for (const m of await methodsOf(route)) {
      const res = await call(route, m, { cookie: unconfirmed });
      if (SENSITIVE.some(([r, sm]) => r === route && sm === m)) {
        expect(res.status, `${m} /api/${route}`).toBe(403);
        expect(((await res.json()) as { code?: string }).code, `${m} /api/${route}`).toBe("REAUTH_REQUIRED");
      } else expect(res.status, `${m} /api/${route}`).not.toBe(403);
    }
  });

  test("refuses a trusted admin's browser when the request comes from another site", async () => {
    for (const m of await methodsOf(route)) {
      if (m === "GET") continue;
      for (const origin of [EVIL, null]) {
        const res = await call(route, m, { cookie: admin, origin });
        expect(res.status, `${m} /api/${route} from ${origin}`).toBe(403);
        expect(((await res.json()) as { code?: string }).code, "refused for its origin, not for the code").toBeUndefined();
      }
    }
  });

  test("lets the trusted admin through from this site (the refusals above are not for everyone)", async () => {
    for (const m of await methodsOf(route)) expect((await call(route, m, { cookie: admin })).status, `${m} /api/${route}`).not.toBe(403);
  });
});

describe("public routes", () => {
  test("forms refuse another site", async () => {
    for (const route of ["contact", "inscription", "demarrage", "paiement", "paiement/portail"]) {
      expect((await call(route, "POST", { origin: EVIL })).status, route).toBe(403);
      expect((await call(route, "POST", { origin: null })).status, route).toBe(403);
    }
  });

  test("the first-admin form is closed once an account exists", async () => {
    const res = await call("demarrage", "POST", { body: { name: "Intrus", email: "intrus@exemple.ch", password: PASSWORD } });
    expect(res.status).toBe(409);
    const { db } = await import("@/server/db");
    expect(db().prepare('select count(*) as n from "user" where email = ?').get("intrus@exemple.ch")).toEqual({ n: 0 });
  });

  test("payment needs a signed-in person", async () => {
    for (const route of ["paiement", "paiement/portail"]) expect([401, 403], route).toContain((await call(route, "POST")).status);
  });

  test("the Stripe webhook refuses a message without a signature, or with a forged one", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const event = JSON.stringify({ id: "evt_x", object: "event", type: "customer.subscription.deleted", data: { object: { id: "sub_x" } } });
    const send = (h: Record<string, string>) => POST(new Request(`${ISSUER_ORIGIN}/api/stripe/webhook`, { method: "POST", body: event, headers: h }));
    expect((await send({})).status).toBe(400);
    expect((await send({ "stripe-signature": `t=${Math.floor(Date.now() / 1000)},v1=${"0".repeat(64)}` })).status).toBe(400);
  });
});

describe("content that people write", async () => {
  const { markdownToHtml } = await import("@/lib/markdown");

  test("Markdown never lets HTML or script through", () => {
    const attacks = [
      "<script>alert(1)</script>",
      '<img src=x onerror="alert(1)">',
      "[clique](javascript:alert(1))",
      "[clique](JaVaScRiPt:alert(1))",
      "[clique](data:text/html;base64,PHNjcmlwdD4=)",
      "![x](javascript:alert(1))",
      '[x](https://exemple.ch" onmouseover="alert(1))',
      "<iframe src=//pirate.example></iframe>",
      "`<b>code</b>`",
    ];
    for (const a of attacks) {
      const html = markdownToHtml(a);
      expect(html, a).not.toMatch(/<(script|img[^>]*onerror|iframe|b>)/i);
      expect(html, a).not.toMatch(/(href|src)="\s*(javascript|data):/i);
      expect(html, a).not.toMatch(/" on\w+="/i);
    }
  });

  test("a CSV export cannot carry a spreadsheet formula", async () => {
    const crm = await import("@/server/crm");
    for (const name of ["=HYPERLINK(\"https://pirate.example\")", "+1+1", "-2+3", "@SUM(A1)", "\t=1", "\r=1"]) crm.create("company", { name });
    const csv = crm.exportCsv("clients");
    for (const cell of csv.split(/\r\n/).slice(1).map((line) => line.split(";")[0].replace(/^"|"$/g, ""))) expect(cell, cell).not.toMatch(/^[=+\-@\t\r]/);
  });
});

describe("security.txt", () => {
  test("says where to report a flaw, and is still valid", async () => {
    const { GET } = await import("@/app/.well-known/security.txt/route");
    const res = GET();
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toMatch(/^Contact: mailto:\S+@\S+$/m);
    expect(text).toMatch(/^Canonical: http:\/\/localhost:3000\/\.well-known\/security\.txt$/m);
    const expires = Date.parse(text.match(/^Expires: (.+)$/m)![1]);
    expect(expires).toBeGreaterThan(Date.now());
    expect(expires - Date.now()).toBeLessThan(365 * 86_400_000);
  });
});
