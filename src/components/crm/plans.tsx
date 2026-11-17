"use client";

import { Check, CreditCard, ExternalLink, Pencil, Plus, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { money, PLAN_SCOPE_LABEL, PLAN_STATUS_LABEL, PLAN_TONE } from "@/lib/crm-labels";
import type { Plan } from "@/server/crm";
import { planFields } from "./fields";
import { Badge, DeleteButton, NewButton, RecordModal, selectClass, useCrm } from "./kit";

export type StripeState = { mode: "off" | "test" | "live"; webhook: boolean; webhookUrl: string };

/** The formulas sold on /tarifs, and whether Stripe is ready to take the payments. */
export function PlanList({ plans, stripe, subscribers }: { plans: Plan[]; stripe: StripeState; subscribers: Record<string, number> }) {
  const crm = useCrm();
  const [editing, setEditing] = useState<Plan | null>(null);
  return (
    <section className="flex flex-col gap-4 px-7 pt-7 max-md:px-4 max-md:pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[15px] font-medium">Formules et tarifs</h2>
        <a href="/tarifs?apercu=1" target="_blank" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
          <ExternalLink className="size-3.5" /> Aperçu de /tarifs
        </a>
        <span className="ml-auto" />
        <NewButton
          variant="secondary"
          title="Nouvelle formule"
          fields={planFields}
          record={{ scope: "suite", status: "brouillon", yearly_discount: 0, trial_days: 14, highlight: 0, sort: (plans.at(-1)?.sort ?? 0) + 10 }}
          submit="Créer"
          onSave={(d) => crm.create("plan", d, "Formule créée")}
        >
          <Plus className="size-4" /> Formule
        </NewButton>
      </div>
      <StripeBanner stripe={stripe} />
      <ul className="grid gap-3 lg:grid-cols-3">
        {plans.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-medium">{p.name}</span>
                  <Badge tone={PLAN_TONE[p.status]}>{PLAN_STATUS_LABEL[p.status]}</Badge>
                  {!!p.highlight && <Star className="size-3.5 fill-current text-warn" aria-label="Mise en avant" />}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-3">{PLAN_SCOPE_LABEL[p.scope]}</p>
              </div>
              <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing(p)}>
                <Pencil className="size-3.5" />
              </Button>
            </div>
            <p className="font-display text-[30px] leading-none tabular">
              {p.monthly_cents == null ? "Sur devis" : money(p.monthly_cents)}
              {p.monthly_cents != null && <span className="ml-1.5 font-sans text-[12px] text-ink-3">/ personne / mois</span>}
            </p>
            <p className="text-[12.5px] text-ink-3">
              {[p.trial_days ? `${p.trial_days} jours d'essai` : "Sans essai", p.yearly_discount ? `-${p.yearly_discount}% à l'année` : null, p.scope === "app" ? "prix par app modifiable ci-dessous" : null].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-auto flex items-center gap-2 border-t border-line pt-3 text-[12.5px] text-ink-3">
              <span>
                <span className="tabular font-medium text-ink">{subscribers[p.id] ?? 0}</span> client(s)
              </span>
              <select value={p.status} onChange={(e) => crm.update("plan", p.id, { status: e.target.value }, "Statut changé")} className={`${selectClass} ml-auto`} aria-label="Statut">
                {Object.entries(PLAN_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <DeleteButton compact onConfirm={() => crm.remove("plan", p.id, "Formule supprimée")} />
            </div>
          </li>
        ))}
      </ul>
      {editing && <RecordModal title={editing.name} fields={planFields} record={editing} submit="Enregistrer" onClose={() => setEditing(null)} onSave={(d) => crm.update("plan", editing.id, d, "Formule enregistrée")} />}
    </section>
  );
}

function StripeBanner({ stripe }: { stripe: StripeState }) {
  if (stripe.mode !== "off" && stripe.webhook)
    return (
      <p className="flex items-center gap-2 rounded-lg bg-ok/10 px-3 py-2 text-[12.5px] text-ok">
        <Check className="size-4" /> Stripe est branché{stripe.mode === "test" ? " en mode test (aucun vrai paiement)" : ", paiements réels"}. Les licences arrivent seules dans le CRM.
      </p>
    );
  return (
    <div className="flex gap-2.5 rounded-lg border border-warn/30 bg-warn/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
      <CreditCard className="mt-0.5 size-4 shrink-0 text-warn" />
      <p>
        {stripe.mode === "off" ? (
          <>Stripe n&apos;est pas encore branché : une inscription démarre l&apos;essai gratuit sans carte (licences « à l&apos;essai »), et les formules sans essai ne peuvent pas être achetées. </>
        ) : (
          <>Clé Stripe présente ({stripe.mode === "test" ? "test" : "réelle"}), mais pas le secret du webhook : les paiements ne créeront pas les licences. </>
        )}
        Ajoute <code className="font-mono">STRIPE_SECRET_KEY</code> et <code className="font-mono">STRIPE_WEBHOOK_SECRET</code> dans <code className="font-mono">.env</code>, avec un webhook Stripe vers <code className="font-mono">{stripe.webhookUrl}</code>.
      </p>
    </div>
  );
}
