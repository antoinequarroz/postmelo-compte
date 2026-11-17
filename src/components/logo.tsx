import { cn } from "@/lib/utils";

/** A key ring: one ring, and the tools it opens. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <rect width="28" height="28" rx="8" fill="var(--ink)" />
      <circle cx="11" cy="14" r="4.6" fill="none" stroke="var(--bg)" strokeWidth="1.9" opacity=".85" />
      <path d="M15.6 14h6.6M19.6 14v3" fill="none" stroke="var(--bg)" strokeWidth="1.9" strokeLinecap="round" opacity=".85" />
      <circle cx="11" cy="14" r="1.7" fill="var(--accent)" />
    </svg>
  );
}
