import type { MetadataRoute } from "next";
import { LOCALE_TAG, LOCALES, localePath } from "@/lib/i18n";
import { listPosts, publishedTranslations } from "@/server/content";
import { publicOrigin } from "@/server/feeds";

export const dynamic = "force-dynamic";

/** The public pages, in every language, with their translations side by side. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicOrigin();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${origin}${localePath("fr", path)}`,
    priority,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_TAG[l], `${origin}${localePath(l, path)}`])) },
  });
  const posts = listPosts({ kind: "blog", published: true }).map((p) => {
    const others = publishedTranslations(p.group_id);
    return {
      url: `${origin}${localePath(p.locale, `/blog/${p.slug}`)}`,
      lastModified: p.updated_at,
      priority: 0.6,
      alternates: { languages: Object.fromEntries(Object.entries(others).map(([l, s]) => [LOCALE_TAG[l as keyof typeof LOCALE_TAG], `${origin}${localePath(l as keyof typeof LOCALE_TAG, `/blog/${s}`)}`])) },
    };
  });
  return [page("/", 1), page("/blog", 0.7), page("/changelog", 0.5), ...posts];
}
