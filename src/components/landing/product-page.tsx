import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveDemo } from "@/components/demos";
import { ContactForm } from "@/components/landing-contact";
import { appColor, readable } from "@/components/landing/color";
import { Nav } from "@/components/landing/nav";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/landing/site-footer";
import { ProductIcon } from "@/components/product-icon";
import { CONTACT_EMAIL, SUITE_NAME } from "@/lib/brand";
import { TRY } from "@/lib/demo-tips";
import { alternates, LOCALE_TAG, LOCALES, localePath, type Locale } from "@/lib/i18n";
import { productPage } from "@/lib/product-pages";
import { STATUS_LABEL } from "@/lib/site-text";
import { primaryClass } from "@/lib/styles";
import { baseUrl } from "@/server/auth";
import { localizedProducts } from "@/server/content";
import { currentSession, siteUrl } from "@/server/http";

/** The words of the page around each app's own text, in each language. */
const T = {
  fr: {
    breadcrumb: "Fil d'Ariane",
    notify: "Être prévenu du lancement",
    try: (name: string) => `Essayer ${name}`,
    demo: "Voir la démo",
    tip: "À essayer :",
    what: (name: string) => `Ce que fait ${name}`,
    who: "Pour qui",
    whoTitle: ["Pensé pour", "les équipes qui créent."],
    suite: "Avec le reste de la suite",
    suiteTitle: ["Un seul compte,", "et tout se parle."],
    discover: (name: string) => `Découvrir ${name}`,
    questions: "Questions",
    allAbout: "Tout sur",
    soon: "Bientôt",
    tryIt: "Essayer",
    firstTitle: ["Sois le premier", "prévenu."],
    readyTitle: "Prêt à essayer",
    readyName: (name: string) => `${name} ?`,
    soonText: (name: string) => `Laisse ton adresse : on te prévient dès que ${name} est prêt.`,
    tryText: (name: string) => `Dis-nous pour combien de personnes. On te répond rapidement avec un accès d'essai à ${name}, et au reste de la suite si tu veux.`,
    or: "Ou écris à",
    others: `Les autres applications ${SUITE_NAME}`,
    all: "Voir toute la suite",
  },
  en: {
    breadcrumb: "Breadcrumb",
    notify: "Get notified at launch",
    try: (name: string) => `Try ${name}`,
    demo: "See the demo",
    tip: "Try this:",
    what: (name: string) => `What ${name} does`,
    who: "Who it's for",
    whoTitle: ["Built for", "teams that create."],
    suite: "With the rest of the suite",
    suiteTitle: ["One account,", "and everything connects."],
    discover: (name: string) => `Discover ${name}`,
    questions: "Questions",
    allAbout: "All about",
    soon: "Coming soon",
    tryIt: "Try it",
    firstTitle: ["Be the first", "to know."],
    readyTitle: "Ready to try",
    readyName: (name: string) => `${name}?`,
    soonText: (name: string) => `Leave your address: we'll let you know as soon as ${name} is ready.`,
    tryText: (name: string) => `Tell us for how many people. We'll get back to you quickly with a trial account for ${name}, and for the rest of the suite if you like.`,
    or: "Or write to",
    others: `The other ${SUITE_NAME} apps`,
    all: "See the whole suite",
  },
  de: {
    breadcrumb: "Brotkrümelnavigation",
    notify: "Zum Start benachrichtigen",
    try: (name: string) => `${name} testen`,
    demo: "Demo ansehen",
    tip: "Probier mal:",
    what: (name: string) => `Was ${name} kann`,
    who: "Für wen",
    whoTitle: ["Gemacht für", "Teams, die gestalten."],
    suite: "Mit dem Rest der Suite",
    suiteTitle: ["Ein Konto,", "und alles spielt zusammen."],
    discover: (name: string) => `${name} entdecken`,
    questions: "Fragen",
    allAbout: "Alles über",
    soon: "Demnächst",
    tryIt: "Testen",
    firstTitle: ["Erfahre es", "als Erster."],
    readyTitle: "Bereit für",
    readyName: (name: string) => `${name}?`,
    soonText: (name: string) => `Hinterlass deine Adresse: Wir sagen dir Bescheid, sobald ${name} bereit ist.`,
    tryText: (name: string) => `Sag uns, für wie viele Personen. Wir melden uns rasch mit einem Testzugang für ${name} und, wenn du willst, für den Rest der Suite.`,
    or: "Oder schreib an",
    others: `Die anderen ${SUITE_NAME}-Apps`,
    all: "Die ganze Suite ansehen",
  },
};

