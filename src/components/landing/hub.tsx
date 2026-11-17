import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";

type App = { id: string; name: string; color: string };

/** One account in the middle, every app around it: dashes flow from the account to each one. */
export function Hub({ apps, label = "Ton compte" }: { apps: App[]; label?: string }) {
  const list = apps.slice(0, 8);
  const R = 40; // % of the box
  const at = (n: number) => {
    const a = (n / list.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
  };
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="0.25" strokeDasharray="0.6 1.4" />
        <circle cx="50" cy="50" r="13" fill="var(--hub-halo)" className="orbit-pulse" />
        {list.map((a, n) => {
          const p = at(n);
          return (
            <line
              key={a.id}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={a.color || "var(--ink)"}
              strokeOpacity="0.7"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="flow"
              style={{ animationDelay: `${n * -0.17}s` }}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <span className="rounded-[22px] bg-surface p-3 shadow-[0_20px_50px_-20px_var(--deep-3)] ring-1 ring-line-strong">
          <Logo className="size-14" />
        </span>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11.5px] font-medium shadow-card ring-1 ring-line">{label}</span>
      </div>
      {list.map((a, n) => {
        const p = at(n);
        return (
          <div key={a.id} className="bob absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${n * -0.7}s` }}>
            <span className="rounded-2xl bg-surface shadow-card">
              <ProductIcon id={a.id} color={a.color} />
            </span>
            <span className="whitespace-nowrap text-[11px] font-medium text-ink-2 max-sm:hidden">{a.name}</span>
          </div>
        );
      })}
    </div>
  );
}
