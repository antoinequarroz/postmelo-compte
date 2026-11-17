import { NextResponse } from "next/server";
import { portalUrl } from "@/server/billing";
import { CrmError } from "@/server/crm";
import { currentSession, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** The Stripe page of the signed-in customer: card, invoices, cancellation. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await currentSession();
  if (!session) return fail("Connecte-toi d'abord.", 401);
  try {
    return NextResponse.json({ url: await portalUrl(session.user.id) });
  } catch (e) {
    if (e instanceof CrmError) return fail(e.message, e.status);
    console.error(e);
    return fail("Une erreur est survenue", 500);
  }
}
