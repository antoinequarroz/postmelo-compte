"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import type { Locale } from "@/lib/i18n";
import { STATUS_LABEL } from "@/lib/site-text";
import { cn } from "@/lib/utils";
import { appColor, readable } from "./color";
import type { SuiteApp } from "./profiles";
import { Reveal } from "./reveal";
import { useScrollProgress } from "./use-scroll";

type Step = { id: string; when: string; title: string; text: string };

/** One week of a small media team, one app per step. A step whose app is not in the catalogue is left out. */
const STEPS: Record<Locale, Step[]> = {
  fr: [
    { id: "lamio", when: "Lundi, 9 h", title: "L'idée", text: "Dans le canal #podcast de Lamio, quelqu'un lance un nom d'invitée. Trois réactions plus tard, c'est décidé." },
    { id: "cairn", when: "Lundi, 14 h", title: "Le brief", text: "L'angle, les questions et les liens s'écrivent dans Cairn. L'IA de Cairn retrouve ce que l'équipe avait déjà noté sur le sujet." },
    { id: "tickup", when: "Mardi", title: "Les tâches", text: "Chaque étape devient un ticket dans TickUp, avec qui s'en occupe et pour quand : inviter, préparer le plateau, monter." },
    { id: "alfred", when: "Mercredi", title: "Le rendez-vous", text: "L'invitée choisit son créneau sur ta page Alfred. La confirmation part par e-mail, le tournage s'inscrit dans l'agenda." },
    { id: "nino", when: "Jeudi, 10 h", title: "Le tournage", text: "Nino Studio pilote OBS et passe d'une caméra à l'autre selon qui parle. Les prises sont prêtes pour DaVinci Resolve." },
    { id: "maya", when: "Jeudi, même heure", title: "La diffusion", text: "Pendant le tournage, Maya Studio compose les scènes, diffuse en direct et enregistre l'épisode en MP4." },
    { id: "metricove", when: "Vendredi", title: "Les extraits", text: "Les extraits montés et les carrousels partent sur Instagram, LinkedIn et YouTube, programmés dans Metricove." },
  ],
  en: [
    { id: "lamio", when: "Monday, 9 am", title: "The idea", text: "In Lamio's #podcast channel, someone suggests a guest. Three reactions later, it's settled." },
    { id: "cairn", when: "Monday, 2 pm", title: "The brief", text: "The angle, the questions and the links are written in Cairn. Cairn's AI finds what the team had already noted on the subject." },
    { id: "tickup", when: "Tuesday", title: "The tasks", text: "Each step becomes a ticket in TickUp, with who is on it and by when: invite, set up the stage, edit." },
    { id: "alfred", when: "Wednesday", title: "The booking", text: "The guest picks a slot on your Alfred page. The confirmation goes out by email and the shoot lands in the calendar." },
    { id: "nino", when: "Thursday, 10 am", title: "The shoot", text: "Nino Studio drives OBS and switches cameras based on who is speaking. The takes are ready for DaVinci Resolve." },
    { id: "maya", when: "Thursday, same time", title: "The broadcast", text: "During the shoot, Maya Studio composes the scenes, streams live and records the episode as MP4." },
    { id: "metricove", when: "Friday", title: "The clips", text: "Edited clips and carousels go out on Instagram, LinkedIn and YouTube, scheduled in Metricove." },
  ],
  de: [
    { id: "lamio", when: "Montag, 9 Uhr", title: "Die Idee", text: "Im Kanal #podcast von Lamio schlägt jemand einen Gast vor. Drei Reaktionen später ist es entschieden." },
    { id: "cairn", when: "Montag, 14 Uhr", title: "Das Briefing", text: "Blickwinkel, Fragen und Links entstehen in Cairn. Die KI von Cairn findet, was das Team zum Thema schon notiert hatte." },
    { id: "tickup", when: "Dienstag", title: "Die Aufgaben", text: "Jeder Schritt wird ein Ticket in TickUp, mit wer und bis wann: einladen, Set vorbereiten, schneiden." },
    { id: "alfred", when: "Mittwoch", title: "Der Termin", text: "Der Gast wählt seinen Termin auf deiner Alfred-Seite. Die Bestätigung geht per E-Mail raus, der Dreh landet im Kalender." },
    { id: "nino", when: "Donnerstag, 10 Uhr", title: "Der Dreh", text: "Nino Studio steuert OBS und wechselt die Kamera je nachdem, wer spricht. Die Aufnahmen sind bereit für DaVinci Resolve." },
    { id: "maya", when: "Donnerstag, gleiche Zeit", title: "Die Ausstrahlung", text: "Während des Drehs stellt Maya Studio die Szenen zusammen, sendet live und nimmt die Folge als MP4 auf." },
    { id: "metricove", when: "Freitag", title: "Die Ausschnitte", text: "Geschnittene Ausschnitte und Karussells gehen auf Instagram, LinkedIn und YouTube raus, geplant in Metricove." },
  ],
};

