import { Fingerprint, KeyRound, ShieldCheck, Users } from "lucide-react";
import { ContactForm } from "@/components/landing-contact";
import { BeforeAfter } from "@/components/landing/before-after";
import { Demos } from "@/components/landing/demos";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { Hub } from "@/components/landing/hub";
import { Journey } from "@/components/landing/journey";
import { Nav } from "@/components/landing/nav";
import { Proof } from "@/components/landing/proof";
import { Profiles } from "@/components/landing/profiles";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/landing/site-footer";
import { Statement } from "@/components/landing/statement";
import { Story } from "@/components/landing/story";
import { ProductIcon } from "@/components/product-icon";
import { CONTACT_EMAIL, SUITE_NAME } from "@/lib/brand";
import { alternates, LOCALE_TAG, type Locale } from "@/lib/i18n";
import { baseUrl } from "@/server/auth";
import { localizedProducts } from "@/server/content";
import { publicProof } from "@/server/crm";
import { currentSession } from "@/server/http";

/** The words of the sections written in this file, in each language. */
const T = {
  fr: {
    title: `${SUITE_NAME} · la suite d'applications pour ton équipe et tes médias`,
    description: "Les outils de ton équipe, réunis sous un seul compte.",
    statement: { text: "Un seul compte. Un seul design. Toutes tes applications, enfin au même endroit.", accent: ["compte", "design", "endroit"] },
    account: {
      eyebrow: "Un seul compte",
      title: ["Comme chez les grands,", "mais à toi."],
      text: `Ton compte ${SUITE_NAME} ouvre toutes les applications de la suite. Tu choisis qui accède à quoi, tu vois les appareils connectés, et tu peux tout couper en un clic.`,
      hub: "Ton compte",
      points: [
        { title: "Une connexion, partout", text: "Un mot de passe pour toute la suite, sans se reconnecter." },
        { title: "Face ID et clés d'accès", text: "Touch ID, clé de sécurité et double authentification." },
        { title: "Les bons accès", text: "Chacun voit uniquement les applications que tu lui ouvres." },
        { title: "Standard et ouvert", text: "OpenID Connect, le standard de Google et Microsoft." },
      ],
    },
    contact: { eyebrow: "Contact", title: ["Prêt à tout", "réunir ?"], text: "Dis-nous quelles applications t'intéressent et pour combien de personnes. On te répond rapidement avec un accès d'essai.", or: "Ou écris à" },
  },
  en: {
    title: `${SUITE_NAME} · the suite of apps for your team and your media`,
    description: "Your team's tools, together under a single account.",
    statement: { text: "One account. One design. All your apps, finally in one place.", accent: ["account", "design", "place"] },
    account: {
      eyebrow: "One account",
      title: ["Like the big players,", "but yours."],
      text: `Your ${SUITE_NAME} account opens every app in the suite. You choose who gets access to what, you see the connected devices, and you can cut everything off in one click.`,
      hub: "Your account",
      points: [
        { title: "One sign-in, everywhere", text: "One password for the whole suite, no signing in again." },
        { title: "Face ID and passkeys", text: "Touch ID, security keys and two-factor authentication." },
        { title: "The right access", text: "Everyone only sees the apps you open to them." },
        { title: "Standard and open", text: "OpenID Connect, the standard used by Google and Microsoft." },
      ],
    },
    contact: { eyebrow: "Contact", title: ["Ready to bring", "it all together?"], text: "Tell us which apps you're interested in and for how many people. We'll get back to you quickly with a trial account.", or: "Or write to" },
  },
  de: {
    title: `${SUITE_NAME} · die App-Suite für dein Team und deine Medien`,
    description: "Die Tools deines Teams, vereint unter einem Konto.",
    statement: { text: "Ein Konto. Ein Design. Alle deine Apps, endlich an einem Ort.", accent: ["Konto", "Design", "Ort"] },
    account: {
      eyebrow: "Ein Konto",
      title: ["Wie bei den Grossen,", "aber deins."],
      text: `Dein ${SUITE_NAME}-Konto öffnet alle Apps der Suite. Du bestimmst, wer worauf Zugriff hat, siehst die verbundenen Geräte und kannst alles mit einem Klick sperren.`,
      hub: "Dein Konto",
      points: [
        { title: "Eine Anmeldung, überall", text: "Ein Passwort für die ganze Suite, ohne neue Anmeldung." },
        { title: "Face ID und Passkeys", text: "Touch ID, Sicherheitsschlüssel und Zwei-Faktor-Authentifizierung." },
        { title: "Die richtigen Zugänge", text: "Alle sehen nur die Apps, die du für sie freigibst." },
        { title: "Standard und offen", text: "OpenID Connect, der Standard von Google und Microsoft." },
      ],
    },
    contact: { eyebrow: "Kontakt", title: ["Bereit, alles", "zu vereinen?"], text: "Sag uns, welche Apps dich interessieren und für wie viele Personen. Wir melden uns rasch mit einem Testzugang.", or: "Oder schreib an" },
  },
};

