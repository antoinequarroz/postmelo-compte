import { NextResponse } from "next/server";
import { signUp } from "@/server/billing";
import { CrmError } from "@/server/crm";
import { audit } from "@/server/audit";
import { body, fail, sameOrigin, tooMany } from "@/server/http";

export const dynamic = "force-dynamic";

/** Creates an account from an invitation link. The page then signs in, and goes on to the payment when a formula was picked. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (await tooMany("inscription", 5, 15 * 60 * 1000)) return fail("Trop de demandes. Réessaie dans un moment.", 429);
  const data = await body(req);
  // A field hidden to people: robots fill it in, and get a polite answer that does nothing.
  if (typeof data.website === "string" && data.website.trim()) return NextResponse.json({ ok: true });
  try {
    const made = await signUp(data);
    audit({ action: "inscription", actorId: made.id, actorEmail: made.email, detail: { invitation: made.inviteId }, headers: req.headers });
    return NextResponse.json({ ok: true, email: made.email });
  } catch (e) {
    if (e instanceof CrmError) {
      if (e.status === 403) audit({ action: "inscription.refusee", ok: false, detail: { raison: "invitation invalide" }, headers: req.headers });
      return fail(e.message, e.status);
    }
    console.error(e);
    return fail("Une erreur est survenue", 500);
  }
}
