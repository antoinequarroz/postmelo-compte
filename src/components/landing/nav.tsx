"use client";

import { ArrowRight, Globe, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SuiteLogo } from "@/components/logo";
import { LOCALE_NAME, LOCALE_SHORT, LOCALES, localePath, type Locale } from "@/lib/i18n";
import { primaryClass } from "@/lib/styles";
import { setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const T = {
  fr: { who: "Pour qui", suite: "La suite", demos: "Démos", account: "Un seul compte", blog: "Blog", pricing: "Tarifs", contact: "Contact", mine: "Mon compte", signIn: "Se connecter", theme: "Clair ou sombre", toDark: "Passer en mode sombre", toLight: "Passer en mode clair", language: "Langue" },
  en: { who: "Who it's for", suite: "The suite", demos: "Demos", account: "One account", blog: "Blog", pricing: "Pricing", contact: "Contact", mine: "My account", signIn: "Sign in", theme: "Light or dark", toDark: "Switch to dark mode", toLight: "Switch to light mode", language: "Language" },
  de: { who: "Für wen", suite: "Die Suite", demos: "Demos", account: "Ein Konto", blog: "Blog", pricing: "Preise", contact: "Kontakt", mine: "Mein Konto", signIn: "Anmelden", theme: "Hell oder dunkel", toDark: "Zum dunklen Modus wechseln", toLight: "Zum hellen Modus wechseln", language: "Sprache" },
} satisfies Record<Locale, Record<string, string>>;

/**
 * A floating glass bar that tightens once the page moves. `languages` gives the address of this
 * same page in each language (a blog post may not exist in all of them); by default, the home pages.
 */
export function Nav({
  suite,
  signedIn,
  admin,
  account,
  locale = "fr",
  languages,
}: {
  suite: string;
  signedIn: boolean;
  admin: boolean;
  account: string;
  locale?: Locale;
  languages?: Partial<Record<Locale, string>>;
}) {
  const t = T[locale];
  // On the home page the anchors scroll; elsewhere they lead back to it.
  const home = localePath(locale, "/");
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
          scrolled ? "max-w-[920px] border-line-strong bg-[var(--nav-glass)] shadow-[0_20px_50px_-20px_var(--deep-2)] backdrop-blur-xl" : "max-w-[1160px] border-transparent bg-transparent",
        )}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <Link href={home} className="flex items-center gap-2.5">
          <SuiteLogo className="size-8" />
          <span className="font-display text-[24px] leading-none">{suite}</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-6 whitespace-nowrap text-[13.5px] text-ink-2 max-md:hidden">
          <a href={`${home}#pour-qui`} className="hover:text-ink">{t.who}</a>
          <a href={`${home}#suite`} className="hover:text-ink">{t.suite}</a>
          <a href={`${home}#demos`} className="hover:text-ink max-lg:hidden">{t.demos}</a>
          <a href={`${home}#compte`} className="hover:text-ink max-xl:hidden">{t.account}</a>
          <Link href={localePath(locale, "/blog")} className="hover:text-ink">{t.blog}</Link>
          <a href={`${account}/tarifs`} className="hover:text-ink">{t.pricing}</a>
          <a href={`${home}#contact`} className="hover:text-ink">{t.contact}</a>
        </div>
        <div className="ml-auto flex items-center gap-1.5 max-sm:gap-0.5">
          {admin && (
            <a href={`${account}/admin`} className="press inline-flex h-9 items-center rounded-full px-3 text-[13.5px] font-medium text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink max-sm:hidden">
              Admin
            </a>
          )}
          <LanguageMenu locale={locale} languages={languages} label={t.language} />
          <ThemeToggle label={t.theme} toDark={t.toDark} toLight={t.toLight} />
          <a href={`${account}${signedIn ? "/compte" : "/connexion"}`} className={cn("press inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-medium max-sm:px-3.5", primaryClass)}>
            {signedIn ? t.mine : t.signIn}
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
function ThemeToggle({ label, toDark, toLight }: { label: string; toDark: string; toLight: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "light" : "dark");
  };
  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      className="press inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink"
    >
      <Sun className="theme-sun size-[17px]" strokeWidth={1.8} />
      <Moon className="theme-moon size-[17px]" strokeWidth={1.8} />
      {/* The name of the button says what a press does; CSS keeps only the one of the current theme. */}
      <span className="theme-sun sr-only">{toDark}</span>
      <span className="theme-moon sr-only">{toLight}</span>
    </button>
  );
}

/** FR · EN · DE: the same page in another language, or that language's home page when it has no version. */
function LanguageMenu({ locale, languages, label }: { locale: Locale; languages?: Partial<Record<Locale, string>>; label: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={label}
        className="press inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink"
      >
        <Globe className="size-[15px] max-sm:hidden" strokeWidth={1.8} />
        {LOCALE_SHORT[locale]}
        <span className="sr-only">· {label}</span>
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 top-11 min-w-[150px] overflow-hidden rounded-2xl border border-line-strong bg-[var(--nav-glass)] p-1 shadow-[0_20px_50px_-20px_var(--deep-2)] backdrop-blur-xl">
          {LOCALES.map((l) => (
            <li key={l} role="none">
              <a
                role="menuitem"
                href={languages?.[l] ?? localePath(l, "/")}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px]", l === locale ? "bg-accent-soft font-medium text-accent" : "text-ink-2 hover:bg-[var(--glass-05)] hover:text-ink")}
              >
                <span className="w-6 font-mono text-[11.5px]">{LOCALE_SHORT[l]}</span>
                {LOCALE_NAME[l]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
