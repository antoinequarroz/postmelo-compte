import "server-only";
import crypto from "node:crypto";
import { db } from "./db";

/**
 * The CRM of the suite: the products we sell (they also fill the public home page),
 * the companies we sell them to, their people, their licences, the deals on the way
 * and everything that happened with them. Same SQLite file as the accounts.
 */

// ---- Vocabulary, shared with the pages (src/lib/crm-labels.ts repeats the French names)

export const COMPANY_KINDS = ["prospect", "client", "partenaire", "ancien"] as const;
export const PRODUCT_STATUSES = ["disponible", "beta", "bientot", "masque"] as const;
export const LICENSE_PLANS = ["essai", "standard", "pro", "entreprise"] as const;
export const LICENSE_STATUSES = ["essai", "actif", "suspendu", "resilie"] as const;
export const DEAL_STAGES = ["nouveau", "qualifie", "proposition", "negociation", "gagne", "perdu"] as const;
export const ACTIVITY_KINDS = ["note", "appel", "email", "rdv", "systeme"] as const;

/** Chance that a deal at this stage is won, for the weighted pipeline. */
export const STAGE_ODDS: Record<(typeof DEAL_STAGES)[number], number> = { nouveau: 0.1, qualifie: 0.25, proposition: 0.5, negociation: 0.75, gagne: 1, perdu: 0 };

export class CrmError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

// ---- Tables

// The tables are checked once per connection (the tests open several data directories).
const ready = new WeakSet<object>();

function crm() {
  const conn = db();
  if (ready.has(conn)) return conn;
  conn.exec(`
    create table if not exists crm_product (
      id text primary key,
      name text not null,
      tagline text not null default '',
      description text not null default '',
      category text not null default '',
      family text not null default 'equipe',
      color text not null default '',
      status text not null default 'disponible',
      price_cents integer,
      url text not null default '',
      sort integer not null default 0,
      created_at text not null
    );
    create table if not exists crm_company (
      id text primary key,
      name text not null,
      kind text not null default 'prospect',
      email text not null default '',
      phone text not null default '',
      website text not null default '',
      city text not null default '',
      country text not null default 'CH',
      notes text not null default '',
      created_at text not null,
      updated_at text not null
    );
    create table if not exists crm_contact (
      id text primary key,
      company_id text references crm_company(id) on delete cascade,
      name text not null,
      email text not null default '',
      phone text not null default '',
      role text not null default '',
      created_at text not null
    );
    create table if not exists crm_license (
      id text primary key,
      company_id text not null references crm_company(id) on delete cascade,
      product_id text not null references crm_product(id),
      plan text not null default 'standard',
      seats integer not null default 1,
      price_cents integer not null default 0,
      status text not null default 'actif',
      start_date text not null,
      renewal_date text,
      notes text not null default '',
      created_at text not null
    );
    create table if not exists crm_deal (
      id text primary key,
      company_id text not null references crm_company(id) on delete cascade,
      product_id text references crm_product(id) on delete set null,
      title text not null,
      value_cents integer not null default 0,
      stage text not null default 'nouveau',
      expected_close text,
      created_at text not null,
      updated_at text not null
    );
    create table if not exists crm_activity (
      id text primary key,
      company_id text not null references crm_company(id) on delete cascade,
      kind text not null default 'note',
      body text not null,
      author text not null default '',
      at text not null
    );
    create index if not exists crm_contact_company on crm_contact(company_id);
    create index if not exists crm_license_company on crm_license(company_id);
    create index if not exists crm_deal_company on crm_deal(company_id);
    create index if not exists crm_activity_company on crm_activity(company_id, at);
  `);
  // The catalogue starts with the products of the suite; from then on it is edited in the admin.
  const count = (conn.prepare("select count(*) as n from crm_product").get() as { n: number }).n;
  if (count === 0) {
    const insert = conn.prepare(
      "insert into crm_product (id, name, tagline, description, category, family, color, status, url, sort, created_at) values (@id, @name, @tagline, @description, @category, @family, @color, @status, '', @sort, @created_at)",
    );
    CATALOG.forEach((p, i) => insert.run({ ...p, sort: i * 10, created_at: now() }));
  }
  ready.add(conn);
  return conn;
}

