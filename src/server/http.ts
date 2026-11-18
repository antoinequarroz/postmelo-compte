import "server-only";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { baseUrl, getAuth } from "./auth";
import { audit } from "./audit";
import { isTrustedAdmin } from "./db";
import { clientIp, limitKey } from "./ip";
import { hit } from "./limits";
import { adminSessionFresh, REAUTH_MESSAGE, REAUTH_REQUIRED, recentlyConfirmed } from "./stepup";

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function body(req: Request): Promise<Record<string, unknown>> {
  const data = await req.json().catch(() => null);
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
}

/** The signed-in person, or null. */
export async function currentSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

/** Our own POST routes only answer pages of this site (the cookie is SameSite=Lax, this is the second lock). */
export function sameOrigin(req: Request, alsoSite = false) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (origin === new URL(baseUrl()).origin) return true;
  // The public site (postmelo.ch) serves the same landing page: its contact form may post here.
  const site = alsoSite ? siteUrl() : null;
  return !!site && origin === new URL(site).origin;
}

/** The address of the public site when it differs from the account service, e.g. https://postmelo.ch. */
export function siteUrl() {
  const raw = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  return raw && /^https?:\/\//.test(raw) ? raw : null;
}

/** The signed-in admin, or null: the CRM and its API are for admins protected by a second factor only. */
export async function adminSession() {
  const session = await currentSession();
  if (!session) return null;
  if (isTrustedAdmin(session.user) && adminSessionFresh(session)) return session;
  // A signed-in person knocking at the admin: worth a line in the journal.
  const h = await headers();
  audit({ action: "admin.refus", ok: false, actorId: session.user.id, actorEmail: session.user.email, target: h.get("x-pathname"), detail: { role: session.user.role ?? "user", twoFactor: session.user.twoFactorEnabled === true, ...(isTrustedAdmin(session.user) ? { session: "plus de 12 h" } : {}) }, headers: h });
  return null;
}

/**
 * For the sensitive actions (export, deletion, tool access): null when this session proved its
 * presence in the last minutes, else the answer that makes the page ask for the code again.
 */
export function confirmationNeeded(session: Parameters<typeof recentlyConfirmed>[0]) {
  return recentlyConfirmed(session) ? null : NextResponse.json({ error: REAUTH_MESSAGE, code: REAUTH_REQUIRED }, { status: 403 });
}

type Actor = { user: { id: string; email: string } };

/** Writes what an admin just did in the audit log, then hands back the answer unchanged. */
export function logged(res: Response, req: Request, session: Actor, action: string, target?: string | null, detail?: Record<string, unknown>) {
  audit({ action, ok: res.ok, actorId: session.user.id, actorEmail: session.user.email, target: target ?? null, detail: detail ?? null, headers: req.headers });
  return res;
}

/** A small limit per address, for the public forms: true when this request is one too many. Kept in the database. */
export async function tooMany(scope: string, max: number, windowMs: number) {
  return hit(`${scope}|${limitKey(clientIp(await headers()))}`, max, windowMs);
}
