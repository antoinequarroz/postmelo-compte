import { ProductList } from "@/components/crm/products";
import { PageHeader } from "@/components/ui";
import { listProductTexts } from "@/server/content";
import { dashboard, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const stats = dashboard().byProduct;
  return (
    <>
      <PageHeader title="Produits" subtitle="Le catalogue de la suite. Il alimente directement la page d'accueil de postmelo.ch, en français, en anglais et en allemand." />
      <ProductList products={listProducts()} stats={stats.map((s) => ({ id: s.id, active: s.active, trial: s.trial, mrr: s.mrr }))} texts={listProductTexts()} />
    </>
  );
}
