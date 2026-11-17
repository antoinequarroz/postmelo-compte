import "server-only";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { baseUrl, getAuth } from "./auth";

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

/** The signed-in admin, or null: the CRM and its API are for admins only. */
export async function adminSession() {
  const session = await currentSession();
  return session && session.user.role === "admin" ? session : null;
}

const hits = new Map<string, number[]>();

/** A small limit per address, for the public forms: true when this request is one too many. */
export async function tooMany(scope: string, max: number, windowMs: number) {
  if (process.env.RATE_LIMIT === "off") return false;
  const h = await headers();
  const key = `${scope}|${h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"}`;
  const t = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
  recent.push(t);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((at) => t - at >= windowMs)) hits.delete(k);
  return recent.length > max;
}
