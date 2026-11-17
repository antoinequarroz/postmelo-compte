"use client";

import { ArrowLeft, Globe, Mail, MapPin, Pencil, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { Avatar, Button, inputClass } from "@/components/ui";
import {
  ACTIVITY_LABEL, ago, day, daysUntil, KIND_LABEL, KIND_TONE, LICENSE_STATUS_LABEL, money, PLAN_LABEL, STAGE_LABEL,
} from "@/lib/crm-labels";
import { cn } from "@/lib/utils";
import type { Activity, Company, Contact, Deal, License } from "@/server/crm";
import { activityKinds, companyFields, contactFields, dealFields, licenseFields } from "./fields";
import { Badge, DeleteButton, Empty, NewButton, RecordModal, selectClass, useCrm } from "./kit";

type Product = { id: string; name: string; color: string };

function Section({ title, count, action, children }: { title: string; count?: number; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface shadow-card">
      <header className="flex h-12 items-center gap-2 border-b border-line pl-4 pr-2">
        <h2 className="text-[14px] font-medium">{title}</h2>
        {count !== undefined && <span className="text-[12px] text-ink-3">{count}</span>}
        <span className="ml-auto">{action}</span>
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
}

const small = "[&>button]:h-7 [&>button]:px-2.5 [&>button]:text-[12.5px]";

export function CompanyView({
  company,
  contacts,
  licenses,
  deals,
  activities,
  products,
}: {
  company: Company;
  contacts: Contact[];
  licenses: (License & { product_name: string })[];
  deals: (Deal & { product_name: string | null })[];
  activities: Activity[];
  products: Product[];
}) {
  const crm = useCrm();
  const router = useRouter();
  const [editing, setEditing] = useState<{ kind: "company" | "contact" | "license" | "deal"; record: Record<string, unknown> } | null>(null);
  const color = (id: string) => products.find((p) => p.id === id)?.color ?? "";
  const mrr = licenses.filter((l) => l.status === "actif").reduce((s, l) => s + l.price_cents, 0);
  const fixed = { company_id: company.id };

  const editFields = editing && { company: companyFields, contact: contactFields, license: licenseFields(products), deal: dealFields(products) }[editing.kind];

  return (
    <>
      <header className="border-b border-line px-7 py-5 max-md:px-4">
        <Link href="/admin/clients" className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink">
          <ArrowLeft className="size-3.5" /> Clients
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Avatar id={company.id} name={company.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[30px] leading-none">{company.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
              <span>Ajouté le {day(company.created_at)}</span>
              {mrr > 0 && <span className="text-ink-2">{money(mrr)} / mois</span>}
            </p>
          </div>
          <select
            aria-label="Statut"
            value={company.kind}
            onChange={(e) => crm.update("company", company.id, { kind: e.target.value }, "Statut changé")}
            className={cn(selectClass, "h-9")}
          >
            {Object.entries(KIND_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <Button onClick={() => setEditing({ kind: "company", record: company })}>
            <Pencil className="size-3.5" /> Modifier
          </Button>
          <DeleteButton
            compact
            label="Supprimer le client"
            onConfirm={async () => {
              if (await crm.remove("company", company.id, "Client supprimé")) router.push("/admin/clients");
            }}
          />
        </div>
      </header>

      <div className="grid gap-4 p-7 max-md:p-4 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Coordinates */}
          <section className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3.5 text-[13px] shadow-card">
            <Badge tone={KIND_TONE[company.kind]}>{KIND_LABEL[company.kind]}</Badge>
            {company.email && (
              <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent">
                <Mail className="size-3.5" /> {company.email}
              </a>
            )}
            {company.phone && (
              <a href={`tel:${company.phone}`} className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent">
                <Phone className="size-3.5" /> {company.phone}
              </a>
            )}
            {company.website && (
              <a href={/^https?:\/\//.test(company.website) ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent">
                <Globe className="size-3.5" /> {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {(company.city || company.country) && (
              <span className="inline-flex items-center gap-1.5 text-ink-2">
                <MapPin className="size-3.5" /> {[company.city, company.country].filter(Boolean).join(", ")}
              </span>
            )}
            {company.notes && <p className="w-full whitespace-pre-line border-t border-line pt-2.5 text-ink-2">{company.notes}</p>}
          </section>

          <Section
            title="Licences"
            count={licenses.length}
            action={
              <span className={small}>
                <NewButton variant="secondary" title="Nouvelle licence" fields={licenseFields(products)} fixed={fixed} submit="Ajouter" onSave={(d) => crm.create("license", d, "Licence ajoutée")}>
                  <Plus className="size-3.5" /> Licence
                </NewButton>
              </span>
            }
          >
            {licenses.length === 0 ? (
              <Empty>Aucune licence. Ajoute la première pour suivre ce que ce client utilise.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {licenses.map((l) => {
                  const left = l.renewal_date ? daysUntil(l.renewal_date) : null;
                  return (
                    <li key={l.id} className="flex flex-wrap items-center gap-3 px-2 py-2.5 text-[13px]">
                      <ProductIcon id={l.product_id} color={color(l.product_id)} size="sm" />
                      <div className="min-w-[140px] flex-1">
                        <p className="font-medium">
                          {l.product_name} <span className="font-normal text-ink-3">· {PLAN_LABEL[l.plan]}</span>
                        </p>
                        <p className="text-[12px] text-ink-3">
                          {l.seats} place{l.seats > 1 ? "s" : ""} · depuis le {day(l.start_date)}
                          {l.renewal_date && (
                            <span className={cn(left !== null && left < 0 && l.status !== "resilie" && "text-danger", left !== null && left >= 0 && left <= 14 && "text-warn")}> · renouvellement {day(l.renewal_date)}</span>
                          )}
                        </p>
                      </div>
                      <span className="tabular text-ink-2">{money(l.price_cents)}</span>
                      <select value={l.status} onChange={(e) => crm.update("license", l.id, { status: e.target.value }, "Licence mise à jour")} className={selectClass} aria-label="Statut de la licence">
                        {Object.entries(LICENSE_STATUS_LABEL).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing({ kind: "license", record: l })}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <DeleteButton compact onConfirm={() => crm.remove("license", l.id, "Licence supprimée")} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            title="Opportunités"
            count={deals.length}
            action={
              <span className={small}>
                <NewButton variant="secondary" title="Nouvelle opportunité" fields={dealFields(products)} fixed={fixed} submit="Créer" onSave={(d) => crm.create("deal", d, "Opportunité créée")}>
                  <Plus className="size-3.5" /> Opportunité
                </NewButton>
              </span>
            }
          >
            {deals.length === 0 ? (
              <Empty>Aucune opportunité en cours.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {deals.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-3 px-2 py-2.5 text-[13px]">
                    <div className="min-w-[160px] flex-1">
                      <p className="font-medium">{d.title}</p>
                      <p className="text-[12px] text-ink-3">
                        {d.product_name ?? "Toute la suite"}
                        {d.expected_close && ` · signature prévue le ${day(d.expected_close)}`}
                      </p>
                    </div>
                    <span className="tabular text-ink-2">{money(d.value_cents)}</span>
                    <select value={d.stage} onChange={(e) => crm.update("deal", d.id, { stage: e.target.value }, "Étape changée")} className={selectClass} aria-label="Étape">
                      {Object.entries(STAGE_LABEL).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing({ kind: "deal", record: d })}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <DeleteButton compact onConfirm={() => crm.remove("deal", d.id, "Opportunité supprimée")} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Contacts"
            count={contacts.length}
            action={
              <span className={small}>
                <NewButton variant="secondary" title="Nouveau contact" fields={contactFields} fixed={fixed} submit="Ajouter" onSave={(d) => crm.create("contact", d, "Contact ajouté")}>
                  <Plus className="size-3.5" /> Contact
                </NewButton>
              </span>
            }
          >
            {contacts.length === 0 ? (
              <Empty>Aucun contact.</Empty>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {contacts.map((c) => (
                  <li key={c.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                    <Avatar id={c.id} name={c.name} size="md" />
                    <div className="min-w-0 flex-1 text-[13px]">
                      <p className="truncate font-medium">
                        {c.name}
                        {c.role && <span className="font-normal text-ink-3"> · {c.role}</span>}
                      </p>
                      <p className="truncate text-[12px] text-ink-3">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="hover:text-accent">
                            {c.email}
                          </a>
                        )}
                        {c.email && c.phone && " · "}
                        {c.phone}
                      </p>
                    </div>
                    <span className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                      <Button size="sm" variant="ghost" aria-label="Modifier" onClick={() => setEditing({ kind: "contact", record: c })}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <DeleteButton compact onConfirm={() => crm.remove("contact", c.id, "Contact supprimé")} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Journal companyId={company.id} activities={activities} />
      </div>

      {editing && editFields && (
        <RecordModal
          title="Modifier"
          fields={editFields}
          record={editing.record}
          submit="Enregistrer"
          onClose={() => setEditing(null)}
          onSave={(d) => crm.update(editing.kind, String(editing.record.id), d, "Modifications enregistrées")}
        />
      )}
    </>
  );
}

/** The history of the relation: notes, calls, e-mails, meetings, and what changed. */
function Journal({ companyId, activities }: { companyId: string; activities: Activity[] }) {
  const crm = useCrm();
  const [kind, setKind] = useState("note");
  const [text, setText] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (await crm.create("activity", { company_id: companyId, kind, body: text })) setText("");
  };
  return (
    <section className="flex h-fit flex-col rounded-xl border border-line bg-surface shadow-card xl:sticky xl:top-4">
      <header className="flex h-12 items-center border-b border-line px-4">
        <h2 className="text-[14px] font-medium">Journal</h2>
      </header>
      <form onSubmit={add} className="flex flex-col gap-2 border-b border-line p-3">
        <div className="flex gap-1">
          {activityKinds.map((k) => (
            <button
              type="button"
              key={k.value}
              onClick={() => setKind(k.value)}
              className={cn("press h-7 rounded-md px-2.5 text-[12px]", kind === k.value ? "bg-accent-soft font-medium text-accent" : "text-ink-2 hover:bg-ink/5")}
            >
              {k.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && add(e)}
          rows={3}
          maxLength={4000}
          placeholder="Ce qui s'est dit, ce qui est prévu…"
          className={`${inputClass} h-auto resize-y py-2 text-[13px] leading-relaxed`}
        />
        <Button variant="primary" size="sm" className="self-end" disabled={crm.busy || !text.trim()}>
          Ajouter
        </Button>
      </form>
      {activities.length === 0 ? (
        <p className="p-4 text-[13px] text-ink-3">Rien pour l&apos;instant.</p>
      ) : (
        <ol className="scroll-thin flex max-h-[70vh] flex-col overflow-y-auto p-3">
          {activities.map((a) => (
            <li key={a.id} className="relative flex gap-3 pb-4 pl-4 before:absolute before:bottom-0 before:left-[3px] before:top-3 before:w-px before:bg-line last:before:hidden">
              <span className={cn("absolute left-0 top-[7px] size-[7px] rounded-full", a.kind === "systeme" ? "bg-ink-3/50" : "bg-accent")} />
              <div className="min-w-0 flex-1 text-[13px]">
                <p className="flex items-center gap-2 text-[11.5px] text-ink-3">
                  <span className="font-medium text-ink-2">{ACTIVITY_LABEL[a.kind]}</span>
                  {a.author && <span className="truncate">{a.author}</span>}
                  <span className="ml-auto shrink-0" title={new Date(a.at).toLocaleString("fr-CH")} suppressHydrationWarning>
                    {ago(a.at)}
                  </span>
                </p>
                <p className={cn("mt-0.5 whitespace-pre-line break-words leading-relaxed", a.kind === "systeme" ? "text-ink-3" : "text-ink")}>{a.body}</p>
              </div>
              {a.kind !== "systeme" && (
                <span className="opacity-60 hover:opacity-100">
                  <DeleteButton compact label="Supprimer la note" onConfirm={() => crm.remove("activity", a.id)} />
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
