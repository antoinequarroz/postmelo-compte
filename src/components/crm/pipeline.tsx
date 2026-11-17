"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { day, daysUntil, money, STAGE_LABEL } from "@/lib/crm-labels";
import { cn } from "@/lib/utils";
import type { DealRow } from "@/server/crm";
import { dealFields } from "./fields";
import { NewButton, RecordModal, selectClass, useCrm } from "./kit";

type Option = { id: string; name: string };
type Product = Option & { color: string };

const STAGES = Object.keys(STAGE_LABEL);
const ODDS: Record<string, number> = { nouveau: 10, qualifie: 25, proposition: 50, negociation: 75, gagne: 100, perdu: 0 };

/** The deals as a board: drag a card to another column (or pick the stage on the card). */
export function Pipeline({ deals, products, companies }: { deals: DealRow[]; products: Product[]; companies: Option[] }) {
  const crm = useCrm();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<DealRow | null>(null);
  // Moves show at once; the server's answer then replaces this.
  const [moved, setMoved] = useState<Record<string, string>>({});
  const stageOf = (d: DealRow) => moved[d.id] ?? d.stage;
  const color = (id: string | null) => products.find((p) => p.id === id)?.color ?? "";

  const move = async (id: string, stage: string) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal || stageOf(deal) === stage) return;
    setMoved((m) => ({ ...m, [id]: stage }));
    await crm.update("deal", id, { stage }, `Déplacée vers « ${STAGE_LABEL[stage]} »`);
    setMoved((m) => {
      const rest = { ...m };
      delete rest[id];
      return rest;
    });
  };

  return (
    <div className="flex flex-col gap-3 p-7 max-md:p-4">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[12.5px] text-ink-3">Glisse une carte d&apos;une colonne à l&apos;autre. Une opportunité gagnée fait passer le prospect en client.</p>
        {companies.length > 0 && (
          <NewButton title="Nouvelle opportunité" fields={dealFields(products, companies)} submit="Créer" onSave={(d) => crm.create("deal", d, "Opportunité créée")}>
            <Plus className="size-4" /> Opportunité
          </NewButton>
        )}
      </div>
      <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
        {STAGES.map((stage) => {
          const cards = deals.filter((d) => stageOf(d) === stage);
          const total = cards.reduce((s, d) => s + d.value_cents, 0);
          return (
            <section
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((o) => (o === stage ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain") || dragging;
                if (id) move(id, stage);
              }}
              className={cn(
                "flex min-h-[60vh] min-w-[230px] flex-1 flex-col rounded-xl border border-line bg-bg-2/60 transition-colors",
                over === stage && "border-accent/50 bg-accent-soft",
              )}
            >
              <header className="flex items-baseline gap-2 px-3 pb-2 pt-3">
                <h2 className="text-[13px] font-medium">{STAGE_LABEL[stage]}</h2>
                <span className="text-[12px] text-ink-3">{cards.length}</span>
                <span className="tabular ml-auto text-[12px] text-ink-2">{money(total)}</span>
              </header>
              <p className="px-3 pb-2 text-[11px] text-ink-3">{ODDS[stage]} % de chances</p>
              <ul className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {cards.map((d) => {
                  const left = d.expected_close ? daysUntil(d.expected_close) : null;
                  return (
                    <li
                      key={d.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", d.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(d.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                      className={cn("cursor-grab rounded-lg border border-line bg-surface p-3 shadow-card active:cursor-grabbing", dragging === d.id && "opacity-50")}
                    >
                      <button onClick={() => setEditing(d)} className="block w-full text-left text-[13px] font-medium leading-snug hover:text-accent">
                        {d.title}
                      </button>
                      <Link href={`/admin/clients/${d.company_id}`} className="mt-0.5 block truncate text-[12px] text-ink-3 hover:text-ink">
                        {d.company_name}
                      </Link>
                      <div className="mt-2.5 flex items-center gap-2">
                        {d.product_id ? <ProductIcon id={d.product_id} color={color(d.product_id)} size="sm" className="size-6" /> : null}
                        <span className="tabular text-[12.5px] font-medium">{money(d.value_cents)}</span>
                        {d.expected_close && stage !== "gagne" && stage !== "perdu" && (
                          <span className={cn("ml-auto text-[11.5px] text-ink-3", left !== null && left < 0 && "text-danger")}>{day(d.expected_close)}</span>
                        )}
                      </div>
                      {/* Without a mouse (iPad): the stage is also a list. */}
                      <select value={stageOf(d)} onChange={(e) => move(d.id, e.target.value)} className={cn(selectClass, "mt-2.5 h-7 w-full md:hidden")} aria-label="Étape">
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {editing && (
        <RecordModal
          title="Opportunité"
          fields={dealFields(products)}
          record={editing}
          submit="Enregistrer"
          onClose={() => setEditing(null)}
          onSave={(d) => crm.update("deal", editing.id, d, "Opportunité mise à jour")}
        />
      )}
    </div>
  );
}
