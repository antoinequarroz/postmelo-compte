"use client";

import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { Button } from "@/components/ui";
import { day, daysUntil, LICENSE_STATUS_LABEL, money, PLAN_LABEL } from "@/lib/crm-labels";
import { cn } from "@/lib/utils";
import type { LicenseRow } from "@/server/crm";
import { licenseFields } from "./fields";
import { DeleteButton, Empty, NewButton, RecordModal, selectClass, useCrm } from "./kit";

type Option = { id: string; name: string };
type Product = Option & { color: string };

export function NewLicense({ products, companies }: { products: Product[]; companies: Option[] }) {
  const crm = useCrm();
  if (!companies.length) return null;
  return (
    <NewButton title="Nouvelle licence" fields={licenseFields(products, companies)} submit="Ajouter" onSave={(d) => crm.create("license", d, "Licence ajoutée")}>
      <Plus className="size-4" /> Nouvelle
    </NewButton>
  );
}

export function LicenseFilters({ products, product, status }: { products: Product[]; product: string; status: string }) {
  const router = useRouter();
  const path = usePathname();
  const go = (next: { produit?: string; statut?: string }) => {
    const params = new URLSearchParams();
    const p = next.produit ?? product;
    const s = next.statut ?? status;
    if (p) params.set("produit", p);
    if (s) params.set("statut", s);
    router.replace(`${path}${params.size ? "?" + params : ""}`);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <select value={product} onChange={(e) => go({ produit: e.target.value })} className={cn(selectClass, "h-9")} aria-label="Produit">
        <option value="">Tous les produits</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select value={status} onChange={(e) => go({ statut: e.target.value })} className={cn(selectClass, "h-9")} aria-label="Statut">
        <option value="">Tous les statuts</option>
        {Object.entries(LICENSE_STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LicenseTable({ licenses, products }: { licenses: LicenseRow[]; products: Product[] }) {
  const crm = useCrm();
  const [editing, setEditing] = useState<LicenseRow | null>(null);
  const color = (id: string) => products.find((p) => p.id === id)?.color ?? "";
  if (!licenses.length) return <Empty>Aucune licence ici. On en ajoute depuis la fiche d&apos;un client ou avec « Nouvelle ».</Empty>;
  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[820px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] text-ink-3">
              <th className="px-4 py-2.5 font-medium">Client</th>
              <th className="px-3 py-2.5 font-medium">Produit</th>
              <th className="px-3 py-2.5 font-medium">Formule</th>
              <th className="px-3 py-2.5 text-right font-medium">Places</th>
              <th className="px-3 py-2.5 text-right font-medium">Mensuel</th>
              <th className="px-3 py-2.5 font-medium">Statut</th>
              <th className="px-3 py-2.5 font-medium">Renouvellement</th>
              <th className="w-[90px] px-2 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {licenses.map((l) => {
              const left = l.renewal_date ? daysUntil(l.renewal_date) : null;
              const live = l.status === "actif" || l.status === "essai";
              return (
                <tr key={l.id} className="hover:bg-surface-2">
                  <td className="px-4 py-2">
                    <Link href={`/admin/clients/${l.company_id}`} className="font-medium hover:text-accent">
                      {l.company_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <ProductIcon id={l.product_id} color={color(l.product_id)} size="sm" />
                      {l.product_name}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-2">{PLAN_LABEL[l.plan]}</td>
                  <td className="tabular px-3 py-2 text-right text-ink-2">{l.seats}</td>
                  <td className="tabular px-3 py-2 text-right">{money(l.price_cents)}</td>
                  <td className="px-3 py-2">
                    <select value={l.status} onChange={(e) => crm.update("license", l.id, { status: e.target.value }, "Licence mise à jour")} className={selectClass} aria-label="Statut">
                      {Object.entries(LICENSE_STATUS_LABEL).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={cn("px-3 py-2", !live || left === null || left > 14 ? "text-ink-2" : left < 0 ? "text-danger" : "text-warn")}>
                    {day(l.renewal_date)}
                    {live && left !== null && left < 0 && <span className="text-[11.5px]"> · dépassé</span>}
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex justify-end">
                      <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing(l)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <DeleteButton compact onConfirm={() => crm.remove("license", l.id, "Licence supprimée")} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && (
        <RecordModal
          title={`Licence ${editing.product_name}`}
          fields={licenseFields(products)}
          record={editing}
          submit="Enregistrer"
          onClose={() => setEditing(null)}
          onSave={(d) => crm.update("license", editing.id, d, "Licence mise à jour")}
        />
      )}
    </>
  );
}
