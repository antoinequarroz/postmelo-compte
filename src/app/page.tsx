import { Fingerprint, KeyRound, ShieldCheck, Users } from "lucide-react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/landing-contact";
import { BeforeAfter } from "@/components/landing/before-after";
import { Hero } from "@/components/landing/hero";
import { Hub } from "@/components/landing/hub";
import { Nav } from "@/components/landing/nav";
import { Reveal } from "@/components/landing/reveal";
import { Statement } from "@/components/landing/statement";
import { Story } from "@/components/landing/story";
import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";
import { CONTACT_EMAIL, SUITE_NAME, SUITE_TAGLINE } from "@/lib/brand";
import { listProducts } from "@/server/crm";
import { currentSession } from "@/server/http";

export const dynamic = "force-dynamic";

// The bar of mobile browsers takes the paper or the night of the page.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export const metadata: Metadata = {
  title: `${SUITE_NAME} · la suite d'applications pour ton équipe et tes médias`,
  description: SUITE_TAGLINE,
  // The only page meant to be found: the rest of the service stays out of search engines.
  robots: { index: true, follow: true },
};

/** The public home page of the suite. It follows the theme of the device, or the one picked with the toggle of the nav. */
export default async function HomePage() {
  const session = await currentSession().catch(() => null);
  const products = listProducts(true);
  const signedIn = !!session;
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
    <div className="landing relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="landing-grain" />
      <Nav suite={SUITE_NAME} signedIn={signedIn} admin={admin} />

      <main>
        <Hero apps={apps} suite={SUITE_NAME} signedIn={signedIn} />

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

        <Story apps={story} />

        <Statement text="Un seul compte. Un seul design. Toutes tes applications, enfin au même endroit." accent={["compte", "design", "endroit"]} />

        {/* One account */}
        <section id="compte" className="relative scroll-mt-20">
          <div className="mx-auto grid max-w-[1160px] items-center gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Un seul compte</p>
              <h2 className="mt-4 font-display text-[clamp(40px,5.6vw,76px)] leading-[0.92]">
                Comme chez les grands,
                <br />
                <span className="italic text-ink-2">mais à toi.</span>
              </h2>
              <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-ink-2">
                Ton compte {SUITE_NAME} ouvre toutes les applications de la suite. Tu choisis qui accède à quoi, tu vois les appareils connectés, et tu peux tout couper en un clic.
              </p>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: KeyRound, title: "Une connexion, partout", text: "Un mot de passe pour toute la suite, sans se reconnecter." },
                  { icon: Fingerprint, title: "Face ID et clés d'accès", text: "Touch ID, clé de sécurité et double authentification." },
                  { icon: Users, title: "Les bons accès", text: "Chacun voit uniquement les applications que tu lui ouvres." },
                  { icon: ShieldCheck, title: "Standard et ouvert", text: "OpenID Connect, le standard de Google et Microsoft." },
                ].map(({ icon: Icon, title, text }, n) => (
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
              <Hub apps={apps} />
            </Reveal>
          </div>
        </section>

        <BeforeAfter />

        {/* Contact */}
        <section id="contact" className="relative scroll-mt-20 overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 -z-0 mx-auto h-[70%] max-w-[1200px] contact-glow" />
          <div className="relative mx-auto grid max-w-[1160px] gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Contact</p>
              <h2 className="mt-4 font-display text-[clamp(52px,8vw,120px)] leading-[0.86] tracking-[-0.015em]">
                Prêt à tout
                <br />
                <span className="italic text-accent">réunir ?</span>
              </h2>
              <p className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-ink-2">
                Dis-nous quelles applications t&apos;intéressent et pour combien de personnes. On te répond rapidement avec un accès d&apos;essai.
              </p>
              <p className="mt-6 text-[14px] text-ink-3">
                Ou écris à{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink hover:text-accent">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </Reveal>
            <Reveal delay={150}>
              <ContactForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden border-t border-line">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-5 px-4 pt-10 text-[13px] text-ink-3 sm:px-6">
          <Logo className="size-6" />
          <span>© {new Date().getFullYear()} {SUITE_NAME}</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
            {CONTACT_EMAIL}
          </a>
          <Link href={signedIn ? "/compte" : "/connexion"} className="ml-auto hover:text-ink">
            {signedIn ? "Mon compte" : "Se connecter"}
          </Link>
        </div>
        <p aria-hidden className="pointer-events-none mt-4 select-none text-center font-display text-[25vw] leading-[0.75] tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_var(--outline)]"
          style={{ backgroundImage: "linear-gradient(180deg, var(--outline-fill), transparent 85%)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
        >
          {SUITE_NAME}
        </p>
      </footer>
    </div>
  );
}
