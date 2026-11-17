import { ArrowLeft, ArrowRight, Rss } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/landing/reveal";
import { ProductIcon } from "@/components/product-icon";
import { SUITE_NAME } from "@/lib/brand";
import { alternates, LOCALE_NAME, LOCALE_TAG, LOCALES, localePath, longDate, type Locale } from "@/lib/i18n";
import { markdownToHtml, plainText, readingMinutes } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { getPublishedPost, listPosts, localizedProducts, publishedTranslations, type Post } from "@/server/content";
import { SitePage } from "./site-page";

/** The public blog and changelog, in the three languages of the site. */

const T = {
  fr: {
    blog: { eyebrow: "Blog", title: ["Ce qu'on fabrique,", "et pourquoi."], intro: `Les nouveautés de ${SUITE_NAME}, nos choix et la façon dont les équipes utilisent la suite.`, empty: "Les premiers articles arrivent bientôt.", read: "Lire l'article", minutes: (n: number) => `${n} min de lecture`, all: "Tous les articles", by: "Par", next: "Envie d'essayer ?", nextText: "Dis-nous ce dont ton équipe a besoin, on te répond avec un accès d'essai.", cta: "Demander un accès", alsoIn: "Aussi en", metaTitle: `Blog · ${SUITE_NAME}` },
    changelog: { eyebrow: "Nouveautés", title: ["Ce qui change", "dans la suite."], intro: "Chaque nouveauté, amélioration et correction des applications, au fil des versions.", empty: "Aucune nouveauté publiée pour l'instant.", all: "Toutes les apps", suite: "Toute la suite", metaTitle: `Nouveautés · ${SUITE_NAME}`, rss: "Flux RSS" },
    change: { nouveau: "Nouveau", amelioration: "Amélioration", correction: "Correction" } as Record<string, string>,
  },
  en: {
    blog: { eyebrow: "Blog", title: ["What we build,", "and why."], intro: `News from ${SUITE_NAME}, the choices we make and how teams use the suite.`, empty: "The first articles are coming soon.", read: "Read the article", minutes: (n: number) => `${n} min read`, all: "All articles", by: "By", next: "Want to try it?", nextText: "Tell us what your team needs, and we'll get back to you with a trial account.", cta: "Request access", alsoIn: "Also in", metaTitle: `Blog · ${SUITE_NAME}` },
    changelog: { eyebrow: "What's new", title: ["What's changing", "in the suite."], intro: "Every new feature, improvement and fix across the apps, release after release.", empty: "Nothing published yet.", all: "All apps", suite: "Whole suite", metaTitle: `What's new · ${SUITE_NAME}`, rss: "RSS feed" },
    change: { nouveau: "New", amelioration: "Improved", correction: "Fixed" } as Record<string, string>,
  },
  de: {
    blog: { eyebrow: "Blog", title: ["Was wir bauen,", "und warum."], intro: `Neuigkeiten von ${SUITE_NAME}, unsere Entscheidungen und wie Teams die Suite nutzen.`, empty: "Die ersten Artikel kommen bald.", read: "Artikel lesen", minutes: (n: number) => `${n} Min. Lesezeit`, all: "Alle Artikel", by: "Von", next: "Lust, es auszuprobieren?", nextText: "Sag uns, was dein Team braucht, und wir melden uns mit einem Testzugang.", cta: "Zugang anfragen", alsoIn: "Auch auf", metaTitle: `Blog · ${SUITE_NAME}` },
    changelog: { eyebrow: "Neuigkeiten", title: ["Was sich", "in der Suite ändert."], intro: "Jede Neuerung, Verbesserung und Korrektur der Apps, Version für Version.", empty: "Noch nichts veröffentlicht.", all: "Alle Apps", suite: "Ganze Suite", metaTitle: `Neuigkeiten · ${SUITE_NAME}`, rss: "RSS-Feed" },
    change: { nouveau: "Neu", amelioration: "Verbessert", correction: "Behoben" } as Record<string, string>,
  },
};

