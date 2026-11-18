import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, C, EASE, SANS, SERIF } from "./theme";

/** 0 → 1 between two frames, eased like the site (--ease-out). */
export const prog = (frame: number, start: number, dur: number, ease = EASE) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const mix = (p: number, a: number, b: number) => a + (b - a) * p;

/** Film grain, same turbulence as body::after on the site, re-seeded every 2 frames so it lives. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.075 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity, zIndex: 50 }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed={seed} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** The page background of the site at night: ink-black paper with soft glows. */
export const Backdrop: React.FC<{ glow?: string; glow2?: string; glowOpacity?: number; children?: React.ReactNode }> = ({
  glow = C.accent,
  glow2 = "#ff9650",
  glowOpacity = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dx = Math.sin(frame / 90) * 4;
  const dy = Math.cos(frame / 110) * 3;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(${width * 0.55}px ${height * 0.55}px at ${78 + dx}% ${-6 + dy}%, ${alpha(glow, 0.2)}, transparent 62%),
            radial-gradient(${width * 0.5}px ${height * 0.45}px at ${8 - dx}% ${104 - dy}%, ${alpha(glow2, 0.08)}, transparent 62%)`,
        }}
      />
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
      <Grain />
    </AbsoluteFill>
  );
};

/** Words that rise out of a blur, one after the other. */
export const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties;
  out?: number;
}> = ({ text, start, stagger = 3, dur = 22, style, wordStyle, out }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const o = out === undefined ? 1 : 1 - prog(frame, out, 14);
  return (
    <span style={{ display: "inline", ...style, opacity: o }}>
      {words.map((w, i) => {
        const p = prog(frame, start + i * stagger, dur);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: p,
              transform: `translateY(${mix(p, 0.45, 0)}em)`,
              filter: `blur(${mix(p, 14, 0)}px)`,
              ...(wordStyle ? wordStyle(i) : {}),
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

export const Serif: React.FC<{ children: React.ReactNode; size: number; italic?: boolean; color?: string; style?: React.CSSProperties }> = ({
  children,
  size,
  italic,
  color = C.ink,
  style,
}) => (
  <div style={{ fontFamily: SERIF, fontSize: size, lineHeight: 0.98, letterSpacing: "-0.02em", fontStyle: italic ? "italic" : "normal", color, ...style }}>
    {children}
  </div>
);

/** The gradient used on « Toutes tes applications. » on the site. */
export const gradientText = (from = "#5fd3a8", via = "#7fb6e8", to = "#a98bf5"): React.CSSProperties => ({
  backgroundImage: `linear-gradient(90deg, ${from}, ${via} 55%, ${to})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

export const AppIcon: React.FC<{ icon: string; size: number; glow?: string; style?: React.CSSProperties }> = ({ icon, size, glow, style }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
    {glow && (
      <div
        style={{
          position: "absolute",
          inset: -size * 0.35,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(glow, 0.45)}, transparent 65%)`,
          filter: `blur(${size * 0.12}px)`,
        }}
      />
    )}
    <Img src={staticFile(`brand/${icon}.png`)} style={{ position: "relative", width: size, height: size, borderRadius: size * 0.24 }} />
  </div>
);

/** A macOS window, as in the mocks of the landing. */
export const Window: React.FC<{
  width: number;
  height: number;
  title?: string;
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, title, accent, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      background: `linear-gradient(180deg, ${C.surface}, #161614)`,
      border: `1px solid ${C.lineStrong}`,
      boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 40px 120px -30px rgba(0,0,0,0.85)${accent ? `, 0 0 140px -40px ${alpha(accent, 0.55)}` : ""}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: SANS,
      color: C.ink,
      ...style,
    }}
  >
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 9, padding: "0 20px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
      ))}
      {title && <div style={{ marginLeft: 16, fontSize: 17, color: C.ink2 }}>{title}</div>}
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

/** A small rounded label, like the « Bientôt » pill of the hero. */
export const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.accent, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 18,
      fontFamily: SANS,
      color,
      background: alpha(color, 0.13),
      border: `1px solid ${alpha(color, 0.25)}`,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Deterministic jitter. */
export const rnd = (key: string) => random(key);