const T = {
  fr: { eyebrow: "Comment ça s'enchaîne", title: ["Un épisode de podcast,", "de l'idée à la mise en ligne."], intro: "Suis la semaine d'une petite équipe média. Chaque étape se passe dans une application différente, et personne ne change de compte ni de façon de travailler.", end: ["Vendredi soir, l'épisode est en ligne.", "Une semaine, un seul compte, et pas un mot de passe cherché."], cta: "Essayer avec ton équipe" },
  en: { eyebrow: "How it all connects", title: ["A podcast episode,", "from idea to release."], intro: "Follow the week of a small media team. Each step happens in a different app, and nobody switches account or way of working.", end: ["Friday evening, the episode is live.", "One week, one account, and not a single password hunted down."], cta: "Try it with your team" },
  de: { eyebrow: "Wie alles ineinandergreift", title: ["Eine Podcast-Folge,", "von der Idee bis online."], intro: "Folge der Woche eines kleinen Medienteams. Jeder Schritt passiert in einer anderen App, und niemand wechselt Konto oder Arbeitsweise.", end: ["Freitagabend ist die Folge online.", "Eine Woche, ein Konto, und kein einziges Passwort gesucht."], cta: "Mit deinem Team testen" },
};

type Geo = { w: number; h: number; d: string; pts: { x: number; y: number }[]; lens: number[]; total: number };

/** A smooth path through the points, top to bottom: each bend leaves and arrives vertically. */
function through(pts: { x: number; y: number }[]) {
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const q = pts[i - 1];
    const k = (p.y - q.y) * 0.5;
    return `${d} C ${q.x} ${q.y + k} ${p.x} ${p.y - k} ${p.x} ${p.y}`;
  }, "");
}

/**
 * "Comment ça s'enchaîne": a podcast episode told as a path across the apps. The path draws itself
 * as the page scrolls, and each step lights up when the line reaches its app.
 */
