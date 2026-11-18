import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge, Empty, selectClass } from "@/components/crm/kit";
import { Stat } from "@/components/crm/stat";
import { PageHeader } from "@/components/ui";
import { AUDIT_FAMILIES, AUDIT_LABEL, AUDIT_SENSITIVE } from "@/lib/audit-labels";
import { cn } from "@/lib/utils";
import { listAudit, RETENTION_DAYS, verifyAudit } from "@/server/audit";

export const dynamic = "force-dynamic";

const when = (iso: string) => new Date(iso).toLocaleString("fr-CH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Zurich" });

/** A short name for the device, from the browser's user agent. */
function device(ua: string | null) {
  if (!ua) return "";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
  return [browser, os].filter(Boolean).join(" · ") || ua.slice(0, 40);
}

const KEY: Record<string, string> = { session: "session", role: "rôle", twoFactor: "2FA", methode: "méthode", erreur: "raison", champs: "champs", langue: "langue", accepte: "accepté" };
const ERROR: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "e-mail ou mot de passe faux",
  INVALID_CODE: "code faux",
  INVALID_TWO_FACTOR_COOKIE: "étape 2FA expirée",
  TOO_MANY_ATTEMPTS: "trop d'essais",
  CODE_ALREADY_USED: "code déjà utilisé",
  FORBIDDEN: "interdit",
};
const value = (k: string, v: unknown) => (typeof v === "boolean" ? (v ? "oui" : "non") : Array.isArray(v) ? v.join(", ") : k === "erreur" ? (ERROR[String(v)] ?? String(v)) : String(v));

const describe = (detail: Record<string, unknown> | null) =>
  detail
    ? Object.entries(detail)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${KEY[k] ?? k} : ${value(k, v)}`)
        .join(" · ")
    : "";

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ type?: string; qui?: string; echecs?: string }> }) {
  const { type = "", qui = "", echecs = "" } = await searchParams;
  const rows = listAudit({ action: type || undefined, actor: qui.trim() || undefined, failures: echecs === "1", limit: 300 });
  const chain = verifyAudit();
  const day = Date.now() - 24 * 3600 * 1000;
  const recent = listAudit({ limit: 1000 }).filter((r) => Date.parse(r.at) > day);
  return (
    <>
      <PageHeader title="Journal de sécurité" subtitle={`Qui s'est connecté, qui a changé quoi. Rien ne peut y être modifié, chaque ligne est gardée ${RETENTION_DAYS} jours.`} />
      <div className="flex flex-col gap-4 p-7 max-md:p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Connexions (24 h)" value={String(recent.filter((r) => r.action === "connexion.reussie").length)} />
          <Stat label="Refus (24 h)" value={String(recent.filter((r) => !r.ok).length)} detail="Connexions ratées et accès refusés" />
          <div className={cn("flex items-center gap-3 rounded-xl border bg-surface p-4 shadow-card", chain.ok ? "border-line" : "border-danger/60")}>
            {chain.ok ? <ShieldCheck className="size-6 shrink-0 text-ok" /> : <ShieldAlert className="size-6 shrink-0 text-danger" />}
            <div>
              <p className="text-[13.5px] font-medium">{chain.ok ? "Journal intact" : "Journal altéré"}</p>
              <p className="text-[12px] text-ink-3">
                {chain.ok ? `${chain.rows} lignes vérifiées, aucune modifiée ni retirée.` : `La ligne ${chain.brokenAt} ne correspond plus à ce qui a été écrit.`}
              </p>
            </div>
          </div>
        </div>

        <form method="get" className="flex flex-wrap items-center gap-2">
          <select name="type" defaultValue={type} className={cn(selectClass, "h-9")} aria-label="Type d'événement">
            <option value="">Tous les événements</option>
            {AUDIT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input name="qui" defaultValue={qui} placeholder="E-mail ou identifiant" className={cn(selectClass, "h-9 w-56")} aria-label="Personne" />
          <label className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
            <input type="checkbox" name="echecs" value="1" defaultChecked={echecs === "1"} className="size-4 accent-[var(--accent)]" />
            Refus seulement
          </label>
          <button type="submit" className="press h-9 rounded-lg border border-line-strong bg-surface px-3 text-[13px] shadow-card hover:bg-surface-2">
            Filtrer
          </button>
        </form>

        {!rows.length ? (
          <Empty>Rien dans le journal pour ce filtre.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[860px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] text-ink-3">
                  <th className="px-4 py-2.5 font-medium">Quand</th>
                  <th className="px-3 py-2.5 font-medium">Événement</th>
                  <th className="px-3 py-2.5 font-medium">Qui</th>
                  <th className="px-3 py-2.5 font-medium">Sur quoi</th>
                  <th className="px-3 py-2.5 font-medium">D&apos;où</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.seq} className="align-top hover:bg-surface-2">
                    <td className="tabular whitespace-nowrap px-4 py-2 text-ink-2">{when(r.at)}</td>
                    <td className="px-3 py-2">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className={cn("font-medium", !r.ok && "text-danger")}>{AUDIT_LABEL[r.action] ?? r.action}</span>
                        {!r.ok && <Badge tone="danger">refusé</Badge>}
                        {r.ok && AUDIT_SENSITIVE.has(r.action) && <Badge tone="warn">sensible</Badge>}
                      </span>
                      {describe(r.detail) && <span className="mt-0.5 block text-[12px] text-ink-3">{describe(r.detail)}</span>}
                    </td>
                    <td className="px-3 py-2 text-ink-2">{r.actorEmail ?? r.actorId ?? "—"}</td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-ink-2" title={r.target ?? ""}>
                      {r.target ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-ink-3">
                      <span className="tabular block">{r.ip ?? "—"}</span>
                      <span className="block text-[12px]">{device(r.userAgent)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
