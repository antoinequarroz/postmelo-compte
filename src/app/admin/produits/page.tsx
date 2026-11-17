import { PlanList } from "@/components/crm/plans";
import { ProductList } from "@/components/crm/products";
import { PageHeader } from "@/components/ui";
import { baseUrl } from "@/server/auth";
import { stripeMode, webhookReady } from "@/server/billing";
import { crmDb, dashboard, listPlans, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const stats = dashboard().byProduct;
  const plans = listPlans();
  // Companies per formula, whatever the number of apps it covers.
  const subscribers = Object.fromEntries(
    (crmDb().prepare("select plan_id, count(distinct company_id) as n from crm_license where plan_id is not null and status in ('actif', 'essai') group by plan_id").all() as { plan_id: string; n: number }[]).map((r) => [r.plan_id, r.n]),
  );
  return (
    <>
      <PageHeader title="Produits" subtitle="Le catalogue de la suite et ses formules. Ils alimentent directement la page d'accueil et la page des tarifs." />
      <PlanList plans={plans} subscribers={subscribers} stripe={{ mode: stripeMode(), webhook: webhookReady(), webhookUrl: `${baseUrl()}/api/stripe/webhook` }} />
      <ProductList products={listProducts()} stats={stats.map((s) => ({ id: s.id, active: s.active, trial: s.trial, mrr: s.mrr }))} />
    </>
  );
}
