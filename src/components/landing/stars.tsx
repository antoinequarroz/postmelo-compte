"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "./use-scroll";

/** A field of slow, twinkling specks of light that lean away from the pointer. */
export function Stars({ className, colors }: { className?: string; /** Comma-separated. */ colors: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const palette = colors ? colors.split(",") : ["#ffffff"];
    let w = 0;
    let h = 0;
    let frame = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const stars = Array.from({ length: 220 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.2 + 0.25,
      tw: Math.random() * Math.PI * 2,
      c: i % 9 === 0 ? palette[i % palette.length] : "#f6f4ef",
    }));
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y -= 0.00012 * s.z;
        if (s.y < -0.02) s.y = 1.02;
        const x = s.x * w - mouse.x * 40 * s.z;
        const y = s.y * h - mouse.y * 40 * s.z;
        const a = 0.25 + 0.75 * Math.abs(Math.sin(t / 1400 + s.tw)) * s.z;
        ctx.globalAlpha = a;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(x, y, s.r * s.z * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    resize();
    window.addEventListener("resize", resize);
    if (prefersReduced()) {
      draw(0);
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      frame = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onMove);
    }
    // Stop drawing when the hero is out of sight.
    const io = new IntersectionObserver(([e]) => {
      if (prefersReduced()) return;
      if (e.isIntersecting && !frame) frame = requestAnimationFrame(draw);
      if (!e.isIntersecting) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    io.observe(c);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [colors]);
  return <canvas ref={canvas} aria-hidden className={className} />;
}
