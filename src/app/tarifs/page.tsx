import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/landing/site-footer";
import { Pricing } from "@/components/pricing";
import { CONTACT_EMAIL, SUITE_NAME } from "@/lib/brand";
import { sellable } from "@/lib/pricing";
import { baseUrl } from "@/server/auth";
import { listPlans, listProducts } from "@/server/crm";
import { currentSession } from "@/server/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Tarifs · ${SUITE_NAME}`,
  description: `Une app ou toute la suite ${SUITE_NAME}, au mois ou à l'année, avec un essai gratuit.`,
  robots: { index: true, follow: true },
  icons: { icon: "/_compte/brand/postmelo/favicon.ico", apple: "/_compte/brand/postmelo/apple-touch-icon.png" },
};

const lines = (s: string) => s.split("\n").map((l) => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean);

/** The public pricing page. Its formulas are edited in Admin > Produits; admins preview the drafts with ?apercu=1. */
export default async function PricingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const session = await currentSession().catch(() => null);
  const admin = session?.user.role === "admin";
  const preview = admin && params.apercu === "1";
  const plans = listPlans(!preview).filter((p) => preview ? p.status !== "masque" : true);
  const apps = listProducts(true).filter((p) => sellable(p.status));
  const account = baseUrl();

  return (
    <div className="landing relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="landing-grain" />
      <Nav suite={SUITE_NAME} signedIn={!!session} admin={admin} account={account} />
      <main className="mx-auto max-w-[1160px] px-4 pb-28 pt-36 sm:px-6">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Tarifs</p>
          <h1 className="mt-4 font-display text-[clamp(48px,7vw,104px)] leading-[0.9] tracking-[-0.015em]">
            Une app, ou <span className="italic text-accent">toute la suite.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-relaxed text-ink-2">
            Un seul compte pour toutes les applications. Tu paies par personne, au mois ou à l&apos;année, et tu arrêtes quand tu veux.
          </p>
          {params.annule === "1" && <p className="mx-auto mt-6 w-fit rounded-full bg-warn/14 px-4 py-1.5 text-[13px] text-warn">Paiement annulé. Rien n&apos;a été débité.</p>}
          {preview && <p className="mx-auto mt-6 w-fit rounded-full bg-accent-soft px-4 py-1.5 text-[13px] text-accent">Aperçu admin : les brouillons sont visibles ici seulement.</p>}
        </Reveal>

        <div className="mt-16">
          {plans.length ? (
            <Pricing
              account={account}
              invitationOnly={!session}
              apps={apps.map((a) => ({ id: a.id, name: a.name, color: a.color, category: a.category, price_cents: a.price_cents }))}
              plans={plans.map((p) => ({ id: p.id, name: p.name, tagline: p.tagline, features: lines(p.features), scope: p.scope, monthly_cents: p.monthly_cents, yearly_discount: p.yearly_discount, trial_days: p.trial_days, highlight: !!p.highlight, status: p.status }))}
            />
          ) : (
            <Reveal className="mx-auto max-w-[520px] rounded-3xl border border-line bg-[var(--glass-025)] p-8 text-center">
              <h2 className="font-display text-[34px] leading-none">Les tarifs arrivent.</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
                En attendant, dis-nous quelles applications t&apos;intéressent : on te répond avec un accès d&apos;essai.
              </p>
              <a href={`${account}/#contact`} className="mt-6 inline-flex font-medium text-accent hover:underline">Nous écrire</a>
              {admin && (
                <p className="mt-6 text-[12.5px] text-ink-3">
                  Admin : publie tes formules dans <Link className="underline" href="/admin/produits">Admin › Produits</Link>, ou <Link className="underline" href="/tarifs?apercu=1">vois l&apos;aperçu</Link>.
                </p>
              )}
            </Reveal>
          )}
        </div>

        <Reveal className="mx-auto mt-24 grid max-w-[980px] gap-4 sm:grid-cols-3">
          {[
            { t: "Essai gratuit", d: "Tu essaies avec toute ton équipe avant de payer. Sans engagement." },
            { t: "Par personne", d: "Tu ajoutes ou retires des places quand l'équipe change. Le prix suit." },
            { t: "Sans engagement", d: "Factures, carte et résiliation en libre-service depuis ton compte." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-line bg-[var(--glass-025)] p-5">
              <h3 className="text-[15px] font-medium">{x.t}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">{x.d}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-10 text-center text-[13px] text-ink-3">
          Prix en francs suisses. Paiement sécurisé par Stripe. Une question ? <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink hover:text-accent">{CONTACT_EMAIL}</a>
        </p>
      </main>
      <SiteFooter locale="fr" signedIn={!!session} account={account} languages={{ fr: "/tarifs" }} />
    </div>
  );
}
