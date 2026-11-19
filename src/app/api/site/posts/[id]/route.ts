import { answer } from "@/server/crm-http";
import { removePost, updatePost } from "@/server/content";
import { adminSession, body, confirmationNeeded, fail, logged, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Changes a post. Admins only. */
export async function PATCH(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const { id } = await params;
  const data = await body(req);
  return logged(answer(() => updatePost(id, data)), req, session, "site.article_modifie", id, { champs: Object.keys(data) });
}

/** Deletes a post (only in its language: the translations stay). Admins only. */
export async function DELETE(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const confirm = confirmationNeeded(session);
  if (confirm) return confirm;
  const { id } = await params;
  return logged(answer(() => removePost(id)), req, session, "site.article_supprime", id);
}
