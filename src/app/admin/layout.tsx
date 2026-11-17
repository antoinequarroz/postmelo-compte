import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/crm/nav";
import { SUITE_NAME } from "@/lib/brand";
import { currentSession } from "@/server/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `Admin — ${SUITE_NAME}` };

/** The CRM of the suite. Admins only: others go back to their account. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "admin") redirect("/compte");
  return (
    <div className="flex min-h-dvh max-md:flex-col">
      <AdminNav name={session.user.name} id={session.user.id} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