/** The public app of the catalogue with this id, in this language, with its page; none for a hidden or unknown one. */
function find(id: string, locale: Locale) {
  const products = localizedProducts(locale);
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  return { product, products, page: productPage(product, locale) };
}

/** Whether a public app of the catalogue lives at /<id>. */
export const isProductPage = (id: string) => localizedProducts("fr").some((p) => p.id === id);

/** Where the page lives for search engines: on the public site when there is one. */
const site = () => siteUrl() ?? baseUrl();

/** The address of an app's page in each language. */
const languagesOf = (id: string) => Object.fromEntries(LOCALES.map((l) => [l, localePath(l, `/${id}`)])) as Record<Locale, string>;

/** Title, description and the same page in the other languages, for the head of each version. */
export function productMetadata(id: string, locale: Locale): Metadata {
  const found = find(id, locale);
  if (!found) return {};
  const { product, page } = found;
  const title = `${product.name} · ${page.title} | ${SUITE_NAME}`;
  const description = `${product.tagline} ${page.intro}`.slice(0, 300).replace(/\s+\S*$/, "…");
  const url = `${site()}${localePath(locale, `/${product.id}`)}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alternates(`/${product.id}`) },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, siteName: SUITE_NAME, type: "website", locale: LOCALE_TAG[locale].replace("-", "_") },
    twitter: { card: "summary_large_image", title, description },
    icons: { icon: "/_compte/brand/postmelo/favicon.ico", apple: "/_compte/brand/postmelo/apple-touch-icon.png" },
  };
}

const eyebrow = "text-[12.5px] font-medium uppercase tracking-[0.2em]";

/** The page of one app: what it does, its live demo, who it is for, how it fits the suite, and a way to try it. */
export async function ProductPage({ id, locale }: { id: string; locale: Locale }) {
  const found = find(id, locale);
  if (!found) notFound();
  const t = T[locale];
  const { product: p, products, page } = found;
  const session = await currentSession().catch(() => null);
  const signedIn = !!session;
  // Absolute: the same page is also served on postmelo.ch, where these paths belong to another app.
  const account = baseUrl();
  const home = localePath(locale, "/");
  const languages = languagesOf(p.id);
  const tip = TRY[locale][p.id];
  const c = appColor(p.color);
  const ink = readable(c);
  const others = products.filter((x) => x.id !== p.id);
  const links = page.links.filter((l) => others.some((o) => o.id === l.id));
  const url = `${site()}${localePath(locale, `/${p.id}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: p.name,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: p.category,
        operatingSystem: page.platforms,
        description: page.intro,
        url,
        inLanguage: LOCALE_TAG[locale],
        publisher: { "@type": "Organization", name: SUITE_NAME, url: site(), email: CONTACT_EMAIL },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SUITE_NAME, item: `${site()}${home === "/" ? "" : home}` },
          { "@type": "ListItem", position: 2, name: p.name, item: url },
        ],
      },
    ],
  };

  return (
    <div lang={LOCALE_TAG[locale]} className="landing relative min-h-dvh overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden className="landing-grain" />
      <Nav suite={SUITE_NAME} signedIn={signedIn} admin={session?.user.role === "admin"} account={account} locale={locale} languages={languages} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[900px]" style={{ background: `radial-gradient(50% 50% at 50% 30%, light-dark(color-mix(in oklab, ${c} 14%, transparent), color-mix(in oklab, ${c} 22%, transparent)), transparent 75%)` }} />
          <div className="mx-auto max-w-[1160px] px-4 pb-14 pt-32 text-center sm:px-6 sm:pt-40">
            <nav aria-label={t.breadcrumb} className="rise-blur text-[13px] text-ink-3">
              <Link href={home} className="hover:text-ink">
                {SUITE_NAME}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-ink-2">{p.name}</span>
            </nav>
            <h1 className="mt-8">
              <span className="rise-blur flex items-center justify-center gap-3.5" style={{ animationDelay: "80ms" }}>
                <ProductIcon id={p.id} color={p.color} size="lg" />
                <span className="font-display text-[clamp(40px,5vw,64px)] leading-none">{p.name}</span>
              </span>
              <span className="rise-blur mx-auto mt-7 block max-w-[980px] font-display text-[clamp(52px,9vw,128px)] leading-[0.88] tracking-[-0.02em]" style={{ animationDelay: "160ms" }}>
                {page.headline[0]}
                {page.headline[1] && (
                  <>
                    <br />
                    <span className="italic" style={{ color: ink }}>
                      {page.headline[1]}
                    </span>
                  </>
                )}
              </span>
            </h1>
            <p className="rise-blur mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-[13px] text-ink-3" style={{ animationDelay: "220ms" }}>
              {page.title}
              {p.status !== "disponible" && (
                <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `color-mix(in oklab, ${c} 18%, transparent)`, color: ink }}>
                  {STATUS_LABEL[locale][p.status]}
                </span>
              )}
            </p>
            <p className="rise-blur mx-auto mt-6 max-w-[640px] text-[17px] leading-relaxed text-ink-2" style={{ animationDelay: "260ms" }}>
              {page.intro}
            </p>
            <div className="rise-blur mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "320ms" }}>
              <a href="#contact" data-product={p.id} className={`press inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium ${primaryClass}`}>
                {p.status === "bientot" ? t.notify : t.try(p.name)}
                <ArrowRight className="size-4" />
              </a>
              <a href="#demo" className="press inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-[15px] font-medium text-ink hover:bg-[var(--glass-05)]">
                {t.demo}
              </a>
            </div>
          </div>

          {/* Live demo */}
          <div id="demo" className="mx-auto max-w-[1120px] scroll-mt-24 px-4 pb-10 sm:px-6">
            <Reveal className="h-[500px] sm:h-[560px]">
              <LiveDemo id={p.id} name={p.name} color={p.color} locale={locale} />
            </Reveal>
            {tip && (
              <p className="mx-auto mt-6 max-w-[620px] text-center text-[14px] text-ink-3">
                <span className="font-medium" style={{ color: ink }}>
                  {t.tip}{" "}
                </span>
                {tip}
              </p>
            )}
          </div>
        </section>

        {/* What it does */}
        <section id="fonctions" className="relative scroll-mt-20">
          <div className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6">
            <Reveal className="max-w-[720px]">
              <p className={eyebrow} style={{ color: ink }}>
                {t.what(p.name)}
              </p>
              <h2 className="mt-4 font-display text-[clamp(40px,5.4vw,76px)] leading-[0.92]">
                {p.tagline.replace(/\.$/, "")}
                <span style={{ color: ink }}>.</span>
              </h2>
            </Reveal>
            <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.features.map(({ icon: Icon, title, text }, n) => (
                <Reveal as="li" key={title} delay={(n % 3) * 90} className="group rounded-[22px] border border-line bg-[var(--glass-025)] p-6 transition-colors duration-500 hover:border-line-strong hover:bg-[var(--glass-04)]">
                  <span className="flex size-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: `color-mix(in oklab, ${c} 16%, transparent)`, color: ink }}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-medium">{title}</h3>
                  {text && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{text}</p>}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Who it is for */}
        {page.uses.length > 0 && (
          <section className="relative border-y border-line">
            <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <p className={eyebrow} style={{ color: ink }}>
                  {t.who}
                </p>
                <h2 className="mt-4 font-display text-[clamp(40px,4.6vw,64px)] leading-[0.92]">
                  {t.whoTitle[0]}
                  <br />
                  <span className="italic text-ink-2">{t.whoTitle[1]}</span>
                </h2>
              </Reveal>
              <ul className="flex flex-col">
                {page.uses.map((u, n) => (
                  <Reveal as="li" key={u.who} delay={n * 90} className="flex gap-5 border-b border-line py-6 first:pt-0 last:border-0">
                    <span className="font-display text-[34px] leading-none" style={{ color: ink }}>
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[17px] font-medium">{u.who}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{u.text}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* With the rest of the suite */}
        {links.length > 0 && (
          <section className="relative">
            <div className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6">
              <Reveal className="text-center">
                <p className={`${eyebrow} text-accent`}>{t.suite}</p>
                <h2 className="mx-auto mt-4 max-w-[760px] font-display text-[clamp(40px,5vw,72px)] leading-[0.92]">
                  {t.suiteTitle[0]}
                  <br />
                  <span className="italic text-ink-2">{t.suiteTitle[1]}</span>
                </h2>
              </Reveal>
              <ul className="mt-14 grid gap-3 md:grid-cols-3">
                {links.map((l, n) => {
                  const o = others.find((x) => x.id === l.id)!;
                  return (
                    <Reveal as="li" key={l.id} delay={n * 90}>
                      <a href={localePath(locale, `/${o.id}`)} className="group flex h-full flex-col rounded-[22px] border border-line bg-[var(--glass-025)] p-6 transition-colors duration-500 hover:border-line-strong hover:bg-[var(--glass-04)]">
                        <span className="flex items-center gap-3">
                          <ProductIcon id={p.id} color={p.color} size="sm" className="size-9" />
                          <Plus className="size-3.5 text-ink-3" />
                          <ProductIcon id={o.id} color={o.color} size="sm" className="size-9" />
                        </span>
                        <p className="mt-5 flex-1 text-[15px] leading-relaxed text-ink-2">{l.text}</p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: readable(appColor(o.color)) }}>
                          {t.discover(o.name)}
                          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </a>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Questions */}
        <section id="questions" className="relative scroll-mt-20 border-t border-line">
          <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <p className={eyebrow} style={{ color: ink }}>
                {t.questions}
              </p>
              <h2 className="mt-4 font-display text-[clamp(40px,4.4vw,64px)] leading-[0.92]">
                {t.allAbout}
                <br />
                <span className="italic text-ink-2">{p.name}.</span>
              </h2>
            </Reveal>
            <Reveal delay={120} className="flex flex-col gap-3">
              {page.faq.map(({ q, a }, n) => (
                <details key={q} name="faq" open={n === 0} className="faq group rounded-[22px] border border-line bg-[var(--glass-025)] transition-colors duration-500 open:border-line-strong open:bg-[var(--glass-04)] hover:border-line-strong">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                    <h3 className="flex-1">{q}</h3>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--glass-05)] text-ink-2 transition-[transform,background-color,color] duration-500 group-open:rotate-45 group-open:bg-accent group-open:text-accent-ink" style={{ transitionTimingFunction: "var(--ease-out)" }}>
                      <Plus className="size-4" strokeWidth={2.2} />
                    </span>
                  </summary>
                  <div>
                    <p className="max-w-[620px] px-6 pb-6 text-[15px] leading-relaxed text-ink-2">{a}</p>
                  </div>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Try it */}
        <section id="contact" className="relative scroll-mt-20 overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 mx-auto h-[70%] max-w-[1200px]" style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${c} 16%, transparent), transparent)` }} />
          <div className="relative mx-auto grid max-w-[1160px] gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className={eyebrow} style={{ color: ink }}>
                {p.status === "bientot" ? t.soon : t.tryIt}
              </p>
              <h2 className="mt-4 font-display text-[clamp(52px,8vw,112px)] leading-[0.86] tracking-[-0.015em]">
                {p.status === "bientot" ? t.firstTitle[0] : t.readyTitle}
                <br />
                <span className="italic" style={{ color: ink }}>
                  {p.status === "bientot" ? t.firstTitle[1] : t.readyName(p.name)}
                </span>
              </h2>
              <p className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-ink-2">
                {p.status === "bientot" ? t.soonText(p.name) : t.tryText(p.name)}
              </p>
              <p className="mt-6 text-[14px] text-ink-3">
                {t.or}{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink hover:text-accent">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </Reveal>
            <Reveal delay={150}>
              <ContactForm products={products.map((x) => ({ id: x.id, name: x.name }))} product={p.id} locale={locale} />
            </Reveal>
          </div>
        </section>

        {/* The other apps */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1160px] px-4 py-16 sm:px-6">
            <p className="text-center text-[12.5px] font-medium uppercase tracking-[0.2em] text-ink-3">{t.others}</p>
            <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
              {others.map((o) => (
                <li key={o.id}>
                  <a href={localePath(locale, `/${o.id}`)} className="press flex items-center gap-2.5 rounded-full border border-line bg-[var(--glass-025)] py-1.5 pl-1.5 pr-4 text-[14px] font-medium hover:border-line-strong hover:bg-[var(--glass-04)]">
                    <ProductIcon id={o.id} color={o.color} size="sm" className="size-7" />
                    {o.name}
                    <span className="text-[12px] font-normal text-ink-3 max-sm:hidden">{o.category}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center">
              <Link href={home} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent">
                {t.all} <ArrowRight className="size-4" />
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} signedIn={signedIn} account={account} languages={languages} />
    </div>
  );
}
