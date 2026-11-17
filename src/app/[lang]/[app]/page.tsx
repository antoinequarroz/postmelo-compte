import type { Metadata, Viewport } from "next";
import { ProductPage, productMetadata } from "@/components/landing/product-page";
import { langParam } from "@/lib/lang-param";

export const dynamic = "force-dynamic";

/** The page of an app in English or German: /en/<app>, /de/<app>. The French one is /<app>. */
type Props = { params: Promise<{ lang: string; app: string }> };

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await langParam(params);
  return productMetadata((await params).app, locale);
}

export default async function LocalizedProductPage({ params }: Props) {
  const locale = await langParam(params);
  return <ProductPage id={(await params).app} locale={locale} />;
}
