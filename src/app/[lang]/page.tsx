import type { Metadata, Viewport } from "next";
import { LandingPage, landingMetadata } from "@/components/landing/landing-page";
import { langParam } from "@/lib/lang-param";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return landingMetadata(await langParam(params));
}

export default async function LocalizedHomePage({ params }: Props) {
  return <LandingPage locale={await langParam(params)} />;
}
