import "server-only";
import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import Stripe from "stripe";
import { asPeriod, MAX_SEATS, type Period, quote, sellable, split } from "@/lib/pricing";
import { MAX_PASSWORD, MIN_PASSWORD } from "@/lib/utils";
import { addPerson, baseUrl, getAuth } from "./auth";
import { create, CrmError, crmDb, getPlan, log, type Plan, type Product, productName, promote, today } from "./crm";
import { setToolAccess } from "./db";
import { claimInvite, findInvite, inviteAlreadyUsed, inviteUsedBy, releaseInvite } from "./invites";

/**
 * Sign-up and payment. Someone picks a formula on /tarifs, creates an account, pays with Stripe
 * (or starts a free trial while Stripe is not set up), and the licences appear in the CRM by
 * themselves, with the apps opened to their account. Stripe tells us about every change of the
 * subscription (renewal, failed payment, cancellation) through the webhook, and the licences follow.
 */

// ---- Stripe

const globalForStripe = globalThis as unknown as { __stripe?: { key: string; client: Stripe } };

/** The Stripe client, or null while STRIPE_SECRET_KEY is not set (sign-ups then start a free trial). */
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (globalForStripe.__stripe?.key !== key) globalForStripe.__stripe = { key, client: new Stripe(key) };
  return globalForStripe.__stripe.client;
}

/** "off" without keys, "test" with sk_test_ keys (no real money), "live" otherwise. */
export function stripeMode(): "off" | "test" | "live" {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return "off";
  return key.startsWith("sk_test_") || key.startsWith("rk_test_") ? "test" : "live";
}

export const webhookReady = () => !!process.env.STRIPE_WEBHOOK_SECRET?.trim();

// ---- Who pays: a company of the CRM, linked to the account that signed up

function billing() {
  const conn = crmDb();
  conn.exec(`
    create table if not exists billing_customer (
      company_id text primary key references crm_company(id) on delete cascade,
      user_id text not null unique,
      stripe_customer_id text unique,
      created_at text not null
    );
  `);
  return conn;
}

type Link = { company_id: string; user_id: string; stripe_customer_id: string | null };

export const linkOfUser = (userId: string) => billing().prepare("select * from billing_customer where user_id = ?").get(userId) as Link | undefined;
const linkOfCompany = (companyId: string) => billing().prepare("select * from billing_customer where company_id = ?").get(companyId) as Link | undefined;
const linkOfCustomer = (customerId: string) => billing().prepare("select * from billing_customer where stripe_customer_id = ?").get(customerId) as Link | undefined;

function linkCompany(companyId: string, userId: string) {
  billing().prepare("insert or ignore into billing_customer (company_id, user_id, created_at) values (?, ?, ?)").run(companyId, userId, new Date().toISOString());
}

/** The company of a signed-in person, created on the spot for accounts made by an admin. */
function companyOf(user: { id: string; name: string; email: string }) {
  const link = linkOfUser(user.id);
  if (link) return link.company_id;
  const companyId = create("company", { name: user.name, kind: "prospect", email: user.email }, "Site");
  create("contact", { company_id: companyId, name: user.name, email: user.email });
  linkCompany(companyId, user.id);
  return companyId;
}

// ---- Sign-up

const ACCOUNT_EXISTS = "Un compte existe déjà avec cet e-mail : connecte-toi.";
export const INVITE_INVALID = "Ce lien d'invitation n'est plus valable. Demande-en un nouveau.";

const text = (input: Record<string, unknown>, key: string, max: number) => (typeof input[key] === "string" ? (input[key] as string).trim().slice(0, max) : "");

/**
 * Creates the account from an invitation, its company in the CRM (a prospect until it pays) and
 * the link between them. The address is the one of the invitation, never one typed on the page.
 */
