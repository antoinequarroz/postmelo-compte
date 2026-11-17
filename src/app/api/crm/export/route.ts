import { exportCsv } from "@/server/crm";
import { adminSession, fail } from "@/server/http";

export const dynamic = "force-dynamic";

/** The clients or the licences as a CSV file (semicolons, for Excel in French). Admins only. */
export async function GET(req: Request) {
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const what = new URL(req.url).searchParams.get("type") === "licences" ? "licences" : "clients";
  return new Response(exportCsv(what), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="postmelo-${what}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
