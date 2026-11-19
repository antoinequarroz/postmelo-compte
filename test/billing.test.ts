import Stripe from "stripe";
import { beforeAll, expect, test } from "vitest";
import { freshEnv } from "./helpers";

freshEnv();
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;

type Billing = typeof import("@/server/billing");
type Crm = typeof import("@/server/crm");
let billing: Billing;
let crm: Crm;
const PASSWORD = "un-bon-mot-de-passe";

beforeAll(async () => {
  billing = await import("@/server/billing");
  crm = await import("@/server/crm");
});

const user = async (email: string) => {
  const { getAuth } = await import("@/server/auth");
  const ctx = await (await getAuth()).$context;
  const found = await ctx.internalAdapter.findUserByEmail(email);
  return found!.user as { id: string; name: string; email: string; role?: string };
};

test("the suggested formulas start as drafts: nothing is public or for sale until published", () => {
  expect(crm.listPlans().map((p) => p.id)).toEqual(["une-app", "suite", "entreprise"]);
  expect(crm.listPlans(true)).toHaveLength(0);
  expect(() => billing.readOrder({ plan: "suite" })).toThrow("n'est pas disponible");
});

test("prices: an app's own price wins, the yearly discount applies, the suite is split over its licences", async () => {
  const { quote, split } = await import("@/lib/pricing");
  const plan = { scope: "app", monthly_cents: 900, yearly_discount: 20 };
  expect(quote(plan, null, 3, "mois")).toMatchObject({ unit: 900, perMonth: 2700, charge: 2700 });
  expect(quote(plan, { price_cents: 1500 }, 2, "annee")).toMatchObject({ unit: 1200, perMonth: 2400, charge: 28800 });
  expect(quote({ ...plan, yearly_discount: 17 }, null, 1, "annee")?.unit).toBe(700);
  expect(quote({ ...plan, monthly_cents: 950, yearly_discount: 17 }, null, 1, "annee")?.unit).toBe(790);
  expect(quote({ scope: "suite", monthly_cents: null, yearly_discount: 0 }, null, 1, "mois")).toBeNull();
  expect(split(1000, 3)).toEqual([334, 333, 333]);
});

test("signing up creates the account, its company in the CRM and, without Stripe, a free trial with the apps opened", async () => {
  crm.update("plan", "une-app", { status: "publie" });
  crm.update("plan", "suite", { status: "publie" });
  const { createInvite } = await import("@/server/invites");
  const invite = (email: string) => createInvite({ email, createdBy: "admin" }).token;
  await billing.signUp({ name: "Léa Martin", email: "ignoree@ailleurs.ch", password: PASSWORD, company: "Studio Léa", invitation: invite("Lea@Studio.ch") });
  await expect(billing.signUp({ name: "Léa", password: PASSWORD, invitation: invite("lea@studio.ch") })).rejects.toThrow("existe déjà");
  await expect(billing.signUp({ name: "X", password: "court", invitation: invite("x@y.ch") })).rejects.toThrow("mot de passe");

  const lea = await user("lea@studio.ch");
  expect(lea.role).toBe("user");
  const link = billing.linkOfUser(lea.id)!;
  expect(crm.getCompany(link.company_id)?.company).toMatchObject({ name: "Studio Léa", kind: "prospect" });

  // A draft formula, an app that is not sold yet ("bientôt") or a hidden one are refused.
  crm.update("plan", "une-app", { status: "brouillon" });
  await expect(billing.startCheckout(lea, { plan: "une-app", product: "cairn" })).rejects.toThrow("n'est pas disponible");
  crm.update("plan", "une-app", { status: "publie" });
  await expect(billing.startCheckout(lea, { plan: "une-app", product: "maya" })).rejects.toThrow("Choisis l'application");

  const { url } = await billing.startCheckout(lea, { plan: "suite", seats: 4, period: "annee" });
  expect(url).toBe("/compte?essai=1");
  const company = crm.getCompany(link.company_id)!;
  expect(company.company.kind).toBe("client");
  const sellable = crm.listProducts(true).filter((p) => p.status === "disponible" || p.status === "beta").map((p) => p.id);
  expect(company.licenses.map((l) => l.product_id).sort()).toEqual([...sellable].sort());
  expect(company.licenses.every((l) => l.status === "essai" && l.seats === 4 && l.plan_id === "suite" && l.plan === "pro")).toBe(true);
  // 29.00 less 17% = 24.07, rounded to 24 per person, four people, split over the apps.
  expect(company.licenses.reduce((s, l) => s + l.price_cents, 0)).toBe(2400 * 4);

  const { mayOpenTool } = await import("@/server/db");
  expect(mayOpenTool("lamio", lea)).toBe(true);
  expect(mayOpenTool("maya", lea)).toBe(false);

  // One free trial per company.
  await expect(billing.startCheckout(lea, { plan: "une-app", product: "cairn" })).rejects.toThrow("paiement en ligne ouvre bientôt");
  expect(billing.subscriptionOf(lea.id)).toMatchObject({ company: "Studio Léa", portal: false });
});

