import "server-only";
import { NextResponse } from "next/server";
import { CrmError, KINDS, type Kind } from "./crm";
import { fail } from "./http";

export const asKind = (value: string): Kind | null => ((KINDS as string[]).includes(value) ? (value as Kind) : null);

/** Runs a CRM change and turns its refusals into French answers. */
export function answer(run: () => unknown) {
  try {
    const result = run();
    return NextResponse.json({ ok: true, ...(typeof result === "string" ? { id: result } : {}) });
  } catch (e) {
    if (e instanceof CrmError) return fail(e.message, e.status);
    console.error(e);
    return fail("Une erreur est survenue", 500);
  }
}
