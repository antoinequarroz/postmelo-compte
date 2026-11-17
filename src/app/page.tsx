import { ArrowRight, ArrowUpRight, Check, Fingerprint, KeyRound, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/landing-contact";
import { Hero } from "@/components/landing/hero";
import { Hub } from "@/components/landing/hub";
import { CountUp, Reveal } from "@/components/landing/reveal";
import { SpotCard } from "@/components/landing/spot-card";
import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";
import { CONTACT_EMAIL, SUITE_NAME, SUITE_TAGLINE } from "@/lib/brand";
import { money, PRODUCT_STATUS_LABEL } from "@/lib/crm-labels";
import { primaryClass } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { listProducts, type Product } from "@/server/crm";
import { currentSession } from "@/server/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SUITE_NAME} — la suite d'outils pour ton équipe et tes médias`,
  description: SUITE_TAGLINE,
  // The only page meant to be found: the rest of the service stays out of search engines.
  robots: { index: true, follow: true },
};

const FAMILY = {
  equipe: { kicker: "Travailler ensemble", title: "Le quotidien de l'équipe.", text: "Se parler, s'organiser, garder ses notes et ses accès au même endroit. Les outils dont une équipe se sert tous les jours." },
  media: { kicker: "Créer et diffuser", title: "Du post au plateau live.", text: "Écrire, publier, filmer et diffuser. Toute la chaîne de production de contenu, du carrousel LinkedIn au podcast en direct." },
} as const;

