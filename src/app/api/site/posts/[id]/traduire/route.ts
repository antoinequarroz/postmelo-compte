import { answer } from "@/server/crm-http";
import { translatePost } from "@/server/content";
import { adminSession, body, fail, logged, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** Starts the translation of a post: a draft in the other language. Answers its id. Admins only. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const { id } = await params;
  const { locale } = await body(req);
  return logged(answer(() => translatePost(id, locale, session.user.name)), req, session, "site.article_traduit", id, { langue: locale });
}
