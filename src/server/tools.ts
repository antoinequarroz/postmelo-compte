import "server-only";

/**
 * The tools of the suite that sign people in with this account.
 *
 * A tool is switched on by two variables: <NOM>_URL (its public address) and
 * <NOM>_CLIENT_SECRET (32 characters at least, the same value goes in the tool).
 * Its OpenID Connect client id is its id below, and its return address is fixed:
 * <its URL>/api/auth/compte/callback.
 */
const KNOWN = [
  { id: "lamio", name: "Lamio", description: "Messagerie d'équipe" },
  { id: "cairn", name: "Cairn", description: "Notes et coffre de clés" },
  { id: "metricove", name: "Metricove", description: "Publication et statistiques" },
  { id: "tickup", name: "TickUp", description: "Gestion de projet" },
  { id: "alfred", name: "Alfred", description: "Assistant" },
  { id: "nino", name: "Nino", description: "Régie vidéo" },
] as const;

export const CALLBACK_PATH = "/api/auth/compte/callback";
export const MIN_SECRET = 32;

export type Tool = { id: string; name: string; description: string; url: string; secret: string; redirectUri: string };

export function tools(): Tool[] {
  const list: Tool[] = [];
  for (const t of KNOWN) {
    const key = t.id.toUpperCase();
    const url = (process.env[`${key}_URL`] ?? "").trim().replace(/\/+$/, "");
    const secret = (process.env[`${key}_CLIENT_SECRET`] ?? "").trim();
    if (!url || !secret) continue;
    if (secret.length < MIN_SECRET) throw new Error(`${key}_CLIENT_SECRET doit faire au moins ${MIN_SECRET} caractères.`);
    list.push({ ...t, url, secret, redirectUri: url + CALLBACK_PATH });
  }
  return list;
}

export const tool = (id: string | null | undefined) => tools().find((t) => t.id === id) ?? null;
