import "server-only";
import { SUITE_NAME } from "@/lib/brand";
import { LOCALE_TAG, localePath, type Locale } from "@/lib/i18n";
import { markdownToHtml, plainText } from "@/lib/markdown";
import { baseUrl } from "./auth";
import { listPosts, type PostKind } from "./content";
import { siteUrl } from "./http";

/** Where the public pages are read: the public site (postmelo.ch) when set, else the account service. */
export const publicOrigin = () => siteUrl() ?? baseUrl();

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TITLES: Record<PostKind, Record<Locale, string>> = {
  blog: { fr: `Blog · ${SUITE_NAME}`, en: `Blog · ${SUITE_NAME}`, de: `Blog · ${SUITE_NAME}` },
  changelog: { fr: `Nouveautés · ${SUITE_NAME}`, en: `What's new · ${SUITE_NAME}`, de: `Neuigkeiten · ${SUITE_NAME}` },
};

/** An RSS 2.0 feed of the blog or the changelog in one language. */
export function rssFeed(kind: PostKind, locale: Locale) {
  const origin = publicOrigin();
  const page = `${origin}${localePath(locale, kind === "blog" ? "/blog" : "/changelog")}`;
  const items = listPosts({ kind, locale, published: true })
    .slice(0, 50)
    .map((p) => {
      const link = kind === "blog" ? `${origin}${localePath(locale, `/blog/${p.slug}`)}` : `${page}#${p.slug}`;
      return `<item><title>${xml(p.title)}</title><link>${xml(link)}</link><guid isPermaLink="false">${p.id}</guid><pubDate>${new Date(`${p.published_at}T08:00:00Z`).toUTCString()}</pubDate><description>${xml(p.excerpt || plainText(p.body, 300))}</description><content:encoded><![CDATA[${markdownToHtml(p.body).replace(/]]>/g, "]]&gt;")}]]></content:encoded></item>`;
    })
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>${xml(TITLES[kind][locale])}</title><link>${xml(page)}</link><description>${xml(TITLES[kind][locale])}</description><language>${LOCALE_TAG[locale]}</language>${items}</channel></rss>`;
  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
