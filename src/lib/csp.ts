import { SUITE } from "@/lib/suite-tools";

/** Where a page may send a form, besides itself: the tools of the suite (sign-in redirects) and Stripe. */
const STRIPE = ["https://checkout.stripe.com", "https://billing.stripe.com"];

function origin(raw: string | undefined) {
  try {
    return raw ? new URL(raw.trim()).origin : null;
  } catch {
    return null;
  }
}

/** The origins of the tools switched on in the environment (<ID>_URL). */
export function toolOrigins(env: Record<string, string | undefined> = process.env) {
  return SUITE.map((t) => origin(env[`${t.id.toUpperCase()}_URL`])).filter((o): o is string => !!o);
}

/**
 * The Content-Security-Policy of every page. Scripts run only when they carry this request's
 * nonce (or are loaded by one that does): an injected <script> or onclick= is refused by the browser.
 */
export function contentSecurityPolicy(nonce: string, opts: { https: boolean; dev?: boolean; formTargets?: string[] }) {
  const forms = ["'self'", ...(opts.formTargets ?? []), ...STRIPE];
  const directives = [
    "default-src 'self'",
    // 'unsafe-eval' only for React's development tools, never in production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${opts.dev ? " 'unsafe-eval'" : ""}`,
    // Styles set by React (style=…) and next/font: inline styles cannot run code.
    "style-src 'self' 'unsafe-inline'",
    // Blog images may come from any https address (the Markdown only lets https and site paths through).
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    `form-action ${forms.join(" ")}`,
  ];
  if (opts.https) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** A fresh nonce: 128 random bits, base64. */
export function newNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
