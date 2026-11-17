"use client";

import { X } from "lucide-react";
import { forwardRef, useEffect } from "react";
import { primaryClass } from "@/lib/styles";
import { cn, initials } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "secondary", size = "md", className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "press inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-9 px-3.5 text-[13.5px]",
        variant === "primary" && primaryClass,
        variant === "secondary" && "border border-line-strong bg-surface text-ink shadow-card hover:bg-surface-2",
        variant === "ghost" && "text-ink-2 hover:bg-ink/5 hover:text-ink",
        variant === "danger" && "border border-line-strong bg-surface text-danger shadow-card hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
});

export const inputClass =
  "h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[14px] outline-none placeholder:text-ink-3 focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--accent-soft)]";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="text-[11.5px] text-ink-3">{hint}</span>}
    </label>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface-2 px-1 font-mono text-[10.5px] text-ink-3">{children}</kbd>;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="flex items-end gap-3 border-b border-line px-7 py-5 max-md:px-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[28px] leading-none">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13px] text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-card", className)} {...props} />;
}

// Each person keeps the same quiet tint everywhere, derived from their id.
const TINTS = [265, 20, 150, 200, 330, 85, 235, 45];

const AVATAR_SIZES = {
  xs: "size-5 rounded-[5px] text-[9px]",
  sm: "size-7 rounded-md text-[10.5px]",
  md: "size-8 rounded-lg text-[12px]",
  lg: "size-9 rounded-lg text-[13px]",
};

export function Avatar({ id, name, size = "md", className }: { id: string; name: string; size?: keyof typeof AVATAR_SIZES; className?: string }) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = TINTS[h % TINTS.length];
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 select-none items-center justify-center font-semibold tracking-wide", AVATAR_SIZES[size], className)}
      style={{ background: `oklch(0.62 0.13 ${hue} / 0.2)`, color: `color-mix(in oklab, oklch(0.62 0.13 ${hue}) 70%, var(--ink))` }}
    >
      {initials(name)}
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4 pt-[14vh]">
      <div className="dialog-backdrop absolute inset-0 bg-[rgba(15,14,12,0.3)] backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal aria-label={title} className="dialog-popup relative w-full max-w-[440px] rounded-2xl border border-line-strong bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center">
          <h2 className="flex-1 font-display text-[24px] leading-none">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="press -mr-1.5 flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-ink/5 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
