"use client";

import { Plus, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { inputClass } from "@/components/ui";
import { KIND_LABEL } from "@/lib/crm-labels";
import { cn } from "@/lib/utils";
import { companyFields } from "./fields";
import { NewButton, useCrm } from "./kit";

export function NewCompany() {
  const crm = useCrm();
  const router = useRouter();
  return (
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
      <Plus className="size-4" /> Nouveau
    </NewButton>
  );
}

/** Search box and status tabs; both live in the address so a filtered list can be shared. */
export function CompanyFilters({ q, kind }: { q: string; kind: string }) {
  const router = useRouter();
  const path = usePathname();
  const [text, setText] = useState(q);
  const go = (next: { q?: string; statut?: string }) => {
    const params = new URLSearchParams();
    const query = next.q ?? text;
    const status = next.statut ?? kind;
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("statut", status);
    router.replace(`${path}${params.size ? "?" + params : ""}`);
  };
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => go({ q: text }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-[220px] flex-1 sm:max-w-[340px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nom, e-mail, ville, contact…" className={`${inputClass} h-9 pl-9`} />
      </label>
      <div className="flex gap-1 rounded-lg border border-line bg-surface-2 p-0.5">
        {[["", "Tous"], ...Object.entries(KIND_LABEL)].map(([value, label]) => (
          <button
            key={value}
            onClick={() => go({ statut: value })}
            className={cn("press h-7 rounded-md px-2.5 text-[12.5px]", kind === value ? "bg-surface font-medium text-ink shadow-card" : "text-ink-2 hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
