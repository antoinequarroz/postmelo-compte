import type { Metadata, Viewport } from "next";
import { LandingPage, landingMetadata } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

// The bar of mobile browsers takes the paper or the night of the page.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export const metadata: Metadata = landingMetadata("fr");

/** The public home page of the suite, in French. /en and /de serve the same page in their language. */
export default function HomePage() {
  return <LandingPage locale="fr" />;
}
