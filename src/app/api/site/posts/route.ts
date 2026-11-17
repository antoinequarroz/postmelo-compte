import { answer } from "@/server/crm-http";
import { createPost } from "@/server/content";
import { adminSession, body, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** Writes a blog post or a changelog entry. Admins only. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const data = await body(req);
  return answer(() => createPost(data, session.user.name));
}
