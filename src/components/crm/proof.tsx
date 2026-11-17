"use client";

import { ExternalLink, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { FIGURE_SOURCE_LABEL, PROOF_STATUS_LABEL, PROOF_TONE } from "@/lib/crm-labels";
import type { Figure, Logo, Testimonial } from "@/server/crm";
import { figureFields, logoFields, testimonialFields } from "./fields";
import { Badge, DeleteButton, Empty, type FieldDef, NewButton, RecordModal, selectClass, useCrm } from "./kit";

type Option = { id: string; name: string };
type Proof = { testimonials: Testimonial[]; logos: Logo[]; figures: (Figure & { shown: string })[] };
type Editing = { kind: "testimonial" | "logo" | "figure"; title: string; record: Record<string, unknown> & { id: string }; fields: FieldDef[] };

/** Social proof of the home page: three lists, each published or kept as a draft. */
export function ProofAdmin({ proof, products, companies }: { proof: Proof; products: Option[]; companies: Option[] }) {
  const crm = useCrm();
  const [editing, setEditing] = useState<Editing | null>(null);
  const tFields = testimonialFields(products, companies);
  const lFields = logoFields(companies);
  const next = (rows: { sort: number }[]) => (rows.at(-1)?.sort ?? 0) + 10;

  const controls = (kind: Editing["kind"], row: { id: string; status: string }, edit: () => void) => (
    <div className="flex shrink-0 items-center gap-1.5">
      <select value={row.status} onChange={(e) => crm.update(kind, row.id, { status: e.target.value }, e.target.value === "publie" ? "Publié sur le site" : "Retiré du site")} className={selectClass} aria-label="Sur le site">
        {Object.entries(PROOF_STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <Button size="sm" variant="ghost" aria-label="Modifier" onClick={edit}>
        <Pencil className="size-3.5" />
      </Button>
      <DeleteButton compact onConfirm={() => crm.remove(kind, row.id, "Supprimé")} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-7 max-md:p-4">
      <a href="/#preuves" target="_blank" className="inline-flex items-center gap-1.5 self-start text-[12.5px] text-ink-3 hover:text-ink">
        <ExternalLink className="size-3.5" /> Voir sur la page d&apos;accueil
      </a>

      <Section
        title="Chiffres"
        text="Saisis un chiffre que tu peux prouver, ou laisse le CRM le compter : il suit tout seul et se cache tant qu'il vaut zéro. Les quatre premiers affichés vont sur le site."
        add={
          <NewButton variant="secondary" title="Nouveau chiffre" fields={figureFields} record={{ source: "manuel", status: "publie", sort: next(proof.figures) }} submit="Ajouter" onSave={(d) => crm.create("figure", d, "Chiffre ajouté")}>
            <Plus className="size-4" /> Chiffre
          </NewButton>
        }
      >
        {proof.figures.length === 0 ? (
          <Empty>Aucun chiffre. La bande des chiffres reste cachée sur le site.</Empty>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {proof.figures.map((f) => (
              <li key={f.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1">
                    <span className="block font-display text-[34px] leading-none tabular">{f.shown ? `${f.shown}${f.suffix}` : "—"}</span>
                    <span className="mt-1 block text-[13px] text-ink-2">{f.label}</span>
                  </p>
                  <Badge tone={f.shown ? PROOF_TONE[f.status] : "warn"}>{f.shown ? PROOF_STATUS_LABEL[f.status] : "Caché : vaut zéro"}</Badge>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink-3">{FIGURE_SOURCE_LABEL[f.source]}</span>
                  {controls("figure", f, () => setEditing({ kind: "figure", title: "Chiffre", record: f, fields: figureFields }))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Logos clients"
        text="Les entreprises qui utilisent la suite et sont d'accord pour l'afficher."
        add={
          <NewButton variant="secondary" title="Nouveau logo" fields={lFields} record={{ status: "publie", sort: next(proof.logos) }} submit="Ajouter" onSave={(d) => crm.create("logo", d, "Logo ajouté")}>
            <Plus className="size-4" /> Logo
          </NewButton>
        }
      >
        {proof.logos.length === 0 ? (
          <Empty>Aucun logo. La bande des logos reste cachée sur le site.</Empty>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {proof.logos.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-card">
                <span className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg bg-bg-2 p-2">
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="truncate font-display text-[17px]">{l.name}</span>
                  )}
                </span>
                <p className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{l.name}</span>
                  <Badge tone={PROOF_TONE[l.status]} className="mt-1">
                    {PROOF_STATUS_LABEL[l.status]}
                  </Badge>
                </p>
                {controls("logo", l, () => setEditing({ kind: "logo", title: l.name, record: l, fields: lFields }))}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Témoignages"
        text="Les mots exacts de tes clients, publiés avec leur accord. Relie-les à un client du CRM pour les retrouver sur sa fiche."
        add={
          <NewButton variant="secondary" title="Nouveau témoignage" fields={tFields} record={{ status: "publie", sort: next(proof.testimonials) }} submit="Ajouter" onSave={(d) => crm.create("testimonial", d, "Témoignage ajouté")}>
            <Plus className="size-4" /> Témoignage
          </NewButton>
        }
      >
        {proof.testimonials.length === 0 ? (
          <Empty>Aucun témoignage. Le bloc des témoignages reste caché sur le site.</Empty>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {proof.testimonials.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
                <blockquote className="font-display text-[19px] italic leading-snug">« {t.quote} »</blockquote>
                <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
                  <p className="min-w-0 flex-1 text-[12.5px]">
                    <span className="font-medium">{t.author}</span>
                    <span className="text-ink-3">
                      {[t.role, t.company || companies.find((c) => c.id === t.company_id)?.name, products.find((p) => p.id === t.product_id)?.name].filter(Boolean).map((x) => ` · ${x}`)}
                    </span>
                  </p>
                  {controls("testimonial", t, () => setEditing({ kind: "testimonial", title: t.author, record: t, fields: tFields }))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {editing && (
        <RecordModal
          title={editing.title}
          fields={editing.fields}
          record={editing.record}
          submit="Enregistrer"
          onClose={() => setEditing(null)}
          onSave={(d) => crm.update(editing.kind, editing.record.id, d, "Enregistré")}
        />
      )}
    </div>
  );
}

function Section({ title, text, add, children }: { title: string; text: string; add: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-medium">{title}</h2>
          <p className="mt-0.5 max-w-[620px] text-[13px] text-ink-3">{text}</p>
        </div>
        {add}
      </div>
      {children}
    </section>
  );
}
