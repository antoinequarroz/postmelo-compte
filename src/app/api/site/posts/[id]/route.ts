import { answer } from "@/server/crm-http";
import { removePost, updatePost } from "@/server/content";
import { adminSession, body, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Changes a post. Admins only. */
export async function PATCH(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const { id } = await params;
  const data = await body(req);
  return answer(() => updatePost(id, data));
}

/** Deletes a post (only in its language: the translations stay). Admins only. */
export async function DELETE(req: Request, { params }: Params) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const { id } = await params;
  return answer(() => removePost(id));
}
