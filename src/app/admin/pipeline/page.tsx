import { Pipeline } from "@/components/crm/pipeline";
import { PageHeader } from "@/components/ui";
import { money } from "@/lib/crm-labels";
import { companyOptions, dashboard, listDeals, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const deals = listDeals();
  const d = dashboard();
  return (
    <>
      <PageHeader title="Pipeline" subtitle={`${d.openDeals} opportunités ouvertes · ${money(d.pipelineOpen)} · ${money(d.pipelineWeighted)} pondéré`} />
      <Pipeline deals={deals} products={listProducts().map((p) => ({ id: p.id, name: p.name, color: p.color }))} companies={companyOptions()} />
    </>
  );
}