/** The products of the suite on day one, written from what each one does today. */
const CATALOG = [
  {
    id: "lamio", name: "Lamio", category: "Messagerie d'équipe", family: "equipe", color: "#6f42e6", status: "disponible",
    tagline: "La messagerie de l'équipe, et la base de la suite.",
    description: "Canaux publics et privés, messages directs et fils de réponses\nFichiers, images, réactions et mentions\nTout arrive en direct, avec les non-lus et les notifications\nRecherche ⌘K, app Mac et iPhone",
  },
  {
    id: "cairn", name: "Cairn", category: "Notes et coffre", family: "equipe", color: "#4f56e8", status: "disponible",
    tagline: "Tes notes et tes secrets, chez toi. Un Notion sur mesure.",
    description: "Notes en Markdown, import depuis Notion\nCoffre chiffré pour mots de passe et clés SSH\nIA qui répond à partir de toutes tes notes\nApps Mac et iPhone avec Face ID",
  },
  {
    id: "tickup", name: "TickUp", category: "Gestion de projet", family: "equipe", color: "", status: "disponible",
    tagline: "Projets, epics et tickets, en kanban ou en liste.",
    description: "Kanban, liste, sprints et planning Gantt\nRoadmap de tous les projets\nGitHub relié aux tickets\nImport depuis Linear",
  },
  {
    id: "alfred", name: "Alfred", category: "Agenda et rendez-vous", family: "equipe", color: "#2f8fd8", status: "beta",
    tagline: "L'assistant de ton temps : agenda et prise de rendez-vous.",
    description: "Vues jour, semaine et mois, événements récurrents\nSynchro iCloud dans les deux sens\nPage publique de prise de rendez-vous\nE-mails de confirmation et d'annulation",
  },
  {
    id: "metricove", name: "Metricove", category: "Réseaux sociaux", family: "media", color: "#ff5a1f", status: "disponible",
    tagline: "Le calendrier éditorial et la publication sur tous tes comptes.",
    description: "Instagram, Facebook, X, LinkedIn et YouTube\nPosts programmés et publiés automatiquement\nVidéos, Shorts et relance en cas d'échec\nUn seul calendrier pour tous les comptes",
  },
  {
    id: "postmelo-studio", name: "Postmelo Studio", category: "Création de contenu", family: "media", color: "#0a8f72", status: "beta",
    tagline: "Le studio qui écrit, met en forme et prépare tes publications.",
    description: "Posts et carrousels jusqu'à 20 diapositives\nFiche de marque : ton, couleurs, exemples\nGénération et retouche par IA\nVidéos animées et export PDF",
  },
  {
    id: "nino", name: "Nino Studio", category: "Studio vidéo", family: "media", color: "#e5484d", status: "beta",
    tagline: "La régie de ton studio : podcast, table ronde, live.",
    description: "Pilote OBS depuis le PC, l'iPad ou le Stream Deck\nRéalisation automatique selon qui parle\nInvités à distance et diffusion live\nPrises prêtes pour DaVinci Resolve",
  },
  {
    id: "maya", name: "Maya Studio", category: "Production et diffusion", family: "media", color: "#d6409f", status: "bientot",
    tagline: "Le moteur de production : scènes, compositing et diffusion.",
    description: "Scènes, sources et mode studio aperçu / programme\nEnregistrement MP4 et diffusion RTMP / SRT\nEntièrement pilotable, Nino s'y branche\nApp desktop Windows et macOS",
  },
];

export const FAMILIES = ["equipe", "media"] as const;

const now = () => new Date().toISOString();
const newId = () => crypto.randomUUID();
export const today = () => new Date().toISOString().slice(0, 10);

// ---- Types

export type Product = { id: string; name: string; tagline: string; description: string; category: string; family: string; color: string; status: string; price_cents: number | null; url: string; sort: number };
export type Company = { id: string; name: string; kind: string; email: string; phone: string; website: string; city: string; country: string; notes: string; created_at: string; updated_at: string };
export type Contact = { id: string; company_id: string | null; name: string; email: string; phone: string; role: string; created_at: string };
export type License = { id: string; company_id: string; product_id: string; plan: string; seats: number; price_cents: number; status: string; start_date: string; renewal_date: string | null; notes: string; created_at: string };
export type Deal = { id: string; company_id: string; product_id: string | null; title: string; value_cents: number; stage: string; expected_close: string | null; created_at: string; updated_at: string };
export type Activity = { id: string; company_id: string; kind: string; body: string; author: string; at: string };

