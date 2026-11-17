import { cn } from "@/lib/utils";

/** Where the identity kit's pictos live. Under /_compte so postmelo.ch serves them too (see docs/DEPLOIEMENT.md). */
export const BRAND_PATH = "/_compte/brand";

/**
 * A picto from the Postmelo identity kit, in its light and dark variants.
 * Both images are in the page and CSS shows the one matching the effective theme
 * (system, or forced with the toggle: see .theme-light / .theme-dark in globals.css).
 */
export function BrandIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block size-7 shrink-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BRAND_PATH}/${slug}/icon-light-128.png`} alt="" width={128} height={128} draggable={false} className="theme-light absolute inset-0 size-full" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BRAND_PATH}/${slug}/icon-dark-128.png`} alt="" width={128} height={128} draggable={false} className="theme-dark absolute inset-0 size-full" />
    </span>
  );
}

/** The account's padlock, in the accent green: sign-in, Mon compte, access pages. */
export function Logo({ className }: { className?: string }) {
  return <BrandIcon slug="compte" className={className} />;
}

/** The suite's own « p », neutral: the public page and the suite admin. */
export function SuiteLogo({ className }: { className?: string }) {
  return <BrandIcon slug="postmelo" className={className} />;
}
