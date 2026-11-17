import { Camera, CheckCircle2, Eye, FileText, Hash, Image as ImageIcon, Lock, Mic, MonitorPlay, Plus, Radio, Search, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Miniature interfaces of each app, drawn in HTML: what people would see once inside.
 * They come alive (messages arriving, a card moving, meters bouncing) when `on` is set.
 */

/** What the miniature interfaces say, in each language. Names of people and places stay as they are. */
const M = {
  fr: {
    lamio: { title: "Lamio · #studio", msgs: ["Le montage du podcast est en ligne 🎙️", "Top ! Je le programme sur Metricove pour jeudi.", "Parfait. @tous point d'équipe à 14 h ?", "Ça marche pour moi 👍"], channels: "Canaux", direct: "Messages", about: "Tournages, montage et diffusion du studio. 9 membres.", pinned: "Planning des tournages · novembre", pinnedBy: "Épinglé par Léa · mis à jour ce matin", today: "Aujourd'hui", typing: "Léa écrit…", write: "Écrire dans #studio" },
    cairn: { title: "Cairn · Notes", search: "Rechercher", tree: ["📁 Clients", "📁 Studio", "📄 Charte Postmelo", "📄 Idées vidéo", "🔒 Accès VPS"], note: "Charte Postmelo", tone: "Ton", toneText: "Direct, chaleureux, sans jargon. On tutoie. Une idée par phrase.", colours: "Couleurs", todo: ["Logo validé", "Déclinaison vidéo"], server: "Serveur VPS", encrypted: "Chiffré", type: "Typographie", serif: "Instrument Serif · titres", sans: "Geist · textes et interface" },
    tickup: { title: "TickUp · Studio · Sprint 4", cols: [{ name: "À faire", cards: ["Brief vidéo", "Maquette accueil", "Sous-titres épisode 13"] }, { name: "En cours", cards: ["Montage épisode 12", "Visuels LinkedIn"] }, { name: "Terminé", cards: ["Logo final", "Charte", "Générique podcast"] }], ticket: "Ticket" },
    alfred: { title: "Alfred · Semaine 47", days: ["Lun", "Mar", "Mer", "Jeu", "Ven"], events: ["Tournage", "Point équipe", "Client Rhône", "Podcast live", "RDV · Léa"], confirmed: "Rendez-vous confirmé", confirmedWhen: "Vendredi 10:30 · e-mail envoyé" },
    metricove: { title: "Metricove · Calendrier", week: "Cette semaine", posts: [{ d: "Jeu 9:00", t: "Épisode 12 · annonce" }, { d: "Ven 12:30", t: "Coulisses du tournage" }, { d: "Sam 18:00", t: "Extrait « Les Coulisses »" }], episode: "Épisode 12", caption: "Le nouvel épisode est là. On parle d'outils, d'équipe et de vidéo 🎬", views: "12,4 k" },
    nino: { title: "Nino Studio · Régie", program: "PROGRAMME", shot: "Plan large · automatique", mics: "Micros", live: "En direct" },
    maya: { title: "Maya Studio · Scène « Plateau »", scenes: "Scènes", sceneList: ["Intro", "Plateau", "Invité", "Écran", "Fin"], sources: "Sources", sourceList: ["Écran", "Caméra", "Logo", "Titre"], bitrate: "Débit", rate: "6,2 Mb/s" },
  },
  en: {
    lamio: { title: "Lamio · #studio", msgs: ["The podcast edit is up 🎙️", "Great! I'll schedule it on Metricove for Thursday.", "Perfect. @everyone team meeting at 2 pm?", "Works for me 👍"], channels: "Channels", direct: "Messages", about: "Shoots, editing and broadcast for the studio. 9 members.", pinned: "Shooting schedule · November", pinnedBy: "Pinned by Léa · updated this morning", today: "Today", typing: "Léa is typing…", write: "Message #studio" },
    cairn: { title: "Cairn · Notes", search: "Search", tree: ["📁 Clients", "📁 Studio", "📄 Postmelo guidelines", "📄 Video ideas", "🔒 VPS access"], note: "Postmelo guidelines", tone: "Tone", toneText: "Direct, warm, no jargon. First names. One idea per sentence.", colours: "Colours", todo: ["Logo approved", "Video version"], server: "VPS server", encrypted: "Encrypted", type: "Typography", serif: "Instrument Serif · headings", sans: "Geist · text and interface" },
    tickup: { title: "TickUp · Studio · Sprint 4", cols: [{ name: "To do", cards: ["Video brief", "Home page mock-up", "Episode 13 subtitles"] }, { name: "In progress", cards: ["Episode 12 edit", "LinkedIn visuals"] }, { name: "Done", cards: ["Final logo", "Guidelines", "Podcast intro"] }], ticket: "Ticket" },
    alfred: { title: "Alfred · Week 47", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], events: ["Shoot", "Team meeting", "Client Rhône", "Live podcast", "Meeting · Léa"], confirmed: "Booking confirmed", confirmedWhen: "Friday 10:30 · email sent" },
    metricove: { title: "Metricove · Calendar", week: "This week", posts: [{ d: "Thu 9:00", t: "Episode 12 · announcement" }, { d: "Fri 12:30", t: "Behind the shoot" }, { d: "Sat 18:00", t: "Clip “Behind the Scenes”" }], episode: "Episode 12", caption: "The new episode is out. We talk tools, teams and video 🎬", views: "12.4k" },
    nino: { title: "Nino Studio · Control room", program: "PROGRAM", shot: "Wide shot · automatic", mics: "Mics", live: "Go live" },
    maya: { title: "Maya Studio · Scene “Stage”", scenes: "Scenes", sceneList: ["Intro", "Stage", "Guest", "Screen", "Outro"], sources: "Sources", sourceList: ["Screen", "Camera", "Logo", "Title"], bitrate: "Bitrate", rate: "6.2 Mb/s" },
  },
  de: {
    lamio: { title: "Lamio · #studio", msgs: ["Der Podcast-Schnitt ist online 🎙️", "Top! Ich plane ihn in Metricove für Donnerstag ein.", "Perfekt. @alle Teammeeting um 14 Uhr?", "Passt für mich 👍"], channels: "Kanäle", direct: "Nachrichten", about: "Drehs, Schnitt und Ausstrahlung des Studios. 9 Mitglieder.", pinned: "Drehplan · November", pinnedBy: "Angeheftet von Léa · heute Morgen aktualisiert", today: "Heute", typing: "Léa schreibt…", write: "In #studio schreiben" },
    cairn: { title: "Cairn · Notizen", search: "Suchen", tree: ["📁 Kunden", "📁 Studio", "📄 Postmelo-Leitfaden", "📄 Videoideen", "🔒 VPS-Zugang"], note: "Postmelo-Leitfaden", tone: "Tonalität", toneText: "Direkt, herzlich, ohne Fachjargon. Wir duzen. Eine Idee pro Satz.", colours: "Farben", todo: ["Logo freigegeben", "Videoversion"], server: "VPS-Server", encrypted: "Verschlüsselt", type: "Typografie", serif: "Instrument Serif · Titel", sans: "Geist · Text und Oberfläche" },
    tickup: { title: "TickUp · Studio · Sprint 4", cols: [{ name: "Zu erledigen", cards: ["Video-Briefing", "Mock-up Startseite", "Untertitel Folge 13"] }, { name: "In Arbeit", cards: ["Schnitt Folge 12", "LinkedIn-Visuals"] }, { name: "Erledigt", cards: ["Finales Logo", "Leitfaden", "Podcast-Intro"] }], ticket: "Ticket" },
    alfred: { title: "Alfred · Woche 47", days: ["Mo", "Di", "Mi", "Do", "Fr"], events: ["Dreh", "Teammeeting", "Kunde Rhône", "Live-Podcast", "Termin · Léa"], confirmed: "Termin bestätigt", confirmedWhen: "Freitag 10:30 · E-Mail gesendet" },
    metricove: { title: "Metricove · Kalender", week: "Diese Woche", posts: [{ d: "Do 9:00", t: "Folge 12 · Ankündigung" }, { d: "Fr 12:30", t: "Hinter den Kulissen des Drehs" }, { d: "Sa 18:00", t: "Ausschnitt «Hinter den Kulissen»" }], episode: "Folge 12", caption: "Die neue Folge ist da. Wir reden über Tools, Teams und Video 🎬", views: "12,4 Tsd." },
    nino: { title: "Nino Studio · Regie", program: "PROGRAMM", shot: "Totale · automatisch", mics: "Mikrofone", live: "Live gehen" },
    maya: { title: "Maya Studio · Szene «Set»", scenes: "Szenen", sceneList: ["Intro", "Set", "Gast", "Bildschirm", "Ende"], sources: "Quellen", sourceList: ["Bildschirm", "Kamera", "Logo", "Titel"], bitrate: "Bitrate", rate: "6,2 Mb/s" },
  },
};
type MockText = (typeof M)["fr"];

