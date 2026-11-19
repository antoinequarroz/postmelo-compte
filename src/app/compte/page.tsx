import { redirect } from "next/navigation";
import { Account } from "@/components/account";
import { Subscription } from "@/components/subscription";
import { subscriptionOf } from "@/server/billing";
import { adminNeedsTwoFactor, isTrustedAdmin, mayOpenTool } from "@/server/db";
import { currentSession } from "@/server/http";
import { adminSessionFresh } from "@/server/stepup";
import { tools } from "@/server/tools";

export const dynamic = "force-dynamic";

/** "Mon compte": the account page, reached after signing in. */
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const session = await currentSession();
  if (!session) redirect("/connexion");
  const { user } = session;
  // Accounts that signed up on the site see their licences; accounts made by an admin have none.
  const sub = subscriptionOf(user.id);
  return (
    <Account
      me={{ id: user.id, name: user.name, email: user.email, admin: isTrustedAdmin(user) && adminSessionFresh(session), adminNeedsTwoFactor: adminNeedsTwoFactor(user), adminSessionExpired: isTrustedAdmin(user) && !adminSessionFresh(session), twoFactor: user.twoFactorEnabled === true }}
      sessionToken={session.session.token}
      welcome={params.bienvenue === "1"}
      subscription={sub && <Subscription {...sub} welcome={params.abonnement ? "abonnement" : params.essai ? "essai" : null} />}
      tools={tools().map((t) => ({ id: t.id, name: t.name, description: t.description, url: t.url, allowed: mayOpenTool(t.id, user) }))}
    />
  );
}
