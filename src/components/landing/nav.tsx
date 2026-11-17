"use client";

import { ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SuiteLogo } from "@/components/logo";
import { primaryClass } from "@/lib/styles";
import { setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** A floating glass bar that tightens once the page moves. On another page than the home, home is where its sections live ("/"). */
export function Nav({ suite, signedIn, admin, account, home = "" }: { suite: string; signedIn: boolean; admin: boolean; account: string; home?: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        className={cn(
          "pointer-events-auto flex h-14 w-full items-center gap-6 rounded-full border px-3 pl-4 transition-all duration-500",
          scrolled ? "max-w-[860px] border-line-strong bg-[var(--nav-glass)] shadow-[0_20px_50px_-20px_var(--deep-2)] backdrop-blur-xl" : "max-w-[1160px] border-transparent bg-transparent",
        )}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <SuiteLogo className="size-8" />
          <span className="font-display text-[24px] leading-none">{suite}</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-6 text-[13.5px] text-ink-2 max-md:hidden">
          <a href={`${home}#pour-qui`} className="hover:text-ink">Pour qui</a>
          <a href={`${home}#suite`} className="hover:text-ink">La suite</a>
          <a href={`${home}#compte`} className="hover:text-ink">Un seul compte</a>
          <a href={`${account}/tarifs`} className="hover:text-ink">Tarifs</a>
          <a href={`${home}#contact`} className="hover:text-ink">Contact</a>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {admin && (
            <a href={`${account}/admin`} className="press inline-flex h-9 items-center rounded-full px-3 text-[13.5px] font-medium text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink max-sm:hidden">
              Admin
            </a>
          )}
          <ThemeToggle />
          <a href={`${account}${signedIn ? "/compte" : "/connexion"}`} className={cn("press inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium", primaryClass)}>
            {signedIn ? "Mon compte" : "Se connecter"}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}

/**
 * Switches the page (and the whole app, it is the same setting as in Réglages) between day and night.
 * Both icons are rendered and CSS shows the right one, so the first paint matches the theme script.
 */
function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "light" : "dark");
  };
  return (
    <button
      type="button"
      onClick={toggle}
      title="Clair ou sombre"
      className="press inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink"
    >
      <Sun className="theme-sun size-[17px]" strokeWidth={1.8} />
      <Moon className="theme-moon size-[17px]" strokeWidth={1.8} />
      {/* The name of the button says what a press does; CSS keeps only the one of the current theme. */}
      <span className="theme-sun sr-only">Passer en mode sombre</span>
      <span className="theme-moon sr-only">Passer en mode clair</span>
    </button>
  );
}
