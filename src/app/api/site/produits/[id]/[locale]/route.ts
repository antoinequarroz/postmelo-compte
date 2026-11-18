import { answer } from "@/server/crm-http";
import { setProductText } from "@/server/content";
import { adminSession, body, fail, logged, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** Saves the English or German texts of a product. Admins only. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; locale: string }> }) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const { id, locale } = await params;
  const data = await body(req);
  return logged(answer(() => setProductText(id, locale, data)), req, session, "site.produit_traduit", `${id}/${locale}`);
}
