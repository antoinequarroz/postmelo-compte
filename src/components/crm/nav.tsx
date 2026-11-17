"use client";

import { Building2, ExternalLink, Handshake, KeySquare, LayoutDashboard, Package, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui";
import { SUITE_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/licences", label: "Licences", icon: KeySquare },
  { href: "/admin/pipeline", label: "Pipeline", icon: Handshake },
  { href: "/admin/produits", label: "Produits", icon: Package },
];

const OTHER = [
  { href: "/compte#personnes", label: "Personnes et accès", icon: Users },
  { href: "/compte", label: "Mon compte", icon: UserRound },
  { href: "/", label: "Site public", icon: ExternalLink },
];

export function AdminNav({ name, id }: { name: string; id: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const item = (l: (typeof LINKS)[number], on: boolean) => (
    <Link
      key={l.href}
      href={l.href}
      className={cn(
        "press flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] max-md:shrink-0",
        on ? "bg-surface font-medium text-ink shadow-card" : "text-ink-2 hover:bg-ink/5 hover:text-ink",
      )}
    >
      <l.icon className={cn("size-4", on ? "text-accent" : "text-ink-3")} />
      {l.label}
    </Link>
  );
  return (
    <aside className="sticky top-0 flex h-dvh w-[232px] shrink-0 flex-col border-r border-line bg-bg-2/60 p-3 backdrop-blur-xl max-md:static max-md:h-auto max-md:w-full max-md:border-b max-md:border-r-0">
      <Link href="/admin" className="flex items-center gap-2.5 px-2 pb-5 pt-2 max-md:pb-3">
        <Logo className="size-8" />
        <span>
          <span className="block font-display text-[21px] leading-none">{SUITE_NAME}</span>
          <span className="block text-[11.5px] text-ink-3">Gestion de la suite</span>
        </span>
      </Link>
      <nav className="flex flex-col gap-0.5 max-md:scroll-thin max-md:flex-row max-md:overflow-x-auto">{LINKS.map((l) => item(l, active(l.href)))}</nav>
      <div className="mt-6 flex flex-col gap-0.5 max-md:hidden">
        <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">Compte</p>
        {OTHER.map((l) => item(l, false))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 border-t border-line px-1.5 pt-3 max-md:hidden">
        <Avatar id={id} name={name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-[13px]">{name}</span>
      </div>
    </aside>
  );
}