// ---- Validation: one description per kind of record, used for creating and for editing

type Spec =
  | { type: "text"; max: number; required?: boolean; email?: boolean }
  | { type: "int"; min: number; max: number; required?: boolean }
  | { type: "money"; nullable?: boolean }
  | { type: "date"; nullable?: boolean; required?: boolean }
  | { type: "enum"; values: readonly string[] }
  | { type: "ref"; table: string; nullable?: boolean; required?: boolean };

const SPECS = {
  product: {
    name: { type: "text", max: 60, required: true },
    tagline: { type: "text", max: 140 },
    description: { type: "text", max: 1200 },
    category: { type: "text", max: 40 },
    family: { type: "enum", values: FAMILIES },
    color: { type: "text", max: 7 },
    status: { type: "enum", values: PRODUCT_STATUSES },
    price_cents: { type: "money", nullable: true },
    url: { type: "text", max: 300 },
    sort: { type: "int", min: 0, max: 999 },
  },
  company: {
    name: { type: "text", max: 120, required: true },
    kind: { type: "enum", values: COMPANY_KINDS },
    email: { type: "text", max: 200, email: true },
    phone: { type: "text", max: 40 },
    website: { type: "text", max: 300 },
    city: { type: "text", max: 80 },
    country: { type: "text", max: 2 },
    notes: { type: "text", max: 4000 },
  },
  contact: {
    company_id: { type: "ref", table: "crm_company", required: true },
    name: { type: "text", max: 120, required: true },
    email: { type: "text", max: 200, email: true },
    phone: { type: "text", max: 40 },
    role: { type: "text", max: 80 },
  },
  license: {
    company_id: { type: "ref", table: "crm_company", required: true },
    product_id: { type: "ref", table: "crm_product", required: true },
    plan: { type: "enum", values: LICENSE_PLANS },
    seats: { type: "int", min: 1, max: 100000 },
    price_cents: { type: "money" },
    status: { type: "enum", values: LICENSE_STATUSES },
    start_date: { type: "date" },
    renewal_date: { type: "date", nullable: true },
    notes: { type: "text", max: 2000 },
  },
  deal: {
    company_id: { type: "ref", table: "crm_company", required: true },
    product_id: { type: "ref", table: "crm_product", nullable: true },
    title: { type: "text", max: 160, required: true },
    value_cents: { type: "money" },
    stage: { type: "enum", values: DEAL_STAGES },
    expected_close: { type: "date", nullable: true },
  },
  activity: {
    company_id: { type: "ref", table: "crm_company", required: true },
    kind: { type: "enum", values: ACTIVITY_KINDS.filter((k) => k !== "systeme") },
    body: { type: "text", max: 4000, required: true },
  },
} satisfies Record<string, Record<string, Spec>>;

export type Kind = keyof typeof SPECS;
export const KINDS = Object.keys(SPECS) as Kind[];
const TABLE: Record<Kind, string> = { product: "crm_product", company: "crm_company", contact: "crm_contact", license: "crm_license", deal: "crm_deal", activity: "crm_activity" };

const LABEL: Record<string, string> = {
  name: "Le nom", title: "Le titre", body: "Le texte", company_id: "Le client", product_id: "Le produit", email: "L'e-mail",
  seats: "Le nombre de places", sort: "L'ordre", start_date: "La date de début", renewal_date: "La date de renouvellement", expected_close: "La date prévue",
};
const label = (key: string) => LABEL[key] ?? `Le champ « ${key} »`;

