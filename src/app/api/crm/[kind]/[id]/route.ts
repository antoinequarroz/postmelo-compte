import { remove, update } from "@/server/crm";
import { answer, asKind } from "@/server/crm-http";
import { adminSession, body, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ kind: string; id: string }> };

/** Changes some fields of a record. Admins only. */
export async function PATCH(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const { kind: k, id } = await params;
  const kind = asKind(k);
  if (!kind) return fail("Introuvable", 404);
  const data = await body(req);
  return answer(() => update(kind, id, data, session.user.name));
}

/** Deletes a record (a company takes its contacts, licences, deals and history with it). Admins only. */
export async function DELETE(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const { kind: k, id } = await params;
  const kind = asKind(k);
  if (!kind) return fail("Introuvable", 404);
  return answer(() => remove(kind, id));
}