const CHANGE_STYLE: Record<string, string> = {
  nouveau: "bg-accent-soft text-accent",
  amelioration: "bg-[color-mix(in_oklab,#4f56e8_16%,transparent)] text-[light-dark(#3d43c4,#a5a9ff)]",
  correction: "bg-[color-mix(in_oklab,#e5a00d_18%,transparent)] text-[light-dark(#8a5d00,#f5c55c)]",
};

const eyebrow = "text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent";

function Header({ kicker, title, intro, children }: { kicker: string; title: string[]; intro: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mx-auto max-w-[1160px] px-4 pb-14 pt-36 sm:px-6 sm:pt-40">
      <p className={eyebrow}>{kicker}</p>
      <h1 className="mt-4 max-w-[900px] font-display text-[clamp(48px,7.4vw,104px)] leading-[0.9] tracking-[-0.015em]">
        {title[0]}
        <br />
        <span className="italic text-ink-2">{title[1]}</span>
      </h1>
      <p className="mt-6 max-w-[560px] text-[16.5px] leading-relaxed text-ink-2">{intro}</p>
      {children}
    </Reveal>
  );
}

// ---- Blog: the list

export function blogIndexMetadata(locale: Locale): Metadata {
  return {
    title: T[locale].blog.metaTitle,
    description: T[locale].blog.intro,
    robots: { index: true, follow: true },
    alternates: { languages: alternates("/blog"), types: { "application/rss+xml": localePath(locale, "/blog/rss.xml") } },
  };
}

