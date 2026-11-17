"use client";

import { ArrowRight, Bell, Check, ChevronDown, Command, Fingerprint, Home, LayoutGrid, Lock, Plus, Search, Settings, Share2, Users } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SuiteLogo } from "@/components/logo";
import { ProductGlyph, ProductIcon } from "@/components/product-icon";
import { primaryClass } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { countWordIn } from "@/lib/site-text";
import { AppMock } from "./mocks";
import { prefersReduced } from "./use-scroll";
import "./hero.css";

export type App = {
  id: string;
  name: string;
  color: string;
  category: string;
  family: string;
  status?: string;
};

/** How far the window lies back at rest, and how small it starts. */
const TILT = 16;
const REST = 0.94;
/** Time spent on each screen of the tour, in milliseconds. */
const DUR = 4500;
const MINT = "#5fd3a8";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
/** An app without a colour (TickUp) takes the ink of the theme. */
const ink = (c: string) => c || "var(--ink)";
const neutral = (c: string) => !c || c === "var(--ink)" || /^#f[0-9a-f]f[0-9a-f]e[0-9a-f]$/i.test(c);
const tint = (c: string, pct = 16) => `color-mix(in oklab, ${ink(c)} ${pct}%, transparent)`;

/** Where each app opens in the hub, and its badge in the sidebar. */
const LIVE: Record<string, { badge?: string; slug: string }> = {
  lamio: { badge: "3", slug: "lamio/studio" },
  cairn: { slug: "cairn/notes" },
  tickup: { slug: "tickup/sprint-4" },
  alfred: { slug: "alfred/semaine-47" },
  metricove: { slug: "metricove/calendrier" },
  nino: { slug: "nino/regie" },
  maya: { badge: "Live", slug: "maya/plateau" },
};

type Live = Record<string, { line: string; crumb: string; note: string }>;