export function Journey({ apps, locale = "fr" }: { apps: SuiteApp[]; locale?: Locale }) {
  const t = T[locale];
  const byId = new Map(apps.map((a) => [a.id, a]));
  const steps = STEPS[locale].flatMap((s) => {
    const a = byId.get(s.id);
    return a ? [{ ...s, app: a }] : [];
  });

  const box = useRef<HTMLDivElement | null>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const line = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const geo = useRef<Geo | null>(null);
  const reduced = useRef(false);
  const [shape, setShape] = useState<Geo | null>(null);

  // Draws the line up to where the reading eye is (70% down the screen) and lights the steps it passed.
  const draw = useCallback((el: HTMLElement) => {
    const g = geo.current;
    const path = line.current;
    if (!g || !path) return;
    // All reads first, then all writes, so a frame never forces a second layout.
    const still = reduced.current;
    const y = still ? Infinity : window.innerHeight * 0.7 - el.getBoundingClientRect().top;
    // Length drawn: interpolated between the lengths at each step, the path only goes down.
    let len = 0;
    if (y >= g.pts[g.pts.length - 1].y) len = g.total;
    else if (y > g.pts[0].y) {
      const i = g.pts.findIndex((p) => p.y > y);
      const a = g.pts[i - 1];
      const b = g.pts[i];
      len = g.lens[i - 1] + ((y - a.y) / (b.y - a.y)) * (g.lens[i] - g.lens[i - 1]);
    }
    const pt = path.getPointAtLength(Math.max(0.01, len));
    path.style.strokeDashoffset = String(g.total - len);
    if (glow.current) glow.current.style.strokeDashoffset = String(g.total - len);
    if (head.current) {
      head.current.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
      head.current.style.opacity = len > 0 && len < g.total ? "1" : "0";
    }
    g.pts.forEach((p, i) => {
      const on = still || y >= p.y - 2;
      items.current[i]?.toggleAttribute("data-on", on);
    });
  }, []);

  const ref = useScrollProgress<HTMLDivElement>((_, el) => draw(el));

  // Measures where each app icon sits and builds the path through them; again when the layout changes.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pts = dots.current.filter((d): d is HTMLSpanElement => !!d).map((d) => {
        const b = d.getBoundingClientRect();
        return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top };
      });
      if (pts.length < 2) return;
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const lens = pts.map((_, i) => {
        if (i === 0) return 0;
        probe.setAttribute("d", through(pts.slice(0, i + 1)));
        return probe.getTotalLength();
      });
      const g = { w: r.width, h: r.height, d: through(pts), pts, lens, total: lens[lens.length - 1] };
      geo.current = g;
      setShape(g);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [steps.length]);

  // Once the path exists (and after each new shape), draw it to the current scroll position, before
  // the browser paints: otherwise every step would show dimmed for a frame, then fade back in.
  useLayoutEffect(() => {
    if (shape && box.current) draw(box.current);
  }, [shape, draw]);

  // Follows the reduced motion setting, also when it changes while the page is open.
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => {
      reduced.current = mq.matches;
      if (box.current) draw(box.current);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [draw]);

  if (steps.length === 0) return null;
  const top = shape?.pts[0].y ?? 0;
  const bottom = shape?.pts[shape.pts.length - 1].y ?? 1;

  return (
    <section id="exemple" className="relative isolate scroll-mt-20 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-40 -z-10 mx-auto h-[60%] max-w-[900px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }} />
      <div className="mx-auto max-w-[1160px] px-4 pt-28 sm:px-6">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-[900px] font-display text-[clamp(40px,6vw,88px)] leading-[0.92] tracking-[-0.012em]">
            {t.title[0]}
            <br />
            <span className="italic text-ink-2">{t.title[1]}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-ink-2">
            {t.intro}
          </p>
        </Reveal>
      </div>

      <div
        ref={(el) => {
          box.current = el;
          ref.current = el;
        }}
        className="relative mx-auto mt-20 max-w-[1080px] px-4 sm:px-6"
      >
        {shape && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={shape.w} height={shape.h} viewBox={`0 0 ${shape.w} ${shape.h}`}>
            <defs>
              {/* The line takes the colour of each app as it passes it. */}
              <linearGradient id="journey-ink" gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={bottom}>
                {steps.map((s, i) => (
                  <stop key={s.id} offset={(shape.pts[i].y - top) / (bottom - top || 1)} style={{ stopColor: appColor(s.app.color) }} />
                ))}
              </linearGradient>
            </defs>
            <path d={shape.d} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
            <path d={shape.d} fill="none" stroke="url(#journey-ink)" strokeWidth="9" strokeLinecap="round" opacity="0.14" strokeDasharray={shape.total} style={{ strokeDashoffset: shape.total }} ref={glow} />
            <path ref={line} d={shape.d} fill="none" stroke="url(#journey-ink)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={shape.total} style={{ strokeDashoffset: shape.total }} />
            <g ref={head} style={{ opacity: 0 }}>
              <circle r="9" fill="var(--accent-soft)" className="orbit-pulse" />
              <circle r="4" fill="var(--ink)" />
            </g>
          </svg>
        )}

        <ol data-armed={shape ? "" : undefined} className="relative flex flex-col gap-14 pb-10 lg:gap-0">
          {steps.map((s, i) => {
            const c = appColor(s.app.color);
            const right = i % 2 === 1;
            return (
              <li
                key={s.id}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className={cn("journey-step relative grid grid-cols-[52px_minmax(0,1fr)] items-start gap-5", "lg:grid-cols-[minmax(0,1fr)_200px_minmax(0,1fr)] lg:items-center lg:gap-0", i > 0 && "lg:-mt-16")}
              >
                {/* The app, on the path */}
                <span className={cn("relative z-10 flex justify-center pt-1 lg:col-start-2 lg:row-start-1 lg:pt-0", right ? "lg:justify-end lg:pr-8" : "lg:justify-start lg:pl-8")}>
                  <span
                    ref={(el) => {
                      dots.current[i] = el;
                    }}
                    className="journey-dot relative flex size-[52px] items-center justify-center rounded-2xl"
                    style={{ ["--c" as string]: c }}
                  >
                    <ProductIcon id={s.app.id} color={s.app.color} size="md" className="size-11" />
                  </span>
                </span>
                {/* The step */}
                <div className={cn("lg:row-start-1", right ? "lg:col-start-3" : "lg:col-start-1 lg:text-right")}>
                  <div className={cn("journey-card relative inline-block w-full max-w-[420px] rounded-[22px] border border-line bg-[var(--glass-025)] p-5 text-left shadow-[var(--shadow)] backdrop-blur-sm sm:p-6", !right && "lg:ml-auto")}>
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] font-medium uppercase tracking-[0.14em]">
                      <span className="tabular text-ink-3">{s.when}</span>
                      <span aria-hidden className="h-px w-5 bg-line-strong max-sm:hidden" />
                      <span style={{ color: readable(c) }}>{s.app.name}</span>
                    </p>
                    <h3 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[30px] leading-none">
                      {s.title}
                      {s.app.status !== "disponible" && STATUS_LABEL[locale][s.app.status] && (
                        <span className="rounded-full px-2 py-0.5 font-sans text-[11px] font-medium leading-normal" style={{ background: `color-mix(in oklab, ${c} 16%, transparent)`, color: readable(c) }}>
                          {STATUS_LABEL[locale][s.app.status]}
                        </span>
                      )}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Reveal className="mx-auto max-w-[1160px] px-4 pb-8 pt-14 text-center sm:px-6">
        <p className="mx-auto max-w-[720px] text-balance font-display text-[clamp(30px,3.6vw,48px)] leading-[1.04]">
          {t.end[0]}
          <br />
          <span className="italic text-ink-3">{t.end[1]}</span>
        </p>
        <a href="#contact" className="group mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-accent">
          {t.cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </Reveal>
    </section>
  );
}
