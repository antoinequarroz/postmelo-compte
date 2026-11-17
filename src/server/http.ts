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
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return !!origin && origin === new URL(baseUrl()).origin;
}
