import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./i18n";

/** The [lang] segment: /en and /de. French lives at the root, so /fr/… is not a page. */
export async function langParam(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "fr") notFound();
  return lang;
}
