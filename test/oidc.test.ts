import crypto from "node:crypto";
import * as oidc from "openid-client";
import { beforeAll, describe, expect, test } from "vitest";
import { Browser, freshEnv, ISSUER_ORIGIN, TOOL_SECRET, TOOL_URL } from "./helpers";

freshEnv();

type Auth = Awaited<ReturnType<typeof import("@/server/auth").getAuth>>;
let auth: Auth;
let config: oidc.Configuration;
let ids: { ada: string; bob: string; lea: string };
const PASSWORD = "un-bon-mot-de-passe";
const REDIRECT = `${TOOL_URL}/api/auth/compte/callback`;

beforeAll(async () => {
  const server = await import("@/server/auth");
  const { lamioHash } = await import("@/server/password");
  const { hashPassword } = await import("better-auth/crypto");
  auth = await server.getAuth();
  const hash = await hashPassword(PASSWORD);
  const ada = await server.addPerson(auth, { name: "Ada Admin", email: "ada@exemple.ch", role: "admin", passwordHash: hash });
  const bob = await server.addPerson(auth, { name: "Bob Membre", email: "bob@exemple.ch", role: "user", passwordHash: hash });
  // Léa comes from Lamio: same id, same scrypt hash as there.
  const salt = crypto.randomBytes(16).toString("hex");
  const lamio = crypto.scryptSync(PASSWORD, salt, 32).toString("hex");
  const lea = await server.addPerson(auth, { id: "lamio-lea-01", name: "Léa Lamio", email: "lea@exemple.ch", role: "user", passwordHash: lamioHash(salt, lamio) });
  ids = { ada: ada.id, bob: bob.id, lea: lea.id };

  // The tool's side: openid-client, the reference client library, talking to the handler directly.
  config = await oidc.discovery(new URL(server.issuer()), "cairn", undefined, oidc.ClientSecretBasic(TOOL_SECRET), {
    execute: [oidc.allowInsecureRequests],
    [oidc.customFetch]: (url, options) => auth.handler(new Request(url, options as RequestInit)),
  });
  config[oidc.customFetch] = (url, options) => auth.handler(new Request(url, options as RequestInit));
});

/** What a tool does to start a sign-in, then what the browser does on the login page. */
async function signIn(email: string, password = PASSWORD) {
  const browser = new Browser(auth.handler);
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const url = oidc.buildAuthorizationUrl(config, {
    redirect_uri: REDIRECT,
    scope: "openid profile email offline_access",
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256",
    state,
    nonce,
  });
  const toLogin = await browser.fetch(url.href);
  expect(toLogin.status).toBe(302);
  const login = new URL(toLogin.headers.get("location")!, ISSUER_ORIGIN);
  expect(login.pathname).toBe("/connexion");
  const res = await browser.post("/api/auth/sign-in/email", { email, password, oauth_query: login.search.slice(1) });
  const text = await res.text();
  if (process.env.DBG) console.log(res.status, [...res.headers], text);
  const body = (text ? JSON.parse(text) : {}) as { redirect?: boolean; url?: string; code?: string };
  return { browser, res, body, verifier, state, nonce, authorizeUrl: url.href };
}