/** Checks and normalises what a form sent. With partial, only the fields present are kept (editing). */
export function clean(kind: Kind, input: Record<string, unknown>, partial = false): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const [key, spec] of Object.entries(SPECS[kind]) as [string, Spec][]) {
    const present = key in input && input[key] !== undefined;
    if (!present) {
      if (!partial && "required" in spec && spec.required) throw new CrmError(`${label(key)} manque.`);
      continue;
    }
    const raw = input[key];
    switch (spec.type) {
      case "text": {
        const value = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();
        if (spec.required && !value) throw new CrmError(`${label(key)} manque.`);
        if (value.length > spec.max) throw new CrmError(`${label(key)} est trop long (${spec.max} caractères au plus).`);
        if (spec.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new CrmError("Cette adresse e-mail n'est pas valide.");
        if (key === "color" && value && !/^#[0-9a-f]{6}$/i.test(value)) throw new CrmError("La couleur doit s'écrire #RRGGBB.");
        out[key] = key === "country" ? value.toUpperCase() : spec.email ? value.toLowerCase() : value;
        break;
      }
      case "int": {
        const value = Number(raw);
        if (!Number.isInteger(value) || value < spec.min || value > spec.max) throw new CrmError(`${label(key)} doit être un nombre entier entre ${spec.min} et ${spec.max}.`);
        out[key] = value;
        break;
      }
      case "money": {
        if ((raw === null || raw === "") && spec.nullable) {
          out[key] = null;
          break;
        }
        const value = Number(raw);
        if (!Number.isInteger(value) || value < 0 || value > 1e11) throw new CrmError("Ce montant n'est pas valide.");
        out[key] = value;
        break;
      }
      case "date": {
        if (raw === null || raw === "") {
          // An empty date is "none" when allowed, otherwise the default of the table applies.
          if (spec.nullable) out[key] = null;
          else if (spec.required) throw new CrmError(`${label(key)} manque.`);
          break;
        }
        if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) throw new CrmError(`${label(key)} n'est pas une date valide.`);
        out[key] = raw;
        break;
      }
      case "enum": {
        if (typeof raw !== "string" || !spec.values.includes(raw)) throw new CrmError(`${label(key)} n'est pas une valeur connue.`);
        out[key] = raw;
        break;
      }
      case "ref": {
        if ((raw === null || raw === "") && "nullable" in spec && spec.nullable) {
          out[key] = null;
          break;
        }
        if (typeof raw !== "string" || !crm().prepare(`select 1 from ${spec.table} where id = ?`).get(raw)) throw new CrmError(`${label(key)} n'existe pas.`);
        out[key] = raw;
        break;
      }
    }
  }
  return out;
}

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

// ---- Writing

/** Creates a record. Returns its id. Side effects keep the CRM honest (history, client status). */
export function create(kind: Kind, input: Record<string, unknown>, author = ""): string {
  const conn = crm();
  const data = clean(kind, input);
  const stamp = now();
  let id: string = newId();
  if (kind === "product") {
    id = slug(String(data.name)) || id;
    if (conn.prepare("select 1 from crm_product where id = ?").get(id)) throw new CrmError("Un produit porte déjà ce nom.", 409);
  }
  const row: Record<string, unknown> = { ...data, id };
  if (kind === "company" || kind === "deal") Object.assign(row, { created_at: stamp, updated_at: stamp });
  else if (kind === "activity") Object.assign(row, { at: stamp, author });
  else row.created_at = stamp;
  if (kind === "license") row.start_date ??= today();

  const run = conn.transaction(() => {
    const cols = Object.keys(row);
    conn.prepare(`insert into ${TABLE[kind]} (${cols.join(", ")}) values (${cols.map((c) => "@" + c).join(", ")})`).run(row);
    if (kind === "license") {
      promote(String(data.company_id));
      log(String(data.company_id), `Licence ${productName(String(data.product_id))} ajoutée (${data.seats ?? 1} place(s)).`, author);
    }
    if (kind === "deal") {
      log(String(data.company_id), `Opportunité « ${data.title} » ouverte.`, author);
      if (data.stage === "gagne") promote(String(data.company_id));
    }
  });
  run();
  return id;
}

