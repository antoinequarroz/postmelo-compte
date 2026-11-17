"use client";

import { useRef } from "react";
import { useScrollProgress } from "./use-scroll";

/** A sentence whose words light up one by one as the page scrolls past it. */
export function Statement({ text, accent }: { text: string; accent: string[] }) {
  const words = text.split(" ");
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const ref = useScrollProgress<HTMLDivElement>((p) => {
    const lit = p * 1.25 * words.length;
    spans.current.forEach((el, i) => {
      if (!el) return;
      const v = Math.min(1, Math.max(0, lit - i));
      el.style.opacity = String(0.14 + v * 0.86);
      el.style.filter = v < 1 ? `blur(${(1 - v) * 3}px)` : "none";
    });
  });
  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-4 sm:px-6">
        <p className="mx-auto max-w-[1100px] text-center font-display text-[clamp(38px,6.2vw,92px)] leading-[1.02] tracking-[-0.01em]">
          {words.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                spans.current[i] = el;
              }}
              className={accent.includes(w.replace(/[.,]/g, "")) ? "italic text-accent" : undefined}
              style={{ opacity: 0.14, transition: "opacity 200ms linear" }}
            >
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
