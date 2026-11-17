"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { localePath, type Locale } from "@/lib/i18n";
import { countWordIn, FAMILY_LABEL, STATUS_LABEL } from "@/lib/site-text";
import { cn } from "@/lib/utils";
import { appColor, readable } from "./color";
import { AppMock } from "./mocks";
import { Reveal } from "./reveal";
import { useScrollProgress } from "./use-scroll";

export type StoryApp = { id: string; name: string; color: string; category: string; family: string; tagline: string; points: string[]; status: string };

const T = {
  fr: { eyebrow: "La suite", title: (n: string) => `${n} applications.`, sub: "Une seule façon de travailler.", notify: "Être prévenu du lancement", try: (name: string) => `Essayer ${name}`, discover: (name: string) => `Découvrir ${name}` },
  en: { eyebrow: "The suite", title: (n: string) => `${n} apps.`, sub: "One way of working.", notify: "Get notified at launch", try: (name: string) => `Try ${name}`, discover: (name: string) => `Discover ${name}` },
  de: { eyebrow: "Die Suite", title: (n: string) => `${n} Apps.`, sub: "Eine Art zu arbeiten.", notify: "Zum Start benachrichtigen", try: (name: string) => `${name} testen`, discover: (name: string) => `${name} entdecken` },
};