/** Every word of the hero and of the hub it shows, in each language. */
const T = {
  fr: {
    live: {
      lamio: { line: "3 messages · #studio", crumb: "#studio", note: "4 en ligne" },
      cairn: { line: "Brief client à jour", crumb: "Charte Postmelo", note: "Chiffré" },
      tickup: { line: "12 tâches cette semaine", crumb: "Sprint 4", note: "68 % fait" },
      alfred: { line: "Point d'équipe à 14 h", crumb: "Semaine 47", note: "Point à 14 h" },
      metricove: { line: "Post jeudi 9 h", crumb: "Calendrier", note: "5 posts prévus" },
      nino: { line: "Épisode 14 · 62 %", crumb: "Régie", note: "Enregistrement" },
      maya: { line: "Direct ce soir à 20 h", crumb: "Plateau", note: "Direct à 20 h" },
    } as Live,
    feed: ["a partagé le montage du podcast", "a terminé « Habillage générique »", "a programmé 4 publications", "a ajouté « Contrat Atelier Nord »", "a lancé l'export 4K"],
    ago: ["il y a 2 min", "il y a 8 min", "il y a 21 min", "il y a 1 h", "il y a 2 h"],
    date: "Mardi 17 novembre",
    hello: ["Bonjour Camille,", "tout est prêt."],
    new: "Nouveau",
    reach: "Portée des réseaux · 30 jours",
    views: "vues",
    control: "Régie · Plateau A",
    members: "14 membres",
    search: "Rechercher",
    nav: ["Accueil", "Activité", "Équipe", "Toutes les apps"],
    yourApps: "Tes applications",
    role: "Admin",
    today: "Aujourd'hui",
    agenda: ["Point d'équipe", "Validation client · Atelier Nord", "Direct « Les Coulisses »"],
    activity: "Activité de l'équipe",
    seeAll: "Tout voir",
    storage: "Stockage de l'équipe",
    storageOf: "64 / 200 Go",
    home: "Accueil",
    soon: "Bientôt",
    suiteBadge: "La suite",
    soonLine: (name: string, suite: string) => `${name} arrive dans la suite ${suite}`,
    countLine: (suite: string, n: number) => `${suite} · ${n} applications`,
    title: ["Un seul compte.", "Un seul design.", "Toutes tes applications."],
    sub: "Messagerie, notes, projets, agenda, réseaux sociaux, contenu, vidéo et direct.",
    subMore: (n: string) => ` ${n} applications qui se parlent, ouvertes avec une seule connexion.`,
    cta: "Demander un accès",
    open: "Ouvrir mon compte",
    discover: "Découvrir la suite",
    tablist: "Parcourir la suite",
    preview: (name: string) => `Aperçu de ${name}`,
    faceId: "Connectée avec Face ID",
    appsOpen: (n: number) => `${n} apps ouvertes, sans mot de passe`,
  },
  en: {
    live: {
      lamio: { line: "3 messages · #studio", crumb: "#studio", note: "4 online" },
      cairn: { line: "Client brief up to date", crumb: "Postmelo guidelines", note: "Encrypted" },
      tickup: { line: "12 tasks this week", crumb: "Sprint 4", note: "68% done" },
      alfred: { line: "Team meeting at 2 pm", crumb: "Week 47", note: "Meeting at 2 pm" },
      metricove: { line: "Post Thursday 9 am", crumb: "Calendar", note: "5 posts scheduled" },
      nino: { line: "Episode 14 · 62%", crumb: "Control room", note: "Recording" },
      maya: { line: "Live tonight at 8 pm", crumb: "Stage", note: "Live at 8 pm" },
    } as Live,
    feed: ["shared the podcast edit", "finished “Opening titles”", "scheduled 4 posts", "added “Atelier Nord contract”", "started the 4K export"],
    ago: ["2 min ago", "8 min ago", "21 min ago", "1 h ago", "2 h ago"],
    date: "Tuesday 17 November",
    hello: ["Hello Camille,", "everything is ready."],
    new: "New",
    reach: "Social reach · 30 days",
    views: "views",
    control: "Control room · Stage A",
    members: "14 members",
    search: "Search",
    nav: ["Home", "Activity", "Team", "All apps"],
    yourApps: "Your apps",
    role: "Admin",
    today: "Today",
    agenda: ["Team meeting", "Client sign-off · Atelier Nord", "Live “Behind the Scenes”"],
    activity: "Team activity",
    seeAll: "See all",
    storage: "Team storage",
    storageOf: "64 / 200 GB",
    home: "Home",
    soon: "Soon",
    suiteBadge: "The suite",
    soonLine: (name: string, suite: string) => `${name} is coming to the ${suite} suite`,
    countLine: (suite: string, n: number) => `${suite} · ${n} apps`,
    title: ["One account.", "One design.", "All your apps."],
    sub: "Messaging, notes, projects, calendar, social media, content, video and live.",
    subMore: (n: string) => ` ${n} apps that talk to each other, opened with a single sign-in.`,
    cta: "Request access",
    open: "Open my account",
    discover: "Discover the suite",
    tablist: "Browse the suite",
    preview: (name: string) => `Preview of ${name}`,
    faceId: "Signed in with Face ID",
    appsOpen: (n: number) => `${n} apps open, no password`,
  },
  de: {
    live: {
      lamio: { line: "3 Nachrichten · #studio", crumb: "#studio", note: "4 online" },
      cairn: { line: "Kundenbriefing aktuell", crumb: "Postmelo-Leitfaden", note: "Verschlüsselt" },
      tickup: { line: "12 Aufgaben diese Woche", crumb: "Sprint 4", note: "68 % erledigt" },
      alfred: { line: "Teammeeting um 14 Uhr", crumb: "Woche 47", note: "Meeting um 14 Uhr" },
      metricove: { line: "Post Donnerstag 9 Uhr", crumb: "Kalender", note: "5 Posts geplant" },
      nino: { line: "Folge 14 · 62 %", crumb: "Regie", note: "Aufnahme" },
      maya: { line: "Live heute um 20 Uhr", crumb: "Set", note: "Live um 20 Uhr" },
    } as Live,
    feed: ["hat den Podcast-Schnitt geteilt", "hat «Vorspann» abgeschlossen", "hat 4 Beiträge geplant", "hat «Vertrag Atelier Nord» hinzugefügt", "hat den 4K-Export gestartet"],
    ago: ["vor 2 Min.", "vor 8 Min.", "vor 21 Min.", "vor 1 Std.", "vor 2 Std."],
    date: "Dienstag, 17. November",
    hello: ["Hallo Camille,", "alles ist bereit."],
    new: "Neu",
    reach: "Reichweite · 30 Tage",
    views: "Aufrufe",
    control: "Regie · Set A",
    members: "14 Mitglieder",
    search: "Suchen",
    nav: ["Start", "Aktivität", "Team", "Alle Apps"],
    yourApps: "Deine Apps",
    role: "Admin",
    today: "Heute",
    agenda: ["Teammeeting", "Kundenabnahme · Atelier Nord", "Live «Hinter den Kulissen»"],
    activity: "Aktivität im Team",
    seeAll: "Alle ansehen",
    storage: "Speicher des Teams",
    storageOf: "64 / 200 GB",
    home: "Start",
    soon: "Demnächst",
    suiteBadge: "Die Suite",
    soonLine: (name: string, suite: string) => `${name} kommt in die ${suite}-Suite`,
    countLine: (suite: string, n: number) => `${suite} · ${n} Apps`,
    title: ["Ein Konto.", "Ein Design.", "Alle deine Apps."],
    sub: "Chat, Notizen, Projekte, Kalender, Social Media, Inhalte, Video und Livestream.",
    subMore: (n: string) => ` ${n} Apps, die miteinander reden, geöffnet mit einer einzigen Anmeldung.`,
    cta: "Zugang anfragen",
    open: "Mein Konto öffnen",
    discover: "Die Suite entdecken",
    tablist: "Die Suite durchblättern",
    preview: (name: string) => `Vorschau von ${name}`,
    faceId: "Mit Face ID angemeldet",
    appsOpen: (n: number) => `${n} Apps offen, ohne Passwort`,
  },
};
type Text = (typeof T)["fr"];

