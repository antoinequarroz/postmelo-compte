import { redirect } from "next/navigation";
import { Account } from "@/components/account";
import { isAdmin, mayOpenTool } from "@/server/db";
import { currentSession } from "@/server/http";
import { tools } from "@/server/tools";

export const dynamic = "force-dynamic";

/** "Mon compte": the account page, reached after signing in. */
export default async function HomePage() {
  const session = await currentSession();
  if (!session) redirect("/connexion");
  const { user } = session;
  return (
    <Account
      me={{ id: user.id, name: user.name, email: user.email, admin: isAdmin(user), twoFactor: user.twoFactorEnabled === true }}
      sessionToken={session.session.token}
      tools={tools().map((t) => ({ id: t.id, name: t.name, description: t.description, url: t.url, allowed: mayOpenTool(t.id, user) }))}
    />
  );
}
