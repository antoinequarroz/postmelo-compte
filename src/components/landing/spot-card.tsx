"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/** A product card lit by the pointer, in the colour of its app, that tilts slightly. */
export function SpotCard({ tint, delay, className, children }: { tint: string; delay?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.transform = `perspective(1200px) rotateX(${((y / r.height) - 0.5) * -4}deg) rotateY(${((x / r.width) - 0.5) * 5}deg) translateY(-4px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <Reveal as="li" delay={delay}>
      <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={cn("spot relative h-full", className)} style={{ ["--tint" as string]: tint }}>
        {children}
      </div>
    </Reveal>
  );
}
