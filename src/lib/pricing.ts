/**
 * What a formula costs. Shared by the pricing page, the sign-up page and the server, which
 * computes it again before asking Stripe: the browser's numbers are never trusted.
 */

export type Period = "mois" | "annee";
export const PERIODS: Period[] = ["mois", "annee"];
export const asPeriod = (value: unknown): Period => (value === "annee" ? "annee" : "mois");

type PlanPrice = { scope: string; monthly_cents: number | null; yearly_discount: number };
type ProductPrice = { price_cents: number | null } | null | undefined;

/** Price of one place for one month, before any yearly discount. An app's own price wins over the formula's. */
export function unitMonthly(plan: PlanPrice, product?: ProductPrice): number | null {
  if (plan.scope === "app" && product?.price_cents != null) return product.price_cents;
  return plan.monthly_cents;
}

/** The discounted price stays a round one: whole francs when the monthly price is, otherwise 5 centimes. */
function yearlyUnit(base: number, discount: number) {
  const raw = (base * (100 - discount)) / 100;
  const step = base % 100 === 0 ? 100 : 5;
  return Math.max(step === 100 && base > 0 ? 100 : 0, Math.round(raw / step) * step);
}

export type Quote = {
  /** One place, one month, discount included. */
  unit: number;
  seats: number;
  /** What it costs per month for every place (for the CRM's monthly revenue). */
  perMonth: number;
  /** What is charged at each renewal: a month, or a year. */
  charge: number;
  period: Period;
};

export function quote(plan: PlanPrice, product: ProductPrice, seats: number, period: Period): Quote | null {
  const base = unitMonthly(plan, product);
  if (base == null) return null;
  const unit = period === "annee" ? yearlyUnit(base, plan.yearly_discount) : base;
  const n = Math.max(1, Math.floor(seats) || 1);
  return { unit, seats: n, perMonth: unit * n, charge: period === "annee" ? unit * 12 * n : unit * n, period };
}

/** Splits a monthly amount over several licences (one per app of the suite), in whole cents. */
export function split(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  return Array.from({ length: parts }, (_, i) => base + (i < total - base * parts ? 1 : 0));
}

/** Products a formula can be bought with: available or in beta, not "bientôt" nor hidden. */
export const sellable = (status: string) => status === "disponible" || status === "beta";

export const MAX_SEATS = 500;
