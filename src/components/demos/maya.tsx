"use client";

import { ArrowRightLeft, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Shot, soft } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, type Step } from "./shell";

/** What the studio says, in each language. Names of people stay as they are. */
const T = {
  fr: {
    scenes: ["Intro", "Plateau", "Invitée", "Écran", "Fin"],
    show: "Les Coulisses",
    episode: "Épisode 12",
    guest: "Sofia R., invitée",
    thanks: "Merci !",
    subscribe: "Abonne-toi pour l'épisode 13",
    title: "Maya Studio · Mode studio",
    hint: "Choisis une scène, puis envoie-la à l'antenne",
    preview: "Aperçu",
    program: "Programme",
    toProgram: "Transition vers le programme",
    scenesLabel: "Scènes",
    stop: "Arrêter",
    stream: "Diffuser · SRT",
    offAir: "Hors antenne",
    rate: (n: number) => `${n.toFixed(1).replace(".", ",")} Mb/s`,
  },
  en: {
    scenes: ["Intro", "Stage", "Guest", "Screen", "Outro"],
    show: "Behind the Scenes",
    episode: "Episode 12",
    guest: "Sofia R., guest",
    thanks: "Thank you!",
    subscribe: "Subscribe for episode 13",
    title: "Maya Studio · Studio mode",
    hint: "Pick a scene, then send it to air",
    preview: "Preview",
    program: "Program",
    toProgram: "Transition to program",
    scenesLabel: "Scenes",
    stop: "Stop",
    stream: "Stream · SRT",
    offAir: "Off air",
    rate: (n: number) => `${n.toFixed(1)} Mb/s`,
  },
  de: {
    scenes: ["Intro", "Set", "Gast", "Bildschirm", "Ende"],
    show: "Hinter den Kulissen",
    episode: "Folge 12",
    guest: "Sofia R., Gast",
    thanks: "Danke!",
    subscribe: "Abonniere für Folge 13",
    title: "Maya Studio · Studiomodus",
    hint: "Wähl eine Szene und schick sie dann auf Sendung",
    preview: "Vorschau",
    program: "Programm",
    toProgram: "Übergang zum Programm",
    scenesLabel: "Szenen",
    stop: "Stoppen",
    stream: "Senden · SRT",
    offAir: "Nicht auf Sendung",
    rate: (n: number) => `${n.toFixed(1).replace(".", ",")} Mb/s`,
  },
} satisfies Record<Locale, unknown>;
type Text = (typeof T)["fr"];

/** A camera picture placed in the frame of a scene. */
function Cam({ hue, className, style }: { hue: number; className: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("absolute overflow-hidden", className)} style={style}>
      <Shot hue={hue} className="h-full w-full" />
    </div>
  );
}

/** What a scene puts on screen. */
function Scene({ n, color, thumb, t }: { n: number; color: string; thumb?: boolean; t: Text }) {
  const lower = (name: string) => thumb ? null : (
    <div className="absolute bottom-[9%] left-[6%] rounded bg-black/70 px-1.5 py-0.5 text-[8.5px] text-[#f6f4ef]">
      <span className="font-semibold">{name}</span> · {t.show}
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#121214]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${soft(color, 35)}, transparent 60%)` }}>
      {n === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center text-[#f6f4ef]">
          {!thumb && <p className="text-[8px] uppercase tracking-[0.3em] opacity-70">{t.episode}</p>}
          <p className={cn("font-display italic leading-none", thumb ? "text-[13px]" : "text-[clamp(18px,3vw,28px)]")}>{t.show}</p>
        </div>
      )}
      {n === 1 && (
        <>
          <Cam hue={200} className="left-[5%] top-[12%] h-[66%] w-[44%] rounded-md" />
          <Cam hue={30} className="right-[5%] top-[12%] h-[66%] w-[44%] rounded-md" />
          {lower("Léa & Marc")}
        </>
      )}
      {n === 2 && (
        <>
          <Cam hue={290} className="inset-[8%] rounded-md" />
          <Cam hue={200} className="bottom-[12%] right-[10%] h-[30%] w-[24%] rounded border-2" style={{ borderColor: color }} />
          {lower(t.guest)}
        </>
      )}
      {n === 3 && (
        <>
          <div className="absolute left-[6%] top-[10%] h-[74%] w-[64%] rounded-md bg-[#f4f2ed] p-[3%]">
            <span className="block h-[8%] w-1/2 rounded-sm bg-black/15" />
            <span className="mt-[5%] block h-[30%] rounded-sm" style={{ background: soft(color, 50) }} />
            <span className="mt-[5%] block h-[6%] w-4/5 rounded-sm bg-black/10" />
            <span className="mt-[3%] block h-[6%] w-3/5 rounded-sm bg-black/10" />
          </div>
          <Cam hue={30} className="bottom-[12%] right-[5%] h-[38%] w-[24%] rounded border-2" style={{ borderColor: color }} />
        </>
      )}
      {n === 4 && (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-[#f6f4ef]">
          <p className={cn("font-display leading-none", thumb ? "text-[13px]" : "text-[clamp(18px,3vw,28px)]")}>{t.thanks}</p>
          {!thumb && <p className="text-[8.5px] opacity-70">{t.subscribe}</p>}
        </div>
      )}
    </div>
  );
}

function Monitor({ label, n, color, live, fading, onAir, t }: { label: string; n: number; color: string; live?: boolean; fading?: number | null; onAir?: boolean; t: Text }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
        <span className="size-1.5 rounded-full" style={{ background: onAir ? "#ff3b30" : "#28c840" }} />
        {label}
        <span className="normal-case tracking-normal text-ink-2">· {t.scenes[n]}</span>
      </p>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10">
        <Scene n={n} color={color} t={t} />
        {fading != null && (
          <div className="absolute inset-0 animate-[fade_600ms_ease_both]">
            <Scene n={fading} color={color} t={t} />
          </div>
        )}
        {live && (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: color, color: onColor(color) }}>
            <span className="rec size-1.5 rounded-full bg-white" /> LIVE
          </span>
        )}
      </div>
    </div>
  );
}

