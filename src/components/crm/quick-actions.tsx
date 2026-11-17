"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { companyFields, dealFields } from "./fields";
import { NewButton, useCrm } from "./kit";

type Option = { id: string; name: string };

/** "New client" and "new deal", from the dashboard. */
export function QuickActions({ products, companies }: { products: Option[]; companies: Option[] }) {
  const crm = useCrm();
  const router = useRouter();
  return (
    <div className="flex gap-2 max-sm:hidden">
      {companies.length > 0 && (
        <NewButton variant="secondary" title="Nouvelle opportunité" fields={dealFields(products, companies)} submit="Créer" onSave={(data) => crm.create("deal", data, "Opportunité créée")}>
          <Plus className="size-4" /> Opportunité
        </NewButton>
      )}
      <NewButton
        title="Nouveau client"
        fields={companyFields}
        record={{ kind: "prospect", country: "CH" }}
        submit="Créer"
        onSave={async (data) => {
          const res = await crm.create("company", data, "Client créé");
          if (res?.id) router.push(`/admin/clients/${res.id}`);
          return res;
        }}
      >
        <Plus className="size-4" /> Client
      </NewButton>
    </div>
  );
}
