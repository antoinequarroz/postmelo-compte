import "server-only";
import crypto from "node:crypto";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n";
import { CrmError, listProducts, type Product } from "./crm";
import { db } from "./db";

/**
 * What the public site publishes besides the catalogue: the blog, the changelog, and the texts of
 * the products in English and German. Everything is written in the admin, same SQLite file.
 */

export const POST_KINDS = ["blog", "changelog"] as const;
export const POST_STATUSES = ["brouillon", "publie"] as const;
/** What a changelog entry is: something new, something better, something fixed. */
export const CHANGE_TYPES = ["nouveau", "amelioration", "correction"] as const;

export type PostKind = (typeof POST_KINDS)[number];
export type Post = {
  id: string;
  kind: PostKind;
  locale: Locale;
  /** The same post in other languages shares its group. */
  group_id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  product_id: string | null;
  version: string;
  change: string;
  status: (typeof POST_STATUSES)[number];
  published_at: string | null;
  author: string;
  created_at: string;
  updated_at: string;
};
export type ProductText = { product_id: string; locale: Locale; category: string; tagline: string; description: string };

const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);

const ready = new WeakSet<object>();

function site() {
  const conn = db();
  if (ready.has(conn)) return conn;
  conn.exec(`
    create table if not exists site_post (
      id text primary key,
      kind text not null,
      locale text not null default 'fr',
      group_id text not null,
      slug text not null,
      title text not null,
      excerpt text not null default '',
      body text not null default '',
      product_id text,
      version text not null default '',
      change text not null default '',
      status text not null default 'brouillon',
      published_at text,
      author text not null default '',
      created_at text not null,
      updated_at text not null,
      unique (kind, locale, slug)
    );
    create index if not exists site_post_list on site_post(kind, locale, status, published_at);
    create index if not exists site_post_group on site_post(group_id);
    create table if not exists site_product_text (
      product_id text not null,
      locale text not null,
      category text not null default '',
      tagline text not null default '',
      description text not null default '',
      primary key (product_id, locale)
    );
    create table if not exists site_migration (id text primary key, at text not null);
  `);
  ready.add(conn);
  seed(conn);
  return conn;
}

/** Runs once per database, even if what it wrote is later deleted in the admin. */
function once(conn: ReturnType<typeof db>, id: string, run: () => void) {
  if (conn.prepare("select 1 from site_migration where id = ?").get(id)) return;
  conn.transaction(() => {
    run();
    conn.prepare("insert into site_migration (id, at) values (?, ?)").run(id, now());
  })();
}

// ---- Validation

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");

const text = (input: Record<string, unknown>, key: string, max: number, name: string) => {
  const raw = input[key];
  const value = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();
  if (value.length > max) throw new CrmError(`${name} est trop long (${max} caractères au plus).`);
  return value;
};