export async function signUp(input: Record<string, unknown>) {
  const invite = findInvite(input.invitation);
  if (!invite) {
    if (inviteAlreadyUsed(input.invitation)) throw new CrmError(ACCOUNT_EXISTS, 409);
    throw new CrmError(INVITE_INVALID, 403);
  }
  const name = text(input, "name", 80) || invite.name;
  const email = invite.email;
  const password = typeof input.password === "string" ? input.password : "";
  const companyName = text(input, "company", 120) || name;
  if (!name) throw new CrmError("Indique ton nom.");
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) throw new CrmError(`Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);

  const auth = await getAuth();
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) throw new CrmError(ACCOUNT_EXISTS, 409);
  // One link, one account: of two sign-ups sent at once with the same link, only one goes on.
  if (!claimInvite(invite.id)) throw new CrmError(INVITE_INVALID, 403);
  let user: Awaited<ReturnType<typeof addPerson>>;
  try {
    user = await addPerson(auth, { name, email, role: "user", passwordHash: await hashPassword(password) });
  } catch (e) {
    releaseInvite(invite.id);
    throw e;
  }
  inviteUsedBy(invite.id, user.id);

  const conn = crmDb();
  conn.transaction(() => {
    // A company the CRM already knows (a prospect from the contact form) is reused, unless someone already pays for it.
    const known = conn.prepare("select id from crm_company where lower(name) = lower(?)").get(companyName) as { id: string } | undefined;
    const companyId = known && !linkOfCompany(known.id) ? known.id : create("company", { name: companyName, kind: "prospect", email }, "Site");
    if (!conn.prepare("select 1 from crm_contact where company_id = ? and email = ?").get(companyId, email)) create("contact", { company_id: companyId, name, email });
    linkCompany(companyId, user.id);
    log(companyId, `Compte créé sur invitation par ${name} <${email}>.`, "Site");
  })();
  return { id: user.id, email, inviteId: invite.id };
}

// ---- Choosing a formula

export type Order = { plan: Plan; product: Product | null; products: Product[]; seats: number; period: Period };

/** Checks what was picked on the pricing page, against the catalogue as it is now. */
export function readOrder(input: Record<string, unknown>): Order {
  const plan = getPlan(text(input, "plan", 60));
  if (!plan || plan.status !== "publie") throw new CrmError("Cette formule n'est pas disponible.");
  if (plan.monthly_cents == null && plan.scope === "suite") throw new CrmError("Cette formule se fait sur devis : écris-nous.");
  const all = crmDb().prepare("select * from crm_product order by sort, name").all() as Product[];
  const seats = Number(input.seats ?? 1);
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) throw new CrmError(`Le nombre de places doit être entre 1 et ${MAX_SEATS}.`);
  const period = asPeriod(input.period);
  if (plan.scope === "app") {
    const product = all.find((p) => p.id === text(input, "product", 40) && sellable(p.status));
    if (!product) throw new CrmError("Choisis l'application.");
    if (quote(plan, product, seats, period) == null) throw new CrmError("Cette application se fait sur devis : écris-nous.");
    return { plan, product, products: [product], seats, period };
  }
  return { plan, product: null, products: all.filter((p) => sellable(p.status)), seats, period };
}

const orderLabel = (o: Pick<Order, "plan" | "product">) => (o.product ? `${o.product.name} · ${o.plan.name}` : o.plan.name);

/** A company gets the free trial once: not if it already had licences. */
const hadLicences = (companyId: string) => !!crmDb().prepare("select 1 from crm_license where company_id = ?").get(companyId);

/**
 * Starts the purchase for a signed-in person. With Stripe: the address of the Stripe payment page.
 * Without Stripe yet: the free trial starts right away, and the account page is next.
 */
export async function startCheckout(user: { id: string; name: string; email: string }, input: Record<string, unknown>): Promise<{ url: string }> {
  const order = readOrder(input);
  const companyId = companyOf(user);
  const q = quote(order.plan, order.product, order.seats, order.period)!;
  const trial = order.plan.trial_days > 0 && !hadLicences(companyId) ? order.plan.trial_days : 0;
  const client = stripe();

  if (!client) {
    if (!trial) throw new CrmError("Le paiement en ligne ouvre bientôt. Écris-nous et on active ton accès.", 503);
    applyLicences({
      companyId,
      planId: order.plan.id,
      productId: order.product?.id ?? null,
      seats: q.seats,
      status: "essai",
      renewal: addDays(today(), trial),
      perMonth: q.perMonth,
      subscriptionId: null,
      author: "Site",
    });
    log(companyId, `Essai gratuit de ${trial} jours : ${orderLabel(order)}, ${q.seats} place(s).`, "Site");
    return { url: "/compte?essai=1" };
  }

  const metadata = { company_id: companyId, plan_id: order.plan.id, product_id: order.product?.id ?? "", user_id: user.id };
  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: await customerOf(client, companyId, user),
    client_reference_id: companyId,
    locale: "fr",
    allow_promotion_codes: true,
    billing_address_collection: "required",
    line_items: [
      {
        quantity: q.seats,
        price_data: {
          currency: "chf",
          unit_amount: order.period === "annee" ? q.unit * 12 : q.unit,
          recurring: { interval: order.period === "annee" ? "year" : "month" },
          product_data: { name: `PostMelo · ${orderLabel(order)}`, metadata: { plan_id: order.plan.id, product_id: order.product?.id ?? "" } },
        },
      },
    ],
    subscription_data: { metadata, ...(trial ? { trial_period_days: trial } : {}) },
    metadata,
    success_url: `${baseUrl()}/compte?abonnement=1`,
    cancel_url: `${baseUrl()}/tarifs?annule=1`,
  });
  if (!session.url) throw new CrmError("Stripe n'a pas ouvert la page de paiement.", 502);
  log(companyId, `Paiement commencé : ${orderLabel(order)}, ${q.seats} place(s), ${order.period === "annee" ? "à l'année" : "au mois"}.`, "Site");
  return { url: session.url };
}

async function customerOf(client: Stripe, companyId: string, user: { email: string; name: string }) {
  const link = linkOfCompany(companyId);
  if (link?.stripe_customer_id) return link.stripe_customer_id;
  const company = crmDb().prepare("select name, email from crm_company where id = ?").get(companyId) as { name: string; email: string };
  const customer = await client.customers.create({ name: company.name, email: company.email || user.email, metadata: { company_id: companyId } });
  billing().prepare("update billing_customer set stripe_customer_id = ? where company_id = ?").run(customer.id, companyId);
  return customer.id;
}

/** The Stripe page where a customer changes card, downloads invoices or cancels. */
export async function portalUrl(userId: string) {
  const client = stripe();
  const link = linkOfUser(userId);
  if (!client || !link?.stripe_customer_id) throw new CrmError("Aucun abonnement payant sur ce compte.", 404);
  const session = await client.billingPortal.sessions.create({ customer: link.stripe_customer_id, return_url: `${baseUrl()}/compte`, locale: "fr" });
  return session.url;
}

// ---- Licences follow the subscription

const addDays = (date: string, n: number) => new Date(Date.parse(date + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);

const STATUS: Record<string, string> = {
  trialing: "essai",
  active: "actif",
  past_due: "suspendu",
  unpaid: "suspendu",
  paused: "suspendu",
  incomplete: "suspendu",
  canceled: "resilie",
  incomplete_expired: "resilie",
};
const STATUS_NAME: Record<string, string> = { essai: "à l'essai", actif: "active", suspendu: "suspendue (paiement en attente)", resilie: "résiliée" };

export type LicenceUpdate = {
  companyId: string;
  planId: string;
  /** The app of an "app" formula; null for the whole suite. */
  productId: string | null;
  seats: number;
  status: string;
  renewal: string | null;
  /** Monthly amount of the whole subscription, split over its licences. */
  perMonth: number;
  subscriptionId: string | null;
  author?: string;
};

/**
 * Writes the licences of one purchase: one per app (a single one for an "app" formula, every
 * sellable app for the suite). Running it again with the same subscription updates them, so
 * Stripe may send the same news twice. The account linked to the company gets the apps opened.
 */
export function applyLicences(u: LicenceUpdate) {
  const conn = crmDb();
  const plan = getPlan(u.planId);
  const scope = plan?.scope ?? (u.productId ? "app" : "suite");
  const products = (
    scope === "app"
      ? conn.prepare("select * from crm_product where id = ?").all(u.productId)
      : conn.prepare("select * from crm_product order by sort, name").all().filter((p) => sellable((p as Product).status))
  ) as Product[];
  // Apps added to a running suite subscription keep their licence when a new app appears.
  const existing = u.subscriptionId ? (conn.prepare("select * from crm_license where subscription_id = ?").all(u.subscriptionId) as { id: string; product_id: string; status: string }[]) : [];
  for (const e of existing) if (!products.some((p) => p.id === e.product_id)) products.push(conn.prepare("select * from crm_product where id = ?").get(e.product_id) as Product);
  const prices = split(u.perMonth, products.length);
  const stamp = new Date().toISOString();
  const kind = scope === "suite" ? "pro" : "standard";

  conn.transaction(() => {
    products.forEach((p, i) => {
      const before = existing.find((e) => e.product_id === p.id);
      if (before) {
        conn
          .prepare("update crm_license set seats = ?, price_cents = ?, status = ?, renewal_date = ?, plan = ?, plan_id = ? where id = ?")
          .run(u.seats, prices[i], u.status, u.renewal, kind, u.planId, before.id);
        if (before.status !== u.status) log(u.companyId, `Licence ${p.name} : ${STATUS_NAME[u.status] ?? u.status}.`, u.author ?? "Stripe");
      } else {
        conn
          .prepare(
            "insert into crm_license (id, company_id, product_id, plan, seats, price_cents, status, start_date, renewal_date, notes, created_at, plan_id, subscription_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .run(crypto.randomUUID(), u.companyId, p.id, kind, u.seats, prices[i], u.status, today(), u.renewal, `Souscrite en ligne (${plan?.name ?? u.planId}).`, stamp, u.planId, u.subscriptionId);
        log(u.companyId, `Licence ${productName(p.id)} ajoutée depuis le site (${u.seats} place(s), ${STATUS_NAME[u.status] ?? u.status}).`, u.author ?? "Stripe");
      }
    });
    if (u.status === "actif" || u.status === "essai") promote(u.companyId);
  })();
  syncAccess(u.companyId, products.map((p) => p.id));
}

/** Opens or closes the apps of the paying account, following its licences that are running. */
function syncAccess(companyId: string, productIds: string[]) {
  const link = linkOfCompany(companyId);
  if (!link) return;
  const conn = crmDb();
  for (const id of productIds) {
    const running = conn.prepare("select 1 from crm_license where company_id = ? and product_id = ? and status in ('actif', 'essai')").get(companyId, id);
    setToolAccess(id, link.user_id, !!running);
  }
}

/** What Stripe says about a subscription, in the words of the CRM. */
export function fromSubscription(sub: Stripe.Subscription): LicenceUpdate | null {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const companyId = sub.metadata?.company_id || linkOfCustomer(customerId)?.company_id;
  const planId = sub.metadata?.plan_id;
  if (!companyId || !planId || !crmDb().prepare("select 1 from crm_company where id = ?").get(companyId)) return null;
  const item = sub.items.data[0];
  if (!item) return null;
  const seats = item.quantity ?? 1;
  const amount = (item.price.unit_amount ?? 0) * seats;
  const perMonth = item.price.recurring?.interval === "year" ? Math.round(amount / 12) : amount;
  const loose = sub as unknown as { current_period_end?: number };
  const end = sub.status === "trialing" && sub.trial_end ? sub.trial_end : (item.current_period_end ?? loose.current_period_end ?? null);
  return {
    companyId,
    planId,
    productId: sub.metadata?.product_id || null,
    seats,
    status: STATUS[sub.status] ?? "suspendu",
    renewal: end ? new Date(end * 1000).toISOString().slice(0, 10) : null,
    perMonth,
    subscriptionId: sub.id,
  };
}

/** Handles one event of the Stripe webhook. Unknown events are ignored. */
export async function handleEvent(event: Stripe.Event) {
  const client = stripe();
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const companyId = s.metadata?.company_id || s.client_reference_id;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
      if (companyId && customerId) billing().prepare("update billing_customer set stripe_customer_id = coalesce(stripe_customer_id, ?) where company_id = ?").run(customerId, companyId);
      const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
      if (subId && client) {
        const u = fromSubscription(await client.subscriptions.retrieve(subId));
        if (u) applyLicences(u);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const u = fromSubscription(event.data.object);
      if (u) applyLicences(u);
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const inv = event.data.object;
      const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
      const link = customerId ? linkOfCustomer(customerId) : undefined;
      if (!link || (event.type === "invoice.paid" && !inv.amount_paid)) break;
      const amount = `CHF ${((event.type === "invoice.paid" ? inv.amount_paid : inv.amount_due) / 100).toFixed(2)}`;
      log(link.company_id, event.type === "invoice.paid" ? `Paiement reçu : ${amount}${inv.number ? ` (facture ${inv.number})` : ""}.` : `Paiement refusé : ${amount}. Stripe réessaie et prévient le client.`, "Stripe");
      break;
    }
  }
}

// ---- The account page

export type Subscription = {
  company: string;
  portal: boolean;
  licences: { product: string; status: string; seats: number; renewal: string | null; price_cents: number }[];
};

/** The licences of the company of an account, for "Mon compte". */
export function subscriptionOf(userId: string): Subscription | null {
  const link = linkOfUser(userId);
  if (!link) return null;
  const conn = crmDb();
  const company = conn.prepare("select name from crm_company where id = ?").get(link.company_id) as { name: string } | undefined;
  if (!company) return null;
  const licences = conn
    .prepare("select p.name as product, l.status, l.seats, l.renewal_date as renewal, l.price_cents from crm_license l join crm_product p on p.id = l.product_id where l.company_id = ? and l.status != 'resilie' order by p.sort")
    .all(link.company_id) as Subscription["licences"];
  return { company: company.name, portal: !!link.stripe_customer_id && !!stripe(), licences };
}
