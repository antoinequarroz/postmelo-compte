"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { money } from "@/lib/crm-labels";
import { type Period, quote } from "@/lib/pricing";
import { primaryClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

export type PricingPlan = { id: string; name: string; tagline: string; features: string[]; scope: string; monthly_cents: number | null; yearly_discount: number; trial_days: number; highlight: boolean; status: string };
export type PricingApp = { id: string; name: string; color: string; category: string; price_cents: number | null };

/** The cards of /tarifs, with the month / year switch and, for a one-app formula, the choice of the app. */
export function Pricing({ plans, apps, account }: { plans: PricingPlan[]; apps: PricingApp[]; account: string }) {
  const [period, setPeriod] = useState<Period>("mois");
  const discount = Math.max(0, ...plans.filter((p) => p.monthly_cents != null).map((p) => p.yearly_discount));
  return (
    <div className="flex flex-col items-center gap-10">
      <div role="radiogroup" aria-label="Facturation" className="inline-flex rounded-full border border-line-strong bg-[var(--glass-025)] p-1 text-[13.5px]">
        {(["mois", "annee"] as const).map((p) => (
          <button
            key={p}
            role="radio"
            aria-checked={period === p}
            onClick={() => setPeriod(p)}
            className={cn("press inline-flex h-9 items-center gap-2 rounded-full px-4 font-medium transition-colors", period === p ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:text-ink")}
          >
            {p === "mois" ? "Au mois" : "À l'année"}
            {p === "annee" && discount > 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] text-accent">-{discount}%</span>}
          </button>
        ))}
      </div>
      <ul className={cn("grid w-full gap-4", plans.length >= 3 ? "lg:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2 max-w-[820px]" : "max-w-[420px]")}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} apps={apps} period={period} account={account} />
        ))}
      </ul>
    </div>
  );
}

function PlanCard({ plan, apps, period, account }: { plan: PricingPlan; apps: PricingApp[]; period: Period; account: string }) {
  const [appId, setAppId] = useState(apps[0]?.id ?? "");
  const app = plan.scope === "app" ? apps.find((a) => a.id === appId) : undefined;
  const q = quote(plan, app, 1, period);
  const onRequest = q == null;
  const href = onRequest
    ? `${account}/#contact`
    : `/inscription?${new URLSearchParams({ formule: plan.id, periode: period, ...(app ? { app: app.id } : {}) })}`;
  return (
    <li
      className={cn(
        "relative flex flex-col rounded-3xl border p-7 transition-colors duration-500",
        plan.highlight ? "border-accent/40 bg-surface shadow-[0_30px_80px_-40px_var(--accent)]" : "border-line bg-[var(--glass-025)] hover:border-line-strong",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11.5px] font-medium text-accent-ink">
          <Sparkles className="size-3" /> Le plus choisi
        </span>
      )}
      {plan.status !== "publie" && <span className="absolute right-5 top-5 rounded-full bg-warn/14 px-2 py-0.5 text-[11px] font-medium text-warn">{plan.status === "brouillon" ? "Brouillon" : "Masquée"}</span>}
      <h2 className="font-display text-[34px] leading-none">{plan.name}</h2>
      {plan.tagline && <p className="mt-2 min-h-[42px] text-[14px] leading-relaxed text-ink-2">{plan.tagline}</p>}

      {plan.scope === "app" && apps.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Application">
          {apps.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={a.id === appId}
              title={a.category}
              onClick={() => setAppId(a.id)}
              className={cn("press inline-flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-2.5 text-[12.5px]", a.id === appId ? "border-accent/50 bg-accent-soft text-ink" : "border-line text-ink-2 hover:text-ink")}
            >
              <ProductIcon id={a.id} color={a.color || undefined} size="sm" className="size-6" />
              {a.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-end gap-2">
        {onRequest ? (
          <span className="font-display text-[46px] leading-none">Sur devis</span>
        ) : (
          <>
            <span className="font-display text-[54px] leading-none tabular">{money(q.unit)}</span>
            <span className="pb-1.5 text-[13px] leading-tight text-ink-3">
              par personne
              <br />
              par mois{period === "annee" ? ", à l'année" : ""}
            </span>
          </>
        )}
      </div>
      <p className="mt-2 min-h-[20px] text-[12.5px] text-ink-3">
        {onRequest ? "Un prix selon la taille de l'équipe." : period === "annee" ? `Soit ${money(q.unit * 12)} par personne et par an.` : plan.yearly_discount ? `Ou ${plan.yearly_discount}% de moins à l'année.` : ""}
      </p>

      <a href={href} className={cn("press mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium", plan.highlight || !onRequest ? primaryClass : "border border-line-strong hover:bg-[var(--glass-05)]")}>
        {onRequest ? "Nous écrire" : plan.trial_days ? `Essayer ${plan.trial_days} jours gratuits` : "Choisir"}
        <ArrowRight className="size-4" />
      </a>

      {plan.features.length > 0 && (
        <ul className="mt-7 flex flex-col gap-2.5 border-t border-line pt-6 text-[13.5px] text-ink-2">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
