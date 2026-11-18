import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth";
import { accessByTool, setToolAccess } from "@/server/db";
import { adminSession, body, fail, sameOrigin } from "@/server/http";
import { tool, tools } from "@/server/tools";

export const dynamic = "force-dynamic";

/** The tools switched on, and the members each one is open to. Admins only. */
export async function GET() {
  if (!(await adminSession())) return fail("Non autorisé", 403);
  return NextResponse.json({ tools: tools().map(({ id, name, description, url }) => ({ id, name, description, url })), access: accessByTool() }, { headers: { "Cache-Control": "no-store" } });
}

/** Opens or closes a tool for a member. Admins only. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const data = await body(req);
  const asked = tool(typeof data.tool === "string" ? data.tool : null);
  const userId = typeof data.userId === "string" ? data.userId : "";
  if (!asked || typeof data.allowed !== "boolean") return fail("Demande invalide");
  const { internalAdapter } = await (await getAuth()).$context;
  if (!(await internalAdapter.findUserById(userId))) return fail("Cette personne n'existe pas", 404);
  setToolAccess(asked.id, userId, data.allowed);
  return NextResponse.json({ ok: true });
}
