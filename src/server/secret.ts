import "server-only";
import crypto from "node:crypto";

/** The service's master secret (AUTH_SECRET): signs sessions and tokens, and keys the audit log. */
export function authSecret() {
  const value = process.env.AUTH_SECRET ?? "";
  if (value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET manque ou fait moins de 32 caractères (openssl rand -base64 32).");
  return "dev-only-secret-dev-only-secret-dev-only";
}

/** A key of its own for one use, derived from the master secret: one leak never opens the others. */
export const derivedKey = (purpose: string) => crypto.createHmac("sha256", authSecret()).update(`postmelo-compte:${purpose}`).digest();
