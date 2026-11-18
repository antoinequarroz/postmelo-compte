"use client";

import { Download } from "lucide-react";
import { ensureConfirmed } from "@/lib/reauth";

/** The CSV export: a sensitive action, so the code is asked first when it was not typed recently. */
export function ExportButton({ type }: { type: "clients" | "licences" }) {
  const go = async () => {
    if (await ensureConfirmed()) window.location.href = `/api/crm/export?type=${type}`;
  };
  return (
    <button type="button" onClick={go} className="press inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13.5px] text-ink-2 hover:bg-ink/5 hover:text-ink max-sm:hidden">
      <Download className="size-4" /> CSV
    </button>
  );
}
