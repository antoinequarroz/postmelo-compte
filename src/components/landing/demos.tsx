"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { LiveDemo } from "@/components/demos";
import { ProductIcon } from "@/components/product-icon";
import { TRY } from "@/lib/demo-tips";
import { cn } from "@/lib/utils";
import { appColor, readable } from "./color";
import { Reveal } from "./reveal";

export type DemoApp = { id: string; name: string; color: string; category: string; tagline: string; status: string };


/** Live demos on the home page: one app at a time, picked from a row of tabs. */
export function Demos({ apps }: { apps: DemoApp[] }) {
  const [active, setActive] = useState(apps[0]?.id);
  const a = apps.find((x) => x.id === active) ?? apps[0];
  if (!a) return null;
  const c = appColor(a.color);

  return (
    <section id="demos" className="relative scroll-mt-20 overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 transition-[background] duration-1000" style={{ background: `radial-gradient(55% 45% at 65% 60%, light-dark(color-mix(in oklab, ${c} 12%, transparent), color-mix(in oklab, ${c} 18%, transparent)), transparent 70%)` }} />
      <div className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Démos vivantes</p>
          <h2 className="mx-auto mt-4 max-w-[860px] font-display text-[clamp(44px,6.4vw,92px)] leading-[0.9] tracking-[-0.015em]">
            Essaie-les.
            <br />
            <span className="italic text-ink-2">Là, tout de suite.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-ink-2">Pas de vidéo, pas d&apos;inscription : chaque application se joue toute seule, puis te laisse la main dès que tu cliques.</p>
        </Reveal>

        {/* The apps */}
        <Reveal delay={100} className="-mx-4 mt-10 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div role="tablist" aria-label="Choisir une application" className="mx-auto flex w-max gap-1.5 rounded-full border border-line bg-[var(--glass-025)] p-1.5 backdrop-blur">
            {apps.map((x) => {
              const on = x.id === a.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(x.id)}
                  className={cn("press flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13.5px] font-medium transition-colors", on ? "bg-[var(--glass-08)] text-ink shadow-[var(--tab-shadow)]" : "text-ink-3 hover:text-ink")}
                >
                  <ProductIcon id={x.id} color={x.color} size="sm" className={cn("size-7 transition-[filter,opacity]", !on && "opacity-70 grayscale")} />
                  {x.name}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div key={`copy-${a.id}`} className="demo-pop order-2 lg:order-1">
            <div className="flex items-center gap-4">
              <ProductIcon id={a.id} color={a.color} size="lg" />
              <div>
                <h3 className="font-display text-[clamp(40px,4.4vw,60px)] leading-[0.9]">{a.name}</h3>
                <p className="mt-1 text-[13px] text-ink-3">{a.category}</p>
              </div>
            </div>
            <p className="mt-6 text-[18px] leading-snug text-ink">{a.tagline}</p>
            {TRY[a.id] && (
              <p className="mt-4 rounded-2xl border border-line bg-[var(--glass-025)] p-4 text-[14px] leading-relaxed text-ink-2">
                <span className="font-medium" style={{ color: readable(c) }}>
                  À essayer :{" "}
                </span>
                {TRY[a.id]}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={`/${a.id}`} className="group inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: readable(c) }}>
                Découvrir {a.name}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#contact" data-product={a.id} className="text-[14px] text-ink-3 hover:text-ink">
                {a.status === "bientot" ? "Être prévenu du lancement" : "Demander un accès"}
              </a>
            </div>
          </div>
          <div className="order-1 h-[500px] sm:h-[540px] lg:order-2">
            <LiveDemo key={a.id} id={a.id} name={a.name} color={a.color} />
          </div>
        </div>
      </div>
    </section>
  );
}
