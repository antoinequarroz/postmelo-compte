import { NextResponse } from "next/server";
import { signUp } from "@/server/billing";
import { CrmError } from "@/server/crm";
import { audit } from "@/server/audit";
import { body, fail, sameOrigin, tooMany } from "@/server/http";

export const dynamic = "force-dynamic";

/** Creates an account from the sign-up page. The page then signs in and goes on to the payment. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (await tooMany("inscription", 5, 15 * 60 * 1000)) return fail("Trop de demandes. Réessaie dans un moment.", 429);
  const data = await body(req);
  // A field hidden to people: robots fill it in, and get a polite answer that does nothing.
  if (typeof data.website === "string" && data.website.trim()) return NextResponse.json({ ok: true });
  try {
    await signUp(data);
    audit({ action: "inscription", actorEmail: typeof data.email === "string" ? data.email : null, headers: req.headers });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof CrmError) return fail(e.message, e.status);
    console.error(e);
    return fail("Une erreur est survenue", 500);
  }
}
