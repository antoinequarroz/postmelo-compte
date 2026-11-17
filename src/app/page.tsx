import { ArrowRight, ArrowUpRight, Check, Fingerprint, KeyRound, LayoutGrid, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/landing-contact";
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
        {/* Hero */}
        <section className="mx-auto grid max-w-[1160px] items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pt-24 lg:grid-cols-[1fr_1fr]">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3 py-1 text-[12.5px] text-ink-2 shadow-card">
              <span className="size-1.5 rounded-full bg-accent" />
              {products.length} applications, un seul compte
            </p>
            <h1 className="mt-6 font-display text-[clamp(46px,7vw,80px)] leading-[0.95] tracking-[-0.01em]">
              Toute ta boîte,
              <br />
              <span className="italic text-accent">dans une seule suite.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-[16.5px] leading-relaxed text-ink-2">
              Messagerie, notes, projets, agenda, réseaux sociaux, création de contenu et studio vidéo. Les applications {SUITE_NAME} partagent le même design, le même compte, et se pilotent depuis un seul endroit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className={cn("press inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14.5px] font-medium", primaryClass)}>
                Demander un accès
                <ArrowRight className="size-4" />
              </a>
              <a href={`#${families[0]?.id ?? "compte"}`} className="press inline-flex h-11 items-center rounded-xl border border-line-strong bg-surface px-5 text-[14.5px] font-medium shadow-card hover:bg-surface-2">
                Découvrir les applications
              </a>
            </div>
          </div>

          {/* The launcher, as people see it once signed in */}
          <div className="rise relative" style={{ animationDelay: "80ms" }}>
            <div className="absolute -inset-8 -z-10 rounded-[48px] bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]" />
            <div className="rounded-[22px] border border-line-strong bg-surface/85 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-line pb-4">
                <LayoutGrid className="size-4 text-ink-3" />
                <span className="text-[13px] font-medium">Mes applications</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent">
                  <ShieldCheck className="size-3" /> Connecté
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-2.5 pt-4 sm:grid-cols-4">
                {products.slice(0, 8).map((p) => (
                  <li key={p.id} className="flex flex-col items-center gap-2.5 rounded-xl border border-line bg-bg/40 px-2 py-4 text-center">
                    <ProductIcon id={p.id} color={p.color} size="lg" />
                    <span className="text-[12.5px] font-medium leading-tight">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {families.map((f, i) => (
          <section key={f.id} id={f.id} className={cn("scroll-mt-16 border-t border-line", i % 2 === 0 && "bg-bg-2/50")}>
            <div className="mx-auto max-w-[1160px] px-4 py-20 sm:px-6">
              <div className="max-w-[660px]">
                <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">{f.kicker}</p>
                <h2 className="mt-3 font-display text-[clamp(36px,5vw,52px)] leading-[1.02]">{f.title}</h2>
                <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{f.text}</p>
              </div>
              <ul className="mt-12 grid gap-4 md:grid-cols-2">
                {f.products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* One account */}
        <section id="compte" className="scroll-mt-16 border-t border-line">
          <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">Un seul compte</p>
              <h2 className="mt-3 font-display text-[clamp(36px,5vw,52px)] leading-[1.02]">Comme chez les grands, mais à toi.</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
                Ton compte {SUITE_NAME} ouvre toutes les applications de la suite. Tu choisis qui accède à quoi, tu vois les appareils connectés, et tu peux tout couper en un clic.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: KeyRound, title: "Une connexion, partout", text: "Un mot de passe pour toute la suite. On passe d'une application à l'autre sans se reconnecter." },
                { icon: Fingerprint, title: "Face ID et clés d'accès", text: "Connexion par Face ID, Touch ID ou clé de sécurité, et double authentification par code." },
                { icon: Users, title: "Les bons accès", text: "Chaque personne voit uniquement les applications que tu lui ouvres. Retirer un accès prend une seconde." },
                { icon: ShieldCheck, title: "Standard et ouvert", text: "OpenID Connect, le standard de Google et Microsoft. Chaque application s'y branche proprement." },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon className="size-[18px]" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-medium">{title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-16 border-t border-line bg-bg-2/50">
          <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent">Contact</p>
              <h2 className="mt-3 font-display text-[clamp(36px,5vw,52px)] leading-[1.02]">On en parle ?</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
                Dis-nous quelles applications t&apos;intéressent et pour combien de personnes. On te répond rapidement avec un accès d&apos;essai.
              </p>
              <p className="mt-6 text-[14px] text-ink-2">
                Ou écris directement à{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <ContactForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
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

function ProductCard({ p }: { p: Product }) {
  const points = p.description
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  const tint = p.color || "var(--ink)";
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-60 blur-2xl" style={{ background: `color-mix(in oklab, ${tint} 16%, transparent)` }} />
      <div className="relative flex items-start gap-4">
        <ProductIcon id={p.id} color={p.color} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[32px] leading-none">{p.name}</h3>
            {p.status !== "disponible" && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-medium", p.status === "beta" ? "bg-accent-soft text-accent" : "bg-warn/15 text-warn")}>{PRODUCT_STATUS_LABEL[p.status]}</span>
            )}
          </div>
          {p.category && <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">{p.category}</p>}
        </div>
      </div>
      <p className="relative mt-5 text-[15px] leading-relaxed text-ink">{p.tagline}</p>
      {points.length > 0 && (
        <ul className="relative mt-4 flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-2">
              <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: `color-mix(in oklab, ${tint} 85%, var(--ink))` }} />
              {point}
            </li>
          ))}
        </ul>
      )}
      <div className="relative mt-auto flex items-center gap-3 pt-6 text-[13px]">
        {p.price_cents != null ? (
          <span>
            <span className="font-medium">{money(p.price_cents)}</span>
            <span className="text-ink-3"> / mois</span>
          </span>
        ) : (
          <span className="text-ink-3">{p.status === "bientot" ? "Liste d'attente ouverte" : "Prix sur demande"}</span>
        )}
        {p.url ? (
          <a href={p.url} className="ml-auto inline-flex items-center gap-1 font-medium text-accent hover:underline">
            Découvrir <ArrowUpRight className="size-3.5" />
          </a>
        ) : (
          <a href="#contact" data-product={p.id} className="ml-auto inline-flex items-center gap-1 font-medium text-accent hover:underline">
            {p.status === "bientot" ? "Être prévenu" : "Demander un accès"} <ArrowRight className="size-3.5" />
          </a>
        )}
      </div>
    </li>
  );
}
