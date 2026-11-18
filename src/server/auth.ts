import "server-only";
import crypto from "node:crypto";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { getMigrations } from "better-auth/db/migration";
import { nextCookies } from "better-auth/next-js";
import { admin, jwt, twoFactor } from "better-auth/plugins";
import { APP_NAME } from "@/lib/brand";
import { MAX_PASSWORD, MIN_PASSWORD } from "@/lib/utils";
import { db, dataDir, forgetPerson, isTrustedAdmin, mayOpenTool } from "./db";
import { password } from "./password";
import { tool, tools } from "./tools";

/** The public address of this service: the "issuer" every tool trusts. */
export const baseUrl = () => (process.env.COMPTE_URL ?? "http://localhost:3000").trim().replace(/\/+$/, "");

/** Where the OpenID Connect endpoints live, and the value of "iss" in every token. */
export const issuer = () => `${baseUrl()}/api/auth`;

function secret() {
  const value = process.env.AUTH_SECRET ?? "";
  if (value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET manque ou fait moins de 32 caractères (openssl rand -base64 32).");
  return "dev-only-secret-dev-only-secret-dev-only";
}

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const isLocal = (url: URL) => url.hostname === "localhost" || url.hostname === "127.0.0.1";

export const ADMIN_NEEDS_2FA = "Active la double authentification pour utiliser l'admin.";

const refusal = (toolId: string) => `${baseUrl()}/refus?outil=${toolId}`;

/** The role the tools know: "admin" or "member", as in Lamio. */
const suiteRole = (user: Record<string, unknown>) => (user.role === "admin" ? "admin" : "member");

function build() {
  const secure = baseUrl().startsWith("https://");
  return betterAuth({
    appName: APP_NAME,
    baseURL: baseUrl(),
    secret: secret(),
    database: db(),
    // The JWT plugin's own /token route hands session JWTs to the browser: tools get theirs from /oauth2/token.
    disabledPaths: ["/token"],
    emailAndPassword: {
      enabled: true,
      // No open sign-up: an admin creates each account.
      disableSignUp: true,
      minPasswordLength: MIN_PASSWORD,
      maxPasswordLength: MAX_PASSWORD,
      password,
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: process.env.NODE_ENV === "production" && process.env.RATE_LIMIT !== "off",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/two-factor/verify-totp": { window: 60, max: 5 },
        "/two-factor/verify-backup-code": { window: 60, max: 5 },
      },
    },
    advanced: { cookiePrefix: "compte", useSecureCookies: secure },
    hooks: {
      // A member who may not open a tool is told so here, before any code is issued.
      // The same rule is enforced again when tokens are made (customIdTokenClaims below).
      before: createAuthMiddleware(async (ctx) => {
        // The admin plugin's routes (people, roles, sessions of others) need an admin protected by a second factor.
        if (ctx.path.startsWith("/admin/")) {
          const session = await getSessionFromCtx(ctx);
          if (!session || !isTrustedAdmin(session.user)) throw new APIError("FORBIDDEN", { message: ADMIN_NEEDS_2FA });
          return;
        }
        if (ctx.path !== "/oauth2/authorize") return;
        const asked = tool(ctx.query?.client_id as string | undefined);
        if (!asked) return;
        const session = await getSessionFromCtx(ctx);
        if (session && !mayOpenTool(asked.id, session.user)) throw ctx.redirect(refusal(asked.id));
      }),
      // Same answer when the request resumes right after signing in (password, code or passkey).
      after: createAuthMiddleware(async (ctx) => {
        const query = (ctx.body as { oauth_query?: unknown } | undefined)?.oauth_query;
        if (typeof query !== "string") return;
        const asked = tool(new URLSearchParams(query).get("client_id"));
        const user = ctx.context.newSession?.user ?? ctx.context.session?.user;
        if (asked && user && !mayOpenTool(asked.id, user)) return ctx.json({ redirect: true, url: refusal(asked.id) });
      }),
    },
    databaseHooks: { user: { delete: { after: async (user) => void forgetPerson(user.id) } } },
    plugins: [
      admin(),
      twoFactor({ issuer: APP_NAME }),
      passkey({ rpName: APP_NAME }),
      jwt({ disableSettingJwtHeader: true }),
      oauthProvider({
        loginPage: "/connexion",
        consentPage: "/autoriser",
        scopes: ["openid", "profile", "email", "offline_access"],
        // The tools come from the environment (src/server/tools.ts), never from the API.
        clientPrivileges: () => false,
        cachedTrustedClients: new Set(tools().map((t) => t.id)),
        storeClientSecret: { hash: sha256 },
        // http is accepted for a tool on this machine only (development).
        allowInsecureRedirectUri: isLocal,
        advertisedMetadata: {
          claims_supported: ["sub", "iss", "aud", "exp", "iat", "sid", "scope", "azp", "auth_time", "name", "email", "email_verified", "role", "two_factor"],
        },
        customIdTokenClaims: ({ user, metadata }) => {
          const asked = typeof metadata?.tool === "string" ? metadata.tool : null;
          if (asked && !mayOpenTool(asked, user as { id: string; role?: string })) throw new APIError("FORBIDDEN", { message: "Cet outil n'est pas ouvert à ce compte." });
          return {
            name: user.name,
            email: user.email,
            email_verified: user.emailVerified,
            role: suiteRole(user),
            // True when the account is protected by a second factor: no session exists without it.
            two_factor: user.twoFactorEnabled === true,
          };
        },
        customUserInfoClaims: ({ user }) => ({ role: suiteRole(user), two_factor: user.twoFactorEnabled === true }),
      }),
      // Last, so that server actions and pages can set cookies.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof build>;

const globalForAuth = globalThis as unknown as { __compteAuth?: { key: string; ready: Promise<Auth> } };

/** Creates the missing tables, then writes the tools of the environment as OpenID Connect clients. */
async function prepare(auth: Auth) {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  const { adapter } = await auth.$context;
  for (const t of tools()) {
    const row = {
      clientId: t.id,
      clientSecret: sha256(t.secret),
      name: t.name,
      uri: t.url,
      redirectUris: [t.redirectUri],
      postLogoutRedirectUris: [t.url, `${t.url}/login`],
      tokenEndpointAuthMethod: "client_secret_basic",
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      scopes: ["openid", "profile", "email", "offline_access"],
      applicationType: "web",
      disabled: false,
      // First-party tools: no "allow this app" screen, and they may end the session on sign-out.
      skipConsent: true,
      enableEndSession: true,
      requirePKCE: true,
      metadata: JSON.stringify({ tool: t.id }),
      updatedAt: new Date(),
    };
    const where = [{ field: "clientId", value: t.id }];
    const existing = await adapter.findOne({ model: "oauthClient", where });
    if (existing) await adapter.update({ model: "oauthClient", where, update: row });
    else await adapter.create({ model: "oauthClient", data: { ...row, createdAt: new Date() } });
  }
  return auth;
}

/** Adds a person with a password. Used for the first account, by the import and by the tests; admins go through the admin API. */
export async function addPerson(auth: Auth, person: { id?: string; name: string; email: string; role: "admin" | "user"; passwordHash: string; createdAt?: Date }) {
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.createUser({
    ...(person.id ? { id: person.id } : {}),
    name: person.name,
    email: person.email.toLowerCase(),
    emailVerified: true,
    role: person.role,
    ...(person.createdAt ? { createdAt: person.createdAt } : {}),
  }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: person.passwordHash });
  return user;
}

export async function countPeople(auth: Auth) {
  return (await auth.$context).internalAdapter.countTotalUsers();
}

/** The auth server, ready to answer. Built once per process (and per data directory, for the tests). */
export function getAuth(): Promise<Auth> {
  const key = `${dataDir()}|${baseUrl()}|${tools().map((t) => `${t.id}=${t.url}=${sha256(t.secret)}`).join(",")}`;
  if (globalForAuth.__compteAuth?.key !== key) globalForAuth.__compteAuth = { key, ready: prepare(build()) };
  return globalForAuth.__compteAuth.ready;
}
