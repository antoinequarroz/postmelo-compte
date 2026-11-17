import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge, Empty } from "@/components/crm/kit";
import { QuickActions } from "@/components/crm/quick-actions";
import { Bar, Panel, Stat } from "@/components/crm/stat";
import { ProductIcon } from "@/components/product-icon";
import { PageHeader } from "@/components/ui";
import { ACTIVITY_LABEL, ago, day, daysUntil, LICENSE_STATUS_LABEL, LICENSE_TONE, money, PRODUCT_STATUS_LABEL, STAGE_LABEL } from "@/lib/crm-labels";
import { companyOptions, dashboard, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = dashboard();
  const products = listProducts().map((p) => ({ id: p.id, name: p.name }));
  const companies = companyOptions();
  const maxMrr = Math.max(...d.byProduct.map((p) => p.mrr), 0);
  const maxLicenses = Math.max(...d.byProduct.map((p) => p.active + p.trial), 0);
  const maxStage = Math.max(...d.stages.map((s) => s.value), 0);
  const dateLabel = new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}>
        <QuickActions products={products} companies={companies} />
      </PageHeader>
      <div className="flex flex-col gap-4 p-7 max-md:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Revenu mensuel" value={money(d.mrr)} detail={`${money(d.arr)} par an`} />
          <Stat label="Licences actives" value={String(d.activeLicenses)} detail={`${d.seats} places · ${d.trialLicenses} à l'essai`} />
          <Stat label="Clients" value={String(d.clients)} detail={`${d.prospects} prospects · ${d.newCompanies} nouveaux ce mois`} />
          <Stat label="Pipeline ouvert" value={money(d.pipelineOpen)} detail={`${d.openDeals} opportunités · ${money(d.pipelineWeighted)} pondéré`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Par produit" action={<Link href="/admin/produits" className="text-[12.5px] text-ink-3 hover:text-ink">Catalogue</Link>}>
            <ul className="flex flex-col gap-3.5">
              {d.byProduct.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <ProductIcon id={p.id} color={p.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 text-[13px]">
                      <Link href={`/admin/licences?produit=${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      {p.status !== "disponible" && <span className="text-[11.5px] text-ink-3">{PRODUCT_STATUS_LABEL[p.status]}</span>}
                      <span className="tabular ml-auto text-ink-2">{money(p.mrr)}</span>
                      <span className="tabular w-[124px] text-right text-[12px] text-ink-3">
                        {p.active} active{p.active > 1 ? "s" : ""}{p.trial ? ` · ${p.trial} essai` : ""}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Bar value={maxMrr ? p.mrr : p.active + p.trial} max={maxMrr || maxLicenses} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Pipeline" action={<Link href="/admin/pipeline" className="text-[12.5px] text-ink-3 hover:text-ink">Ouvrir</Link>}>
            <ul className="flex flex-col gap-3.5">
              {d.stages.map((s) => (
                <li key={s.stage}>
                  <div className="flex items-baseline gap-2 text-[13px]">
                    <span className="font-medium">{STAGE_LABEL[s.stage]}</span>
                    <span className="text-[12px] text-ink-3">{s.count}</span>
                    <span className="tabular ml-auto text-ink-2">{money(s.value)}</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={s.value} max={maxStage} className={s.stage === "perdu" ? "bg-ink-3" : s.stage === "gagne" ? "bg-ok" : undefined} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-ink-3">
              Gagné ce mois : {money(d.wonThisMonth.v)} ({d.wonThisMonth.n})
            </p>
          </Panel>

          <Panel title="Renouvellements (45 jours)">
            {d.renewals.length === 0 ? (
              <Empty>Aucun renouvellement prévu.</Empty>
            ) : (
              <ul className="-my-1 divide-y divide-line">
                {d.renewals.map((r) => {
                  const left = daysUntil(r.renewal_date);
                  return (
                    <li key={r.id}>
                      <Link href={`/admin/clients/${r.company_id}`} className="flex items-center gap-3 py-2.5 text-[13px] hover:text-accent">
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{r.company_name}</span>
                          <span className="text-ink-3"> · {r.product_name}</span>
                        </span>
                        {r.status !== "actif" && <Badge tone={LICENSE_TONE[r.status]}>{LICENSE_STATUS_LABEL[r.status]}</Badge>}
                        <span className="tabular text-ink-2">{money(r.price_cents)}</span>
                        <Badge tone={left < 0 ? "danger" : left <= 14 ? "warn" : "neutral"} className="w-[96px] justify-center">
                          {left < 0 ? `En retard ${-left} j` : left === 0 ? "Aujourd'hui" : `${day(r.renewal_date)}`}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Activité récente">
            {d.recent.length === 0 ? (
              <Empty>Rien pour l&apos;instant. Crée un client ou attends la première demande du site.</Empty>
            ) : (
              <ul className="-my-1 divide-y divide-line">
                {d.recent.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/clients/${a.company_id}`} className="group flex items-start gap-3 py-2.5 text-[13px]">
                      <Badge tone={a.kind === "systeme" ? "neutral" : "accent"} className="mt-px w-[78px] justify-center">
                        {ACTIVITY_LABEL[a.kind]}
                      </Badge>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium group-hover:text-accent">{a.company_name}</span>
                        <span className="line-clamp-1 text-ink-2">{a.body}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-ink-3">{ago(a.at)}</span>
                      <ChevronRight className="size-4 shrink-0 text-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
