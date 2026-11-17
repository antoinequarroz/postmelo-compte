import { Nav } from "@/components/landing/nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { SUITE_NAME } from "@/lib/brand";
import { LOCALE_TAG, type Locale } from "@/lib/i18n";
import { baseUrl } from "@/server/auth";
import { currentSession } from "@/server/http";

/** The frame of the public pages other than the home page: the same grain, nav and footer. */
export async function SitePage({ locale, languages, children }: { locale: Locale; languages?: Partial<Record<Locale, string>>; children: React.ReactNode }) {
  const session = await currentSession().catch(() => null);
  const account = baseUrl();
  return (
    <div lang={LOCALE_TAG[locale]} className="landing relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="landing-grain" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-260px] -z-0 h-[560px] w-[1100px] max-w-[160vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,var(--glow-mint),var(--glow-violet)_60%,transparent)] opacity-70 blur-2xl" />
      <Nav suite={SUITE_NAME} signedIn={!!session} admin={session?.user.role === "admin"} account={account} locale={locale} languages={languages} />
      <main className="relative">{children}</main>
      <SiteFooter locale={locale} signedIn={!!session} account={account} languages={languages} />
    </div>
  );
}
