"use client";

import { Camera, Mic, Radio, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Shot, soft } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, type Step } from "./shell";

const HUES = [210, 30, 290];

/** What the control room says, in each language. Names of people stay as they are. */
const T = {
  fr: {
    cams: [{ name: "Plan large", who: "Tout le monde" }, { name: "CAM 2", who: "Léa" }, { name: "CAM 3", who: "Marc" }],
    mics: ["Léa", "Marc", "Invitée"],
    title: "Nino Studio · Régie",
    hint: "Coupe sur une caméra, lance l'enregistrement ou le direct",
    ready: "Prêt",
    onAir: "EN DIRECT",
    program: "PROGRAMME",
    auto: "automatique",
    cutTo: (name: string) => `Couper sur ${name}`,
    wide: "LARGE",
    micsLabel: "Micros",
    autoDirect: "Réalisation auto",
    stop: "Arrêter",
    record: "Enregistrer",
    stopLive: "En direct · arrêter",
    goLive: "Passer en direct",
  },
  en: {
    cams: [{ name: "Wide shot", who: "Everyone" }, { name: "CAM 2", who: "Léa" }, { name: "CAM 3", who: "Marc" }],
    mics: ["Léa", "Marc", "Guest"],
    title: "Nino Studio · Control room",
    hint: "Cut to a camera, start recording or go live",
    ready: "Ready",
    onAir: "LIVE",
    program: "PROGRAM",
    auto: "automatic",
    cutTo: (name: string) => `Cut to ${name}`,
    wide: "WIDE",
    micsLabel: "Mics",
    autoDirect: "Auto-directing",
    stop: "Stop",
    record: "Record",
    stopLive: "Live · stop",
    goLive: "Go live",
  },
  de: {
    cams: [{ name: "Totale", who: "Alle" }, { name: "CAM 2", who: "Léa" }, { name: "CAM 3", who: "Marc" }],
    mics: ["Léa", "Marc", "Gast"],
    title: "Nino Studio · Regie",
    hint: "Schneide auf eine Kamera, starte die Aufnahme oder geh live",
    ready: "Bereit",
    onAir: "LIVE",
    program: "PROGRAMM",
    auto: "automatisch",
    cutTo: (name: string) => `Auf ${name} schneiden`,
    wide: "TOTALE",
    micsLabel: "Mikrofone",
    autoDirect: "Auto-Regie",
    stop: "Stoppen",
    record: "Aufnehmen",
    stopLive: "Live · stoppen",
    goLive: "Live gehen",
  },
} satisfies Record<Locale, unknown>;
// Who speaks puts its camera on air: the guest has no camera of her own, the wide shot takes her.
const CAM_OF_SPEAKER = [1, 2, 0];
const clock = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Nino Studio: the control room. Auto mode cuts to whoever speaks; click a camera to cut yourself. */
export function NinoDemo({ color, locale = "fr" }: { color: string; locale?: Locale }) {
  const t = T[locale];
  const CAMS = t.cams.map((c, i) => ({ ...c, hue: HUES[i] }));
  const MICS = t.mics;
  const [program, setProgram] = useState(0);
  const [auto, setAuto] = useState(true);
  const [speaker, setSpeaker] = useState(0);
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [live, setLive] = useState(false);
  const [cut, setCut] = useState(0);
  const autoRef = useRef(auto);
  autoRef.current = auto;

  // The conversation goes round the table.
  useEffect(() => {
    const id = setInterval(() => setSpeaker((s) => (s + 1 + Math.floor(Math.random() * 2)) % 3), 2600);
    return () => clearInterval(id);
  }, []);
  // In auto mode, the director follows the voice.
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      if (!autoRef.current) return;
      setProgram(CAM_OF_SPEAKER[speaker]);
      setCut((c) => c + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [speaker, auto]);
  useEffect(() => {
    if (!rec) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [rec]);

  const take = (i: number) => {
    setAuto(false);
    setProgram(i);
    setCut((c) => c + 1);
  };
  const reset = () => {
    setProgram(0);
    setAuto(true);
    setRec(false);
    setSecs(0);
    setLive(false);
  };
  const script = (): Step[] => [
    { wait: 1800 },
    { at: "rec", do: () => setRec(true), wait: 3200 },
    { at: "cam-2", do: () => take(2), wait: 2200 },
    { at: "cam-1", do: () => take(1), wait: 2000 },
    { at: "auto", do: () => setAuto(true), wait: 2400 },
    { at: "live", do: () => setLive(true), wait: 4000 },
  ];

  const cam = CAMS[program];
  return (
    <DemoShell title={t.title} color={color} locale={locale} hint={t.hint} script={script} reset={reset}>
      <div className="grid h-full grid-cols-1 gap-3 p-3 sm:grid-cols-[1.55fr_1fr] sm:p-4">
        <div className="flex min-h-0 flex-col gap-2">
          {/* Programme */}
          <Shot hue={cam.hue} className="aspect-video rounded-xl transition-[background] duration-300 sm:aspect-auto sm:min-h-0 sm:flex-1">
            <span key={cut} aria-hidden className="demo-flash absolute inset-0 bg-black" />
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-[#f6f4ef]">
              <span className={cn("size-2 rounded-full", rec ? "rec bg-[#ff3b30]" : "bg-white/40")} /> {rec ? `REC ${clock(secs)}` : t.ready}
            </span>
            <span className="absolute right-2.5 top-2.5 flex gap-1">
              {live && <span className="demo-pop rounded-md bg-[#ff3b30] px-2 py-1 text-[10px] font-semibold text-white">{t.onAir}</span>}
              <span className="rounded-md px-2 py-1 text-[10px] font-semibold" style={{ background: color, color: onColor(color) }}>
                {t.program}
              </span>
            </span>
            <span className="absolute bottom-2.5 left-2.5 text-[10.5px] text-white/80">
              {cam.name} · {cam.who} {auto && <span className="text-white/60">· {t.auto}</span>}
            </span>
          </Shot>
          <div className="grid grid-cols-3 gap-2">
            {CAMS.map((c, i) => (
              <button key={c.hue} type="button" data-demo={`cam-${i}`} onClick={() => take(i)} className="group text-left" aria-label={t.cutTo(c.name)}>
                <Shot hue={c.hue} className={cn("aspect-video rounded-md ring-2 transition-[box-shadow]", i === program ? "" : "ring-transparent group-hover:ring-white/30")} style={i === program ? { ["--tw-ring-color" as string]: color } : undefined}>
                  <span className="absolute bottom-1 left-1 flex items-center text-[9px] text-white/80">
                    <Camera className="mr-1 size-2.5" /> {i === 0 ? t.wide : c.name}
                  </span>
                  {i === program && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#ff3b30]" />}
                </Shot>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2 max-sm:grid max-sm:grid-cols-2">
          <p className="text-[10px] uppercase tracking-wider text-ink-3 max-sm:hidden">{t.micsLabel}</p>
          <div className="flex items-end justify-between gap-2 rounded-xl bg-wash/[0.03] p-3 max-sm:col-span-2 max-sm:h-[96px] sm:min-h-[90px] sm:flex-1">
            {MICS.map((m, i) => (
              <div key={m} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <div className="relative w-full flex-1 overflow-hidden rounded bg-wash/[0.05]">
                  <span
                    className="vu absolute inset-x-0 bottom-0 h-full rounded transition-opacity duration-500"
                    style={{ background: `linear-gradient(to top, #28c840, #febc2e 75%, ${color})`, animationDelay: `${i * -0.23}s`, animationDuration: `${0.6 + i * 0.15}s`, opacity: i === speaker ? 1 : 0.18 }}
                  />
                </div>
                <span className={cn("flex items-center gap-0.5 text-[9.5px] transition-colors", i === speaker ? "text-ink" : "text-ink-3")}>
                  <Mic className="size-2.5" /> {m}
                </span>
              </div>
            ))}
          </div>
          <button type="button" data-demo="auto" onClick={() => setAuto((a) => !a)} aria-pressed={auto} className="flex items-center gap-2 rounded-lg border border-[color:var(--edge-10)] px-2.5 py-2 text-left">
            <Wand2 className="size-3.5 shrink-0" style={{ color }} />
            <span className="flex-1">{t.autoDirect}</span>
            <span className="relative h-4 w-7 rounded-full transition-colors" style={{ background: auto ? color : "var(--edge-14)" }}>
              <span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform", auto ? "translate-x-3.5" : "translate-x-0.5")} />
            </span>
          </button>
          <button type="button" data-demo="rec" onClick={() => setRec((r) => !r)} className="flex items-center justify-center gap-1.5 rounded-lg border py-2 font-medium transition-colors" style={rec ? { borderColor: "#ff3b30", color: "var(--rec-text)", background: "rgba(255,59,48,0.1)" } : { borderColor: "var(--edge-10)" }}>
            <span className={cn("size-2.5 rounded-full bg-[#ff3b30]", rec && "rec")} /> {rec ? t.stop : t.record}
          </button>
          <button type="button" data-demo="live" onClick={() => setLive((l) => !l)} className="press flex items-center justify-center gap-1.5 rounded-lg py-2 font-medium max-sm:col-span-2" style={live ? { background: "#ff3b30", color: "#fff" } : { background: soft(color, 18), color: "var(--ink)" }}>
            <Radio className="size-3.5" /> {live ? t.stopLive : t.goLive}
          </button>
        </div>
      </div>
    </DemoShell>
  );
}