/** The public home page of the suite: what it holds, how it works, and how to get in. */
export default async function HomePage() {
  const session = await currentSession().catch(() => null);
  const products = listProducts(true);
  const signedIn = !!session;
  const admin = session?.user.role === "admin";
  const families = (Object.keys(FAMILY) as (keyof typeof FAMILY)[]).map((f) => ({ id: f, ...FAMILY[f], products: products.filter((p) => p.family === f) })).filter((f) => f.products.length);

  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1160px] items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-display text-[25px] leading-none">{SUITE_NAME}</span>
          </Link>
          <div className="flex flex-1 items-center gap-5 text-[13.5px] text-ink-2 max-md:hidden">
            {families.map((f) => (
              <a key={f.id} href={`#${f.id}`} className="hover:text-ink">
                {f.kicker}
              </a>
            ))}
            <a href="#compte" className="hover:text-ink">Un seul compte</a>
            <a href="#contact" className="hover:text-ink">Contact</a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {admin && (
              <Link href="/admin" className="press inline-flex h-9 items-center rounded-lg px-3 text-[13.5px] font-medium text-ink-2 hover:bg-ink/5 hover:text-ink max-sm:hidden">
                Admin
              </Link>
            )}
            <Link href={signedIn ? "/compte" : "/connexion"} className={cn("press inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13.5px] font-medium", primaryClass)}>
              {signedIn ? "Mon compte" : "Se connecter"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <Hero apps={products.map((p) => ({ id: p.id, name: p.name, color: p.color, category: p.category }))} suite={SUITE_NAME} firstSection={families[0]?.id ?? "compte"} />

        {/* Endless band of the apps */}
        <div className="marquee-wrap relative overflow-hidden border-y border-line bg-surface/60 py-5 backdrop-blur [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="marquee flex w-max gap-10">
            {[...products, ...products, ...products, ...products].map((p, n) => (
              <li key={`${p.id}-${n}`} className="flex items-center gap-3" aria-hidden={n >= products.length}>
                <ProductIcon id={p.id} color={p.color} size="sm" />
                <span className="font-display text-[24px] leading-none">{p.name}</span>
                <span className="text-[12px] uppercase tracking-[0.08em] text-ink-3">{p.category}</span>
                <span className="ml-6 size-1 rounded-full bg-line-strong" />
              </li>
            ))}
          </ul>
        </div>

        {/* A few figures */}
        <section className="mx-auto grid max-w-[1160px] grid-cols-2 gap-px overflow-hidden px-4 py-16 sm:px-6 md:grid-cols-4">
          {[
            { value: products.length, suffix: "", label: "applications dans la suite" },
            { value: 1, suffix: "", label: "seul compte pour tout ouvrir" },
            { value: 2, suffix: "", label: "familles : équipe et médias" },
            { value: 100, suffix: " %", label: "chez toi, sans dépendre des géants" },
          ].map((f, n) => (
            <Reveal key={f.label} delay={n * 90} className="px-2 py-4 text-center">
              <p className="font-display text-[clamp(44px,6vw,68px)] leading-none text-ink">
                <CountUp to={f.value} suffix={f.suffix} />
              </p>
              <p className="mx-auto mt-2 max-w-[180px] text-[13px] leading-snug text-ink-3">{f.label}</p>
            </Reveal>
          ))}
        </section>

        {families.map((f, i) => (
          <section key={f.id} id={f.id} className={cn("relative scroll-mt-16 overflow-hidden border-t border-line", i % 2 === 0 && "bg-bg-2/50")}>
            <div className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6">
              <Reveal className="flex flex-wrap items-end gap-6">
                <div className="max-w-[660px] flex-1">
                  <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">{f.kicker}</p>
                  <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,60px)] leading-[1.0]">{f.title}</h2>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{f.text}</p>
                </div>
                <div className="flex -space-x-2" aria-hidden>
                  {f.products.map((p) => (
                    <span key={p.id} className="rounded-2xl bg-bg ring-4 ring-bg">
                      <ProductIcon id={p.id} color={p.color} />
                    </span>
                  ))}
                </div>
              </Reveal>
              <ul className="mt-14 grid gap-5 md:grid-cols-2">
                {f.products.map((p, n) => (
                  <ProductCard key={p.id} p={p} delay={(n % 2) * 120 + Math.floor(n / 2) * 60} />
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* One account */}
        <section id="compte" className="relative scroll-mt-16 overflow-hidden border-t border-line">
          <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">Un seul compte</p>
              <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,60px)] leading-[1.0]">Comme chez les grands, mais à toi.</h2>
              <p className="mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-ink-2">
                Ton compte {SUITE_NAME} ouvre toutes les applications de la suite. Tu choisis qui accède à quoi, tu vois les appareils connectés, et tu peux tout couper en un clic.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: KeyRound, title: "Une connexion, partout", text: "Un mot de passe pour toute la suite, sans se reconnecter." },
                  { icon: Fingerprint, title: "Face ID et clés d'accès", text: "Touch ID, clé de sécurité et double authentification." },
                  { icon: Users, title: "Les bons accès", text: "Chacun voit uniquement les applications que tu lui ouvres." },
                  { icon: ShieldCheck, title: "Standard et ouvert", text: "OpenID Connect, le standard de Google et Microsoft." },
                ].map(({ icon: Icon, title, text }, n) => (
                  <Reveal as="li" key={title} delay={150 + n * 90} className="group rounded-2xl border border-line bg-surface p-4 shadow-card transition-transform duration-500 hover:-translate-y-1">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                      <Icon className="size-[18px]" />
                    </span>
                    <h3 className="mt-3 text-[14.5px] font-medium">{title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{text}</p>
                  </Reveal>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <Hub apps={products.map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-16 border-t border-line bg-bg-2/50">
          <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">Contact</p>
              <h2 className="mt-3 font-display text-[clamp(38px,5.4vw,60px)] leading-[1.0]">On en parle ?</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
                Dis-nous quelles applications t&apos;intéressent et pour combien de personnes. On te répond rapidement avec un accès d&apos;essai.
              </p>
              <p className="mt-6 text-[14px] text-ink-2">
                Ou écris directement à{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </Reveal>
            <Reveal delay={120}>
              <ContactForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-4 px-4 py-8 text-[13px] text-ink-3 sm:px-6">
          <Logo className="size-6" />
          <span>
            © {new Date().getFullYear()} {SUITE_NAME}
          </span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
            {CONTACT_EMAIL}
          </a>
          <Link href={signedIn ? "/compte" : "/connexion"} className="ml-auto hover:text-ink">
            {signedIn ? "Mon compte" : "Se connecter"}
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ p, delay }: { p: Product; delay: number }) {
  const points = p.description
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  const tint = p.color || "var(--ink)";
  return (
    <SpotCard tint={tint} delay={delay} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full opacity-70 blur-3xl" style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)` }} />
      <div aria-hidden className="absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${tint} 60%, transparent), transparent)` }} />
      <div className="relative flex items-start gap-4">
        <span className="spot-icon">
          <ProductIcon id={p.id} color={p.color} size="lg" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[34px] leading-none">{p.name}</h3>
            {p.status !== "disponible" && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-medium", p.status === "beta" ? "bg-accent-soft text-accent" : "bg-warn/15 text-warn")}>{PRODUCT_STATUS_LABEL[p.status]}</span>
            )}
          </div>
          {p.category && <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">{p.category}</p>}
        </div>
      </div>
      <p className="relative mt-5 text-[16px] leading-relaxed text-ink">{p.tagline}</p>
      {points.length > 0 && (
        <ul className="relative mt-4 flex flex-col gap-2.5">
          {points.map((point, n) => (
            <li key={point} className="tick flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-2" style={{ transitionDelay: `${delay + 350 + n * 80}ms` }}>
              <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${tint} 16%, transparent)` }}>
                <Check className="size-2.5" strokeWidth={3} style={{ color: `color-mix(in oklab, ${tint} 85%, var(--ink))` }} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      )}
      <div className="relative mt-auto flex items-center gap-3 pt-7 text-[13px]">
        {p.price_cents != null ? (
          <span>
            <span className="font-medium">{money(p.price_cents)}</span>
            <span className="text-ink-3"> / mois</span>
          </span>
        ) : (
          <span className="text-ink-3">{p.status === "bientot" ? "Liste d'attente ouverte" : "Prix sur demande"}</span>
        )}
        {p.url ? (
          <a href={p.url} className="group/link ml-auto inline-flex items-center gap-1 font-medium text-accent">
            Découvrir <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        ) : (
          <a href="#contact" data-product={p.id} className="group/link ml-auto inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 font-medium text-ink transition-colors hover:border-transparent hover:bg-ink hover:text-bg">
            {p.status === "bientot" ? "Être prévenu" : "Demander un accès"} <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
          </a>
        )}
      </div>
    </SpotCard>
  );
}
