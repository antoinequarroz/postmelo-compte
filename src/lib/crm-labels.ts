/** French names and formats of the CRM, shared by server and client components. */

export const KIND_LABEL: Record<string, string> = { prospect: "Prospect", client: "Client", partenaire: "Partenaire", ancien: "Ancien client" };
export const PRODUCT_STATUS_LABEL: Record<string, string> = { disponible: "Disponible", beta: "Bêta", bientot: "Bientôt", masque: "Masqué" };
export const PLAN_LABEL: Record<string, string> = { essai: "Essai", standard: "Standard", pro: "Pro", entreprise: "Entreprise" };
export const LICENSE_STATUS_LABEL: Record<string, string> = { essai: "À l'essai", actif: "Active", suspendu: "Suspendue", resilie: "Résiliée" };
export const STAGE_LABEL: Record<string, string> = { nouveau: "Nouveau", qualifie: "Qualifié", proposition: "Proposition", negociation: "Négociation", gagne: "Gagné", perdu: "Perdu" };
export const PROOF_STATUS_LABEL: Record<string, string> = { publie: "Publié", brouillon: "Brouillon" };
export const FIGURE_SOURCE_LABEL: Record<string, string> = {
  manuel: "Saisi à la main",
  clients: "Clients (compté dans le CRM)",
  licences: "Licences actives (compté dans le CRM)",
  places: "Places actives (compté dans le CRM)",
  produits: "Applications de la suite (catalogue)",
};
export const ACTIVITY_LABEL: Record<string, string> = { note: "Note", appel: "Appel", email: "E-mail", rdv: "Rendez-vous", systeme: "Suivi" };

/** Tone of a status badge: ok, warn, danger, accent or neutral. */
export type Tone = "ok" | "warn" | "danger" | "accent" | "neutral";
export const KIND_TONE: Record<string, Tone> = { prospect: "warn", client: "ok", partenaire: "accent", ancien: "neutral" };
export const LICENSE_TONE: Record<string, Tone> = { essai: "warn", actif: "ok", suspendu: "danger", resilie: "neutral" };
export const PRODUCT_TONE: Record<string, Tone> = { disponible: "ok", beta: "accent", bientot: "warn", masque: "neutral" };
export const PROOF_TONE: Record<string, Tone> = { publie: "ok", brouillon: "neutral" };
export const STAGE_TONE: Record<string, Tone> = { nouveau: "neutral", qualifie: "accent", proposition: "accent", negociation: "warn", gagne: "ok", perdu: "danger" };

// Formatted by hand: Node and the browsers do not group thousands the same way in fr-CH,
// and the pages are rendered on both sides.
const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");

/** 123400 → "CHF 1'234"; cents are shown only when there are some ("CHF 12.50"). */
export function money(cents: number | null | undefined) {
  if (cents == null) return "—";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const units = group(Math.floor(abs / 100));
  return `${sign}CHF ${abs % 100 ? `${units}.${String(abs % 100).padStart(2, "0")}` : units}`;
}

/** "12.50" or "12,50" → 1250; empty → null. */
export function toCents(value: string): number | null {
  const v = value.replace(/['\s]/g, "").replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

export const fromCents = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toFixed(cents % 100 ? 2 : 0));

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** "2026-11-29" or an ISO time → "29 nov. 2026". */
export function day(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? value + "T12:00:00" : value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function ago(value: string) {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`;
  return day(value);
}

/** Days from today to a date (negative when past). */
export const daysUntil = (date: string) => Math.round((new Date(date + "T12:00:00").getTime() - Date.now()) / 864e5);
