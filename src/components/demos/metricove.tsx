"use client";

import { CalendarClock, CheckCircle2, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, typing, type Step } from "./shell";

const NETS = [
  { id: "in", label: "LinkedIn", short: "in" },
  { id: "ig", label: "Instagram", short: "IG" },
  { id: "x", label: "X", short: "X" },
  { id: "fb", label: "Facebook", short: "f" },
  { id: "yt", label: "YouTube", short: "▶" },
] as const;
type Net = (typeof NETS)[number]["id"];
const BACKGROUNDS = [
  (c: string) => `linear-gradient(135deg, color-mix(in oklab, ${c} 55%, transparent), rgba(111,66,230,0.35))`,
  () => "linear-gradient(160deg, oklch(0.45 0.08 210), oklch(0.2 0.03 260))",
  (c: string) => `linear-gradient(135deg, #181715, color-mix(in oklab, ${c} 40%, #181715))`,
];

/** What the composer says, in each language. */
const T = {
  fr: {
    visuals: ["Épisode 12", "Coulisses", "« On a tout testé »"],
    times: ["Jeu 9:00", "Ven 12:30", "Sam 18:00"],
    ai: "L'épisode 12 est en ligne 🎙️ On y parle d'outils, d'équipe et de vidéo, avec une invitée qui a tout testé. Lien en bio.",
    typed: "Coulisses du tournage, demain 18 h 🎬",
    scheduled: (n: number, time: string) => `Programmé sur ${n} compte${n > 1 ? "s" : ""} · ${time}`,
    empty: "Écris ton post, ou laisse l'IA le rédiger avec ta fiche de marque.",
    title: "Metricove · Nouveau post",
    hint: "Écris un post, choisis les réseaux et programme-le",
    placeholder: "Qu'as-tu à partager ?",
    label: "Texte du post",
    write: "Rédiger avec l'IA",
    visual: "Visuel",
    on: "Publier sur",
    when: "Quand",
    schedule: "Programmer",
    week: ["L", "M", "M", "J", "V", "S", "D"],
  },
  en: {
    visuals: ["Episode 12", "Behind the scenes", "“We tried it all”"],
    times: ["Thu 9:00", "Fri 12:30", "Sat 18:00"],
    ai: "Episode 12 is out 🎙️ We talk tools, teams and video, with a guest who has tried it all. Link in bio.",
    typed: "Behind the shoot, tomorrow 6 pm 🎬",
    scheduled: (n: number, time: string) => `Scheduled on ${n} account${n > 1 ? "s" : ""} · ${time}`,
    empty: "Write your post, or let the AI draft it with your brand profile.",
    title: "Metricove · New post",
    hint: "Write a post, pick the networks and schedule it",
    placeholder: "What do you want to share?",
    label: "Post text",
    write: "Write with AI",
    visual: "Visual",
    on: "Publish on",
    when: "When",
    schedule: "Schedule",
    week: ["M", "T", "W", "T", "F", "S", "S"],
  },
  de: {
    visuals: ["Folge 12", "Hinter den Kulissen", "«Wir haben alles getestet»"],
    times: ["Do 9:00", "Fr 12:30", "Sa 18:00"],
    ai: "Folge 12 ist online 🎙️ Wir reden über Tools, Teams und Video, mit einem Gast, der alles getestet hat. Link in der Bio.",
    typed: "Hinter den Kulissen des Drehs, morgen 18 Uhr 🎬",
    scheduled: (n: number, time: string) => `Auf ${n} ${n > 1 ? "Konten" : "Konto"} geplant · ${time}`,
    empty: "Schreib deinen Post oder lass ihn von der KI mit deinem Markenprofil verfassen.",
    title: "Metricove · Neuer Post",
    hint: "Schreib einen Post, wähl die Netzwerke und plane ihn ein",
    placeholder: "Was möchtest du teilen?",
    label: "Text des Posts",
    write: "Mit KI schreiben",
    visual: "Visual",
    on: "Posten auf",
    when: "Wann",
    schedule: "Einplanen",
    week: ["M", "D", "M", "D", "F", "S", "S"],
  },
} satisfies Record<Locale, unknown>;
const START_POSTS = [
  { day: 1, net: "ig" as Net },
  { day: 4, net: "in" as Net },
];

