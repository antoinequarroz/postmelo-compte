import { Box, CalendarClock, Clapperboard, KanbanSquare, Megaphone, MessagesSquare, PenLine, Radio, Vault, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * and in the admin alike. Without a colour, the ink of the theme (TickUp is black and white).
 */
export function ProductIcon({ id, color, className, size = "md" }: { id: string; color?: string; className?: string; size?: "sm" | "md" | "lg" }) {
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