describe("OpenID Connect, from the tool's side", () => {
  test("discovery announces the standard endpoints", () => {
    const meta = config.serverMetadata();
    expect(meta.issuer).toBe(`${ISSUER_ORIGIN}/api/auth`);
    expect(meta.code_challenge_methods_supported).toEqual(["S256"]);
    expect(meta.end_session_endpoint).toBeTruthy();
    expect(meta.jwks_uri).toBeTruthy();
  });

  test("an admin signs in and the tool gets a verified identity", async () => {
    const { body, verifier, state, nonce } = await signIn("ada@exemple.ch");
    expect(body.redirect).toBe(true);
    const back = new URL(body.url!);
    expect(back.origin + back.pathname).toBe(REDIRECT);

    const tokens = await oidc.authorizationCodeGrant(config, back, { pkceCodeVerifier: verifier, expectedState: state, expectedNonce: nonce });
    const claims = tokens.claims()!;
    expect(claims.sub).toBe(ids.ada);
    expect(claims.aud).toBe("cairn");
    expect(claims).toMatchObject({ name: "Ada Admin", email: "ada@exemple.ch", role: "admin", two_factor: false });
    expect(typeof claims.auth_time).toBe("number");

    const info = await oidc.fetchUserInfo(config, tokens.access_token, claims.sub);
    expect(info).toMatchObject({ sub: ids.ada, email: "ada@exemple.ch", role: "admin" });

    // The refresh token rotates and still answers for the same person.
    expect(tokens.refresh_token).toBeTruthy();
    const again = await oidc.refreshTokenGrant(config, tokens.refresh_token!);
    expect(again.claims()?.sub).toBe(ids.ada);

    // A code works once.
    await expect(oidc.authorizationCodeGrant(config, back, { pkceCodeVerifier: verifier, expectedState: state, expectedNonce: nonce })).rejects.toThrow();
  });

  test("an already signed-in browser goes straight back to the tool", async () => {
    const { browser, authorizeUrl } = await signIn("ada@exemple.ch");
    const res = await browser.fetch(authorizeUrl);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain(`${REDIRECT}?code=`);
  });

  test("a wrong PKCE verifier, a wrong secret or another return address are refused", async () => {
    const { body, state, nonce } = await signIn("ada@exemple.ch");
    await expect(oidc.authorizationCodeGrant(config, new URL(body.url!), { pkceCodeVerifier: oidc.randomPKCECodeVerifier(), expectedState: state, expectedNonce: nonce })).rejects.toThrow();

    const second = await signIn("ada@exemple.ch");
    const impostor = await oidc.discovery(new URL(config.serverMetadata().issuer), "cairn", undefined, oidc.ClientSecretBasic("x".repeat(40)), {
      execute: [oidc.allowInsecureRequests],
      [oidc.customFetch]: (url, options) => auth.handler(new Request(url, options as RequestInit)),
    });
    impostor[oidc.customFetch] = (url, options) => auth.handler(new Request(url, options as RequestInit));
    await expect(oidc.authorizationCodeGrant(impostor, new URL(second.body.url!), { pkceCodeVerifier: second.verifier, expectedState: second.state, expectedNonce: second.nonce })).rejects.toThrow();

    const browser = new Browser(auth.handler);
    const evil = new URL(second.authorizeUrl);
    evil.searchParams.set("redirect_uri", "https://ailleurs.exemple/voler");
    const res = await browser.fetch(evil.href);
    expect(res.headers.get("location") ?? "").not.toContain("ailleurs.exemple/voler?code");
  });

  test("a wrong password opens nothing", async () => {
    const { res, body } = await signIn("ada@exemple.ch", "pas-le-bon-mot-de-passe");
    expect(res.status).toBe(401);
    expect(body.url).toBeUndefined();
  });
});

describe("Who may open which tool", () => {
  test("a member without access is sent to the refusal page, and no token is ever issued", async () => {
    const { body, res: answer, browser, authorizeUrl } = await signIn("bob@exemple.ch");
    expect(body.url ?? answer.headers.get("location")).toBe(`${ISSUER_ORIGIN}/refus?outil=cairn`);
    // Signed in now: asking again is refused before any code exists.
    const res = await browser.fetch(authorizeUrl);
    expect(res.headers.get("location")).toBe(`${ISSUER_ORIGIN}/refus?outil=cairn`);
  });

  test("once the admin ticks the tool, the member gets in, with the role of a member", async () => {
    const { setToolAccess } = await import("@/server/db");
    setToolAccess("cairn", ids.bob, true);
    const { body, verifier, state, nonce } = await signIn("bob@exemple.ch");
    const tokens = await oidc.authorizationCodeGrant(config, new URL(body.url!), { pkceCodeVerifier: verifier, expectedState: state, expectedNonce: nonce });
    expect(tokens.claims()).toMatchObject({ sub: ids.bob, role: "member" });

    // Access withdrawn: the refresh token stops giving identities.
    setToolAccess("cairn", ids.bob, false);
    await expect(oidc.refreshTokenGrant(config, tokens.refresh_token!)).rejects.toThrow();
  });
});

describe("Accounts imported from Lamio", () => {
  test("keep their id and their password", async () => {
    const { setToolAccess } = await import("@/server/db");
    setToolAccess("cairn", ids.lea, true);
    const { body, verifier, state, nonce } = await signIn("lea@exemple.ch");
    const tokens = await oidc.authorizationCodeGrant(config, new URL(body.url!), { pkceCodeVerifier: verifier, expectedState: state, expectedNonce: nonce });
    expect(tokens.claims()?.sub).toBe("lamio-lea-01");
    const wrong = await signIn("lea@exemple.ch", "autre-mot-de-passe");
    expect(wrong.res.status).toBe(401);
  });
});

describe("Closed doors", () => {
  test("nobody can sign up on their own", async () => {
    const browser = new Browser(auth.handler);
    const res = await browser.post("/api/auth/sign-up/email", { name: "Intrus", email: "intrus@exemple.ch", password: PASSWORD });
    expect(res.ok).toBe(false);
  });

  test("a signed-in member cannot register a tool of their own", async () => {
    const { browser } = await signIn("bob@exemple.ch");
    const res = await browser.post("/api/auth/oauth2/create-client", { redirect_uris: ["https://ailleurs.exemple/cb"] });
    expect(res.ok).toBe(false);
  });
});
