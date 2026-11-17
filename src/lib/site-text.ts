import type { Locale } from "./i18n";

/**
 * Small words the public pages share in each language. The long texts of a section live in that
 * section's file, next to the French they translate, so a change to one is seen beside the others.
 */

const COUNT: Record<Locale, string[]> = {
  fr: ["Zéro", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix", "Onze", "Douze"],
  en: ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"],
  de: ["Null", "Eine", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn", "Elf", "Zwölf"],
};

/** "Sept", "Seven", "Sieben" for 7. */
export const countWordIn = (n: number, locale: Locale) => COUNT[locale][n] ?? String(n);

const AND: Record<Locale, string> = { fr: "et", en: "and", de: "und" };

/** "a, b et c" / "a, b and c" / "a, b und c". */
export const listIn = (xs: string[], locale: Locale) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${AND[locale]} ${xs[xs.length - 1]}`);

/** The public names of the catalogue statuses (a hidden product never reaches the site). */
export const STATUS_LABEL: Record<Locale, Record<string, string>> = {
  fr: { disponible: "Disponible", beta: "Bêta", bientot: "Bientôt" },
  en: { disponible: "Available", beta: "Beta", bientot: "Coming soon" },
  de: { disponible: "Verfügbar", beta: "Beta", bientot: "Demnächst" },
};

export const FAMILY_LABEL: Record<Locale, Record<string, string>> = {
  fr: { equipe: "Travailler ensemble", media: "Créer et diffuser" },
  en: { equipe: "Work together", media: "Create and broadcast" },
  de: { equipe: "Zusammenarbeiten", media: "Erstellen und senden" },
};
