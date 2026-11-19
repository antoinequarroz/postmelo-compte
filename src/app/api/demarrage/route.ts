import { hashPassword } from "better-auth/crypto";
import { NextResponse } from "next/server";
import { MAX_PASSWORD, MIN_PASSWORD } from "@/lib/utils";
import { addPerson, countPeople, getAuth } from "@/server/auth";
import { audit } from "@/server/audit";
import { body, fail, sameOrigin } from "@/server/http";

export const dynamic = "force-dynamic";

/** Is this a brand-new installation? Then the login page offers to create the first account. */
export async function GET() {
  const auth = await getAuth();
  return NextResponse.json({ needsSetup: (await countPeople(auth)) === 0 }, { headers: { "Cache-Control": "no-store" } });
}

// One at a time: two people arriving together must not both become the first admin.
let creating: Promise<unknown> = Promise.resolve();

/** Creates the first account, which is the admin's. Closed for ever once an account exists. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const data = await body(req);
  const name = typeof data.name === "string" ? data.name.trim().slice(0, 80) : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  if (!name) return fail("Indique ton nom.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return fail("Cette adresse e-mail n'est pas valide.");
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) return fail(`Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);

  const run = creating.then(async () => {
    const auth = await getAuth();
    if ((await countPeople(auth)) > 0) return false;
    await addPerson(auth, { name, email, role: "admin", passwordHash: await hashPassword(password) });
    return true;
  });
  creating = run.catch(() => {});
  const made = await run;
  audit({ action: "installation.premier_admin", ok: made, actorEmail: email, headers: req.headers });
  return made ? NextResponse.json({ ok: true }) : fail("Un compte existe déjà : connecte-toi.", 409);
}
