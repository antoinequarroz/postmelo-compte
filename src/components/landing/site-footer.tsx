import { SuiteLogo } from "@/components/logo";
import { CONTACT_EMAIL, SUITE_NAME } from "@/lib/brand";
import { LOCALE_NAME, LOCALES, localePath, type Locale } from "@/lib/i18n";

const T = {
  fr: { pricing: "Tarifs", blog: "Blog", changelog: "Nouveautés", mine: "Mon compte", signIn: "Se connecter" },
  en: { pricing: "Pricing", blog: "Blog", changelog: "What's new", mine: "My account", signIn: "Sign in" },
  de: { pricing: "Preise", blog: "Blog", changelog: "Neuigkeiten", mine: "Mein Konto", signIn: "Anmelden" },
};

/** The foot of every public page: the links, the languages, and the name of the suite drawn in outline. */
export function SiteFooter({ locale, signedIn, account, languages }: { locale: Locale; signedIn: boolean; account: string; languages?: Partial<Record<Locale, string>> }) {
  const t = T[locale];
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-x-5 gap-y-3 px-4 pt-10 text-[13px] text-ink-3 sm:px-6">
        <a href={localePath(locale, "/")} className="flex items-center gap-2.5 hover:text-ink">
          <SuiteLogo className="size-6" />
          <span>© {new Date().getFullYear()} {SUITE_NAME}</span>
        </a>
        <a href={`${account}/tarifs`} className="hover:text-ink">
          {t.pricing}
        </a>
        <a href={localePath(locale, "/blog")} className="hover:text-ink">
          {t.blog}
        </a>
        <a href={localePath(locale, "/changelog")} className="hover:text-ink">
          {t.changelog}
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
          {CONTACT_EMAIL}
        </a>
        <span className="ml-auto flex items-center gap-3">
          {LOCALES.map((l) => (
            <a key={l} href={languages?.[l] ?? localePath(l, "/")} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className={l === locale ? "font-medium text-ink" : "hover:text-ink"}>
              {LOCALE_NAME[l]}
            </a>
          ))}
          <span aria-hidden className="h-3.5 w-px bg-line-strong" />
          <a href={`${account}${signedIn ? "/compte" : "/connexion"}`} className="hover:text-ink">
            {signedIn ? t.mine : t.signIn}
          </a>
        </span>
      </div>
      <p
        aria-hidden
        className="pointer-events-none mt-4 select-none text-center font-display text-[25vw] leading-[0.75] tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_var(--outline)]"
        style={{ backgroundImage: "linear-gradient(180deg, var(--outline-fill), transparent 85%)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        {SUITE_NAME}
      </p>
    </footer>
  );
}
