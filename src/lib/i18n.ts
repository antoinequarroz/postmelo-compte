/**
 * The languages of the public site. French is the default and lives at the root (/, /blog);
 * the others under their prefix (/en, /de/blog). The admin and the account stay in French.
 */
export const LOCALES = ["fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const isLocale = (value: unknown): value is Locale => typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** The name of each language, written in that language (for the switcher). */
export const LOCALE_NAME: Record<Locale, string> = { fr: "Français", en: "English", de: "Deutsch" };
export const LOCALE_SHORT: Record<Locale, string> = { fr: "FR", en: "EN", de: "DE" };

/** For <html lang> and hreflang: the Swiss variants where they exist. */
export const LOCALE_TAG: Record<Locale, string> = { fr: "fr-CH", en: "en", de: "de-CH" };

/** "/blog" in this language: "/blog", "/en/blog", "/de/blog". */
export function localePath(locale: Locale, path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** The same page in every language, for <link rel="alternate" hreflang>. */
export function alternates(path: string, available: readonly Locale[] = LOCALES) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[LOCALE_TAG[l]] = localePath(l, path);
  if (available.includes(DEFAULT_LOCALE)) languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return languages;
}

/** A date written the way people read it in this language: « 17 novembre 2026 », "17 November 2026", „17. November 2026“. */
export function longDate(value: string, locale: Locale) {
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  // British order for English ("17 November 2026"), as people read it in Switzerland.
  return d.toLocaleDateString(locale === "en" ? "en-GB" : LOCALE_TAG[locale], { day: "numeric", month: "long", year: "numeric" });
}
