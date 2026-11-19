import { CONTACT_EMAIL } from "@/lib/brand";
import { baseUrl } from "@/server/auth";
import { siteUrl } from "@/server/http";

export const dynamic = "force-dynamic";

/** How long a security.txt stays valid (RFC 9116 asks for less than a year): renewed on every request. */
const VALID_DAYS = 180;

/**
 * Where to report a security flaw (RFC 9116). Served on compte.postmelo.ch and postmelo.ch alike.
 * The address is the one of the suite; reports are read by Antoine.
 */
export function GET() {
  const expires = new Date(Date.now() + VALID_DAYS * 86_400_000);
  expires.setUTCHours(0, 0, 0, 0);
  const lines = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: fr, en, de",
    // One line per address that serves this file.
    ...[baseUrl(), siteUrl()].filter(Boolean).map((origin) => `Canonical: ${origin}/.well-known/security.txt`),
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
