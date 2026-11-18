import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth";
import { adminSession, body, fail, sameOrigin } from "@/server/http";
import { confirmWithCode, recentlyConfirmed, STEP_UP_MINUTES } from "@/server/stepup";

export const dynamic = "force-dynamic";

/** Has this admin session confirmed the code in the last minutes? */
export async function GET() {
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  return NextResponse.json({ confirmed: recentlyConfirmed(session), minutes: STEP_UP_MINUTES }, { headers: { "Cache-Control": "no-store" } });
}

/** The admin types the 6-digit code of the authenticator app again before a sensitive action. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const { code } = await body(req);
  const { secretConfig } = await (await getAuth()).$context;
  const result = await confirmWithCode(session, code, secretConfig, req.headers);
  return result.ok ? NextResponse.json({ ok: true }) : fail(result.error, result.status);
}