function Copy({ a, n, total, locale }: { a: StoryApp; n: number; total: number; locale: Locale }) {
  // Without a colour (TickUp), the ink of the theme.
  const c = appColor(a.color);
  return (
    <div>
      <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink-3">
        <span className="tabular" style={{ color: readable(c) }}>
          {String(n + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-8 bg-line-strong" />
        {FAMILY_LABEL[locale][a.family] ?? ""}
        <span className="tabular">/ {String(total).padStart(2, "0")}</span>
      </p>
      <div className="mt-6 flex items-center gap-4">
        <ProductIcon id={a.id} color={c} size="lg" />
        <div>
          <h3 className="font-display text-[clamp(48px,6vw,84px)] leading-[0.9] tracking-[-0.01em]">{a.name}</h3>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-3">
            {a.category}
            {a.status !== "disponible" && (
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `color-mix(in oklab, ${c} 18%, transparent)`, color: `color-mix(in oklab, ${c} 75%, var(--lift))` }}>
                {STATUS_LABEL[locale][a.status]}
              </span>
            )}
          </p>
        </div>
      </div>
      <p className="mt-6 max-w-[460px] text-[19px] leading-snug text-ink">{a.tagline}</p>
      <ul className="mt-6 flex max-w-[460px] flex-col gap-2.5">
        {a.points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-[14.5px] leading-snug text-ink-2">
            <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${c} 22%, transparent)` }}>
              <Check className="size-2.5" strokeWidth={3} style={{ color: readable(c) }} />
            </span>
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href={localePath(locale, `/${a.id}`)} className="group inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: readable(c) }}>
          {T[locale].discover(a.name)}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <a href="#contact" data-product={a.id} className="text-[14px] text-ink-3 hover:text-ink">
          {a.status === "bientot" ? T[locale].notify : T[locale].try(a.name)}
        </a>
      </div>
    </div>
  );
}

/**
 * The tour of the suite. On large screens the section is pinned and each app takes the stage
 * in turn as the page scrolls, with its interface; on phones the apps simply follow each other.
 */
export function Story({ apps, locale = "fr" }: { apps: StoryApp[]; locale?: Locale }) {
  const t = T[locale];
  const [active, setActive] = useState(0);
  // Progress inside the current app (0..1), drawn straight into the rail without re-rendering.
  const fill = useRef<HTMLSpanElement>(null);
  const ref = useScrollProgress<HTMLDivElement>((p) => {
    const x = p * apps.length;
    const i = Math.min(apps.length - 1, Math.floor(x));
    setActive((prev) => (prev === i ? prev : i));
    if (fill.current) fill.current.style.transform = `scaleY(${Math.min(1, x - i)})`;
  });
  const a = apps[active];
  const color = appColor(a?.color);

  return (
    <section id="suite" className="relative scroll-mt-0">
      <Reveal className="mx-auto max-w-[1160px] px-4 pb-10 pt-28 text-center sm:px-6">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-[900px] font-display text-[clamp(44px,7vw,104px)] leading-[0.9] tracking-[-0.015em]">
          {t.title(countWordIn(apps.length, locale))}
          <br />
          <span className="italic text-ink-2">{t.sub}</span>
        </h2>
      </Reveal>

      {/* Large screens: pinned tour */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${apps.length * 85 + 40}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 transition-[background] duration-1000" style={{ background: `radial-gradient(60% 55% at 72% 50%, light-dark(color-mix(in oklab, ${color} 13%, transparent), color-mix(in oklab, ${color} 20%, transparent)), transparent 70%)` }} />
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[64px_minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-10 px-6">
            {/* Rail */}
            <ol className="relative flex flex-col gap-3">
              <span aria-hidden className="absolute -left-4 top-0 h-9 w-[2px] overflow-hidden rounded-full bg-wash/10 transition-transform duration-500" style={{ transform: `translateY(${active * 48}px)` }}>
                <span ref={fill} className="block h-full w-full origin-top rounded-full" style={{ background: color, transform: "scaleY(0)" }} />
              </span>
              {apps.map((x, n) => (
                <li key={x.id} className="relative flex items-center">
                  <span className={cn("transition-all duration-500", n === active ? "scale-100 opacity-100" : "scale-[0.8] rounded-xl opacity-[var(--rail-dim)] ring-1 ring-[var(--rail-ring)] grayscale")}>
                    <ProductIcon id={x.id} color={x.color} size="sm" className="size-9 rounded-xl" />
                  </span>
                </li>
              ))}
            </ol>
            {/* Copy */}
            <div className="relative min-h-[520px]">
              {apps.map((x, n) => (
                <div
                  key={x.id}
                  aria-hidden={n !== active}
                  className="absolute inset-0 flex items-center transition-all duration-700"
                  style={{ opacity: n === active ? 1 : 0, transform: `translateY(${n === active ? 0 : n < active ? -40 : 40}px)`, filter: n === active ? "none" : "blur(10px)", pointerEvents: n === active ? "auto" : "none", transitionTimingFunction: "var(--ease-out)" }}
                >
                  <Copy a={x} n={n} total={apps.length} locale={locale} />
                </div>
              ))}
            </div>
            {/* Interface */}
            <div className="relative h-[540px]" style={{ perspective: "1600px" }}>
              {apps.map((x, n) => (
                <div
                  key={x.id}
                  aria-hidden
                  className="absolute inset-0 transition-all duration-[900ms]"
                  style={{
                    opacity: n === active ? 1 : 0,
                    transform: n === active ? "none" : `translateY(${n < active ? -70 : 70}px) rotateX(${n < active ? 12 : -12}deg) scale(0.92)`,
                    transitionTimingFunction: "var(--ease-out)",
                  }}
                >
                  <AppMock id={x.id} name={x.name} color={x.color} on={n === active} locale={locale} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: one after the other */}
      <div className="mx-auto flex max-w-[720px] flex-col gap-24 px-4 pb-24 sm:px-6 lg:hidden">
        {apps.map((x, n) => (
          <Reveal key={x.id} className="relative">
            <div aria-hidden className="absolute -inset-x-10 -top-10 -z-10 h-[70%]" style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${appColor(x.color)} 18%, transparent), transparent)` }} />
            <Copy a={x} n={n} total={apps.length} locale={locale} />
            <div className="mt-10 h-[380px] sm:h-[440px]">
              <AppMock id={x.id} name={x.name} color={x.color} on locale={locale} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