test("Stripe's subscription drives the licences: paid, unpaid, cancelled, and the same news twice changes nothing", async () => {
  const { createInvite } = await import("@/server/invites");
  await billing.signUp({ name: "Marc", password: PASSWORD, company: "Atelier Marc", invitation: createInvite({ email: "marc@atelier.ch", createdBy: "admin" }).token });
  const marc = await user("marc@atelier.ch");
  const companyId = billing.linkOfUser(marc.id)!.company_id;
  const sub = (status: string, quantity = 3) =>
    ({
      id: "sub_123",
      object: "subscription",
      customer: "cus_123",
      status,
      trial_end: null,
      metadata: { company_id: companyId, plan_id: "une-app", product_id: "tickup" },
      items: { data: [{ quantity, current_period_end: Date.parse("2027-01-15T00:00:00Z") / 1000, price: { unit_amount: 1200 * 12, recurring: { interval: "year" } } }] },
    }) as unknown as Stripe.Subscription;

  billing.applyLicences(billing.fromSubscription(sub("active"))!);
  billing.applyLicences(billing.fromSubscription(sub("active"))!);
  let licences = crm.getCompany(companyId)!.licenses;
  expect(licences).toHaveLength(1);
  expect(licences[0]).toMatchObject({ product_id: "tickup", status: "actif", seats: 3, price_cents: 3600, renewal_date: "2027-01-15", subscription_id: "sub_123" });
  const { mayOpenTool } = await import("@/server/db");
  expect(mayOpenTool("tickup", marc)).toBe(true);
  expect(crm.dashboard().mrr).toBeGreaterThanOrEqual(3600);

  billing.applyLicences(billing.fromSubscription(sub("past_due"))!);
  expect(crm.getCompany(companyId)!.licenses[0].status).toBe("suspendu");
  expect(mayOpenTool("tickup", marc)).toBe(false);

  billing.applyLicences(billing.fromSubscription(sub("canceled", 5))!);
  licences = crm.getCompany(companyId)!.licenses;
  expect(licences[0]).toMatchObject({ status: "resilie", seats: 5 });
  const journal = crm.getCompany(companyId)!.activities.map((a) => a.body).join("\n");
  expect(journal).toContain("Licence TickUp ajoutée depuis le site");
  expect(journal).toContain("Licence TickUp : résiliée.");
  // A formula somebody bought cannot be deleted.
  expect(() => crm.remove("plan", "une-app")).toThrow("souscrit");
});

test("the webhook only believes messages signed with the secret", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  const { POST } = await import("@/app/api/stripe/webhook/route");
  const company = crm.create("company", { name: "Webhook SA" });
  const payload = JSON.stringify({
    id: "evt_1",
    object: "event",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_web",
        object: "subscription",
        customer: "cus_web",
        status: "trialing",
        trial_end: Date.parse("2026-12-01T00:00:00Z") / 1000,
        metadata: { company_id: company, plan_id: "une-app", product_id: "cairn" },
        items: { data: [{ quantity: 1, price: { unit_amount: 900, recurring: { interval: "month" } } }] },
      },
    },
  });
  const send = (signature: string) => POST(new Request("http://localhost:3000/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": signature } }));

  expect((await send("t=1,v1=nope")).status).toBe(400);
  expect(crm.getCompany(company)!.licenses).toHaveLength(0);

  const signature = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload, secret: "whsec_test_secret" });
  expect((await send(signature)).status).toBe(200);
  expect(crm.getCompany(company)!.licenses[0]).toMatchObject({ product_id: "cairn", status: "essai", renewal_date: "2026-12-01", price_cents: 900 });
});