/** Checks what the editor sent. With partial, only the fields present are kept. */
function cleanPost(input: Record<string, unknown>, partial: boolean) {
  const out: Partial<Post> = {};
  const has = (k: string) => k in input && input[k] !== undefined;

  if (!partial || has("kind")) {
    if (!(POST_KINDS as readonly unknown[]).includes(input.kind)) throw new CrmError("Le type de publication n'est pas connu.");
    out.kind = input.kind as PostKind;
  }
  if (!partial || has("locale")) {
    const locale = input.locale ?? "fr";
    if (!isLocale(locale)) throw new CrmError("Cette langue n'est pas proposée.");
    out.locale = locale;
  }
  if (!partial || has("title")) {
    out.title = text(input, "title", 160, "Le titre");
    if (!out.title) throw new CrmError("Le titre manque.");
  }
  if (!partial || has("slug")) {
    // Written by hand or taken from the title, the address is always cleaned into lowercase-with-dashes.
    const slug = slugify(text(input, "slug", 120, "L'adresse")) || (partial ? "" : slugify(out.title ?? ""));
    if (!slug || !SLUG.test(slug)) throw new CrmError("L'adresse de la page manque.");
    out.slug = slug;
  }
  if (has("excerpt")) out.excerpt = text(input, "excerpt", 400, "Le résumé");
  if (has("body")) out.body = text(input, "body", 60000, "Le texte");
  if (has("version")) out.version = text(input, "version", 30, "La version");
  if (has("author")) out.author = text(input, "author", 80, "L'auteur");
  if (has("change")) {
    const change = text(input, "change", 20, "Le type de changement");
    if (change && !(CHANGE_TYPES as readonly string[]).includes(change)) throw new CrmError("Ce type de changement n'est pas connu.");
    out.change = change;
  }
  if (has("product_id")) {
    const id = text(input, "product_id", 60, "Le produit");
    if (id && !listProducts().some((p) => p.id === id)) throw new CrmError("Le produit n'existe pas.");
    out.product_id = id || null;
  }
  if (has("status")) {
    if (!(POST_STATUSES as readonly unknown[]).includes(input.status)) throw new CrmError("Le statut n'est pas connu.");
    out.status = input.status as Post["status"];
  }
  if (has("published_at")) {
    const raw = input.published_at;
    if (raw === null || raw === "") out.published_at = null;
    else if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) throw new CrmError("La date de publication n'est pas valide.");
    else out.published_at = raw;
  }
  return out;
}

const taken = (conn: ReturnType<typeof db>, kind: string, locale: string, slug: string, except = "") =>
  !!conn.prepare("select 1 from site_post where kind = ? and locale = ? and slug = ? and id != ?").get(kind, locale, slug, except);

// ---- Writing

export function createPost(input: Record<string, unknown>, author = ""): string {
  const conn = site();
  const data = cleanPost(input, false);
  if (taken(conn, data.kind!, data.locale!, data.slug!)) throw new CrmError("Une autre publication utilise déjà cette adresse.", 409);
  const id = crypto.randomUUID();
  let group = typeof input.group_id === "string" && input.group_id ? input.group_id : id;
  if (group !== id) {
    const other = conn.prepare("select kind from site_post where group_id = ? limit 1").get(group) as { kind: string } | undefined;
    if (!other || other.kind !== data.kind) group = id;
    else if (conn.prepare("select 1 from site_post where group_id = ? and locale = ?").get(group, data.locale)) throw new CrmError("Cette publication existe déjà dans cette langue.", 409);
  }
  const status = data.status ?? "brouillon";
  const row: Post = {
    id,
    group_id: group,
    kind: data.kind!,
    locale: data.locale!,
    slug: data.slug!,
    title: data.title!,
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    product_id: data.product_id ?? null,
    version: data.version ?? "",
    change: data.change ?? "",
    status,
    // A post published without a date is published today.
    published_at: data.published_at ?? (status === "publie" ? today() : null),
    author: data.author || author,
    created_at: now(),
    updated_at: now(),
  };
  const cols = Object.keys(row);
  conn.prepare(`insert into site_post (${cols.join(", ")}) values (${cols.map((c) => "@" + c).join(", ")})`).run(row);
  return id;
}

export function updatePost(id: string, input: Record<string, unknown>) {
  const conn = site();
  const before = conn.prepare("select * from site_post where id = ?").get(id) as Post | undefined;
  if (!before) throw new CrmError("Cette publication n'existe plus.", 404);
  const { kind: _kind, ...data } = cleanPost(input, true);
  void _kind;
  if (data.locale && data.locale !== before.locale && conn.prepare("select 1 from site_post where group_id = ? and locale = ? and id != ?").get(before.group_id, data.locale, id))
    throw new CrmError("Cette publication existe déjà dans cette langue.", 409);
  if ((data.slug || data.locale) && taken(conn, before.kind, data.locale ?? before.locale, data.slug ?? before.slug, id)) throw new CrmError("Une autre publication utilise déjà cette adresse.", 409);
  if (data.status === "publie" && !before.published_at && !("published_at" in data)) data.published_at = today();
  if (!Object.keys(data).length) return;
  const row = { ...data, updated_at: now() };
  conn.prepare(`update site_post set ${Object.keys(row).map((c) => `${c} = @${c}`).join(", ")} where id = @id`).run({ ...row, id });
}