export function BlogIndex({ locale }: { locale: Locale }) {
  const t = T[locale].blog;
  const posts = listPosts({ kind: "blog", locale, published: true });
  const [first, ...rest] = posts;
  const languages = Object.fromEntries(LOCALES.map((l) => [l, localePath(l, "/blog")]));
  return (
    <SitePage locale={locale} languages={languages}>
      <Header kicker={t.eyebrow} title={t.title} intro={t.intro}>
        <a href={localePath(locale, "/blog/rss.xml")} className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
          <Rss className="size-3.5" /> RSS
        </a>
      </Header>
      <div className="mx-auto max-w-[1160px] px-4 pb-28 sm:px-6">
        {!first ? (
          <p className="rounded-[28px] border border-dashed border-line-strong px-6 py-16 text-center text-[15px] text-ink-3">{t.empty}</p>
        ) : (
          <>
            <Reveal>
              <a href={localePath(locale, `/blog/${first.slug}`)} className="group relative block overflow-hidden rounded-[32px] border border-line bg-[var(--glass-025)] p-8 shadow-[var(--shadow)] transition-colors duration-500 hover:border-line-strong hover:bg-[var(--glass-04)] sm:p-12">
                <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }} />
                <PostMeta post={first} locale={locale} />
                <h2 className="relative mt-5 max-w-[820px] text-balance font-display text-[clamp(36px,4.6vw,64px)] leading-[0.95]">{first.title}</h2>
                <p className="relative mt-5 max-w-[640px] text-[16.5px] leading-relaxed text-ink-2">{first.excerpt || plainText(first.body, 260)}</p>
                <span className="relative mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-accent">
                  {t.read} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
            {rest.length > 0 && (
              <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, n) => (
                  <Reveal as="li" key={p.id} delay={(n % 3) * 100}>
                    <a href={localePath(locale, `/blog/${p.slug}`)} className="group flex h-full flex-col rounded-[26px] border border-line bg-[var(--glass-025)] p-7 transition-colors duration-500 hover:border-line-strong hover:bg-[var(--glass-04)]">
                      <PostMeta post={p} locale={locale} />
                      <h2 className="mt-4 text-balance font-display text-[30px] leading-[1]">{p.title}</h2>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">{p.excerpt || plainText(p.body)}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[13.5px] font-medium text-ink-2 group-hover:text-accent">
                        {t.read} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </a>
                  </Reveal>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </SitePage>
  );
}

function PostMeta({ post, locale }: { post: Post; locale: Locale }) {
  return (
    <p className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
      {post.published_at && <time dateTime={post.published_at}>{longDate(post.published_at, locale)}</time>}
      <span aria-hidden className="h-px w-5 bg-line-strong" />
      <span>{T[locale].blog.minutes(readingMinutes(post.body))}</span>
    </p>
  );
}

// ---- Blog: one article

export function blogPostMetadata(locale: Locale, slug: string): Metadata {
  const post = getPublishedPost("blog", locale, slug);
  if (!post) return {};
  const others = publishedTranslations(post.group_id);
  const languages: Record<string, string> = {};
  for (const [l, s] of Object.entries(others) as [Locale, string][]) languages[LOCALE_TAG[l]] = localePath(l, `/blog/${s}`);
  const description = post.excerpt || plainText(post.body, 160);
  return {
    title: `${post.title} · ${SUITE_NAME}`,
    description,
    robots: { index: true, follow: true },
    alternates: { languages },
    openGraph: { title: post.title, description, type: "article", publishedTime: post.published_at ?? undefined, locale: LOCALE_TAG[locale].replace("-", "_") },
  };
}

export function BlogPost({ locale, slug }: { locale: Locale; slug: string }) {
  const post = getPublishedPost("blog", locale, slug);
  if (!post) notFound();
  const t = T[locale].blog;
  const others = publishedTranslations(post.group_id);
  // The switcher goes to this article in the other language when it exists, otherwise to that blog.
  const languages = Object.fromEntries(LOCALES.map((l) => [l, others[l] ? localePath(l, `/blog/${others[l]}`) : localePath(l, "/blog")]));
  const translated = LOCALES.filter((l) => l !== locale && others[l]);
  return (
    <SitePage locale={locale} languages={languages}>
      <article className="mx-auto max-w-[760px] px-4 pb-24 pt-32 sm:px-6 sm:pt-36">
        <Reveal>
          <a href={localePath(locale, "/blog")} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
            <ArrowLeft className="size-4" /> {t.all}
          </a>
          <div className="mt-8">
            <PostMeta post={post} locale={locale} />
          </div>
          <h1 className="mt-5 text-balance font-display text-[clamp(44px,6.4vw,84px)] leading-[0.92] tracking-[-0.012em]">{post.title}</h1>
          {post.excerpt && <p className="mt-6 text-[19px] leading-snug text-ink">{post.excerpt}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-line py-3 text-[13px] text-ink-3">
            {post.author && (
              <span>
                {t.by} <span className="font-medium text-ink-2">{post.author}</span>
              </span>
            )}
            {translated.length > 0 && (
              <span className="ml-auto">
                {t.alsoIn}{" "}
                {translated.map((l, i) => (
                  <span key={l}>
                    {i > 0 && " · "}
                    <a href={localePath(l, `/blog/${others[l]}`)} hrefLang={l} className="font-medium text-ink-2 hover:text-accent">
                      {LOCALE_NAME[l]}
                    </a>
                  </span>
                ))}
              </span>
            )}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="site-prose mt-10" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body) }} />
        </Reveal>
        <Reveal className="relative mt-20 overflow-hidden rounded-[28px] border border-accent/30 bg-[image:var(--after-gradient)] p-8 sm:p-10">
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/20 blur-3xl" />
          <p className="relative font-display text-[36px] leading-none">{t.next}</p>
          <p className="relative mt-3 max-w-[460px] text-[15px] leading-relaxed text-ink-2">{t.nextText}</p>
          <a href={`${localePath(locale, "/")}#contact`} className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[14.5px] font-medium text-accent-ink hover:brightness-[1.06]">
            {t.cta} <ArrowRight className="size-4" />
          </a>
        </Reveal>
      </article>
    </SitePage>
  );
}

// ---- Changelog

export function changelogMetadata(locale: Locale): Metadata {
  return {
    title: T[locale].changelog.metaTitle,
    description: T[locale].changelog.intro,
    robots: { index: true, follow: true },
    alternates: { languages: alternates("/changelog"), types: { "application/rss+xml": localePath(locale, "/changelog/rss.xml") } },
  };
}

