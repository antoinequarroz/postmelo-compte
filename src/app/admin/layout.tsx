import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/crm/nav";
import { ReauthDialog } from "@/components/reauth-dialog";
import { SUITE_NAME } from "@/lib/brand";
import { headers } from "next/headers";
import { audit } from "@/server/audit";
import { isTrustedAdmin } from "@/server/db";
import { adminSessionFresh } from "@/server/stepup";
import { currentSession } from "@/server/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `Admin — ${SUITE_NAME}` };

/** The CRM of the suite. Admins only: others go back to their account. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion");
  if (!isTrustedAdmin(session.user)) {
    const h = await headers();
    audit({ action: "admin.refus", ok: false, actorId: session.user.id, actorEmail: session.user.email, target: h.get("x-pathname"), detail: { role: session.user.role ?? "user", twoFactor: session.user.twoFactorEnabled === true }, headers: h });
    // A member goes back to the account; an admin without a second factor first protects it, then comes back.
    redirect(session.user.role === "admin" ? "/compte?securite=admin" : "/compte");
  }
  // The admin needs a sign-in from the last 12 hours, even when the session itself lasts longer.
  if (!adminSessionFresh(session)) {
    const h = await headers();
    audit({ action: "admin.refus", ok: false, actorId: session.user.id, actorEmail: session.user.email, target: h.get("x-pathname"), detail: { session: "plus de 12 h" }, headers: h });
    redirect("/compte?securite=reconnexion");
  }
  return (
    <div className="flex min-h-dvh max-md:flex-col">
      <AdminNav name={session.user.name} id={session.user.id} />
      <main className="min-w-0 flex-1">{children}</main>
      <ReauthDialog />
    </div>
  );
}