export function removePost(id: string) {
  const res = site().prepare("delete from site_post where id = ?").run(id);
  if (!res.changes) throw new CrmError("Cette publication n'existe plus.", 404);
}

/** Starts the translation of a post: a draft copy in the other language, to rewrite before publishing. */
export function translatePost(id: string, locale: unknown, author = ""): string {
  const conn = site();
  const from = conn.prepare("select * from site_post where id = ?").get(id) as Post | undefined;
  if (!from) throw new CrmError("Cette publication n'existe plus.", 404);
  if (!isLocale(locale)) throw new CrmError("Cette langue n'est pas proposée.");
  const existing = conn.prepare("select id from site_post where group_id = ? and locale = ?").get(from.group_id, locale) as { id: string } | undefined;
  if (existing) return existing.id;
  let slug = from.slug;
  for (let n = 2; taken(conn, from.kind, locale, slug); n++) slug = `${from.slug}-${n}`;
  return createPost(
    { kind: from.kind, locale, group_id: from.group_id, slug, title: from.title, excerpt: from.excerpt, body: from.body, product_id: from.product_id, version: from.version, change: from.change, status: "brouillon", published_at: from.published_at },
    author,
  );
}

// ---- Reading

export function listPosts(filter: { kind?: PostKind; locale?: Locale; published?: boolean } = {}) {
  const where: string[] = [];
  const args: Record<string, string> = { today: today() };
  if (filter.kind) {
    where.push("kind = @kind");
    args.kind = filter.kind;
  }
  if (filter.locale) {
    where.push("locale = @locale");
    args.locale = filter.locale;
  }
  // A post dated in the future waits for its day.
  if (filter.published) where.push("status = 'publie' and published_at <= @today");
  return site()
    .prepare(`select * from site_post ${where.length ? "where " + where.join(" and ") : ""} order by coalesce(published_at, '9999') desc, created_at desc`)
    .all(args) as Post[];
}

export function getPublishedPost(kind: PostKind, locale: Locale, slug: string) {
  return (site().prepare("select * from site_post where kind = ? and locale = ? and slug = ? and status = 'publie' and published_at <= ?").get(kind, locale, slug, today()) as Post | undefined) ?? null;
}

/** locale → slug of the published versions of a post (for the language switcher and hreflang). */
export function publishedTranslations(groupId: string) {
  const rows = site().prepare("select locale, slug from site_post where group_id = ? and status = 'publie' and published_at <= ?").all(groupId, today()) as { locale: Locale; slug: string }[];
  return Object.fromEntries(rows.map((r) => [r.locale, r.slug])) as Partial<Record<Locale, string>>;
}

// ---- The products in other languages

export const listProductTexts = () => site().prepare("select * from site_product_text").all() as ProductText[];

export function setProductText(productId: string, locale: unknown, input: Record<string, unknown>) {
  const conn = site();
  if (!isLocale(locale) || locale === "fr") throw new CrmError("Les textes en français se modifient dans la fiche du produit.");
  if (!listProducts().some((p) => p.id === productId)) throw new CrmError("Le produit n'existe pas.", 404);
  const row = {
    product_id: productId,
    locale,
    category: text(input, "category", 40, "La catégorie"),
    tagline: text(input, "tagline", 140, "L'accroche"),
    description: text(input, "description", 1200, "La description"),
  };
  conn
    .prepare(
      "insert into site_product_text (product_id, locale, category, tagline, description) values (@product_id, @locale, @category, @tagline, @description) on conflict (product_id, locale) do update set category = excluded.category, tagline = excluded.tagline, description = excluded.description",
    )
    .run(row);
}

/** The catalogue in a language: each text falls back to French when it is not translated. */
export function localizedProducts(locale: Locale, publicOnly = true): Product[] {
  const products = listProducts(publicOnly);
  if (locale === "fr") return products;
  const texts = new Map(listProductTexts().filter((t) => t.locale === locale).map((t) => [t.product_id, t]));
  return products.map((p) => {
    const t = texts.get(p.id);
    return t ? { ...p, category: t.category || p.category, tagline: t.tagline || p.tagline, description: t.description || p.description } : p;
  });
}

