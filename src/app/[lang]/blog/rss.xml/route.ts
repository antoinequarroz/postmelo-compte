import { isLocale } from "@/lib/i18n";
import { rssFeed } from "@/server/feeds";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "fr") return new Response("Not found", { status: 404 });
  return rssFeed("blog", lang);
}
