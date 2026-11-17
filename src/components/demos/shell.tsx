"use client";

import { Hand, MousePointerClick, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/components/landing/use-scroll";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * One move of a demo playing by itself. With `at`, a cursor first glides to the element carrying
 * `data-demo="<at>"` and clicks it; then `do` runs and the demo waits `wait` ms before the next move.
 */
export type Step = { at?: string; do?: () => void; wait?: number };

/** The moves that type `text` one character at a time, `onChar` receiving the text typed so far. */
export function typing(text: string, onChar: (sofar: string) => void, speed = 38): Step[] {
  return Array.from(text, (_, i) => ({ do: () => onChar(text.slice(0, i + 1)), wait: speed }));
}

/** The words of the window around every demo. */
const T = {
  fr: { playing: "Démo en cours · clique pour prendre la main", tap: "Touche pour essayer", yours: "À toi", replay: "Rejouer la démo" },
  en: { playing: "Demo playing · click to take over", tap: "Tap to try", yours: "Your turn", replay: "Replay the demo" },
  de: { playing: "Demo läuft · klick, um zu übernehmen", tap: "Tippe, um es zu testen", yours: "Du bist dran", replay: "Demo neu starten" },
} satisfies Record<Locale, Record<string, string>>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The window of a live demo. While nobody touches it, it plays its script in a loop, with a cursor
 * showing what is clicked, and only while it is on screen. The first real click or key press inside
 * hands it over: the script stops and the visitor uses the demo for real. « Rejouer » starts over.
 */
export function DemoShell({
  title,
  color,
  locale = "fr",
  hint,
  script,
  reset,
  onTakeOver,
  className,
  children,
}: {
  title: string;
  color: string;
  locale?: Locale;
  /** What to try, shown once the visitor has the demo in hand. */
  hint: string;
  script: () => Step[];
  /** Back to the first state, before each loop of the script. */
  reset: () => void;
  /** Clears what the script may have left half done (someone typing…) when the visitor takes over. */
  onTakeOver?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const t = T[locale];
  const stage = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"auto" | "user">("auto");
  const [visible, setVisible] = useState(false);
  const [round, setRound] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0, shown: false, clicks: 0 });
  // The latest functions, read by the loop without restarting it.
  const fns = useRef({ script, reset, onTakeOver });
  fns.current = { script, reset, onTakeOver };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "auto" || !visible) return;
    // Without motion, the demo waits for the visitor.
    if (prefersReduced()) {
      setMode("user");
      return;
    }
    let stop = false;
    const point = (at: string) => {
      const box = stage.current;
      const el = box?.querySelector<HTMLElement>(`[data-demo="${at}"]`);
      if (!box || !el) return false;
      const r = el.getBoundingClientRect();
      if (!r.width) return false; // hidden at this size
      const b = box.getBoundingClientRect();
      setCursor((c) => ({ ...c, shown: true, x: r.left - b.left + Math.min(r.width / 2, 40), y: r.top - b.top + r.height / 2 }));
      return true;
    };
    (async () => {
      while (!stop) {
        fns.current.reset();
        await sleep(900);
        for (const s of fns.current.script()) {
          if (stop) return;
          if (s.at && point(s.at)) {
            await sleep(700);
            if (stop) return;
            setCursor((c) => ({ ...c, clicks: c.clicks + 1 }));
            await sleep(160);
          }
          if (stop) return;
          s.do?.();
          await sleep(s.wait ?? 450);
        }
        setCursor((c) => ({ ...c, shown: false }));
        await sleep(2800);
      }
    })();
    return () => {
      stop = true;
    };
  }, [mode, visible, round]);

  const takeOver = useCallback(
    (e: React.SyntheticEvent) => {
      if (!e.nativeEvent.isTrusted || mode === "user") return;
      if ((e.target as HTMLElement).closest("[data-replay]")) return;
      setMode("user");
      setCursor((c) => ({ ...c, shown: false }));
      fns.current.onTakeOver?.();
    },
    [mode],
  );

  const replay = () => {
    setMode("auto");
    setRound((r) => r + 1);
  };

  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-[color:var(--edge-12)] bg-mock/95 text-[12px] text-ink backdrop-blur-xl", className)}
      style={{ boxShadow: `0 60px 120px -50px light-dark(color-mix(in oklab, ${color} 55%, transparent), ${color}), 0 30px 60px -30px var(--deep-2), inset 0 1px 0 rgba(255,255,255,0.06)` }}
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[color:var(--edge-07)] pl-4 pr-2">
        <span className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 min-w-0 truncate text-[11.5px] font-medium text-ink-3">{title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {mode === "auto" ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--glass-05)] px-2.5 py-1 text-[10.5px] text-ink-2">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: color }} />
                <span className="relative size-1.5 rounded-full" style={{ background: color }} />
              </span>
              <span className="max-sm:hidden">{t.playing}</span>
              <span className="sm:hidden">{t.tap}</span>
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color: `light-dark(color-mix(in oklab, ${color} 75%, black), color-mix(in oklab, ${color} 70%, white))` }}>
                <Hand className="size-3" /> {t.yours}
              </span>
              <button type="button" data-replay onClick={replay} title={t.replay} className="press flex size-7 items-center justify-center rounded-full text-ink-3 hover:bg-[var(--glass-05)] hover:text-ink">
                <RotateCcw className="size-3.5" />
                <span className="sr-only">{t.replay}</span>
              </button>
            </>
          )}
        </span>
      </div>

      <div ref={stage} className="relative min-h-0 flex-1">
        {children}

        {/* The cursor of the script */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-50 transition-[transform,opacity] duration-700"
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)`, opacity: cursor.shown && mode === "auto" ? 1 : 0, transitionTimingFunction: "var(--ease-out)" }}
        >
          {cursor.clicks > 0 && <span key={cursor.clicks} className="demo-click absolute -left-4 -top-4 size-8 rounded-full" style={{ background: `color-mix(in oklab, ${color} 45%, transparent)` }} />}
          <svg viewBox="0 0 24 24" className="relative size-[22px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
            <path d="M5 3l14 8.2-6.3 1.4L9.6 19z" style={{ fill: "var(--ink)", stroke: "var(--bg)" }} strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* What to try, once it is the visitor's turn */}
      <p className={cn("pointer-events-none absolute inset-x-0 bottom-3 z-40 mx-auto flex w-max max-w-[calc(100%-24px)] items-center gap-1.5 rounded-full border border-[color:var(--edge-12)] bg-raised/95 px-3 py-1.5 text-[11px] text-ink-2 shadow-lg backdrop-blur transition-all duration-500", mode === "user" ? "demo-hint" : "translate-y-3 opacity-0")}>
        <MousePointerClick className="size-3.5 shrink-0" style={{ color }} />
        <span className="truncate">{hint}</span>
      </p>
    </div>
  );
}

/** Text on a fill of the app colour: white, or the paper of the theme for an app drawn in ink (TickUp). */
export const onColor = (c: string) => (c.startsWith("var(") ? "var(--bg)" : "#fff");