// ---- What the site starts with

function seed(conn: ReturnType<typeof db>) {
  once(conn, "2026-11-textes-produits-en-de", () => {
    const known = new Set(listProducts().map((p) => p.id));
    const insert = conn.prepare("insert or ignore into site_product_text (product_id, locale, category, tagline, description) values (?, ?, ?, ?, ?)");
    for (const [id, byLocale] of Object.entries(PRODUCT_TEXTS)) {
      if (!known.has(id)) continue;
      for (const [locale, t] of Object.entries(byLocale)) insert.run(id, locale, t.category, t.tagline, t.description);
    }
  });
  once(conn, "2026-11-premiers-articles", () => {
    if ((conn.prepare("select count(*) as n from site_post").get() as { n: number }).n) return;
    const insert = conn.prepare(
      "insert into site_post (id, kind, locale, group_id, slug, title, excerpt, body, product_id, version, change, status, published_at, author, created_at, updated_at) values (@id, @kind, @locale, @group_id, @slug, @title, @excerpt, @body, @product_id, @version, @change, 'publie', @published_at, @author, @at, @at)",
    );
    for (const post of FIRST_POSTS) {
      const group = crypto.randomUUID();
      for (const locale of LOCALES) {
        const t = post[locale];
        insert.run({ id: crypto.randomUUID(), kind: post.kind, locale, group_id: group, slug: t.slug, title: t.title, excerpt: t.excerpt, body: t.body, product_id: post.product_id ?? null, version: post.version ?? "", change: post.change ?? "", published_at: post.date, author: TEAM[locale], at: now() });
      }
    }
  });
}

const TEAM: Record<Locale, string> = { fr: "L'équipe Postmelo", en: "The Postmelo team", de: "Das Postmelo-Team" };

type Text3 = Record<"en" | "de", { category: string; tagline: string; description: string }>;