type MockProps = { color: string; on: boolean; chrome?: boolean; t: MockText };

function Window({ title, color, on, chrome = true, children, className }: { title: string; color: string; on: boolean; chrome?: boolean; children: React.ReactNode; className?: string }) {
  // Without chrome, the app is drawn bare, to sit inside another window (the hero's hub).
  if (!chrome) return <div className={cn("relative h-full w-full text-[12px] text-ink", on && "mock-on", className)}>{children}</div>;
  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-[color:var(--edge-12)] bg-mock/90 text-[12px] text-ink backdrop-blur-xl", on && "mock-on", className)}
      style={{
        boxShadow: `0 60px 120px -50px light-dark(color-mix(in oklab, ${color} 55%, transparent), ${color}), 0 30px 60px -30px var(--deep-2), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[color:var(--edge-07)] px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-3 text-[11.5px] font-medium text-ink-3">{title}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** A camera picture: a coloured set and a head-and-shoulders silhouette, as on the hub's home screen. */
export function Shot({ hue, className, style, children }: { hue: number; className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(160deg, oklch(0.42 0.08 ${hue}), oklch(0.18 0.03 ${hue}))`,
        ...style,
      }}
    >
      <span aria-hidden className="absolute bottom-0 left-1/2 h-[46%] w-[54%] -translate-x-1/2 rounded-t-[50%] bg-black/35" />
      <span aria-hidden className="absolute bottom-[40%] left-1/2 aspect-square w-[20%] -translate-x-1/2 rounded-full bg-black/35" />
      {children}
    </div>
  );
}

