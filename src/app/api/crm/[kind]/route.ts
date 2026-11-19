import { create } from "@/server/crm";
import { answer, asKind } from "@/server/crm-http";
import { adminSession, body, fail, logged, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** Creates a product, company, contact, licence, deal or note. Admins only. */
export async function POST(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const kind = asKind((await params).kind);
  if (!kind) return fail("Introuvable", 404);
  const data = await body(req);
  return logged(answer(() => create(kind, data, session.user.name)), req, session, "crm.cree", kind, { champs: Object.keys(data) });
}
