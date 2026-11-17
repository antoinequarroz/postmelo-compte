import { NextResponse } from "next/server";
import { startCheckout } from "@/server/billing";
import { CrmError } from "@/server/crm";
import { body, currentSession, fail, sameOrigin, tooMany } from "@/server/http";

export const dynamic = "force-dynamic";

/** Starts the purchase of a formula for the signed-in account: answers where to send the browser. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await currentSession();
  if (!session) return fail("Connecte-toi d'abord.", 401);
  if (await tooMany("paiement", 20, 15 * 60 * 1000)) return fail("Trop de demandes. Réessaie dans un moment.", 429);
  try {
    return NextResponse.json(await startCheckout(session.user, await body(req)));
  } catch (e) {
    if (e instanceof CrmError) return fail(e.message, e.status);
    console.error(e);
    return fail("Le paiement n'a pas pu commencer. Réessaie dans un moment.", 500);
  }
}