/** Maya Studio: studio mode. Pick a scene into the preview, then send it to air with a transition. */
export function MayaDemo({ color, locale = "fr" }: { color: string; locale?: Locale }) {
  const t = T[locale];
  const [preview, setPreview] = useState(1);
  const [program, setProgram] = useState(0);
  const [fading, setFading] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [rate, setRate] = useState<number[]>(() => Array.from({ length: 24 }, (_, i) => 5.6 + Math.sin(i) * 0.4));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const live$ = useRef({ preview, program });
  live$.current = { preview, program };

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setRate((r) => [...r.slice(1), 5.4 + Math.random() * 1.4]), 450);
    return () => clearInterval(id);
  }, [live]);

  const transition = () => {
    const { preview, program } = live$.current;
    if (preview === program) return;
    setFading(preview);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setProgram(preview);
      setPreview(program);
      setFading(null);
    }, 620);
  };
  const reset = () => {
    clearTimeout(timer.current);
    setPreview(1);
    setProgram(0);
    setFading(null);
    setLive(false);
  };
  const script = (): Step[] => [
    { at: "live", do: () => setLive(true), wait: 900 },
    { at: "go", do: transition, wait: 1600 },
    { at: "scene-2", do: () => setPreview(2), wait: 700 },
    { at: "go", do: transition, wait: 1800 },
    { at: "scene-3", do: () => setPreview(3), wait: 700 },
    { at: "go", do: transition, wait: 2000 },
  ];

  const points = rate.map((v, i) => `${(i / (rate.length - 1)) * 200},${30 - ((v - 4.5) / 2.5) * 26}`).join(" ");
  const now = rate[rate.length - 1];
  return (
    <DemoShell title={t.title} color={color} locale={locale} hint={t.hint} script={script} reset={reset}>
      <div className="flex h-full flex-col gap-3 p-3 sm:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <Monitor label={t.preview} n={preview} color={color} t={t} />
          <button type="button" data-demo="go" onClick={transition} disabled={fading !== null} title="Transition" className="press mt-5 flex size-10 flex-col items-center justify-center rounded-full text-[8px] font-semibold sm:size-12" style={{ background: color, color: onColor(color) }}>
            <ArrowRightLeft className="size-4" />
            <span className="sr-only">{t.toProgram}</span>
          </button>
          <Monitor label={t.program} n={program} color={color} live={live} fading={fading} onAir t={t} />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-3">{t.scenesLabel}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {t.scenes.map((s, i) => (
              <button
                key={s}
                type="button"
                data-demo={`scene-${i}`}
                onClick={() => setPreview(i)}
                className={cn("relative overflow-hidden rounded-lg border text-left transition-colors", i === preview ? "" : "border-[color:var(--edge-10)] hover:border-[color:var(--edge-14)]")}
                style={i === preview ? { borderColor: "#28c840" } : i === program ? { borderColor: "#ff3b30" } : undefined}
              >
                <span className="relative block aspect-video">
                  <Scene n={i} color={color} thumb t={t} />
                </span>
                <span className="block truncate px-1.5 py-1 text-[10px]">{s}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto flex items-center gap-3 rounded-lg bg-wash/[0.03] px-3 py-2">
          <button type="button" data-demo="live" onClick={() => setLive((l) => !l)} className="press flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold" style={live ? { background: "#ff3b30", color: "#fff" } : { background: soft(color, 18) }}>
            <Radio className="size-3.5" /> {live ? t.stop : t.stream}
          </button>
          <svg viewBox="0 0 200 30" className="h-6 min-w-0 flex-1" aria-hidden preserveAspectRatio="none">
            <polyline fill="none" stroke={live ? color : "var(--edge-14)"} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="tabular shrink-0 text-[10px] text-ink-2">{live ? t.rate(now) : t.offAir}</span>
        </div>
      </div>
    </DemoShell>
  );
}
