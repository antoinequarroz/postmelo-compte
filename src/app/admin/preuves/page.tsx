import { ProofAdmin } from "@/components/crm/proof";
import { PageHeader } from "@/components/ui";
import { companyOptions, listProducts, listProof } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function ProofPage() {
  return (
    <>
      <PageHeader title="Preuves sociales" subtitle="Témoignages, logos clients et chiffres de la page d'accueil. Chaque bloc reste caché sur le site tant qu'il n'a rien de publié." />
      <ProofAdmin proof={listProof()} products={listProducts().map((p) => ({ id: p.id, name: p.name }))} companies={companyOptions()} />
    </>
  );
}