/** Changes some fields of a record. */
export function update(kind: Kind, id: string, input: Record<string, unknown>, author = "") {
  const conn = crm();
  const before = conn.prepare(`select * from ${TABLE[kind]} where id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!before) throw new CrmError("Cet élément n'existe plus.", 404);
  const data = clean(kind, input, true);
  if (kind === "activity") delete data.company_id;
  if (!Object.keys(data).length) return;
  if (kind === "company" || kind === "deal") data.updated_at = now();
  const run = conn.transaction(() => {
    conn.prepare(`update ${TABLE[kind]} set ${Object.keys(data).map((c) => `${c} = @${c}`).join(", ")} where id = @id`).run({ ...data, id });
    if (kind === "deal" && data.stage && data.stage !== before.stage) {
      const companyId = String(data.company_id ?? before.company_id);
      log(companyId, `Opportunité « ${data.title ?? before.title} » : ${STAGE_NAMES[String(before.stage)] ?? before.stage} → ${STAGE_NAMES[String(data.stage)]}.`, author);
      if (data.stage === "gagne") promote(companyId);
    }
    if (kind === "license" && data.status && data.status !== before.status) {
      log(String(before.company_id), `Licence ${productName(String(before.product_id))} : ${LICENSE_NAMES[String(data.status)]}.`, author);
      if (data.status === "actif") promote(String(before.company_id));
    }
  });
  run();
}

export function remove(kind: Kind, id: string) {
  const conn = crm();
  if (kind === "product") {
    const used = conn.prepare("select count(*) as n from crm_license where product_id = ?").get(id) as { n: number };
    if (used.n) throw new CrmError("Ce produit a encore des licences : masque-le plutôt que de le supprimer.", 409);
  }
  const res = conn.prepare(`delete from ${TABLE[kind]} where id = ?`).run(id);
  if (!res.changes) throw new CrmError("Cet élément n'existe plus.", 404);
}

const STAGE_NAMES: Record<string, string> = { nouveau: "Nouveau", qualifie: "Qualifié", proposition: "Proposition", negociation: "Négociation", gagne: "Gagné", perdu: "Perdu" };
const LICENSE_NAMES: Record<string, string> = { essai: "à l'essai", actif: "active", suspendu: "suspendue", resilie: "résiliée" };

const productName = (id: string) => (crm().prepare("select name from crm_product where id = ?").get(id) as { name: string } | undefined)?.name ?? id;

/** A prospect that buys becomes a client. */
function promote(companyId: string) {
  crm().prepare("update crm_company set kind = 'client', updated_at = ? where id = ? and kind in ('prospect', 'ancien')").run(now(), companyId);
}

function log(companyId: string, body: string, author = "") {
  crm().prepare("insert into crm_activity (id, company_id, kind, body, author, at) values (?, ?, 'systeme', ?, ?, ?)").run(newId(), companyId, body, author, now());
}

// ---- A request from the public site becomes a prospect, a contact, a deal and a note

export type Inquiry = { name: string; email: string; company: string; product: string; message: string };

export function recordInquiry(input: Record<string, unknown>): string {
  const text = (key: string, max: number) => (typeof input[key] === "string" ? (input[key] as string).trim().slice(0, max) : "");
  const name = text("name", 120);
  const email = text("email", 200).toLowerCase();
  const companyName = text("company", 120) || name;
  const productId = text("product", 40);
  const message = text("message", 4000);
  if (!name) throw new CrmError("Indique ton nom.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CrmError("Cette adresse e-mail n'est pas valide.");
  const conn = crm();
  const product = productId ? (conn.prepare("select id, name from crm_product where id = ? and status != 'masque'").get(productId) as { id: string; name: string } | undefined) : undefined;

  let companyId = "";
  conn.transaction(() => {
    const existing = conn.prepare("select id from crm_company where lower(name) = lower(?)").get(companyName) as { id: string } | undefined;
    companyId = existing?.id ?? create("company", { name: companyName, kind: "prospect", email });
    if (!conn.prepare("select 1 from crm_contact where company_id = ? and email = ?").get(companyId, email)) create("contact", { company_id: companyId, name, email });
    create("deal", { company_id: companyId, product_id: product?.id ?? null, title: product ? `Demande ${product.name}` : "Demande depuis le site", stage: "nouveau", value_cents: 0 }, "Site");
    conn.prepare("insert into crm_activity (id, company_id, kind, body, author, at) values (?, ?, 'email', ?, ?, ?)").run(newId(), companyId, message || "(sans message)", `${name} <${email}>`, now());
  })();
  return companyId;
}

// ---- Reading

export const listProducts = (publicOnly = false) =>
  crm()
    .prepare(`select * from crm_product ${publicOnly ? "where status != 'masque'" : ""} order by sort, name`)
    .all() as Product[];

export type CompanyRow = Company & { contacts: number; licenses: number; mrr_cents: number; open_deals: number; last_activity: string | null };

export function listCompanies(filter: { q?: string; kind?: string } = {}) {
  const where: string[] = [];
  const args: Record<string, string> = {};
  if (filter.q?.trim()) {
    where.push("(c.name like @q or c.email like @q or c.city like @q or exists (select 1 from crm_contact k where k.company_id = c.id and (k.name like @q or k.email like @q)))");
    args.q = `%${filter.q.trim()}%`;
  }
  if (filter.kind && (COMPANY_KINDS as readonly string[]).includes(filter.kind)) {
    where.push("c.kind = @kind");
    args.kind = filter.kind;
  }
  return crm()
    .prepare(
      `select c.*,
        (select count(*) from crm_contact k where k.company_id = c.id) as contacts,
        (select count(*) from crm_license l where l.company_id = c.id and l.status in ('actif', 'essai')) as licenses,
        (select coalesce(sum(price_cents), 0) from crm_license l where l.company_id = c.id and l.status = 'actif') as mrr_cents,
        (select count(*) from crm_deal d where d.company_id = c.id and d.stage not in ('gagne', 'perdu')) as open_deals,
        (select max(at) from crm_activity a where a.company_id = c.id) as last_activity
       from crm_company c ${where.length ? "where " + where.join(" and ") : ""}
       order by c.updated_at desc`,
    )
    .all(args) as CompanyRow[];
}

export function getCompany(id: string) {
  const conn = crm();
  const company = conn.prepare("select * from crm_company where id = ?").get(id) as Company | undefined;
  if (!company) return null;
  return {
    company,
    contacts: conn.prepare("select * from crm_contact where company_id = ? order by name").all(id) as Contact[],
    licenses: conn.prepare("select l.*, p.name as product_name from crm_license l join crm_product p on p.id = l.product_id where l.company_id = ? order by l.status = 'resilie', p.sort").all(id) as (License & { product_name: string })[],
    deals: conn.prepare("select d.*, p.name as product_name from crm_deal d left join crm_product p on p.id = d.product_id where d.company_id = ? order by d.updated_at desc").all(id) as (Deal & { product_name: string | null })[],
    activities: conn.prepare("select * from crm_activity where company_id = ? order by at desc limit 200").all(id) as Activity[],
  };
}

export type LicenseRow = License & { product_name: string; company_name: string };

export function listLicenses(filter: { product?: string; status?: string } = {}) {
  const where: string[] = [];
  const args: Record<string, string> = {};
  if (filter.product) {
    where.push("l.product_id = @product");
    args.product = filter.product;
  }
  if (filter.status && (LICENSE_STATUSES as readonly string[]).includes(filter.status)) {
    where.push("l.status = @status");
    args.status = filter.status;
  }
  return crm()
    .prepare(
      `select l.*, p.name as product_name, c.name as company_name from crm_license l
       join crm_product p on p.id = l.product_id join crm_company c on c.id = l.company_id
       ${where.length ? "where " + where.join(" and ") : ""}
       order by l.renewal_date is null, l.renewal_date, c.name`,
    )
    .all(args) as LicenseRow[];
}

export type DealRow = Deal & { company_name: string; product_name: string | null };

export const listDeals = () =>
  crm()
    .prepare("select d.*, c.name as company_name, p.name as product_name from crm_deal d join crm_company c on c.id = d.company_id left join crm_product p on p.id = d.product_id order by d.updated_at desc")
    .all() as DealRow[];

/** Every company, for the pickers of the forms. */
export const companyOptions = () => crm().prepare("select id, name from crm_company order by name").all() as { id: string; name: string }[];

export function dashboard() {
  const conn = crm();
  const one = <T>(sql: string, ...args: unknown[]) => conn.prepare(sql).get(...args) as T;
  const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const monthStart = today().slice(0, 8) + "01";

  const mrr = one<{ v: number }>("select coalesce(sum(price_cents), 0) as v from crm_license where status = 'actif'").v;
  const licenses = one<{ active: number; trial: number; seats: number }>(
    "select coalesce(sum(status = 'actif'), 0) as active, coalesce(sum(status = 'essai'), 0) as trial, coalesce(sum(case when status = 'actif' then seats end), 0) as seats from crm_license",
  );
  const companies = one<{ clients: number; prospects: number; fresh: number }>(
    "select coalesce(sum(kind = 'client'), 0) as clients, coalesce(sum(kind = 'prospect'), 0) as prospects, coalesce(sum(created_at >= ?), 0) as fresh from crm_company",
    monthStart,
  );
  const deals = conn.prepare("select stage, count(*) as count, coalesce(sum(value_cents), 0) as value from crm_deal group by stage").all() as { stage: (typeof DEAL_STAGES)[number]; count: number; value: number }[];
  const stages = DEAL_STAGES.map((stage) => deals.find((d) => d.stage === stage) ?? { stage, count: 0, value: 0 });
  const open = stages.filter((s) => s.stage !== "gagne" && s.stage !== "perdu");
  const wonThisMonth = one<{ v: number; n: number }>("select coalesce(sum(value_cents), 0) as v, count(*) as n from crm_deal where stage = 'gagne' and updated_at >= ?", monthStart);

  return {
    mrr,
    arr: mrr * 12,
    activeLicenses: licenses.active,
    trialLicenses: licenses.trial,
    seats: licenses.seats,
    clients: companies.clients,
    prospects: companies.prospects,
    newCompanies: companies.fresh,
    pipelineOpen: open.reduce((s, d) => s + d.value, 0),
    pipelineWeighted: Math.round(open.reduce((s, d) => s + d.value * STAGE_ODDS[d.stage], 0)),
    openDeals: open.reduce((s, d) => s + d.count, 0),
    wonThisMonth,
    stages,
    byProduct: conn
      .prepare(
        `select p.id, p.name, p.status, p.color,
          coalesce(sum(l.status = 'actif'), 0) as active, coalesce(sum(l.status = 'essai'), 0) as trial,
          coalesce(sum(case when l.status = 'actif' then l.price_cents end), 0) as mrr
         from crm_product p left join crm_license l on l.product_id = p.id group by p.id order by p.sort, p.name`,
      )
      .all() as { id: string; name: string; status: string; color: string; active: number; trial: number; mrr: number }[],
    renewals: conn
      .prepare(
        `select l.id, l.renewal_date, l.price_cents, l.status, p.name as product_name, c.id as company_id, c.name as company_name
         from crm_license l join crm_product p on p.id = l.product_id join crm_company c on c.id = l.company_id
         where l.status in ('actif', 'essai') and l.renewal_date is not null and l.renewal_date <= ? order by l.renewal_date limit 8`,
      )
      .all(inDays(45)) as { id: string; renewal_date: string; price_cents: number; status: string; product_name: string; company_id: string; company_name: string }[],
    recent: conn
      .prepare("select a.*, c.name as company_name from crm_activity a join crm_company c on c.id = a.company_id order by a.at desc limit 8")
      .all() as (Activity & { company_name: string })[],
  };
}

export type Dashboard = ReturnType<typeof dashboard>;

// ---- CSV export

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Cells starting like a formula are neutralised: the file is opened in spreadsheets.
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return /[",;\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function exportCsv(what: "clients" | "licences") {
  const rows: unknown[][] =
    what === "clients"
      ? [["Nom", "Statut", "E-mail", "Téléphone", "Ville", "Pays", "Contacts", "Licences", "Mensuel (CHF)", "Créé le"], ...listCompanies().map((c) => [c.name, c.kind, c.email, c.phone, c.city, c.country, c.contacts, c.licenses, (c.mrr_cents / 100).toFixed(2), c.created_at.slice(0, 10)])]
      : [["Client", "Produit", "Formule", "Places", "Mensuel (CHF)", "Statut", "Début", "Renouvellement"], ...listLicenses().map((l) => [l.company_name, l.product_name, l.plan, l.seats, (l.price_cents / 100).toFixed(2), l.status, l.start_date, l.renewal_date ?? ""])];
  return "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}
