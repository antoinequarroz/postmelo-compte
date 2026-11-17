import { headers } from "next/headers";
import { isLocale, LOCALE_NAME } from "@/lib/i18n";
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
  const data = await body(req);
  if (process.env.RATE_LIMIT !== "off" && tooMany(ip)) return fail(data.locale === "en" ? "Too many requests. Please try again in a moment." : data.locale === "de" ? "Zu viele Anfragen. Versuch es gleich nochmals." : "Trop de demandes. Réessaie dans un moment.", 429);
  // A field hidden to people: robots fill it in, and get a polite answer that does nothing.
  if (typeof data.website === "string" && data.website.trim()) return Response.json({ ok: true });
  // From /en or /de: the note says so, to answer in the right language; refusals come back in it.
  const locale = isLocale(data.locale) ? data.locale : "fr";
  if (locale !== "fr") data.message = `[${LOCALE_NAME[locale]}] ${typeof data.message === "string" ? data.message : ""}`.trim();
  const res = answer(() => void recordInquiry(data));
  if (locale === "fr" || res.status !== 400) return res;
  const { error } = (await res.clone().json()) as { error?: string };
  return fail((error && REFUSALS[locale][error]) || error || "Error", 400);
}

const REFUSALS: Record<"en" | "de", Record<string, string>> = {
  en: { "Indique ton nom.": "Please enter your name.", "Cette adresse e-mail n'est pas valide.": "This email address is not valid." },
  de: { "Indique ton nom.": "Bitte gib deinen Namen ein.", "Cette adresse e-mail n'est pas valide.": "Diese E-Mail-Adresse ist ungültig." },
};