/** Metricove: write a post (or let the AI do it), pick the accounts and the time, and schedule it. */
export function MetricoveDemo({ color, locale = "fr" }: { color: string; locale?: Locale }) {
  const tx = T[locale];
  const TIMES = tx.times;
  const AI_TEXT = tx.ai;
  const VISUALS = tx.visuals.map((title, i) => ({ title, bg: BACKGROUNDS[i] }));
  const [text, setText] = useState("");
  const [nets, setNets] = useState<Set<Net>>(new Set(["in"]));
  const [time, setTime] = useState(TIMES[0]);
  const [visual, setVisual] = useState(0);
  const [preview, setPreview] = useState<Net>("in");
  const [posts, setPosts] = useState(START_POSTS);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const writing = useRef<ReturnType<typeof setInterval>>(undefined);

  // The script's moves were made at an earlier render: they read the post from here.
  const live = useRef({ text, nets, time });
  live.current = { text, nets, time };

  const toggle = (n: Net) => {
    setNets((s) => {
      const next = new Set(s);
      if (next.has(n) && next.size > 1) next.delete(n);
      else next.add(n);
      return next;
    });
    setPreview(n);
  };
  const generate = () => {
    clearInterval(writing.current);
    let i = 0;
    writing.current = setInterval(() => {
      i += 3;
      setText(AI_TEXT.slice(0, i));
      if (i >= AI_TEXT.length) clearInterval(writing.current);
    }, 30);
  };
  const schedule = () => {
    const { text, nets, time } = live.current;
    if (!text.trim()) return;
    const day = TIMES.indexOf(time) + 3;
    setPosts((ps) => [...ps, ...[...nets].map((net) => ({ day, net }))]);
    setToast(tx.scheduled(nets.size, time));
    setText("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  };
  const reset = () => {
    clearTimeout(timer.current);
    clearInterval(writing.current);
    setText("");
    setNets(new Set(["in"]));
    setTime(TIMES[0]);
    setVisual(0);
    setPreview("in");
    setPosts(START_POSTS);
    setToast(null);
  };
  const script = (): Step[] => [
    { at: "ai", do: generate, wait: 1700 },
    { at: "visual-1", do: () => setVisual(1), wait: 700 },
    { at: "net-ig", do: () => toggle("ig"), wait: 900 },
    { at: "net-yt", do: () => toggle("yt"), wait: 900 },
    { at: "time-1", do: () => setTime(TIMES[1]), wait: 600 },
    { at: "schedule", do: schedule, wait: 2400 },
    { at: "text", wait: 200 },
    ...typing(tx.typed, setText, 40),
    { at: "net-x", do: () => toggle("x"), wait: 600 },
    { at: "time-2", do: () => setTime(TIMES[2]), wait: 500 },
    { at: "schedule", do: schedule, wait: 2600 },
  ];

  const net = NETS.find((n) => n.id === preview)!;
  const shown = text || tx.empty;
  return (
    <DemoShell title={tx.title} color={color} locale={locale} hint={tx.hint} script={script} reset={reset}>
      <div className="grid h-full grid-cols-1 gap-3 p-3 sm:grid-cols-[1.05fr_1fr] sm:p-4">
        {/* Composer */}
        <div className="flex min-h-0 flex-col gap-2.5">
          <div className="flex flex-col rounded-xl border border-[color:var(--edge-10)] bg-[var(--hub-pane)] focus-within:border-[color:var(--edge-14)]">
            <textarea
              data-demo="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={tx.placeholder}
              aria-label={tx.label}
              maxLength={280}
              rows={4}
              className="resize-none bg-transparent p-3 text-[12.5px] leading-relaxed text-ink outline-none placeholder:text-ink-3"
            />
            <div className="flex items-center gap-2 border-t border-[color:var(--edge-07)] px-2 py-1.5">
              <button type="button" data-demo="ai" onClick={generate} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-[var(--glass-05)]" style={{ color }}>
                <Sparkles className="size-3.5" /> {tx.write}
              </button>
              <span className="tabular ml-auto text-[10px] text-ink-3">{text.length}/280</span>
            </div>
          </div>
          <div className="max-sm:hidden">
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-3">{tx.visual}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {VISUALS.map((v, i) => (
                <button key={v.title} type="button" data-demo={`visual-${i}`} onClick={() => setVisual(i)} aria-pressed={visual === i} className={cn("flex aspect-[16/10] items-end overflow-hidden rounded-lg p-1.5 text-left ring-2 transition-[box-shadow]", visual === i ? "" : "ring-transparent")} style={{ background: v.bg(color), ["--tw-ring-color" as string]: color }}>
                  <span className="font-display text-[13px] leading-none text-[#f6f4ef]">{v.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-3">{tx.on}</p>
            <div className="flex flex-wrap gap-1.5">
              {NETS.map((n) => {
                const on = nets.has(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    data-demo={`net-${n.id}`}
                    onClick={() => toggle(n.id)}
                    aria-pressed={on}
                    title={n.label}
                    className={cn("flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[11px] font-bold transition-all", !on && "text-ink-3 hover:text-ink")}
                    style={on ? { background: color, borderColor: color, color: onColor(color) } : { borderColor: "var(--edge-10)" }}
                  >
                    {n.short}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-3">{tx.when}</p>
            <div className="flex gap-1.5">
              {TIMES.map((t, i) => (
                <button key={t} type="button" data-demo={`time-${i}`} onClick={() => setTime(t)} className={cn("tabular flex-1 rounded-lg border py-1.5 text-[11px] transition-colors", t !== time && "text-ink-3")} style={t === time ? { borderColor: color, background: soft(color, 14), color: "var(--ink)" } : { borderColor: "var(--edge-10)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button type="button" data-demo="schedule" disabled={!text.trim()} onClick={schedule} className="press mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-medium transition-opacity disabled:opacity-40" style={{ background: color, color: onColor(color) }}>
            <CalendarClock className="size-4" /> {tx.schedule}
          </button>
        </div>

        {/* Preview and the week */}
        <div className="hidden min-h-0 flex-col gap-2.5 sm:flex">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[color:var(--edge-10)] bg-raised p-3">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full" style={{ background: `linear-gradient(135deg, ${color}, #6f42e6)` }} />
              <span className="font-medium">Postmelo</span>
              <span className="ml-auto rounded-md bg-wash/[0.06] px-1.5 py-0.5 text-[10px] font-bold">{net.label}</span>
            </div>
            <div key={visual} className={cn("demo-pop mt-2.5 flex items-end rounded-lg p-2.5", preview === "ig" ? "aspect-[4/3]" : "aspect-video")} style={{ background: VISUALS[visual].bg(color) }}>
              <span className="font-display text-[20px] leading-none text-[#f6f4ef]">{VISUALS[visual].title}</span>
            </div>
            <p className={cn("mt-2 line-clamp-3 leading-snug", text ? "text-ink-2" : "text-ink-3")}>{shown}</p>
            <div className="mt-auto flex items-center gap-3 pt-2 text-[10px] text-ink-3">
              <Heart className="size-3" /> 0 <MessageCircle className="size-3" /> 0<span className="ml-auto tabular">{time}</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9.5px] text-ink-3">
            {tx.week.map((d, i) => {
              const day = posts.filter((p) => p.day === i);
              return (
                <div key={i} className="flex flex-col items-center gap-1 rounded-md bg-wash/[0.03] py-1.5">
                  {d}
                  <span className="flex min-h-[18px] flex-wrap justify-center gap-0.5 px-0.5">
                    {day.map((p, n) => (
                      <span key={n} className="demo-pop size-1.5 rounded-full" style={{ background: color }} title={p.net} />
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && (
        <div key={toast} className="demo-pop absolute right-4 top-4 z-30 flex items-center gap-2 rounded-xl border border-[color:var(--edge-12)] bg-raised px-3 py-2 shadow-2xl">
          <CheckCircle2 className="size-4 shrink-0" style={{ color }} />
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </DemoShell>
  );
}
