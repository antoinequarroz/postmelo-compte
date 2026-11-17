import { handleEvent, stripe } from "@/server/billing";
import { fail } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * Stripe tells us here about every payment and every change of a subscription.
 * Each message is signed with STRIPE_WEBHOOK_SECRET: anything else is refused.
 */
export async function POST(req: Request) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!client || !secret) return fail("Stripe n'est pas configuré.", 503);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return fail("Signature manquante.", 400);
  let event;
  try {
    event = client.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return fail("Signature invalide.", 400);
  }
  try {
    await handleEvent(event);
  } catch (e) {
    // A 500 makes Stripe send the event again later.
    console.error("stripe webhook", event.type, e);
    return fail("Erreur pendant le traitement.", 500);
  }
  return Response.json({ received: true });
}