const ICONS = [KeyRound, Fingerprint, Users, ShieldCheck];

/** Title, description and the same page in the other languages, for the head of each version. */
export function landingMetadata(locale: Locale) {
  return {
    title: T[locale].title,
    description: T[locale].description,
    // The only pages meant to be found: the rest of the service stays out of search engines.
    robots: { index: true, follow: true },
    alternates: { languages: alternates("/") },
    openGraph: { title: T[locale].title, description: T[locale].description, locale: LOCALE_TAG[locale].replace("-", "_"), type: "website" as const },
    // The suite's « p » here; the rest of the service keeps the account's padlock (src/app/favicon.ico).
    icons: { icon: "/_compte/brand/postmelo/favicon.ico", apple: "/_compte/brand/postmelo/apple-touch-icon.png" },
  };
}

/** The public home page of the suite. It follows the theme of the device, or the one picked with the toggle of the nav. */
export async function LandingPage({ locale }: { locale: Locale }) {
  const t = T[locale];
  const session = await currentSession().catch(() => null);
  const products = localizedProducts(locale);
  const proof = publicProof();
  const signedIn = !!session;
  // Absolute: the same page is also served on postmelo.ch, where these paths belong to another app.
  const account = baseUrl();
  const admin = session?.user.role === "admin";
  const apps = products.map((p) => ({ id: p.id, name: p.name, color: p.color, category: p.category, family: p.family, status: p.status }));
  const story = products.map((p) => ({
    ...apps.find((a) => a.id === p.id)!,
    tagline: p.tagline,
    status: p.status,
    points: p.description
      .split("\n")
      .map((l) => l.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean),
  }));

  return (
    <div lang={LOCALE_TAG[locale]} className="landing relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="landing-grain" />
      <Nav suite={SUITE_NAME} signedIn={signedIn} admin={admin} account={account} locale={locale} />

      <main>
        <Hero apps={apps} suite={SUITE_NAME} signedIn={signedIn} locale={locale} account={account} />

        {/* Endless band of the apps */}
        <div className="relative overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="marquee flex w-max items-center gap-14">
            {[...products, ...products, ...products, ...products].map((p, n) => (
              <li key={`${p.id}-${n}`} className="flex items-center gap-3.5" aria-hidden={n >= products.length}>
                <ProductIcon id={p.id} color={p.color || undefined} size="sm" className="size-8" />
                <span className="font-display text-[30px] leading-none">{p.name}</span>
                <span className="text-[11.5px] uppercase tracking-[0.12em] text-ink-3">{p.category}</span>
              </li>
            ))}
          </ul>
        </div>

        <Profiles apps={apps} suite={SUITE_NAME} locale={locale} />

        <Story apps={story} locale={locale} />

        <Demos apps={story} locale={locale} />

        <Statement text={t.statement.text} accent={t.statement.accent} />

        {/* One account */}
        <section id="compte" className="relative scroll-mt-20">
          <div className="mx-auto grid max-w-[1160px] items-center gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.account.eyebrow}</p>
              <h2 className="mt-4 font-display text-[clamp(40px,5.6vw,76px)] leading-[0.92]">
                {t.account.title[0]}
                <br />
                <span className="italic text-ink-2">{t.account.title[1]}</span>
              </h2>
              <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-ink-2">
                {t.account.text}
              </p>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {t.account.points.map(({ title, text }, n) => ({ icon: ICONS[n], title, text })).map(({ icon: Icon, title, text }, n) => (
                  <Reveal as="li" key={title} delay={120 + n * 90} className="group rounded-2xl border border-line bg-[var(--glass-025)] p-5 transition-colors duration-500 hover:border-accent/30 hover:bg-[var(--glass-04)]">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-medium">{title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">{text}</p>
                  </Reveal>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}>
              <Hub apps={apps} label={t.account.hub} />
            </Reveal>
          </div>
        </section>

        <Journey apps={apps} locale={locale} />

        <BeforeAfter locale={locale} />

        <Proof proof={proof} locale={locale} />

        <Faq apps={apps} suite={SUITE_NAME} locale={locale} />

        {/* Contact */}
        <section id="contact" className="relative scroll-mt-20 overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 -z-0 mx-auto h-[70%] max-w-[1200px] contact-glow" />
          <div className="relative mx-auto grid max-w-[1160px] gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.contact.eyebrow}</p>
              <h2 className="mt-4 font-display text-[clamp(52px,8vw,120px)] leading-[0.86] tracking-[-0.015em]">
                {t.contact.title[0]}
                <br />
                <span className="italic text-accent">{t.contact.title[1]}</span>
              </h2>
              <p className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-ink-2">
                {t.contact.text}
              </p>
              <p className="mt-6 text-[14px] text-ink-3">
                {t.contact.or}{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink hover:text-accent">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </Reveal>
            <Reveal delay={150}>
              <ContactForm products={products.map((p) => ({ id: p.id, name: p.name }))} locale={locale} />
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} signedIn={signedIn} account={account} />
    </div>
  );
}
