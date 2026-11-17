import { notFound } from "next/navigation";
import { CompanyView } from "@/components/crm/company-view";
import { getCompany, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const data = getCompany((await params).id);
  if (!data) notFound();
  const products = listProducts().map((p) => ({ id: p.id, name: p.name, color: p.color }));
  return <CompanyView {...data} products={products} />;
}
