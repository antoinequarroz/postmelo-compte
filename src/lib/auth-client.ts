"use client";

import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * When a sign-in started from a tool, the address of the page carries the signed request
 * of that tool: oauthProviderClient sends it back with each call, and the browser is sent
 * on to the tool as soon as a session exists.
 */
export const authClient = createAuthClient({
  plugins: [adminClient(), twoFactorClient(), passkeyClient(), oauthProviderClient()],
  fetchOptions: {
    onResponse({ response }) {
      // The tool is not open to this account: the server answered with the refusal page.
      if (response.redirected && new URL(response.url).pathname === "/refus") {
        leaving = true;
        window.location.href = response.url;
      }
    },
  },
});

let leaving = false;

/** True when the page is on its way to a tool: the sign-in was started there. */
export const comesFromTool = () => new URLSearchParams(window.location.search).has("sig");

/** After a sign-in: the account page, unless the browser is already leaving for a tool or the refusal page. */
export function goHome() {
  if (!leaving && !comesFromTool()) window.location.href = "/compte";
}

/** Better Auth answers in English: the messages people may meet, in French. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou mot de passe incorrect.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
  INVALID_EMAIL: "Cette adresse e-mail n'est pas valide.",
  PASSWORD_TOO_SHORT: "Mot de passe trop court (10 caractères au moins).",
  PASSWORD_TOO_LONG: "Mot de passe trop long.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet e-mail.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet e-mail.",
  INVALID_CODE: "Code incorrect.",
  INVALID_BACKUP_CODE: "Code de secours incorrect.",
  INVALID_TWO_FACTOR_COOKIE: "La connexion a expiré. Recommence depuis le début.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Trop d'essais. Recommence depuis le début.",
  AUTH_CANCELLED: "Demande annulée.",
  YOU_CANNOT_REMOVE_YOURSELF: "Tu ne peux pas retirer ton propre compte.",
};

export function message(error: { code?: string; message?: string; status?: number } | null | undefined) {
  if (!error) return "";
  if (error.status === 429) return "Trop d'essais. Patiente une minute.";
  return (error.code && MESSAGES[error.code]) || error.message || "Une erreur est survenue.";
}
