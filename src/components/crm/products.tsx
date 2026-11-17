"use client";

import { ExternalLink, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { Button } from "@/components/ui";
import { money, PRODUCT_STATUS_LABEL, PRODUCT_TONE } from "@/lib/crm-labels";
import type { Product } from "@/server/crm";
import { productFields } from "./fields";
import { Badge, DeleteButton, Empty, NewButton, RecordModal, selectClass, useCrm } from "./kit";

const FAMILY_LABEL: Record<string, string> = { equipe: "Travailler ensemble", media: "Créer et diffuser" };

export function ProductList({ products, stats }: { products: Product[]; stats: { id: string; active: number; trial: number; mrr: number }[] }) {
  const crm = useCrm();
  const [editing, setEditing] = useState<Product | null>(null);
  const stat = (id: string) => stats.find((s) => s.id === id);
  return (
    <div className="flex flex-col gap-4 p-7 max-md:p-4">
      <div className="flex items-center gap-2">
        <a href="/" target="_blank" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
          <ExternalLink className="size-3.5" /> Voir la page d&apos;accueil
        </a>
        <span className="ml-auto" />
        <NewButton
          title="Nouveau produit"
          fields={productFields}
          record={{ status: "bientot", family: "equipe", sort: (products.at(-1)?.sort ?? 0) + 10 }}
          submit="Créer"
          onSave={(d) => crm.create("product", d, "Produit créé")}
        >
          <Plus className="size-4" /> Produit
        </NewButton>
      </div>
      {products.length === 0 ? (
        <Empty>Aucun produit.</Empty>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {products.map((p) => {
            const s = stat(p.id);
            return (
              <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <ProductIcon id={p.id} color={p.color} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium">{p.name}</span>
                      <Badge tone={PRODUCT_TONE[p.status]}>{PRODUCT_STATUS_LABEL[p.status]}</Badge>
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-3">
                      {[p.category, FAMILY_LABEL[p.family]].filter(Boolean).join(" · ")} · {p.price_cents != null ? `${money(p.price_cents)} / personne / mois` : "prix de la formule"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing(p)}>
                    <Pencil className="size-3.5" /> Modifier
                  </Button>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-2">{p.tagline || <span className="text-ink-3">Pas d&apos;accroche.</span>}</p>
                <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[12.5px] text-ink-3">
                  <span>
                    <span className="tabular font-medium text-ink">{s?.active ?? 0}</span> actives
                  </span>
                  <span>
                    <span className="tabular font-medium text-ink">{s?.trial ?? 0}</span> à l&apos;essai
                  </span>
                  <span>
                    <span className="tabular font-medium text-ink">{money(s?.mrr ?? 0)}</span> / mois
                  </span>
                  <select value={p.status} onChange={(e) => crm.update("product", p.id, { status: e.target.value }, "Statut changé")} className={`${selectClass} ml-auto`} aria-label="Statut">
                    {Object.entries(PRODUCT_STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <DeleteButton compact onConfirm={() => crm.remove("product", p.id, "Produit supprimé")} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && (
        <RecordModal title={editing.name} fields={productFields} record={editing} submit="Enregistrer" onClose={() => setEditing(null)} onSave={(d) => crm.update("product", editing.id, d, "Produit enregistré")} />
      )}
    </div>
  );
}
