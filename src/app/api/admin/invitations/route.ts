import { NextResponse } from "next/server";
import { getAuth, baseUrl } from "@/server/auth";
import { adminSession, body, confirmationNeeded, fail, logged, sameOrigin } from "@/server/http";
import { createInvite, inviteById, listOpenInvites, normalEmail, revokeInvite, validEmail } from "@/server/invites";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** The invitations still waiting. Admins only. */
export async function GET() {
  if (!(await adminSession())) return fail("Non autorisé", 403);
  const invites = listOpenInvites().map(({ id, email, name, created_at, expires_at }) => ({ id, email, name, createdAt: created_at, expiresAt: expires_at }));
  return NextResponse.json({ invites }, { headers: NO_STORE });
}

/** Invites someone: the link comes back once, for the admin to send to that address. Admins only, with the code. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const confirm = confirmationNeeded(session);
  if (confirm) return confirm;
  const data = await body(req);
  const email = normalEmail(typeof data.email === "string" ? data.email : "");
  const name = typeof data.name === "string" ? data.name : "";
  if (!validEmail(email)) return fail("Cette adresse e-mail n'est pas valide.");
  const { internalAdapter } = await (await getAuth()).$context;
  if (await internalAdapter.findUserByEmail(email)) return fail("Cette personne a déjà un compte.", 409);
  const invite = createInvite({ email, name, createdBy: session.user.id });
  const link = `${baseUrl()}/inscription?invitation=${invite.token}`;
  return logged(NextResponse.json({ id: invite.id, email, link, expiresAt: invite.expiresAt }, { headers: NO_STORE }), req, session, "admin.invitation_creee", email);
}

/** Withdraws an invitation before it is used. Admins only. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return fail("Demande refusée", 403);
  const session = await adminSession();
  if (!session) return fail("Non autorisé", 403);
  const data = await body(req);
  const invite = typeof data.id === "string" ? inviteById(data.id) : undefined;
  if (!invite || !revokeInvite(invite.id)) return fail("Cette invitation n'est plus en attente.", 404);
  return logged(NextResponse.json({ ok: true }), req, session, "admin.invitation_retiree", invite.email);
}
