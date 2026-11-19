import { ExportButton } from "@/components/crm/export-button";
import { LicenseFilters, LicenseTable, NewLicense } from "@/components/crm/licenses";
import { Stat } from "@/components/crm/stat";
import { PageHeader } from "@/components/ui";
import { money } from "@/lib/crm-labels";
import { companyOptions, listLicenses, listProducts } from "@/server/crm";

export const dynamic = "force-dynamic";

export default async function LicensesPage({ searchParams }: { searchParams: Promise<{ produit?: string; statut?: string }> }) {
  const { produit = "", statut = "" } = await searchParams;
  const licenses = listLicenses({ product: produit, status: statut });
  const products = listProducts().map((p) => ({ id: p.id, name: p.name, color: p.color }));
  const companies = companyOptions();
  const active = licenses.filter((l) => l.status === "actif");
  return (
    <>
      <PageHeader title="Licences" subtitle="Qui utilise quoi, combien et jusqu'à quand.">
        <ExportButton type="licences" />
        <NewLicense products={products} companies={companies} />
      </PageHeader>
      <div className="flex flex-col gap-4 p-7 max-md:p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Licences affichées" value={String(licenses.length)} detail={`${active.length} actives`} />
          <Stat label="Places actives" value={String(active.reduce((s, l) => s + l.seats, 0))} />
          <Stat label="Revenu mensuel" value={money(active.reduce((s, l) => s + l.price_cents, 0))} detail="Licences actives de cette vue" />
        </div>
        <LicenseFilters products={products} product={produit} status={statut} />
        <LicenseTable licenses={licenses} products={products} />
      </div>
    </>
  );
}