/** The catalogue of day one in English and Swiss German (ss, never ß). */
const PRODUCT_TEXTS: Record<string, Text3> = {
  lamio: {
    en: { category: "Team messaging", tagline: "Your team's messaging, and the base of the suite.", description: "Public and private channels, direct messages and threads\nFiles, images, reactions and mentions\nEverything arrives live, with unread counts and notifications\n⌘K search, Mac and iPhone apps" },
    de: { category: "Team-Chat", tagline: "Der Chat deines Teams und die Basis der Suite.", description: "Öffentliche und private Kanäle, Direktnachrichten und Threads\nDateien, Bilder, Reaktionen und Erwähnungen\nAlles kommt live an, mit Ungelesenen und Benachrichtigungen\nSuche mit ⌘K, App für Mac und iPhone" },
  },
  cairn: {
    en: { category: "Notes and vault", tagline: "Your notes and your secrets, at home. A Notion made to measure.", description: "Markdown notes, import from Notion\nEncrypted vault for passwords and SSH keys\nAI that answers from all your notes\nMac and iPhone apps with Face ID" },
    de: { category: "Notizen und Tresor", tagline: "Deine Notizen und Geheimnisse, bei dir. Ein Notion nach Mass.", description: "Notizen in Markdown, Import aus Notion\nVerschlüsselter Tresor für Passwörter und SSH-Schlüssel\nKI, die aus all deinen Notizen antwortet\nApps für Mac und iPhone mit Face ID" },
  },
  tickup: {
    en: { category: "Project management", tagline: "Projects, epics and tickets, as a board or a list.", description: "Kanban, list, sprints and Gantt planning\nRoadmap of every project\nGitHub linked to tickets\nImport from Linear" },
    de: { category: "Projektmanagement", tagline: "Projekte, Epics und Tickets, als Kanban oder Liste.", description: "Kanban, Liste, Sprints und Gantt-Planung\nRoadmap aller Projekte\nGitHub mit den Tickets verknüpft\nImport aus Linear" },
  },
  alfred: {
    en: { category: "Calendar and bookings", tagline: "The assistant of your time: calendar and appointment booking.", description: "Day, week and month views, recurring events\nTwo-way iCloud sync\nPublic booking page\nConfirmation and cancellation emails" },
    de: { category: "Kalender und Termine", tagline: "Der Assistent deiner Zeit: Kalender und Terminbuchung.", description: "Tages-, Wochen- und Monatsansicht, wiederkehrende Termine\niCloud-Synchronisation in beide Richtungen\nÖffentliche Seite zur Terminbuchung\nBestätigungs- und Absage-E-Mails" },
  },
  metricove: {
    en: { category: "Content and social media", tagline: "Create, schedule and publish on all your accounts.", description: "Posts and carousels made with your brand sheet and AI\nInstagram, Facebook, X, LinkedIn and YouTube\nPosts scheduled and published automatically, videos and Shorts\nOne editorial calendar for every account" },
    de: { category: "Inhalte und Social Media", tagline: "Erstellen, planen und auf all deinen Konten veröffentlichen.", description: "Posts und Karussells mit deinem Markenprofil und KI erstellt\nInstagram, Facebook, X, LinkedIn und YouTube\nPosts automatisch geplant und veröffentlicht, Videos und Shorts\nEin Redaktionskalender für alle Konten" },
  },
  nino: {
    en: { category: "Video studio", tagline: "The control room of your studio: podcast, round table, live.", description: "Control OBS from your PC, iPad or Stream Deck\nAutomatic directing based on who is speaking\nRemote guests and live streaming\nTakes ready for DaVinci Resolve" },
    de: { category: "Videostudio", tagline: "Die Regie deines Studios: Podcast, Gesprächsrunde, Livestream.", description: "Steuert OBS vom PC, iPad oder Stream Deck aus\nAutomatische Regie je nachdem, wer spricht\nGäste aus der Ferne und Livestream\nAufnahmen bereit für DaVinci Resolve" },
  },
  maya: {
    en: { category: "Production and broadcast", tagline: "The production engine: scenes, compositing and broadcast.", description: "Scenes, sources and studio mode preview / program\nMP4 recording and RTMP / SRT streaming\nFully remote-controllable, Nino plugs into it\nDesktop app for Windows and macOS" },
    de: { category: "Produktion und Ausstrahlung", tagline: "Die Produktionsmaschine: Szenen, Compositing und Ausstrahlung.", description: "Szenen, Quellen und Studiomodus Vorschau / Programm\nMP4-Aufnahme und Streaming über RTMP / SRT\nVollständig fernsteuerbar, Nino dockt an\nDesktop-App für Windows und macOS" },
  },
};

type Seed = { kind: PostKind; date: string; product_id?: string; version?: string; change?: string } & Record<Locale, { slug: string; title: string; excerpt: string; body: string }>;

