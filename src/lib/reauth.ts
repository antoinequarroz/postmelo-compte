"use client";

/**
 * Asking for the 6-digit code again before a sensitive admin action.
 *
 * A route that needs it answers 403 with code "REAUTH_REQUIRED"; the page opens the dialog
 * (components/reauth-dialog.tsx), the admin types the code, and the action is sent once more.
 */

export const REAUTH_REQUIRED = "REAUTH_REQUIRED";
const EVENT = "postmelo:reauth";

type Pending = { resolve: (ok: boolean) => void };

/** Opens the dialog and resolves true once the code is confirmed, false if it is closed. */
export function askForCode(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent<Pending>(EVENT, { detail: { resolve } })));
}

export function onReauthRequest(listener: (pending: Pending) => void) {
  const handler = (e: Event) => listener((e as CustomEvent<Pending>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Confirmed in the last minutes? Then a sensitive link (an export) can be followed directly. */
export async function ensureConfirmed() {
  const res = await fetch("/api/admin/confirmer", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { confirmed?: boolean };
  return data.confirmed ? true : askForCode();
}
