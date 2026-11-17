import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LandingPage, landingMetadata } from "@/components/landing/landing-page";
import { ProductPage, productMetadata } from "@/components/landing/product-page";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * One segment, two kinds of pages (Next.js allows a single dynamic name at this level):
 * /en and /de are the home page in that language, /<app> is the French page of an app of the catalogue.
 * The English and German pages of an app live at /en/<app> and /de/<app> ([lang]/[app]).
 */
type Props = { params: Promise<{ lang: string }> };

const isHome = (segment: string): segment is "en" | "de" => isLocale(segment) && segment !== "fr";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (isLocale(lang)) return lang === "fr" ? {} : landingMetadata(lang);
  return productMetadata(lang, "fr");
}

export default async function LocalizedHomeOrProductPage({ params }: Props) {
  const { lang } = await params;
  if (isHome(lang)) return <LandingPage locale={lang} />;
  // /fr is not a page: French lives at the root.
  if (lang === "fr") notFound();
  return <ProductPage id={lang} locale="fr" />;
}
