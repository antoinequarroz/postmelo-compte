import { Download } from "lucide-react";
import Link from "next/link";
import { CompanyFilters, NewCompany } from "@/components/crm/companies";
import { Badge, Empty } from "@/components/crm/kit";
import { Avatar, PageHeader } from "@/components/ui";
import { ago, KIND_LABEL, KIND_TONE, money } from "@/lib/crm-labels";
import { listCompanies } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string }> }) {
  const { q = "", statut = "" } = await searchParams;
  const companies = listCompanies({ q, kind: statut });
  return (
    <>
      <PageHeader title="Clients" subtitle={`${companies.length} entreprise${companies.length > 1 ? "s" : ""}${q || statut ? " trouvée(s)" : ""}`}>
        <a download href="/api/crm/export?type=clients" className="press inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13.5px] text-ink-2 hover:bg-ink/5 hover:text-ink max-sm:hidden">
          <Download className="size-4" /> CSV
        </a>
        <NewCompany />
      </PageHeader>
      <div className="flex flex-col gap-4 p-7 max-md:p-4">
        <CompanyFilters q={q} kind={statut} />
        {companies.length === 0 ? (
          <Empty>{q || statut ? "Aucun résultat." : "Aucun client pour l'instant. Les demandes du site public arrivent ici automatiquement."}</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] text-ink-3">
                  <th className="px-4 py-2.5 font-medium">Entreprise</th>
                  <th className="px-3 py-2.5 font-medium">Statut</th>
                  <th className="px-3 py-2.5 text-right font-medium">Contacts</th>
                  <th className="px-3 py-2.5 text-right font-medium">Licences</th>
                  <th className="px-3 py-2.5 text-right font-medium">Mensuel</th>
                  <th className="px-3 py-2.5 text-right font-medium">Opportunités</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-2">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-2.5 font-medium hover:text-accent">
                        <Avatar id={c.id} name={c.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate">{c.name}</span>
                          {(c.city || c.email) && <span className="block truncate text-[12px] font-normal text-ink-3">{[c.city, c.email].filter(Boolean).join(" · ")}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={KIND_TONE[c.kind]}>{KIND_LABEL[c.kind]}</Badge>
                    </td>
                    <td className="tabular px-3 py-2.5 text-right text-ink-2">{c.contacts}</td>
                    <td className="tabular px-3 py-2.5 text-right text-ink-2">{c.licenses}</td>
                    <td className="tabular px-3 py-2.5 text-right">{c.mrr_cents ? money(c.mrr_cents) : <span className="text-ink-3">—</span>}</td>
                    <td className="tabular px-3 py-2.5 text-right text-ink-2">{c.open_deals || <span className="text-ink-3">—</span>}</td>
                    <td className="px-4 py-2.5 text-right text-[12px] text-ink-3">{c.last_activity ? ago(c.last_activity) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