export const soft = (c: string, pct = 16) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;
const Dot = ({ c }: { c: string }) => <span className="inline-block size-1.5 rounded-full" style={{ background: c }} />;

function Lamio({ color, on, chrome, t: all }: MockProps) {
  const t = all.lamio;
  const msgs = [
    { who: "Léa", hue: 200 },
    { who: "Marc", hue: 30 },
    { who: "Antoine", hue: 150 },
    { who: "Julie", hue: 300 },
  ].map((m, i) => ({ ...m, text: t.msgs[i] }));
  return (
    <Window title={t.title} color={color} on={on} chrome={chrome}>
      <div className="flex h-full">
        <aside className="hidden w-[150px] shrink-0 flex-col gap-1 border-r border-[color:var(--edge-07)] p-3 sm:flex">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-3">{t.channels}</p>
          {["general", "studio", "design", "clients"].map((c) => (
            <span key={c} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1", c === "studio" ? "text-ink" : "text-ink-3")} style={c === "studio" ? { background: soft(color, 22) } : undefined}>
              <Hash className="size-3" /> {c}
              {c === "design" && (
                <span className="ml-auto rounded-full px-1.5 text-[9.5px] font-semibold text-[light-dark(#fff,#000)]" style={{ background: color }}>
                  3
                </span>
              )}
            </span>
          ))}
          <p className="mb-1 mt-3 text-[10px] uppercase tracking-wider text-ink-3">{t.direct}</p>
          {["Léa", "Marc"].map((n) => (
            <span key={n} className="flex items-center gap-1.5 px-2 py-1 text-ink-3">
              <Dot c="#28c840" /> {n}
            </span>
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4">
          {/* The channel's head, then today's messages right under it. */}
          <div className={cn("mb-1", chrome && "max-sm:hidden")}>
            <p className="flex items-center gap-1.5 text-[15px] font-semibold">
              <Hash className="size-4" style={{ color }} /> studio
            </p>
            <p className="mt-1 text-ink-3">{t.about}</p>
            {/* The pinned file, wherever the window is tall enough for it. */}
            <div className={cn("mt-3 flex items-center gap-2.5 rounded-xl border p-2.5", chrome && "max-lg:hidden")} style={{ borderColor: soft(color, 30), background: soft(color, 8) }}>
              <FileText className="size-4 shrink-0" style={{ color }} />
              <span className="min-w-0">
                <span className="block font-medium">{t.pinned}</span>
                <span className="block text-[10.5px] text-ink-3">{t.pinnedBy}</span>
              </span>
            </div>
            <p className="mt-3 flex items-center gap-3 text-[10.5px] text-ink-3">
              <span className="h-px flex-1 bg-wash/[0.07]" /> {t.today} <span className="h-px flex-1 bg-wash/[0.07]" />
            </p>
          </div>
          {msgs.map((m, i) => (
            <div key={i} className="msg flex gap-2.5" style={{ animationDelay: `${300 + i * 650}ms` }}>
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold"
                style={{
                  background: `oklch(0.62 0.13 ${m.hue} / 0.25)`,
                  color: `light-dark(oklch(0.45 0.13 ${m.hue}), oklch(0.8 0.12 ${m.hue}))`,
                }}
              >
                {m.who[0]}
              </span>
              <div>
                <p className="text-[11px] font-semibold">
                  {m.who} <span className="font-normal text-ink-3">14:0{i + 2}</span>
                </p>
                <p className="text-ink-2">{m.text}</p>
              </div>
            </div>
          ))}
          <div className="msg flex items-center gap-2 text-ink-3" style={{ animationDelay: "3000ms" }}>
            <span className="typing flex gap-0.5">
              <span className="size-1.5 rounded-full bg-ink-3" />
              <span className="size-1.5 rounded-full bg-ink-3" />
              <span className="size-1.5 rounded-full bg-ink-3" />
            </span>
            {t.typing}
          </div>
          <div className="mt-auto flex h-9 shrink-0 items-center rounded-lg border border-[color:var(--edge-10)] px-3 text-ink-3">{t.write}</div>
        </div>
      </div>
    </Window>
  );
}

function Cairn({ color, on, chrome, t: all }: MockProps) {
  const t = all.cairn;
  return (
    <Window title={t.title} color={color} on={on} chrome={chrome}>
      <div className="flex h-full">
        <aside className="hidden w-[160px] shrink-0 flex-col gap-1 border-r border-[color:var(--edge-07)] p-3 text-ink-3 sm:flex">
          <span className="mb-2 flex items-center gap-1.5 rounded-md border border-[color:var(--edge-10)] px-2 py-1">
            <Search className="size-3" /> {t.search} <span className="ml-auto text-[9.5px]">⌘K</span>
          </span>
          {t.tree.map((n, i) => (
            <span key={n} className={cn("rounded-md px-2 py-1", i === 2 && "text-ink")} style={i === 2 ? { background: soft(color, 22) } : undefined}>
              {n}
            </span>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-5">
          <p className="font-display text-[24px] leading-none">{t.note}</p>
          <p className="mt-3 text-ink-2">
            <span style={{ color }}>## </span>{t.tone}
          </p>
          <p className="mt-1 leading-relaxed text-ink-3">{t.toneText}</p>
          <p className="mt-3 text-ink-2">
            <span style={{ color }}>## </span>{t.colours}
          </p>
          <div className="mt-2 flex gap-1.5">
            {["#12805c", "#efede8", "#181715", color].map((c) => (
              <span key={c} className="size-6 rounded-md ring-1 ring-wash/10" style={{ background: c }} />
            ))}
          </div>
          <p className="mt-3 text-ink-3">
            - [x] {t.todo[0]}
            <br />- [ ] {t.todo[1]}
            <span className="caret ml-0.5 inline-block h-3 w-px translate-y-0.5" style={{ background: color }} />
          </p>
          <div
            className="msg mt-4 flex items-center gap-3 rounded-xl border p-3"
            style={{
              borderColor: soft(color, 40),
              background: soft(color, 10),
              animationDelay: "700ms",
            }}
          >
            <Lock className="size-4" style={{ color }} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.server}</p>
              <p className="tracking-[0.25em] text-ink-3">••••••••••••</p>
            </div>
            <span className="text-[10px] text-ink-3">{t.encrypted}</span>
          </div>
          {/* In the story's smaller windows on phones and tablets, the note stops at the vault. */}
          <div className={cn(chrome && "max-lg:hidden")}>
            <p className="mt-4 text-ink-2">
              <span style={{ color }}>## </span>{t.type}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[color:var(--edge-08)] bg-[var(--hub-pane)] p-3">
                <p className="font-display text-[30px] leading-none">
                  Aa <span className="italic text-ink-2">Aa</span>
                </p>
                <p className="mt-2 text-[10.5px] text-ink-3">{t.serif}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--edge-08)] bg-[var(--hub-pane)] p-3">
                <p className="text-[26px] font-medium leading-none tracking-tight">Aa</p>
                <p className="mt-2 text-[10.5px] text-ink-3">{t.sans}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

function TickUp({ color, on, chrome, t: all }: MockProps) {
  const cols = all.tickup.cols;
  const c = color || "var(--ink)";
  return (
    <Window title={all.tickup.title} color={c} on={on} chrome={chrome}>
      <div className="grid h-full grid-cols-3 gap-2.5 p-4">
        {cols.map((col, ci) => (
          <div key={col.name} className="flex flex-col gap-2 rounded-xl bg-wash/[0.03] p-2">
            <p className="flex items-center gap-1.5 px-1 text-[10.5px] font-medium text-ink-2">
              <span className="size-2 rounded-full border border-ink-3" style={ci === 2 ? { background: c } : undefined} /> {col.name}
            </p>
            {col.cards.map((card, i) => (
              <div key={card} className={cn("relative rounded-lg border border-[color:var(--edge-10)] bg-raised p-2.5", ci === 0 && i === 0 && "card-move z-10")}>
                <p className="text-[10px] text-ink-3">STU-{12 + ci * 3 + i}</p>
                <p className="mt-0.5 font-medium leading-snug">{card}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="h-1 flex-1 rounded-full bg-wash/10">
                    <span className="block h-full rounded-full" style={{ width: `${[30, 65, 100][ci]}%`, background: c }} />
                  </span>
                </div>
              </div>
            ))}
            <span className="flex items-center gap-1 px-1 text-[10.5px] text-ink-3">
              <Plus className="size-3" /> {all.tickup.ticket}
            </span>
          </div>
        ))}
      </div>
    </Window>
  );
}

function Alfred({ color, on, chrome, t: all }: MockProps) {
  const text = all.alfred;
  const days = text.days;
  const events = [
    { d: 0, s: 3, l: 2 },
    { d: 1, s: 2, l: 2 },
    { d: 2, s: 0, l: 1 },
    { d: 3, s: 2, l: 3 },
    { d: 4, s: 1, l: 1 },
  ].map((e, i) => ({ ...e, t: text.events[i] }));
  return (
    <Window title={text.title} color={color} on={on} chrome={chrome}>
      <div className="flex h-full flex-col p-4">
        <div className="grid grid-cols-5 gap-1.5 text-center text-[10.5px] text-ink-3">
          {days.map((d, i) => (
            <span key={d} className={cn(i === 1 && "text-ink")}>
              {d}{" "}
              <span className={cn("ml-0.5 inline-flex size-5 items-center justify-center rounded-full", i === 1 && "text-black")} style={i === 1 ? { background: color } : undefined}>
                {16 + i}
              </span>
            </span>
          ))}
        </div>
        <div className="relative mt-2 grid flex-1 grid-cols-5 gap-1.5">
          {days.map((d, di) => (
            <div key={d} className="relative rounded-lg bg-wash/[0.025]">
              {events
                .filter((e) => e.d === di)
                .map((e) => (
                  <div
                    key={e.t}
                    className="msg absolute inset-x-1 rounded-md border-l-2 p-1.5 text-[10px] leading-tight"
                    style={{
                      top: `${e.s * 18 + 4}%`,
                      height: `${e.l * 17}%`,
                      borderColor: color,
                      background: soft(color, 22),
                      animationDelay: `${200 + di * 180}ms`,
                    }}
                  >
                    {e.t}
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div className="msg absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-[color:var(--edge-12)] bg-raised px-3 py-2 shadow-2xl" style={{ animationDelay: "1500ms" }}>
          <CheckCircle2 className="size-4" style={{ color }} />
          <span>
            <span className="block font-medium">{text.confirmed}</span>
            <span className="text-[10.5px] text-ink-3">{text.confirmedWhen}</span>
          </span>
        </div>
      </div>
    </Window>
  );
}

function Metricove({ color, on, chrome, t: all }: MockProps) {
  const t = all.metricove;
  const nets = ["in", "IG", "X", "f", "▶"];
  return (
    <Window title={t.title} color={color} on={on} chrome={chrome}>
      <div className="grid h-full grid-cols-[1fr_1.1fr] gap-3 p-4">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="grid grid-cols-7 content-start gap-1 text-center text-[9.5px] text-ink-3">
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} className="relative flex aspect-square items-center justify-center rounded-md bg-wash/[0.03]">
                {i + 1}
                {[2, 5, 9, 12, 16, 19, 23, 26].includes(i) && <span className="absolute bottom-1 size-1 rounded-full" style={{ background: color }} />}
              </span>
            ))}
          </div>
          <div className="min-h-0 overflow-hidden">
            <p className="text-[10px] uppercase tracking-wider text-ink-3">{t.week}</p>
            {t.posts.map((p, i) => ({ ...p, n: ["in", "IG", "▶"][i] })).map((p, i) => (
              <div key={p.d} className="msg mt-2 flex items-center gap-2.5 rounded-lg bg-wash/[0.03] px-2.5 py-2" style={{ animationDelay: `${500 + i * 150}ms` }}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-wash/[0.06] text-[9.5px] font-bold">{p.n}</span>
                <span className="min-w-0 flex-1 truncate">{p.t}</span>
                <span className="tabular shrink-0 text-[10px] text-ink-3">{p.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="msg flex flex-col rounded-xl border border-[color:var(--edge-10)] bg-raised p-3" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2">
            <span
              className="size-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${color}, #6f42e6)`,
              }}
            />
            <span className="font-medium">Postmelo</span>
            <span className="ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-medium text-[light-dark(#fff,#000)]" style={{ background: color }}>
              {t.posts[0].d}
            </span>
          </div>
          <div
            className="mt-2.5 flex aspect-video items-end rounded-lg p-2"
            style={{
              background: `linear-gradient(135deg, ${soft(color, 55)}, rgba(111,66,230,0.35))`,
            }}
          >
            <span className="font-display text-[18px] leading-none">{t.episode}</span>
          </div>
          <p className="mt-2 text-ink-2">{t.caption}</p>
          <div className="mt-auto flex gap-1.5 pt-2">
            {nets.map((n, i) => (
              <span key={n} className="msg flex size-6 items-center justify-center rounded-md bg-wash/[0.06] text-[9.5px] font-bold" style={{ animationDelay: `${700 + i * 120}ms` }}>
                {n}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-1 text-[10px] text-ink-3">
              <Eye className="size-3" /> {t.views}
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}

function Nino({ color, on, chrome, t: all }: MockProps) {
  const t = all.nino;
  return (
    <Window title={t.title} color={color} on={on} chrome={chrome}>
      <div className="grid h-full grid-cols-[1.5fr_1fr] gap-3 p-4">
        <div className="flex flex-col gap-2">
          <Shot hue={210} className="flex-1 rounded-xl">
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-[#f6f4ef]">
              <span className="rec size-2 rounded-full bg-[#ff3b30]" /> REC 00:42:18
            </span>
            <span className="absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-semibold text-white" style={{ background: color }}>
              {t.program}
            </span>
            <span className="absolute bottom-2.5 left-2.5 text-[10px] text-white/75">{t.shot}</span>
          </Shot>
          <div className="grid grid-cols-3 gap-2">
            {[210, 30, 290].map((h, i) => (
              <Shot key={h} hue={h} className={cn("aspect-video rounded-md", i === 0 && "ring-2")} style={{ ["--tw-ring-color" as string]: color }}>
                <span className="absolute bottom-1 left-1 flex items-center text-[9px] text-white/75">
                  <Camera className="mr-1 size-2.5" /> CAM {i + 1}
                </span>
              </Shot>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider text-ink-3">{t.mics}</p>
          <div className="flex flex-1 items-end justify-between gap-1.5 rounded-xl bg-wash/[0.03] p-3">
            {[0, 1, 2, 3].map((m) => (
              <div key={m} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <div className="relative w-full flex-1 overflow-hidden rounded bg-wash/[0.05]">
                  <span
                    className="vu absolute inset-x-0 bottom-0 h-full rounded"
                    style={{
                      background: `linear-gradient(to top, #28c840, #febc2e 75%, ${color})`,
                      animationDelay: `${m * -0.23}s`,
                      animationDuration: `${0.7 + m * 0.15}s`,
                    }}
                  />
                </div>
                <Mic className="size-3 text-ink-3" />
              </div>
            ))}
          </div>
          <button className="flex items-center justify-center gap-1.5 rounded-lg py-2 font-medium text-white" style={{ background: color }}>
            <Radio className="size-3.5" /> {t.live}
          </button>
        </div>
      </div>
    </Window>
  );
}

function Maya({ color, on, chrome, t: all }: MockProps) {
  const t = all.maya;
  const current = t.sceneList[1];
  return (
    <Window title={t.title} color={color} on={on} chrome={chrome}>
      <div className="grid h-full grid-cols-[110px_1fr] gap-3 p-4 max-sm:grid-cols-1">
        <div className="flex flex-col gap-1.5 max-sm:hidden">
          <p className="text-[10px] uppercase tracking-wider text-ink-3">{t.scenes}</p>
          {t.sceneList.map((s) => (
            <span key={s} className={cn("rounded-md px-2 py-1", s === current ? "text-ink" : "text-ink-3")} style={s === current ? { background: soft(color, 25) } : undefined}>
              {s}
            </span>
          ))}
          <p className="mt-2 text-[10px] uppercase tracking-wider text-ink-3">{t.sources}</p>
          {[MonitorPlay, Camera, ImageIcon, FileText].map((Icon, i) => [Icon, t.sourceList[i]]).map(([Icon, n]) => {
            const I = Icon as typeof Camera;
            return (
              <span key={n as string} className="flex items-center gap-1.5 px-2 text-ink-3">
                <I className="size-3" /> {n as string}
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div
            className="relative flex-1 overflow-hidden rounded-xl bg-[#121214]"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 30%, ${soft(color, 35)}, transparent 60%)`,
            }}
          >
            <Shot hue={290} className="absolute left-[8%] top-[14%] h-[62%] w-[55%] rounded-lg border border-white/10" />
            <Shot hue={30} className="absolute bottom-[12%] right-[8%] h-[40%] w-[30%] rounded-lg border-2" style={{ borderColor: color }} />
            <div className="absolute bottom-[10%] left-[8%] rounded-md bg-black/70 px-2 py-1 text-[10px] text-[#f6f4ef]">
              <span className="font-semibold">Antoine Q.</span> · Postmelo
            </div>
            <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold text-white" style={{ background: color }}>
              <span className="rec size-1.5 rounded-full bg-white" /> LIVE · SRT
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-wash/[0.03] px-3 py-2">
            <span className="text-[10px] text-ink-3">{t.bitrate}</span>
            <svg viewBox="0 0 200 30" className="h-6 flex-1" aria-hidden>
              <polyline className="graph" fill="none" stroke={color} strokeWidth="2" points="0,22 20,18 40,20 60,12 80,15 100,8 120,11 140,6 160,9 180,5 200,7" />
            </svg>
            <span className="tabular text-[10px]">{t.rate}</span>
          </div>
        </div>
      </div>
    </Window>
  );
}

function Generic({ color, on, chrome, name }: MockProps & { name: string }) {
  return (
    <Window title={name} color={color} on={on} chrome={chrome}>
      <div className="flex h-full items-center justify-center">
        <Sparkles className="size-10" style={{ color }} />
      </div>
    </Window>
  );
}

const MOCKS: Record<string, (p: MockProps) => React.ReactElement> = {
  lamio: Lamio,
  cairn: Cairn,
  tickup: TickUp,
  alfred: Alfred,
  metricove: Metricove,
  nino: Nino,
  maya: Maya,
};

/** One app's interface. With `chrome` (the default) it has its own window and title bar; without, it is drawn bare. */
export function AppMock({ id, name, color, on, chrome = true, locale = "fr" }: { id: string; name: string; color: string; on: boolean; chrome?: boolean; locale?: Locale }) {
  const Mock = MOCKS[id];
  const c = color || "var(--ink)";
  const t = M[locale];
  return Mock ? <Mock color={c} on={on} chrome={chrome} t={t} /> : <Generic color={c} on={on} chrome={chrome} name={name} t={t} />;
}
