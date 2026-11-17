import { headers } from "next/headers";
import { recordInquiry } from "@/server/crm";
import { answer } from "@/server/crm-http";
import { body, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

// A few requests per address and per quarter of an hour: enough for people, not for robots.
const WINDOW = 15 * 60 * 1000;
const MAX = 5;
const seen = new Map<string, number[]>();

function tooMany(ip: string) {
  const t = Date.now();
  const recent = (seen.get(ip) ?? []).filter((at) => t - at < WINDOW);
  recent.push(t);
  seen.set(ip, recent);
  if (seen.size > 5000) for (const [k, v] of seen) if (v.every((at) => t - at >= WINDOW)) seen.delete(k);
  return recent.length > MAX;
}

/** The contact form of the public page: the request lands in the CRM as a new prospect. */
export async function POST(req: Request) {
  if (!sameOrigin(req, true)) return fail("Demande refusée", 403);
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (process.env.RATE_LIMIT !== "off" && tooMany(ip)) return fail("Trop de demandes. Réessaie dans un moment.", 429);
  const data = await body(req);
  // A field hidden to people: robots fill it in, and get a polite answer that does nothing.
  if (typeof data.website === "string" && data.website.trim()) return Response.json({ ok: true });
  return answer(() => void recordInquiry(data));
}