export function Changelog({ locale, app }: { locale: Locale; app?: string }) {
  const t = T[locale].changelog;
  const products = localizedProducts(locale);
  const all = listPosts({ kind: "changelog", locale, published: true });
  const used = products.filter((p) => all.some((e) => e.product_id === p.id));
  const entries = app ? all.filter((e) => e.product_id === app) : all;
  const product = (id: string | null) => products.find((p) => p.id === id);
  // Grouped by month, newest first.
  const months: { key: string; label: string; items: Post[] }[] = [];
  for (const e of entries) {
    const key = (e.published_at ?? "").slice(0, 7);
    let m = months.find((x) => x.key === key);
    if (!m) {
      const label = new Date(`${key}-15T12:00:00`).toLocaleDateString(locale === "en" ? "en-GB" : LOCALE_TAG[locale], { month: "long", year: "numeric" });
      m = { key, label: label.charAt(0).toUpperCase() + label.slice(1), items: [] };
      months.push(m);
    }
    m.items.push(e);
  }
  const base = localePath(locale, "/changelog");
  const languages = Object.fromEntries(LOCALES.map((l) => [l, localePath(l, "/changelog")]));
  return (
    <SitePage locale={locale} languages={languages}>
      <Header kicker={t.eyebrow} title={t.title} intro={t.intro}>
        {used.length > 0 && (
          <nav className="mt-8 flex flex-wrap items-center gap-2">
            <a href={base} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-medium", !app ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong hover:text-ink")}>
              {t.all}
            </a>
            {used.map((p) => (
              <a key={p.id} href={`${base}?app=${p.id}`} className={cn("flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-[13px] font-medium", app === p.id ? "border-accent/40 bg-accent-soft text-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink")}>
                <ProductIcon id={p.id} color={p.color} size="sm" className="size-6 rounded-full" />
                {p.name}
              </a>
            ))}
            <a href={localePath(locale, "/changelog/rss.xml")} className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
              <Rss className="size-3.5" /> {t.rss}
            </a>
          </nav>
        )}
      </Header>
      <div className="mx-auto max-w-[1160px] px-4 pb-28 sm:px-6">
        {months.length === 0 ? (
          <p className="rounded-[28px] border border-dashed border-line-strong px-6 py-16 text-center text-[15px] text-ink-3">{t.empty}</p>
        ) : (
          months.map((m) => (
            <section key={m.key} className="grid gap-6 border-t border-line py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
              <h2 className="font-display text-[30px] leading-none lg:sticky lg:top-28 lg:self-start">{m.label}</h2>
              <ol className="flex flex-col gap-4">
                {m.items.map((e) => {
                  const p = product(e.product_id);
                  return (
                    <Reveal as="li" key={e.id} id={e.slug} className="scroll-mt-28 rounded-[24px] border border-line bg-[var(--glass-025)] p-6 sm:p-7">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-ink-3">
                        {p ? (
                          <span className="flex items-center gap-2 font-medium text-ink-2">
                            <ProductIcon id={p.id} color={p.color} size="sm" className="size-6 rounded-[7px]" />
                            {p.name}
                          </span>
                        ) : (
                          <span className="font-medium text-ink-2">{t.suite}</span>
                        )}
                        {e.change && <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-medium", CHANGE_STYLE[e.change])}>{T[locale].change[e.change]}</span>}
                        {e.version && <span className="font-mono text-[12px]">v{e.version}</span>}
                        {e.published_at && (
                          <time dateTime={e.published_at} className="ml-auto">
                            {longDate(e.published_at, locale)}
                          </time>
                        )}
                      </p>
                      <h3 className="mt-4 text-[20px] font-medium leading-snug text-ink">
                        <a href={`#${e.slug}`} className="hover:text-accent">
                          {e.title}
                        </a>
                      </h3>
                      {e.body && <div className="site-prose compact mt-3" dangerouslySetInnerHTML={{ __html: markdownToHtml(e.body) }} />}
                    </Reveal>
                  );
                })}
              </ol>
            </section>
          ))
        )}
      </div>
    </SitePage>
  );
}