const PEOPLE = [
  { n: "L", hue: 200 },
  { n: "M", hue: 30 },
  { n: "J", hue: 300 },
  { n: "S", hue: 150 },
];

/** Who did what lately; the words come from T (same order). */
const FEED = [
  { app: "lamio", who: "Léa", hue: 200 },
  { app: "tickup", who: "Marc", hue: 30 },
  { app: "metricove", who: "Julie", hue: 300 },
  { app: "cairn", who: "Sam", hue: 150 },
  { app: "nino", who: "Léa", hue: 200 },
];

function Avatar({ n, hue, size = 22 }: { n: string; hue: number; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-[var(--win-side)]"
      style={{
        width: size,
        height: size,
        background: `light-dark(oklch(0.9 0.06 ${hue}), oklch(0.42 0.11 ${hue}))`,
        color: `light-dark(oklch(0.42 0.11 ${hue}), oklch(0.92 0.06 ${hue}))`,
      }}
    >
      {n}
    </span>
  );
}

/** The home screen of the hub: every app with its latest news, and two live cards. */
function HomePane({ apps, onPick, t }: { apps: App[]; onPick: (n: number) => void; t: Text }) {
  const color = (id: string) => ink(apps.find((a) => a.id === id)?.color ?? "");
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">{t.date}</p>
          <p className="mt-1 font-display text-[34px] leading-none">
            {t.hello[0]} <span className="italic text-ink-2">{t.hello[1]}</span>
          </p>
        </div>
        <span className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-medium text-accent-ink max-sm:hidden">
          <Plus className="size-3.5" /> {t.new}
        </span>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5">
        {/* Launcher */}
        <div className="grid grid-cols-4 gap-3">
          {apps.slice(0, 8).map((a, n) => {
            const c = ink(a.color);
            const flat = neutral(a.color);
            return (
              <button
                key={a.id}
                type="button"
                tabIndex={-1}
                onClick={() => onPick(n + 1)}
                className="relative overflow-hidden rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-3 text-left transition-colors hover:border-wash/[0.14]"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px -28px ${flat ? "light-dark(rgba(20,18,14,0.16), rgba(255,255,255,0.12))" : c}`,
                }}
              >
                <span aria-hidden className="absolute -right-6 -top-6 size-20 rounded-full blur-2xl" style={{ background: tint(c, flat ? 6 : 30) }} />
                <ProductIcon id={a.id} color={a.color} size="md" className="size-9! rounded-[10px]!" />
                <span className="mt-2.5 block truncate text-[12.5px] font-medium">{a.name}</span>
                <span className="mt-0.5 block truncate text-[10.5px] text-ink-3">{t.live[a.id]?.line ?? a.category}</span>
              </button>
            );
          })}
        </div>

        {/* Two live cards */}
        <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-3">
          <div className="flex flex-col rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-4">
            <div className="flex items-center gap-2">
              <ProductIcon id="metricove" color={color("metricove")} size="sm" className="size-5! rounded-md [&_svg]:size-3" />
              <span className="truncate text-[11.5px] text-ink-2">{t.reach}</span>
              <span className="ml-auto shrink-0 rounded-full bg-[#28c840]/15 px-1.5 text-[10px] font-medium text-[var(--ok-text)]">+38 %</span>
            </div>
            <p className="mt-2 font-display text-[30px] leading-none">
              184 920 <span className="font-sans text-[11px] text-ink-3">{t.views}</span>
            </p>
            <svg viewBox="0 0 300 80" className="mt-3 min-h-0 w-full flex-1" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={color("metricove")} stopOpacity="0.35" />
                  <stop offset="1" stopColor={color("metricove")} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 68 C25 62 40 66 60 55 S95 50 115 44 S150 52 170 38 S205 30 225 24 S265 22 300 8 L300 80 L0 80Z" fill="url(#hero-area)" />
              <path className="hero-line" d="M0 68 C25 62 40 66 60 55 S95 50 115 44 S150 52 170 38 S205 30 225 24 S265 22 300 8" fill="none" stroke={color("metricove")} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="flex flex-col rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-4">
            <div className="flex items-center gap-2">
              <ProductIcon id="nino" color={color("nino")} size="sm" className="size-5! rounded-md [&_svg]:size-3" />
              <span className="truncate text-[11.5px] text-ink-2">{t.control}</span>
              <span className="ml-auto flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[var(--rec-text)]">
                <span className="rec size-1.5 rounded-full bg-[#ff4d4d]" /> REC
              </span>
            </div>
            <div className="mt-3 grid flex-1 grid-cols-3 gap-1.5">
              {[210, 30, 290].map((h, n) => (
                <div
                  key={h}
                  className={cn("relative overflow-hidden rounded-md", n === 0 && "ring-1 ring-[#ff4d4d]")}
                  style={{
                    background: `linear-gradient(160deg, oklch(0.42 0.08 ${h}), oklch(0.18 0.03 ${h}))`,
                  }}
                >
                  <span aria-hidden className="absolute bottom-0 left-1/2 h-[46%] w-[70%] -translate-x-1/2 rounded-t-[50%] bg-black/35" />
                  <span aria-hidden className="absolute bottom-[40%] left-1/2 aspect-square w-[24%] -translate-x-1/2 rounded-full bg-black/35" />
                  <span className="absolute bottom-1 left-1 text-[8.5px] text-white/70">CAM {n + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex h-6 items-end gap-[3px]">
              {Array.from({ length: 22 }, (_, i) => (
                <span
                  key={i}
                  className="vu w-full rounded-sm"
                  style={{
                    height: "100%",
                    animationDelay: `${(i * 137) % 900}ms`,
                    background: i % 7 === 6 ? "#febc2e" : "#28c840",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One app opened inside the hub: its header, then its interface. */
function AppPane({ app, on, t, locale }: { app: App; on: boolean; t: Text; locale: Locale }) {
  const place = t.live[app.id] ?? { crumb: app.category, note: "" };
  const c = ink(app.color);
  const flat = neutral(app.color);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-wash/[0.07] bg-[var(--hub-pane)]">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-wash/[0.06] px-4">
        <ProductIcon id={app.id} color={c} size="sm" className="size-8! rounded-lg!" />
        <div className="min-w-0 leading-tight">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold">
            <span className="shrink-0">{app.name}</span>
            <span className="font-normal text-ink-3">/</span>
            <span className="truncate font-normal text-ink-2">{place.crumb}</span>
          </p>
          <p className="truncate text-[11px] text-ink-3">{app.category}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {place.note && (
            <span className="flex items-center gap-1.5 rounded-full bg-wash/[0.04] px-2.5 py-1 text-[11px] text-ink-2 max-sm:hidden">
              <span className="size-1.5 rounded-full bg-[#28c840]" />
              {place.note}
            </span>
          )}
          <span className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium" style={{ background: c, color: flat ? "light-dark(#fff, #0b0b0d)" : "#fff" }}>
            <Share2 className="size-3.5" /> Partager
          </span>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="hero-zoom">
          <AppMock id={app.id} name={app.name} color={c} on={on} chrome={false} locale={locale} />
        </div>
      </div>
    </div>
  );
}

/** The Postmelo hub, drawn at a fixed size: one `active` screen drives the URL, the sidebar and the body. */
function Hub({ apps, active, onPick, t, locale }: { apps: App[]; active: number; onPick: (n: number) => void; t: Text; locale: Locale }) {
  const by = (id: string) => apps.find((a) => a.id === id);
  const color = (id: string) => ink(by(id)?.color ?? "");
  // The URL and the sidebar follow the body a beat later, so all three change together.
  const [shown, setShown] = useState(active);
  useEffect(() => {
    const t = setTimeout(() => setShown(active), 150);
    return () => clearTimeout(t);
  }, [active]);
  const open = shown > 0 ? apps[shown - 1] : null;
  const slug = open ? (LIVE[open.id]?.slug ?? open.id) : t.home.toLowerCase();

  return (
    <div className="flex h-full flex-col bg-[var(--win)] text-[12px] text-ink">
      {/* Title bar */}
      <div className="relative flex h-11 shrink-0 items-center border-b border-wash/[0.06] bg-[var(--win-bar)] px-4">
        <span className="flex gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="absolute left-1/2 flex h-7 w-[340px] -translate-x-1/2 items-center justify-center gap-2 rounded-lg border border-wash/[0.06] bg-[var(--hub-url)] text-[11.5px] text-ink-3 max-sm:w-[260px]">
          <Lock className="size-3" />
          <span>
            postmelo.app/
            <span key={slug} className="hero-slug text-ink-2">
              {slug}
            </span>
          </span>
        </span>
        <span className="ml-auto flex -space-x-1.5">
          {PEOPLE.map((p) => (
            <Avatar key={p.n} {...p} size={22} />
          ))}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-[232px] shrink-0 flex-col border-r border-wash/[0.06] bg-[var(--win-side)] p-3 max-lg:w-[212px] max-sm:w-14 max-sm:items-center max-sm:px-2">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 max-sm:px-0">
            <SuiteLogo className="size-7" />
            <div className="min-w-0 leading-tight max-sm:hidden">
              <p className="text-[13px] font-medium">Studio Lumen</p>
              <p className="text-[10.5px] text-ink-3">{t.members}</p>
            </div>
            <ChevronDown className="ml-auto size-3.5 text-ink-3 max-sm:hidden" />
          </div>
          <div className="mt-3 flex h-8 items-center gap-2 rounded-lg border border-wash/[0.06] bg-[var(--hub-card)] px-2.5 text-ink-3 max-lg:hidden">
            <Search className="size-3.5" /> {t.search}
            <span className="ml-auto flex items-center gap-0.5 rounded border border-wash/10 px-1 text-[10px]">
              <Command className="size-2.5" />K
            </span>
          </div>
          <nav className="mt-3 flex flex-col gap-0.5 text-ink-2 max-sm:mt-4">
            {[
              { i: Home, label: t.nav[0], home: true },
              { i: Bell, label: t.nav[1], n: "5" },
              { i: Users, label: t.nav[2] },
              { i: LayoutGrid, label: t.nav[3] },
            ].map(({ i: I, label, home, n }) => (
              <button
                key={label}
                type="button"
                tabIndex={-1}
                onClick={home ? () => onPick(0) : undefined}
                className={cn("relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-300 max-sm:w-9 max-sm:justify-center max-sm:px-0", home && shown === 0 && "bg-wash/[0.07] text-ink")}
              >
                <I className="size-4 shrink-0" strokeWidth={1.8} /> <span className="max-sm:hidden">{label}</span>
                {n && <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-ink max-sm:absolute max-sm:right-0 max-sm:top-0.5 max-sm:size-1.5 max-sm:p-0 max-sm:text-[0px]">{n}</span>}
              </button>
            ))}
          </nav>
          <p className="mb-1.5 mt-4 px-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3 max-sm:hidden">{t.yourApps}</p>
          <span className="mb-2 mt-3 h-px w-6 bg-wash/[0.08] sm:hidden" />
          <div className="flex flex-col gap-0.5">
            {apps.map((a, n) => {
              const on = shown === n + 1;
              return (
                <button
                  key={a.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => onPick(n + 1)}
                  className={cn("flex h-[30px] items-center gap-2.5 rounded-lg px-2 text-left transition-colors duration-300 max-sm:size-9 max-sm:justify-center max-sm:px-0", on ? "text-ink" : "text-ink-2")}
                  style={
                    on
                      ? {
                          background: tint(a.color, neutral(a.color) ? 10 : 18),
                          boxShadow: `inset 0 0 0 1px ${tint(a.color, neutral(a.color) ? 14 : 28)}`,
                        }
                      : undefined
                  }
                >
                  <ProductIcon id={a.id} color={a.color} size="sm" className="size-6! rounded-[7px]! [&_svg]:size-3.5 max-sm:shrink-0" />
                  <span className="truncate max-sm:hidden">{a.name}</span>
                  {LIVE[a.id]?.badge && (
                    <span
                      className="ml-auto rounded-full px-1.5 text-[9.5px] font-semibold max-sm:hidden"
                      style={{
                        background: tint(a.color, 28),
                        color: `color-mix(in oklab, ${ink(a.color)} 70%, var(--lift))`,
                      }}
                    >
                      {LIVE[a.id].badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-wash/[0.06] bg-[var(--hub-card)] p-2.5 max-sm:hidden">
            <Avatar n="C" hue={160} size={30} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-medium">Camille Roux</p>
              <p className="truncate text-[10.5px] text-ink-3">{t.role}</p>
            </div>
            <Settings className="ml-auto size-3.5 text-ink-3" />
          </div>
        </aside>

        {/* Main: the open screen, then the day and the team */}
        <div className="flex min-w-0 flex-1 gap-5 p-6 max-sm:p-4">
          <div className="relative min-w-0 flex-1">
            <div className="hero-pane" data-on={active === 0}>
              <HomePane apps={apps} onPick={onPick} t={t} />
            </div>
            {apps.map((a, n) => (
              <div key={a.id} className="hero-pane" data-on={active === n + 1}>
                <AppPane app={a} on={active === n + 1} t={t} locale={locale} />
              </div>
            ))}
          </div>

          <div className="flex w-[268px] shrink-0 flex-col gap-3 max-lg:hidden">
            <div className="rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-3.5">
              <div className="flex items-center gap-2">
                <ProductIcon id="alfred" color={color("alfred")} size="sm" className="size-5! rounded-md [&_svg]:size-3" />
                <span className="text-[11.5px] text-ink-2">{t.today}</span>
              </div>
              {[
                { t: "14:00", what: t.agenda[0], c: color("alfred") },
                {
                  t: "16:30",
                  what: t.agenda[1],
                  c: color("lamio"),
                },
                {
                  t: "20:00",
                  what: t.agenda[2],
                  c: color("maya"),
                },
              ].map((e) => (
                <div key={e.t} className="mt-2.5 flex items-center gap-2.5">
                  <span className="tabular w-9 text-[10.5px] text-ink-3">{e.t}</span>
                  <span className="h-6 w-[3px] rounded-full" style={{ background: e.c }} />
                  <span className="truncate text-[11.5px]">{e.what}</span>
                </div>
              ))}
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-ink-2">{t.activity}</span>
                <span className="relative flex size-2">
                  <span className="hero-ping absolute inset-0 rounded-full bg-accent" />
                  <span className="relative size-2 rounded-full bg-accent" />
                </span>
              </div>
              <div className="mt-1 flex min-h-0 flex-col overflow-hidden">
                {FEED.map((f, i) => (
                  <div key={i} className={cn("flex items-start gap-2.5 border-b border-wash/[0.05] py-2 transition-opacity duration-500 last:border-0", open && open.id !== f.app && "opacity-50")}>
                    <Avatar n={f.who[0]} hue={f.hue} size={24} />
                    <div className="min-w-0 flex-1 leading-snug">
                      <p className="text-[11px]">
                        <span className="font-medium">{f.who}</span> <span className="text-ink-2">{t.feed[i]}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-3">
                        <span className="size-1.5 rounded-full" style={{ background: color(f.app) }} />
                        {by(f.app)?.name} · {t.ago[i]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <span className="mt-auto flex shrink-0 items-center justify-between border-t border-wash/[0.05] pt-2.5 text-[11px] text-ink-2">
                {t.seeAll} <ArrowRight className="size-3.5 text-ink-3" />
              </span>
            </div>
            <div className="rounded-xl border border-wash/[0.07] bg-[var(--hub-card)] p-3.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-2">{t.storage}</span>
                <span className="tabular text-ink-3">{t.storageOf}</span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-wash/[0.06]">
                <span className="hero-bar h-full w-[18%]" style={{ background: color("nino") }} />
                <span className="hero-bar h-full w-[9%]" style={{ background: color("cairn") }} />
                <span className="hero-bar h-full w-[5%]" style={{ background: color("lamio") }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Opening screen: the promise in three beats, then the product itself, rising flat as the page moves. */
export function Hero({ apps, suite, signedIn, locale = "fr", account = "" }: { apps: App[]; suite: string; signedIn: boolean; locale?: Locale; account?: string }) {
  const t = T[locale];
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  // Once someone picks a screen, the tour stops there.
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(true);
  const tilt = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // Fit the hub to its frame, like a screenshot. CSS does it from the first paint where it can.
  useIsoLayout(() => {
    const el = box.current;
    if (!el || CSS.supports("scale", "tan(atan2(100cqw, 1px))")) return;
    const fit = () => {
      if (screen.current) screen.current.style.scale = String(el.clientWidth / screen.current.offsetWidth);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The tour only runs while someone can see it.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Tilted back at rest, flat once scrolled; the chip floats a little ahead of the window.
  // The resting pose comes from hero.css, so the first paint matches. Phones only rise, without tilt.
  useEffect(() => {
    const el = tilt.current;
    if (!el || prefersReduced()) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.55)));
      const e = 1 - Math.pow(1 - p, 3);
      const small = window.innerWidth < 640;
      const deg = small ? 0 : TILT * (1 - e);
      const scale = (small ? 0.97 : REST) + (small ? 0.03 : 1 - REST) * e;
      el.style.transform = `rotateX(${deg.toFixed(2)}deg) scale(${scale.toFixed(4)}) translateY(${((1 - e) * -8).toFixed(1)}px)`;
      chip.current?.style.setProperty("translate", `0 ${(14 - e * 26).toFixed(1)}px`);
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const open = active > 0 ? apps[active - 1] : null;
  const color = open && !neutral(open.color) ? open.color : MINT;
  const next = () => setActive((n) => (n + 1) % (apps.length + 1));
  const pick = (n: number) => {
    setActive(n);
    setManual(true);
  };
  const soon = apps.find((a) => a.status === "bientot");
  const tabs = [{ id: "accueil", name: t.home, color: MINT }, ...apps];
  const paused = hover || !visible || focused || manual;

  // Keep the chosen tab in view when the row scrolls (phones).
  useEffect(() => {
    const row = list.current;
    const tab = row?.querySelector<HTMLElement>(`#hero-tab-${active}`);
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  }, [active]);

  // Arrow keys, Home and End move between tabs, as in any tab list.
  const onKey = (e: React.KeyboardEvent) => {
    const last = tabs.length - 1;
    const to = e.key === "ArrowRight" ? (active + 1) % tabs.length : e.key === "ArrowLeft" ? (active + last) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (to < 0) return;
    e.preventDefault();
    pick(to);
    list.current?.querySelector<HTMLElement>(`#hero-tab-${to}`)?.focus();
  };

  return (
    <section className={cn("hero relative isolate overflow-x-clip pb-16 sm:pb-24", !visible && "hero-off")} style={{ "--hero-c": color, "--hero-dur": `${DUR}ms` } as React.CSSProperties}>
      {/* The sky: a faint grid and a glow at the top */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(70%_55%_at_50%_0%,#000,transparent)]"
        style={{
          backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-260px] -z-10 h-[620px] w-[1100px] max-w-[160vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,var(--glow-mint),var(--glow-violet)_60%,transparent)] blur-2xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pt-[88px] text-center sm:pt-[80px]">
        <a
          href="#suite"
          className="rise-blur group inline-flex max-w-full items-center gap-2 rounded-full border border-line-strong bg-[var(--glass-04)] py-1 pl-1 pr-3.5 text-[12.5px] text-ink-2 backdrop-blur hover:border-accent/40"
          style={{ animationDelay: "100ms" }}
        >
          <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{soon ? t.soon : t.suiteBadge}</span>
          <span className="truncate">{soon ? t.soonLine(soon.name, suite) : t.countLine(suite, apps.length)}</span>
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </a>

        <h1 className="mt-4 font-display text-[clamp(44px,5.4vw,78px)] leading-[0.95] tracking-[-0.02em]">
          <span className="rise-blur inline-block" style={{ animationDelay: "220ms" }}>
            {t.title[0]}
          </span>{" "}
          <br className="sm:hidden" />
          <span className="rise-blur inline-block" style={{ animationDelay: "360ms" }}>
            {t.title[1]}
          </span>
          <br />
          <span className="rise-blur inline-block bg-[image:var(--title-gradient)] bg-clip-text pb-[0.08em] pr-[0.06em] italic text-transparent" style={{ animationDelay: "520ms" }}>
            {t.title[2]}
          </span>
        </h1>

        <p className="rise-blur mt-5 max-w-[600px] text-[16px] leading-relaxed text-ink-2 sm:text-[17.5px]" style={{ animationDelay: "680ms" }}>
          {t.sub}
          <span className="max-sm:hidden">{t.subMore(countWordIn(apps.length, locale))}</span>
        </p>

        <div className="rise-blur mt-5 flex flex-wrap justify-center gap-3" style={{ animationDelay: "820ms" }}>
          <a href="#contact" className={cn("press sweep relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-6 text-[15px] font-medium", primaryClass)}>
            {t.cta} <ArrowRight className="size-4" />
          </a>
          <a href={signedIn ? `${account}/compte` : "#suite"} className="press inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-[var(--glass-04)] px-6 text-[15px] font-medium backdrop-blur hover:bg-[var(--glass-08)]">
            {signedIn ? t.open : t.discover}
          </a>
        </div>
      </div>

      {/* Tabs: home, then each app. One index drives the tab, the hub's sidebar, its URL and its body. */}
      <div className="rise-blur relative z-10 mx-auto mt-6 flex max-w-[1180px] justify-center px-4" style={{ animationDelay: "1000ms" }}>
        <div
          ref={list}
          role="tablist"
          aria-label={t.tablist}
          className={cn("hero-tabs flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-[var(--glass-03)] p-1 backdrop-blur", paused && "hero-paused")}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
          onKeyDown={onKey}
        >
          {tabs.map((x, n) => {
            const on = n === active;
            return (
              <button
                key={x.id}
                id={`hero-tab-${n}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="hero-panel"
                aria-label={x.name}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(n)}
                className={cn(
                  "relative flex h-9 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full text-[13px] font-medium transition-colors duration-300",
                  on ? "bg-[var(--glass-08)] pl-1 pr-3 text-ink shadow-[var(--tab-shadow)] sm:pl-1.5" : "w-7 text-ink-3 hover:bg-[var(--glass-04)] hover:text-ink-2 sm:w-9",
                )}
              >
                {on ? (
                  n === 0 ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Home className="size-3.5" strokeWidth={1.8} />
                    </span>
                  ) : (
                    <ProductIcon id={x.id} color={neutral(x.color) ? "#8d8a83" : ink(x.color)} size="sm" className="rounded-full!" />
                  )
                ) : n === 0 ? (
                  <Home className="size-4" strokeWidth={1.8} />
                ) : (
                  <ProductGlyph id={x.id} />
                )}
                <span className={cn("whitespace-nowrap", !on && "sr-only")}>{x.name}</span>
                {on && (
                  <span aria-hidden className="absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full bg-wash/[0.06]">
                    <span
                      key={`${active}-${manual}`}
                      className={cn("hero-progress block h-full rounded-full", manual && "hero-progress-done")}
                      style={{
                        background: n === 0 || neutral(x.color) ? MINT : ink(x.color),
                      }}
                      onAnimationEnd={manual ? undefined : next}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${active}`} className="sr-only">
        {t.preview(tabs[active]?.name ?? "")}
      </div>

      {/* The product, rising out of a horizon of light */}
      <div className="relative mx-auto mt-6 w-full max-w-[1180px] px-4 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] -z-10">
          <div className="hero-arc" />
        </div>
        <div aria-hidden className="hero-beam" />
        <div aria-hidden className="hero-side" />

        <div className="rise-blur hero-stage" style={{ animationDelay: "700ms", animationDuration: "1.6s" }}>
          <div ref={tilt} className="hero-tilt">
            <div className="hero-frame relative rounded-[22px] p-1.5 sm:rounded-[30px] sm:p-2.5" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
              <div aria-hidden className="hero-edge absolute inset-x-[14%] top-0 h-px" />
              <div ref={box} aria-hidden className="hero-box relative overflow-hidden rounded-[16px] sm:rounded-[22px]">
                <div ref={screen} className="hero-screen absolute left-0 top-0 origin-top-left">
                  <Hub apps={apps} active={active} onPick={pick} t={t} locale={locale} />
                </div>
                <div className="hero-shine pointer-events-none absolute inset-0" />
              </div>

              {/* Signed in once, for everything: floating just under the frame's corner */}
              <div ref={chip} aria-hidden className="hero-chip-wrap pointer-events-none absolute bottom-[-72px] left-3 z-10 max-sm:hidden xl:-left-4" style={{ translate: "0 14px" }}>
                <div
                  className="rise-blur flex items-center gap-3 rounded-2xl border border-[color:var(--edge-14)] bg-chip/85 py-2 pl-2 pr-4 shadow-[0_30px_60px_-20px_var(--deep),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                  style={{ animationDelay: "1400ms" }}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Fingerprint className="size-5" />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                      {t.faceId} <Check className="size-3.5 text-accent" />
                    </span>
                    <span className="text-[11.5px] text-ink-3">{t.appsOpen(apps.length)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* A soft reflection under the product */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[12%] -bottom-10 -z-10 h-24 rounded-[50%] bg-[radial-gradient(closest-side,var(--glow-reflect),transparent)] blur-xl" />
      </div>
    </section>
  );
}
