"use client";

import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, type Step } from "./shell";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const FIRST = 9; // 9 h
const HOURS = 8; // 9 h → 17 h
type Ev = { d: number; s: number; l: number; t: string; booked?: boolean };
const START: Ev[] = [
  { d: 0, s: 9.5, l: 2, t: "Tournage" },
  { d: 1, s: 14, l: 1, t: "Point équipe" },
  { d: 2, s: 10, l: 1, t: "Client Rhône" },
  { d: 3, s: 14, l: 2.5, t: "Podcast live" },
  { d: 4, s: 11, l: 1, t: "Revue sprint" },
];
const SLOTS = [9, 10.5, 13.5, 15, 16];
const hh = (h: number) => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;

/** Alfred: the public booking page on one side, the agenda on the other. A booking lands in the week. */
export function AlfredDemo({ color }: { color: string }) {
  const [events, setEvents] = useState(START);
  const [day, setDay] = useState(3);
  const [slot, setSlot] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const free = SLOTS.filter((s) => !events.some((e) => e.d === day && s < e.s + e.l && s + 0.5 > e.s));
  const book = (d = day, s = slot) => {
    if (s === null) return;
    setEvents((es) => [...es, { d, s, l: 0.5, t: "RDV · Léa M.", booked: true }]);
    setSlot(null);
    setToast(`${DAYS[d]} ${hh(s)} · confirmation envoyée à Léa`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  };
  const reset = () => {
    clearTimeout(timer.current);
    setEvents(START);
    setDay(3);
    setSlot(null);
    setToast(null);
  };
  const script = (): Step[] => [
    { at: "day-1", do: () => setDay(1), wait: 700 },
    { at: "slot-10.5", do: () => setSlot(10.5), wait: 700 },
    { at: "book", do: () => book(1, 10.5), wait: 2600 },
    { at: "day-4", do: () => setDay(4), wait: 600 },
    { at: "slot-15", do: () => setSlot(15), wait: 600 },
    { at: "book", do: () => book(4, 15), wait: 2800 },
  ];

  return (
    <DemoShell title="Alfred · Semaine 47" color={color} hint="Choisis un jour et un créneau, puis confirme" script={script} reset={reset}>
      <div className="grid h-full grid-cols-1 sm:grid-cols-[1fr_230px]">
        {/* The week */}
        <div className="hidden min-h-0 flex-col p-4 sm:flex">
          <div className="grid grid-cols-[28px_repeat(5,1fr)] gap-1.5 text-center text-[10.5px] text-ink-3">
            <span />
            {DAYS.map((d, i) => (
              <span key={d} className={cn(i === day && "font-medium text-ink")}>
                {d} {16 + i}
              </span>
            ))}
          </div>
          <div className="relative mt-2 grid min-h-0 flex-1 grid-cols-[28px_repeat(5,1fr)] gap-1.5">
            <div className="relative">
              {Array.from({ length: HOURS }, (_, i) => (
                <span key={i} className="tabular absolute right-0 -translate-y-1/2 text-[9px] text-ink-3" style={{ top: `${(i / HOURS) * 100}%` }}>
                  {FIRST + i}
                </span>
              ))}
            </div>
            {DAYS.map((d, di) => (
              <div key={d} className="relative rounded-lg bg-wash/[0.025] transition-colors" style={di === day ? { background: soft(color, 7) } : undefined}>
                {events
                  .filter((e) => e.d === di)
                  .map((e) => (
                    <div
                      key={`${e.t}-${e.s}`}
                      className={cn("absolute inset-x-1 overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-[9.5px] leading-tight", e.booked && "demo-pop")}
                      style={{ top: `${((e.s - FIRST) / HOURS) * 100}%`, height: `${(e.l / HOURS) * 100}%`, borderColor: color, background: e.booked ? color : soft(color, 20), color: e.booked ? onColor(color) : undefined }}
                    >
                      {e.t}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* The public booking page */}
        <div className="flex min-h-0 flex-col border-[color:var(--edge-07)] p-4 sm:border-l">
          <p className="text-[10px] uppercase tracking-wider text-ink-3">Page publique</p>
          <p className="mt-1 text-[14px] font-semibold">Rendez-vous avec Antoine</p>
          <p className="mt-0.5 flex items-center gap-1 text-ink-3">
            <Clock className="size-3" /> 30 min · visio ou studio
          </p>
          <div className="mt-4 grid grid-cols-5 gap-1">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                data-demo={`day-${i}`}
                onClick={() => (setDay(i), setSlot(null))}
                className={cn("flex flex-col items-center rounded-lg py-1.5 text-[10px] transition-colors", i !== day && "text-ink-3 hover:bg-[var(--glass-05)]")}
                style={i === day ? { background: color, color: onColor(color) } : undefined}
              >
                {d}
                <span className="text-[13px] font-semibold">{16 + i}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {SLOTS.map((s) => {
              const ok = free.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  data-demo={`slot-${s}`}
                  disabled={!ok}
                  onClick={() => setSlot(s)}
                  className={cn("tabular rounded-lg border py-1.5 text-[11.5px] transition-colors", ok ? "hover:border-[color:var(--edge-14)]" : "border-transparent text-ink-3/50 line-through")}
                  style={slot === s ? { borderColor: color, background: soft(color, 16), color: "var(--ink)" } : ok ? { borderColor: "var(--edge-10)" } : undefined}
                >
                  {hh(s)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            data-demo="book"
            disabled={slot === null}
            onClick={() => book()}
            className="press mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-medium transition-opacity disabled:opacity-40"
            style={{ background: color, color: onColor(color) }}
          >
            <CalendarCheck className="size-4" /> {slot === null ? "Choisis un créneau" : `Confirmer ${DAYS[day]} ${hh(slot)}`}
          </button>
        </div>
      </div>

      {toast && (
        <div key={toast} className="demo-pop absolute left-4 top-4 z-30 flex items-center gap-2 rounded-xl border border-[color:var(--edge-12)] bg-raised px-3 py-2 shadow-2xl sm:left-auto sm:right-[250px]">
          <CheckCircle2 className="size-4 shrink-0" style={{ color }} />
          <span>
            <span className="block font-medium">Rendez-vous confirmé</span>
            <span className="text-[10.5px] text-ink-3">{toast}</span>
          </span>
        </div>
      )}
    </DemoShell>
  );
}
