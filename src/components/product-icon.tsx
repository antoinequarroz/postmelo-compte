import { Box, CalendarClock, Clapperboard, KanbanSquare, Megaphone, MessagesSquare, PenLine, Radio, Vault, type LucideIcon } from "lucide-react";
import { BrandIcon } from "@/components/logo";
import { cn } from "@/lib/utils";

// Products with a picto in the identity kit (public/_compte/brand/<id>/).
const PICTOS: Record<string, string> = { lamio: "lamio", cairn: "cairn", tickup: "tickup", alfred: "alfred", metricove: "metricove", nino: "nino", maya: "maya-studio" };

const ICONS: Record<string, LucideIcon> = {
  lamio: MessagesSquare,
  cairn: Vault,
  tickup: KanbanSquare,
  alfred: CalendarClock,
  metricove: Megaphone,
  "postmelo-studio": PenLine,
  nino: Clapperboard,
  maya: Radio,
};

/** The bare glyph of a product, without its tile: for quiet, monochrome places. */
export function ProductGlyph({ id, className }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Box;
  return <Icon aria-hidden className={cn("size-4 shrink-0", className)} strokeWidth={1.8} />;
}

/**
 * Each product keeps its own glyph and colour (the accent of its app), on the public page
 * and in the admin alike. Products of the identity kit show their picto instead. Without a colour, the ink of the theme (TickUp is black and white).
 */
export function ProductIcon({ id, color, className, size = "md" }: { id: string; color?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  if (PICTOS[id]) return <BrandIcon slug={PICTOS[id]} className={cn(size === "sm" ? "size-7" : size === "md" ? "size-10" : "size-14", className)} />;
  const Icon = ICONS[id] ?? Box;
  const c = color || "var(--ink)";
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center", size === "sm" && "size-7 rounded-md", size === "md" && "size-10 rounded-xl", size === "lg" && "size-14 rounded-2xl", className)}
      style={{
        background: `color-mix(in oklab, ${c} 14%, transparent)`,
        color: `color-mix(in oklab, ${c} 85%, var(--ink))`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 22%, transparent)`,
      }}
    >
      <Icon className={size === "sm" ? "size-3.5" : size === "md" ? "size-5" : "size-7"} strokeWidth={1.8} />
    </span>
  );
}
