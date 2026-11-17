"use client";

import { ArrowRight, LayoutGrid, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { primaryClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

type App = { id: string; name: string; color: string; category: string };

const WORDS = [
  { text: "tes messages", id: "lamio" },
  { text: "tes notes", id: "cairn" },
  { text: "tes projets", id: "tickup" },
  { text: "ton agenda", id: "alfred" },
  { text: "tes réseaux", id: "metricove" },
  { text: "tes contenus", id: "postmelo-studio" },
  { text: "ton studio", id: "nino" },
  { text: "tes lives", id: "maya" },
];

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Hero({ apps, suite, firstSection }: { apps: App[]; suite: string; firstSection: string }) {
  const words = WORDS.filter((w) => apps.some((a) => a.id === w.id));
  const [i, setI] = useState(0);
  const word = words[i % Math.max(words.length, 1)];
  const color = apps.find((a) => a.id === word?.id)?.color || "var(--accent)";

  // The headline cycles through what the suite holds; the launcher lights the matching app.
  useEffect(() => {
    if (reduced() || words.length < 2) return;
    const t = setInterval(() => setI((n) => n + 1), 2200);
    return () => clearInterval(t);
  }, [words.length]);

  // The launcher leans toward the pointer.
  const card = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse" || reduced()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
  };
  const onLeave = () => {
    if (card.current) card.current.style.transform = "";
  };

  const headline = ["Toute", "ta", "boîte,"];

  return (
    <section className="relative isolate overflow-hidden">
      {/* Moving colour behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob blob-a left-[-10%] top-[-20%] size-[520px]" style={{ background: "color-mix(in oklab, var(--accent) 45%, transparent)" }} />
        <div className="blob blob-b right-[-8%] top-[5%] size-[460px]" style={{ background: `color-mix(in oklab, ${color} 40%, transparent)`, transition: "background 1.2s ease" }} />
        <div className="blob blob-c bottom-[-30%] left-[30%] size-[520px]" style={{ background: "rgba(255, 150, 80, 0.22)" }} />
        <div className="dot-grid absolute inset-0" />
      </div>

      <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-4 pb-24 pt-14 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="word-in inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3 py-1 text-[12.5px] text-ink-2 shadow-card backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {apps.length} applications, un seul compte
          </p>
          <h1 className="mt-6 font-display text-[clamp(48px,7.4vw,86px)] leading-[0.95] tracking-[-0.015em]">
            {headline.map((w, n) => (
              <span key={w} className="word-in mr-[0.22em] inline-block" style={{ animationDelay: `${120 + n * 90}ms` }}>
                {w}
              </span>
            ))}
            <br />
            <span className="word-in mr-[0.22em] inline-block italic" style={{ animationDelay: "420ms" }}>
              et
            </span>
            <span className="relative inline-block" aria-live="polite">
              <span key={i} className="swap-in inline-block whitespace-nowrap italic" style={{ color, transition: "color 400ms ease" }}>
                {word?.text ?? "tout le reste"}
              </span>
            </span>
            <br />
            <span className="word-in inline-block" style={{ animationDelay: "560ms" }}>
              dans une seule suite.
            </span>
          </h1>
          <p className="word-in mt-7 max-w-[540px] text-[16.5px] leading-relaxed text-ink-2" style={{ animationDelay: "700ms" }}>
            Messagerie, notes, projets, agenda, réseaux sociaux, création de contenu et studio vidéo. Les applications {suite} partagent le même design, le même compte, et se pilotent depuis un seul endroit.
          </p>
          <div className="word-in mt-9 flex flex-wrap gap-3" style={{ animationDelay: "820ms" }}>
            <a href="#contact" className={cn("press sheen inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-medium", primaryClass)}>
              Demander un accès
              <ArrowRight className="size-4" />
            </a>
            <a href={`#${firstSection}`} className="press inline-flex h-12 items-center rounded-xl border border-line-strong bg-surface/80 px-6 text-[15px] font-medium shadow-card backdrop-blur hover:bg-surface-2">
              Découvrir les applications
            </a>
          </div>
        </div>

        {/* The launcher, as people see it once signed in */}
        <div className="word-in relative" style={{ animationDelay: "300ms" }} onPointerMove={onMove} onPointerLeave={onLeave}>
          <div
            ref={card}
            className="rounded-[24px] border border-line-strong bg-surface/80 p-5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            style={{ transition: "transform 600ms var(--ease-out)", transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center gap-2 border-b border-line pb-4">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <LayoutGrid className="ml-2 size-4 text-ink-3" />
              <span className="text-[13px] font-medium">Mes applications</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent">
                <ShieldCheck className="size-3" /> Connecté
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2.5 pt-4 sm:grid-cols-4">
              {apps.slice(0, 8).map((a, n) => {
                const live = a.id === word?.id;
                return (
                  <li
                    key={a.id}
                    className={cn("bob flex flex-col items-center gap-2.5 rounded-xl border px-2 py-4 text-center transition-colors duration-500", live ? "border-transparent bg-surface" : "border-line bg-bg/40")}
                    style={{ animationDelay: `${(n % 4) * -1.2 - Math.floor(n / 4) * 0.6}s`, ...(live ? { boxShadow: `0 0 0 1.5px color-mix(in oklab, ${a.color || "var(--ink)"} 55%, transparent), 0 14px 30px -14px color-mix(in oklab, ${a.color || "var(--ink)"} 60%, transparent)` } : {}) }}
                  >
                    <span key={live ? `on-${i}` : "off"} className={cn("rounded-2xl", live && "tile-live")} style={{ ["--ring" as string]: `color-mix(in oklab, ${a.color || "var(--ink)"} 45%, transparent)` }}>
                      <ProductIcon id={a.id} color={a.color} size="lg" className={cn("transition-transform duration-500", live && "scale-110")} />
                    </span>
                    <span className="text-[12.5px] font-medium leading-tight">{a.name}</span>
                    <span className={cn("-mt-1.5 text-[10.5px] leading-tight text-ink-3 transition-opacity duration-500", live ? "opacity-100" : "opacity-0")}>{a.category}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
