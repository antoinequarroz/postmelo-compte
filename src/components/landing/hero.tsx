"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";
import { primaryClass } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Stars } from "./stars";
import { prefersReduced } from "./use-scroll";

export type App = { id: string; name: string; color: string; category: string; family: string };

const TILT = 72; // degrees: how flat the orbit lies

function Ring({ apps, radius, duration, reverse }: { apps: App[]; radius: number; duration: number; reverse?: boolean }) {
  const anim = { animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as const;
  return (
    <div className="orbit-ring absolute left-1/2 top-1/2" style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius, ...anim }}>
      {/* The path, seen as an ellipse */}
      <div className="absolute inset-0 rounded-full border border-[rgba(255,252,245,0.10)] shadow-[0_0_80px_-20px_rgba(95,211,168,0.35)_inset]" />
      {apps.map((a, n) => {
        const angle = (n / apps.length) * 360 + (reverse ? 45 : 0);
        return (
          <div key={a.id} className="absolute left-1/2 top-1/2" style={{ transform: `rotateZ(${angle}deg) translateX(${radius}px) rotateZ(${-angle}deg)`, transformStyle: "preserve-3d" }}>
            <div className="orbit-counter" style={anim}>
              <div style={{ transform: `rotateX(${-TILT}deg)`, transformStyle: "preserve-3d" }}>
                <div className="-ml-[44px] -mt-[60px] flex w-[88px] flex-col items-center gap-2">
                  <span
                    className="flex size-[76px] items-center justify-center rounded-[22px] border border-[rgba(255,252,245,0.14)] bg-[rgba(24,24,27,0.72)] backdrop-blur-md"
                    style={{ boxShadow: `0 20px 50px -18px ${a.color || "#f6f4ef"}, inset 0 1px 0 rgba(255,255,255,0.08)` }}
                  >
                    <ProductIcon id={a.id} color={a.color || "#f6f4ef"} size="lg" />
                  </span>
                  <span className="whitespace-nowrap text-[12.5px] font-medium text-ink/85">{a.name}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* The core, facing the camera */}
    </div>
  );
}

function Core({ apps }: { apps: App[] }) {
  const stops = [...apps.map((a) => a.color || "#f6f4ef"), apps[0]?.color || "#5fd3a8"].join(", ");
  return (
    <div className="core-breathe relative -ml-[110px] -mt-[110px] size-[220px]">
      <div className="core-aurora absolute -inset-16 rounded-full opacity-70 blur-[50px]" style={{ background: `conic-gradient(from 0deg, ${stops})` }} />
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(95,211,168,0.65) 28%, rgba(18,128,92,0.25) 55%, transparent 72%)", filter: "blur(2px)" }} />
      <div className="absolute inset-[38%] flex items-center justify-center">
        <Logo className="size-12 drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}

/** Full-screen opening: the suite as a small solar system, the account at its heart. */
export function Hero({ apps, suite, signedIn }: { apps: App[]; suite: string; signedIn: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let scroll = 0;
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      if (tilt.current) tilt.current.style.transform = `rotateX(${cur.y * -8}deg) rotateY(${cur.x * 12}deg)`;
      const p = Math.min(1, scroll / window.innerHeight);
      if (scene.current) {
        scene.current.style.transform = `translateY(${p * -12}vh) scale(${1 + p * 0.55})`;
        scene.current.style.opacity = String(1 - p * 0.9);
      }
      if (copy.current) {
        copy.current.style.transform = `translateY(${p * -18}vh)`;
        copy.current.style.opacity = String(1 - p * 1.6);
      }
      frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => (scroll = window.scrollY);
    onScroll();
    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const team = apps.filter((a) => a.family === "equipe");
  const media = apps.filter((a) => a.family !== "equipe");

  return (
    <section className="relative isolate min-h-[calc(100svh+340px)] overflow-hidden">
      <Stars className="absolute inset-0 -z-10 size-full" colors={apps.map((a) => a.color).filter(Boolean).join(",")} />
      <div aria-hidden className="absolute inset-x-0 bottom-[-30%] -z-10 mx-auto h-[80%] w-[120%] max-w-[1600px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(95,211,168,0.22),rgba(111,66,230,0.10)_55%,transparent)] blur-2xl" />

      <div ref={copy} className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pt-[15vh] text-center will-change-transform">
        <p className="rise-blur inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] text-ink-2 backdrop-blur" style={{ animationDelay: "100ms" }}>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          La suite {suite} · {apps.length} applications, un seul compte
        </p>
        <h1 className="mt-7 font-display text-[clamp(54px,9.5vw,148px)] leading-[0.88] tracking-[-0.02em]">
          <span className="rise-blur block" style={{ animationDelay: "250ms" }}>
            Tout ce que tu crées,
          </span>
          <span className="rise-blur block italic text-accent" style={{ animationDelay: "450ms" }}>
            enfin réuni.
          </span>
        </h1>
        <p className="rise-blur mt-7 max-w-[600px] text-[16px] leading-relaxed text-ink-2 sm:text-[17.5px]" style={{ animationDelay: "650ms" }}>
          Messagerie, notes, projets, agenda, réseaux sociaux, création de contenu, studio vidéo et diffusion en direct. Huit applications, un design, un compte.
        </p>
        <div className="rise-blur mt-9 flex flex-wrap justify-center gap-3" style={{ animationDelay: "800ms" }}>
          <a href="#contact" className={cn("press sweep relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-6 text-[15px] font-medium", primaryClass)}>
            Demander un accès <ArrowRight className="size-4" />
          </a>
          <a href={signedIn ? "/compte" : "#suite"} className="press inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-[#101012]/80 px-6 text-[15px] font-medium backdrop-blur hover:bg-white/[0.08]">
            {signedIn ? "Ouvrir mon compte" : "Découvrir la suite"}
          </a>
        </div>
      </div>

      {/* The orbit, rising from the bottom of the screen like a planet */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[calc(100svh-30px)] -translate-x-1/2 -translate-y-1/2">
        <div ref={scene} className="will-change-transform">
          <div className="rise-blur" style={{ animationDelay: "500ms", animationDuration: "1.8s" }}>
            <div className="relative scale-[0.5] sm:scale-[0.75] lg:scale-100" style={{ perspective: "1400px" }}>
              <div ref={tilt} className="relative size-[900px]" style={{ transformStyle: "preserve-3d" }}>
                <Ring apps={media} radius={420} duration={70} reverse />
                <Ring apps={team} radius={260} duration={46} />
              </div>
              {/* The core: the account, a flat layer facing the camera, kept out of the 3D tree so it is never sliced */}
              <div className="absolute left-1/2 top-1/2">
                <Core apps={apps} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
