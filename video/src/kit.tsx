import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "./theme";
import { mix, prog } from "./ui";

export { mix, prog };

/** Shared pieces of the app screens. All mocks are drawn at this size and scaled by the scenes. */
export const MOCK_W = 1040;
export const MOCK_H = 660;

export const pop = (f: number, at: number, dur = 14) => {
  const p = prog(f, at, dur);
  return { opacity: p, transform: `translateY(${mix(p, 14, 0)}px) scale(${mix(p, 0.97, 1)})`, filter: `blur(${mix(p, 6, 0)}px)` };
};

export const typed = (text: string, f: number, at: number, cps = 1.4) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));

export const Avatar: React.FC<{ l: string; c: string; s?: number }> = ({ l, c, s = 38 }) => (
  <div
    style={{
      width: s,
      height: s,
      borderRadius: s / 2,
      background: `linear-gradient(140deg, ${c}, ${alpha(c, 0.55)})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: s * 0.42,
      fontWeight: 600,
      color: "#fff",
      flexShrink: 0,
    }}
  >
    {l}
  </div>
);

export const Side: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 230 }) => (
  <div style={{ width: w, borderRight: `1px solid ${C.line}`, background: "rgba(255,255,255,0.015)", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
    {children}
  </div>
);

export const SideItem: React.FC<{ icon?: React.ReactNode; label: string; active?: boolean; color?: string; badge?: number }> = ({ icon, label, active, color = C.accent, badge }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 10,
      fontSize: 17,
      color: active ? C.ink : C.ink2,
      background: active ? alpha(color, 0.16) : "transparent",
      boxShadow: active ? `inset 0 0 0 1px ${alpha(color, 0.22)}` : "none",
    }}
  >
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
    {badge ? <span style={{ fontSize: 13, fontWeight: 600, padding: "1px 8px", borderRadius: 99, background: color, color: "#fff" }}>{badge}</span> : null}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink3, padding: "14px 12px 6px" }}>{children}</div>
);


/** A person in front of a camera, drawn with light and shapes. */
export const Shot: React.FC<{ hue: string; label: string; who?: number; wide?: boolean; talking?: boolean; f: number; style?: React.CSSProperties }> = ({
  hue,
  label,
  who = 0,
  wide,
  talking,
  f,
  style,
}) => {
  const people = wide ? [-0.22, 0.22] : [0];
  const bob = Math.sin(f / 9 + who) * 2;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: `radial-gradient(90% 80% at 50% 30%, ${alpha(hue, 0.45)}, #121212 75%)`,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5))" }} />
      {people.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: `${50 + x * 100}%`, bottom: 0, transform: `translateX(-50%) translateY(${bob}px)`, height: wide ? "62%" : "84%", aspectRatio: "1 / 1.1" }}>
          <div style={{ position: "absolute", left: "31%", width: "38%", aspectRatio: "1 / 1.12", top: "6%", borderRadius: "50%", background: `linear-gradient(160deg, #e9d2c0, #a77d64)`, zIndex: 1 }} />
          <div style={{ position: "absolute", left: "42%", width: "16%", height: "14%", top: "42%", background: "#b88b70" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "48%", borderRadius: "46% 46% 0 0", zIndex: 2, background: `linear-gradient(160deg, ${i === 1 || who === 1 ? "#3a4a5e" : "#2b2b2b"}, #111)` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 10, top: 9, fontSize: 13, padding: "3px 9px", borderRadius: 6, background: "rgba(0,0,0,0.5)", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
        {talking && <Mic size={12} color="#5fd3a8" />} {label}
      </div>
    </div>
  );
};

export const Meter: React.FC<{ level: number; c: string }> = ({ level, c }) => (
  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 26 }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} style={{ width: 5, height: 6 + i * 2, borderRadius: 2, background: i / 10 < level ? (i > 7 ? "#ec4d5b" : c) : "rgba(255,255,255,0.1)" }} />
    ))}
  </div>
);
