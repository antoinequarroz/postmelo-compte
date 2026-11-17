import "server-only";
import crypto from "node:crypto";
import { hashPassword, verifyPassword as verifyDefault } from "better-auth/crypto";

/**
 * Passwords set here use Better Auth's own scrypt format. Accounts imported from Lamio keep
 * the hash they had there, stored as "lamio1:<salt>:<hash>", so nobody has to pick a new password.
 */
export const LAMIO_PREFIX = "lamio1:";

export const lamioHash = (salt: string, hash: string) => `${LAMIO_PREFIX}${salt}:${hash}`;

function verifyLamio(stored: string, password: string): Promise<boolean> {
  const [salt, hash] = stored.slice(LAMIO_PREFIX.length).split(":");
  if (!salt || !hash) return Promise.resolve(false);
  return new Promise((resolve) =>
    crypto.scrypt(password, salt, 32, (error, key) => {
      const expected = Buffer.from(hash, "hex");
      resolve(!error && key.length === expected.length && crypto.timingSafeEqual(key, expected));
    }),
  );
}

export const password = {
  hash: (value: string) => hashPassword(value),
  verify: ({ hash, password }: { hash: string; password: string }) => (hash.startsWith(LAMIO_PREFIX) ? verifyLamio(hash, password) : verifyDefault({ hash, password })),
};
