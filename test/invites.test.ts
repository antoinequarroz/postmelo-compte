import crypto from "node:crypto";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { Browser, freshEnv, ISSUER_ORIGIN } from "./helpers";

freshEnv();
// The per-address limit of the form is tested in limits.test.ts: here, many sign-ups come from one address.
process.env.RATE_LIMIT = "off";

// The routes read the request through next/headers: here, the headers of the request under test.
let current = new Headers();
vi.mock("next/headers", () => ({
  headers: async () => current,
  cookies: async () => ({ get: () => undefined }),
}));

const PASSWORD = "un-bon-mot-de-passe";

async function call(route: string, method: string, body: unknown = {}, cookie?: string) {
  const mod = (await import(`@/app/api/${route}/route`)) as Record<string, (req: Request) => Promise<Response>>;
  const h = new Headers({ "content-type": "application/json", origin: ISSUER_ORIGIN, "x-forwarded-for": "203.0.113.20" });
  if (cookie) h.set("cookie", cookie);
  current = h;
  return mod[method](new Request(`${ISSUER_ORIGIN}/api/${route}`, { method, headers: h, body: method === "GET" ? undefined : JSON.stringify(body) }));
}

const signUp = (body: Record<string, unknown>) => call("inscription", "POST", { name: "Nina", password: PASSWORD, ...body });

async function userByEmail(email: string) {
  const { db } = await import("@/server/db");
  return db().prepare('select id, email, "emailVerified" as verified from "user" where email = ?').get(email) as { id: string; email: string; verified: number } | undefined;
}

let admin = "";

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { db } = await import("@/server/db");
  const { hashPassword } = await import("better-auth/crypto");
  const auth = await server.getAuth();
  await server.addPerson(auth, { name: "Ada", email: "ada@exemple.ch", role: "admin", passwordHash: await hashPassword(PASSWORD) });
  const res = await new Browser(auth.handler).post("/api/auth/sign-in/email", { email: "ada@exemple.ch", password: PASSWORD });
  expect(res.status).toBe(200);
  admin = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  // A trusted admin: second factor on, and the code typed a moment ago.
  db().prepare('update "user" set "twoFactorEnabled" = 1 where email = ?').run("ada@exemple.ch");
  const token = decodeURIComponent(admin.match(/compte\.session_token=([^;]+)/)![1]).split(".")[0];
  const { recentlyConfirmed } = await import("@/server/stepup");
  recentlyConfirmed({ session: { token, createdAt: new Date(0) }, user: { id: "", email: "" } });
  db().prepare("insert or replace into admin_stepup (token_hash, at) values (?, ?)").run(crypto.createHash("sha256").update(token).digest("hex"), Date.now());
});

describe("signing up", () => {
  test("is refused without an invitation, or with a made-up one, and creates nothing", async () => {
    for (const invitation of [undefined, "", "x".repeat(43), crypto.randomBytes(32).toString("base64url")]) {
      const res = await signUp({ email: "intrus@exemple.ch", invitation });
      expect(res.status).toBe(403);
    }
    expect(await userByEmail("intrus@exemple.ch")).toBeUndefined();
    const { listAudit } = await import("@/server/audit");
    expect(listAudit({ action: "inscription.refusee" }).length).toBe(4);
  });

  test("an invitation opens one account, at its own address, already verified", async () => {
    const { createInvite } = await import("@/server/invites");
    const { token } = createInvite({ email: "Nina@Exemple.ch", createdBy: "test" });
    // The address typed on the page does not count: the account takes the invitation's.
    const res = await signUp({ email: "autre@exemple.ch", invitation: token });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ email: "nina@exemple.ch" });
    expect(await userByEmail("autre@exemple.ch")).toBeUndefined();
    expect((await userByEmail("nina@exemple.ch"))?.verified).toBe(1);
    // The same link a second time: refused.
    expect((await signUp({ invitation: token })).status).toBe(403);
  });

  test("the same link sent twice at once makes one account only", async () => {
    const { createInvite } = await import("@/server/invites");
    const { token } = createInvite({ email: "duo@exemple.ch", createdBy: "test" });
    const statuses = (await Promise.all([signUp({ invitation: token }), signUp({ invitation: token }), signUp({ invitation: token })])).map((r) => r.status);
    expect(statuses.filter((s) => s === 200)).toHaveLength(1);
    const { db } = await import("@/server/db");
    expect(db().prepare('select count(*) as n from "user" where email = ?').get("duo@exemple.ch")).toEqual({ n: 1 });
  });

  test("an invitation stops working after 7 days, or once withdrawn, or once a newer one is made", async () => {
    const { createInvite, revokeInvite, INVITE_DAYS } = await import("@/server/invites");
    const old = createInvite({ email: "tard@exemple.ch", createdBy: "test" }, Date.now() - INVITE_DAYS * 24 * 3600_000 - 1000);
    expect((await signUp({ invitation: old.token })).status).toBe(403);

    const withdrawn = createInvite({ email: "retire@exemple.ch", createdBy: "test" });
    expect(revokeInvite(withdrawn.id)).toBe(true);
    expect((await signUp({ invitation: withdrawn.token })).status).toBe(403);

    const first = createInvite({ email: "deux@exemple.ch", createdBy: "test" });
    const second = createInvite({ email: "deux@exemple.ch", createdBy: "test" });
    expect((await signUp({ invitation: first.token })).status).toBe(403);
    expect((await signUp({ invitation: second.token })).status).toBe(200);
  });

  test("only the hash of the link is kept: the database alone opens nothing", async () => {
    const { createInvite } = await import("@/server/invites");
    const { token } = createInvite({ email: "hache@exemple.ch", createdBy: "test" });
    const { db } = await import("@/server/db");
    const rows = JSON.stringify(db().prepare("select * from invitation").all());
    expect(rows).not.toContain(token);
    expect(rows).toContain(crypto.createHash("sha256").update(token).digest("hex"));
  });
});

describe("the admin", () => {
  test("makes a link for one address, sees it waiting, and can withdraw it", async () => {
    const res = await call("admin/invitations", "POST", { email: "Zoe@Exemple.ch", name: "Zoé" }, admin);
    expect(res.status).toBe(200);
    const made = (await res.json()) as { id: string; email: string; link: string };
    expect(made.email).toBe("zoe@exemple.ch");
    expect(made.link).toMatch(new RegExp(`^${ISSUER_ORIGIN}/inscription\\?invitation=[A-Za-z0-9_-]{43}$`));

    const list = (await (await call("admin/invitations", "GET", undefined, admin)).json()) as { invites: { id: string; email: string }[] };
    expect(list.invites.map((i) => i.email)).toContain("zoe@exemple.ch");
    // The list never carries the link itself.
    expect(JSON.stringify(list)).not.toContain(made.link.split("=")[1]);

    expect((await call("admin/invitations", "DELETE", { id: made.id }, admin)).status).toBe(200);
    expect((await call("admin/invitations", "DELETE", { id: made.id }, admin)).status).toBe(404);
    expect((await signUp({ invitation: made.link.split("=")[1] })).status).toBe(403);

    const { listAudit } = await import("@/server/audit");
    expect(listAudit({ action: "admin.invitation", actor: "ada@exemple.ch" }).map((r) => r.action)).toEqual(["admin.invitation_retiree", "admin.invitation_creee"]);
  });

  test("cannot invite an address that already has an account, or that is not one", async () => {
    expect((await call("admin/invitations", "POST", { email: "ada@exemple.ch" }, admin)).status).toBe(409);
    expect((await call("admin/invitations", "POST", { email: "pas-une-adresse" }, admin)).status).toBe(400);
  });
});