/** A first article and the first entries of the changelog, so the pages are not empty on day one. */
const FIRST_POSTS: Seed[] = [
  {
    kind: "blog",
    date: "2026-11-17",
    fr: {
      slug: "bienvenue-sur-postmelo",
      title: "Bienvenue sur Postmelo",
      excerpt: "Pourquoi on réunit nos applications sous un seul compte, et ce qui arrive dans les prochaines semaines.",
      body: "Postmelo, c'est une suite d'applications pour les petites équipes qui font tout elles-mêmes : parler, noter, organiser, recevoir, tourner et publier.\n\n## Un seul compte\n\nToutes les applications partagent le même compte. Tu te connectes une fois, avec ton mot de passe, Face ID ou une clé d'accès, et tu passes de l'une à l'autre sans te reconnecter.\n\n## Un seul design\n\nLamio, Cairn, TickUp, Alfred, Metricove, Nino Studio et Maya Studio parlent la même langue visuelle. Seule la couleur change.\n\n## La suite\n\nOn publiera ici les nouveautés, nos choix techniques et des exemples d'équipes qui utilisent la suite. Le [journal des versions](/changelog) suit chaque mise à jour.",
    },
    en: {
      slug: "welcome-to-postmelo",
      title: "Welcome to Postmelo",
      excerpt: "Why we are bringing our apps together under a single account, and what is coming in the next few weeks.",
      body: "Postmelo is a suite of apps for small teams who do everything themselves: talk, take notes, organise, host, film and publish.\n\n## One account\n\nEvery app shares the same account. You sign in once, with your password, Face ID or a passkey, and move from one app to the next without signing in again.\n\n## One design\n\nLamio, Cairn, TickUp, Alfred, Metricove, Nino Studio and Maya Studio speak the same visual language. Only the colour changes.\n\n## What's next\n\nThis is where we will share what is new, the technical choices we make and stories from teams using the suite. The [changelog](/en/changelog) follows every update.",
    },
    de: {
      slug: "willkommen-bei-postmelo",
      title: "Willkommen bei Postmelo",
      excerpt: "Warum wir unsere Apps unter einem einzigen Konto vereinen und was in den nächsten Wochen kommt.",
      body: "Postmelo ist eine Suite von Apps für kleine Teams, die alles selbst machen: reden, notieren, organisieren, empfangen, drehen und veröffentlichen.\n\n## Ein Konto\n\nAlle Apps teilen dasselbe Konto. Du meldest dich einmal an, mit Passwort, Face ID oder Passkey, und wechselst von einer App zur nächsten, ohne dich erneut anzumelden.\n\n## Ein Design\n\nLamio, Cairn, TickUp, Alfred, Metricove, Nino Studio und Maya Studio sprechen dieselbe visuelle Sprache. Nur die Farbe ändert sich.\n\n## Wie es weitergeht\n\nHier zeigen wir Neuigkeiten, unsere technischen Entscheidungen und Beispiele von Teams, die die Suite nutzen. Das [Änderungsprotokoll](/de/changelog) begleitet jedes Update.",
    },
  },
  {
    kind: "changelog",
    date: "2026-11-17",
    product_id: "metricove",
    change: "nouveau",
    fr: { slug: "metricove-reprend-postmelo-studio", title: "Postmelo Studio rejoint Metricove", excerpt: "", body: "- La création de posts et de carrousels avec ta fiche de marque et l'IA passe dans Metricove\n- Un seul calendrier éditorial pour créer, programmer et publier" },
    en: { slug: "metricove-takes-over-postmelo-studio", title: "Postmelo Studio joins Metricove", excerpt: "", body: "- Creating posts and carousels with your brand sheet and AI moves into Metricove\n- One editorial calendar to create, schedule and publish" },
    de: { slug: "metricove-uebernimmt-postmelo-studio", title: "Postmelo Studio wird Teil von Metricove", excerpt: "", body: "- Posts und Karussells mit Markenprofil und KI erstellst du jetzt in Metricove\n- Ein Redaktionskalender zum Erstellen, Planen und Veröffentlichen" },
  },
  {
    kind: "changelog",
    date: "2026-11-17",
    version: "1.0",
    change: "nouveau",
    fr: { slug: "un-seul-compte-pour-la-suite", title: "Un seul compte pour toute la suite", excerpt: "", body: "- Connexion unique (OpenID Connect) pour toutes les applications\n- Face ID, clés d'accès et double authentification\n- Tu choisis qui peut ouvrir quelle application" },
    en: { slug: "one-account-for-the-whole-suite", title: "One account for the whole suite", excerpt: "", body: "- Single sign-on (OpenID Connect) for every app\n- Face ID, passkeys and two-factor authentication\n- You choose who can open which app" },
    de: { slug: "ein-konto-fuer-die-ganze-suite", title: "Ein Konto für die ganze Suite", excerpt: "", body: "- Single Sign-on (OpenID Connect) für alle Apps\n- Face ID, Passkeys und Zwei-Faktor-Authentifizierung\n- Du bestimmst, wer welche App öffnen darf" },
  },
];
