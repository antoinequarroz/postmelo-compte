import { type NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy, newNonce, toolOrigins } from "@/lib/csp";

/**
 * Security headers that depend on the request or on the environment (the fixed ones are in next.config.ts):
 * a Content-Security-Policy with a fresh nonce, HSTS and Cross-Origin-Opener-Policy.
 */
export function middleware(req: NextRequest) {
  const nonce = newNonce();
  const https = (process.env.COMPTE_URL ?? "").trim().startsWith("https://");
  const csp = contentSecurityPolicy(nonce, { https, dev: process.env.NODE_ENV === "development", formTargets: toolOrigins() });

  // Next.js reads the nonce from the request's policy and puts it on its own scripts.
  const request = new Headers(req.headers);
  request.set("x-nonce", nonce);
  request.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: request } });

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // One year, every subdomain of postmelo.ch: the browser never tries plain http again.
  if (https) res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return res;
}

export const config = {
  matcher: [
    {
      // Pages and API routes; not the static files (they carry no script to protect).
      source: "/((?!_compte/|_next/static|_next/image|favicon.ico|icon|apple-icon).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
