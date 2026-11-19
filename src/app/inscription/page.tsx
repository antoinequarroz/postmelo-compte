import type { Metadata } from "next";
import Link from "next/link";
import { SuiteLogo } from "@/components/logo";
import { RequestAccess } from "@/components/request-access";
import { Signup } from "@/components/signup";
import { SUITE_NAME } from "@/lib/brand";
import { asPeriod, quote, sellable } from "@/lib/pricing";
import { linkOfUser, stripeMode } from "@/server/billing";
import { crmDb, getPlan, listProducts } from "@/server/crm";
import { currentSession } from "@/server/http";
import { findInvite } from "@/server/invites";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `Inscription · ${SUITE_NAME}`, robots: { index: false, follow: false }, referrer: "no-referrer" };

/**
 * Sign-up and payment for the formula picked on /tarifs (?formule=…&app=…&periode=mois|annee).
 * A new account needs an invitation link (?invitation=…); without one, the visitor asks for access.
 */
export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const session = await currentSession().catch(() => null);
  const plan = params.formule ? getPlan(params.formule) : undefined;
  const app = plan?.scope === "app" ? listProducts(true).find((p) => p.id === params.app && sellable(p.status)) : undefined;
  const period = asPeriod(params.periode);
  const ok = plan && plan.status === "publie" && (plan.scope === "suite" || app) && quote(plan, app, 1, period) != null;
  const link = session ? linkOfUser(session.user.id) : undefined;
  const hadLicences = !!link && !!crmDb().prepare("select 1 from crm_license where company_id = ?").get(link.company_id);
  const invite = session ? null : findInvite(params.invitation);
  const choice = ok
    ? {
        plan: { id: plan.id, name: plan.name, scope: plan.scope, monthly_cents: plan.monthly_cents, yearly_discount: plan.yearly_discount, trial_days: plan.trial_days },
        app: app ? { id: app.id, name: app.name, color: app.color, price_cents: app.price_cents } : null,
        period,
        trial: !hadLicences,
        stripe: stripeMode() !== "off",
      }
    : null;
  const wanted = ok ? (app ? `${app.name} · ${plan.name}` : plan.name) : null;

  return (
    <div className="landing relative flex min-h-dvh flex-col overflow-x-clip">
      <div aria-hidden className="landing-grain" />
      <header className="mx-auto flex w-full max-w-[1000px] items-center gap-3 px-4 pt-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <SuiteLogo className="size-8" />
          <span className="font-display text-[24px] leading-none">{SUITE_NAME}</span>
        </Link>
        <Link href="/tarifs" className="ml-auto text-[13.5px] text-ink-2 hover:text-ink">← Les tarifs</Link>
      </header>
      <main className="mx-auto flex w-full max-w-[1000px] flex-1 items-start px-4 py-12 sm:px-6">
        {!session && !invite ? (
          <RequestAccess wanted={wanted} product={app?.id ?? null} expired={!!params.invitation} />
        ) : choice || invite ? (
          <Signup
            me={session ? { name: session.user.name, email: session.user.email } : null}
            invitation={invite ? { token: params.invitation!, email: invite.email, name: invite.name } : null}
            choice={choice}
          />
        ) : (
          <div className="mx-auto max-w-[460px] rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
            <h1 className="font-display text-[34px] leading-none">Choisis d&apos;abord une formule.</h1>
            <p className="mt-3 text-[14px] text-ink-2">Cette formule n&apos;existe pas ou n&apos;est plus proposée.</p>
            <Link href="/tarifs" className="mt-6 inline-flex font-medium text-accent hover:underline">Voir les tarifs</Link>
          </div>
        )}
      </main>
    </div>
  );
}
