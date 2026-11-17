import { cn } from "@/lib/utils";

/** One figure of the dashboard. */
export function Stat({ label, value, detail, className }: { label: string; value: string; detail?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-4 shadow-card", className)}>
      <p className="text-[12px] font-medium text-ink-3">{label}</p>
      <p className="tabular mt-2 font-display text-[34px] leading-none">{value}</p>
      {detail && <p className="mt-2 text-[12px] text-ink-3">{detail}</p>}
    </div>
  );
}

/** A horizontal bar for a share of a total. */
export function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.max(value > 0 ? 3 : 0, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/6">
      <div className={cn("h-full rounded-full bg-accent", className)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col rounded-xl border border-line bg-surface shadow-card", className)}>
      <header className="flex h-12 items-center gap-2 border-b border-line px-4">
        <h2 className="flex-1 text-[14px] font-medium">{title}</h2>
        {action}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}
