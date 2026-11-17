import React from "react";
import { KeyRound, Lock } from "lucide-react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, SfxTrack } from "./ad";
import { SfxKind } from "./sound";
import { alpha, APPS, C, EASE, EASE_IN_OUT, MONO, SANS } from "./theme";
import { AppIcon, Backdrop, gradientText, mix, prog, rnd, Serif, Words } from "./ui";

const useV = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/* ───────────────────────── Hook: too many tools ───────────────────────── */

const WORDS = ["Ta messagerie.", "Tes notes.", "Tes projets.", "Ton agenda.", "Tes réseaux.", "Ton studio.", "Ton direct.", "Tes mots de passe."];
const TINTS = ["#7a6ab0", "#5a6ab0", "#9a9a9a", "#4a8ac0", "#c0704a", "#4ab0a0", "#c04a5a", "#b0a04a"];

const LoginWindow: React.FC<{ i: number; born: number; f: number; collapse: number }> = ({ i, born, f, collapse }) => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  const p = prog(f, born, 8, EASE);
  if (f < born) return null;
  const w = v ? 420 : 380;
  const h = v ? 300 : 260;
  const x = rnd(`lx${i}`) * (width - w);
  const y = (v ? 120 : 40) + rnd(`ly${i}`) * (height - h - (v ? 240 : 80));
  const shake = Math.sin(f * 2.3 + i) * 6 * prog(f, 120, 40);
  const tint = TINTS[i % TINTS.length];
  return (
    <div
      style={{
        position: "absolute",
        left: mix(collapse, x, width / 2 - w / 2) + shake,
        top: mix(collapse, y, height / 2 - h / 2),
        width: w,
        height: h,
        borderRadius: 16,
        background: "#1c1c1a",
        border: `1px solid ${C.lineStrong}`,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.85)",
        transform: `scale(${mix(p, 1.25, 1) * mix(collapse, 1, 0.02)}) rotate(${(rnd(`lr${i}`) - 0.5) * 10}deg)`,
        opacity: Math.min(1, p * 1.5) * (1 - collapse * 0.8),
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      <div style={{ height: 30, background: alpha(tint, 0.4), display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: 9, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: C.ink, fontWeight: 600 }}>
          <Lock size={18} color={tint} /> Connexion
        </div>
        <div style={{ height: 38, borderRadius: 9, border: `1px solid ${C.lineStrong}`, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 15, color: C.ink3 }}>camille@studiolumen.ch</div>
        <div style={{ height: 38, borderRadius: 9, border: `1px solid ${alpha("#ec4d5b", 0.6)}`, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 18, color: C.ink2, fontFamily: MONO, letterSpacing: 3 }}>
          ••••••••
        </div>
        <div style={{ fontSize: 14, color: "#ff8a94" }}>Mot de passe incorrect</div>
      </div>
    </div>
  );
};

export const Hook: React.FC<{ dur: number; fast?: boolean }> = ({ dur, fast }) => {
  const f = useCurrentFrame();
  const v = useV();
  const step = fast ? BEAT / 2 : BEAT; // one word per beat (or half beat)
  const words = WORDS;
  const wordsEnd = step * words.length;
  const idx = Math.min(words.length - 1, Math.floor(f / step));
  const local = f - idx * step;
  const inWords = f < wordsEnd;
  const collapseAt = dur - 22;
  const collapse = prog(f, collapseAt, 16, EASE_IN_OUT);
  const count = Math.min(words.length, Math.floor(f / step) + 1);
  const chaos = !inWords && f < collapseAt;
  const stop = f >= collapseAt + 6;
  const sfx: { f: number; kind: SfxKind }[] = [
    ...words.map((_, i) => ({ f: i * step, kind: (i % 2 ? "pop" : "click") as SfxKind })),
    { f: Math.max(0, dur - 60), kind: "riser" },
    { f: collapseAt, kind: "swish" },
  ];
  return (
    <Backdrop glow="#ff9650" glowOpacity={0.3}>
      {/* Windows pile up, one per word. */}
      <AbsoluteFill style={{ filter: `blur(${inWords ? 2.5 : 1}px)`, opacity: 0.9 }}>
        {Array.from({ length: words.length * 2 }).map((_, i) => (
          <LoginWindow key={i} i={i} born={(i % words.length) * step + (i >= words.length ? wordsEnd + (i - words.length) * 3 : 0)} f={f} collapse={collapse} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${v ? "95% 35%" : "60% 45%"} at 50% 50%, rgba(15,15,14,0.92), rgba(15,15,14,0.35))`, opacity: 1 - collapse }} />
      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: v ? 180 : 70,
          right: v ? 70 : 90,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: MONO,
          fontSize: v ? 34 : 28,
          color: "#ff8a94",
          padding: "12px 22px",
          borderRadius: 99,
          background: "rgba(236,77,91,0.12)",
          border: "1px solid rgba(236,77,91,0.35)",
          opacity: 1 - collapse,
        }}
      >
        <KeyRound size={v ? 30 : 24} /> {count} {count > 1 ? "comptes" : "compte"}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: v ? "0 60px" : 0 }}>
        {inWords && (
          <Serif
            size={v ? 150 : 180}
            style={{
              transform: `scale(${mix(prog(local, 0, 6, EASE), 1.35, 1)})`,
              filter: `blur(${mix(prog(local, 0, 5), 12, 0)}px)`,
              opacity: prog(local, 0, 3),
              textShadow: "0 10px 50px rgba(0,0,0,0.9)",
              color: idx === words.length - 1 ? "#ff8a94" : C.ink,
            }}
          >
            {words[idx]}
          </Serif>
        )}
        {chaos && (
          <div style={{ opacity: 1 - prog(f, collapseAt - 6, 6) }}>
            <Serif size={v ? 120 : 140} style={{ textShadow: "0 10px 50px rgba(0,0,0,0.9)" }}>
              <Words text="Trop d'apps." start={wordsEnd} stagger={2} dur={10} />
            </Serif>
            <Serif size={v ? 120 : 140} italic color="#ff8a94" style={{ textShadow: "0 10px 50px rgba(0,0,0,0.9)" }}>
              <Words text="Trop de mots de passe." start={wordsEnd + 8} stagger={2} dur={10} />
            </Serif>
          </div>
        )}
        {stop && (
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", boxShadow: `0 0 60px 20px ${alpha(C.accent, 0.6)}`, transform: `scale(${mix(prog(f, collapseAt + 6, 10), 1, 0.2)})` }} />
        )}
      </AbsoluteFill>
      <SfxTrack events={sfx} />
    </Backdrop>
  );
};

/* ───────────────────────── Reveal: one account ───────────────────────── */

export const Reveal: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const cx = width / 2;
  const cy = height / 2 - (v ? 80 : 40);
  const R = v ? 360 : 330;
  const converge = prog(f, 4 * BEAT, BEAT, (t) => t * t * t);
  const flash = f >= 5 * BEAT ? 1 - prog(f, 5 * BEAT, 12) : 0.7 * (1 - prog(f, 0, 10));
  const logo = prog(f, 5 * BEAT, 14, EASE);
  const spin = interpolate(f, [0, 5 * BEAT], [0, 120]);
  const lock = prog(f, BEAT, 10, EASE) * (1 - prog(f, 5 * BEAT, 4));
  const sfx: { f: number; kind: SfxKind }[] = [
    { f: 0, kind: "impact" },
    ...APPS.map((_, i) => ({ f: Math.round(i * (BEAT / 2)), kind: "swish" as SfxKind })),
    { f: BEAT, kind: "lock" },
    { f: 4 * BEAT, kind: "whoosh" },
    { f: 5 * BEAT, kind: "impact" },
  ];
  return (
    <Backdrop glow={C.accent} glow2="#a98bf5" glowOpacity={0.5 + 0.5 * logo}>
      {/* Rings */}
      {[0, 1, 2].map((k) => {
        const p = prog(f, k * BEAT, 2 * BEAT, EASE);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: cx - 400,
              top: cy - 400,
              width: 800,
              height: 800,
              borderRadius: 400,
              border: `2px solid ${alpha(C.accent, 0.4 * (1 - p))}`,
              transform: `scale(${mix(p, 0.2, 1.8)})`,
            }}
          />
        );
      })}
      {/* The seven icons fly in, orbit, then dive into the lock. */}
      {APPS.map((a, i) => {
        const born = i * (BEAT / 2);
        const p = prog(f, born, 14, EASE);
        if (f < born) return null;
        const ang = ((i / APPS.length) * 360 + spin - 90) * (Math.PI / 180);
        const fromAng = ang + Math.PI * 0.6;
        const r = mix(p, R * 3.2, R) * (1 - converge);
        const a0 = mix(p, fromAng, ang);
        const x = cx + Math.cos(a0) * r;
        const y = cy + Math.sin(a0) * r * (v ? 1.1 : 0.82);
        const size = v ? 150 : 130;
        return (
          <div
            key={a.id}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              transform: `perspective(800px) rotateY(${mix(p, 180, 0)}deg) scale(${mix(converge, 1, 0.2)})`,
              opacity: Math.min(1, p * 2) * (1 - prog(f, 5 * BEAT - 3, 3)),
              filter: `blur(${mix(p, 8, 0) + converge * 6}px)`,
            }}
          >
            <AppIcon icon={a.icon} size={size} glow={a.color} />
          </div>
        );
      })}
      {/* The lock at the centre. */}
      <div style={{ position: "absolute", left: cx - 110, top: cy - 110, transform: `scale(${mix(lock, 0.3, 1) * (1 + 0.15 * converge)})`, opacity: lock }}>
        <Img src={staticFile("brand/compte-512.png")} style={{ width: 220, height: 220, borderRadius: 50, boxShadow: `0 0 ${80 + 120 * converge}px ${alpha(C.accent, 0.5 + 0.4 * converge)}` }} />
      </div>
      {/* Flash */}
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.85 }} />
      {/* Logo + promise */}
      {logo > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${mix(logo, 1.4, 1)})`, filter: `blur(${mix(logo, 14, 0)}px)`, opacity: logo }}>
            <Img src={staticFile("brand/postmelo.png")} style={{ width: v ? 160 : 150, height: v ? 160 : 150, borderRadius: 36 }} />
            <Serif size={v ? 170 : 190}>Postmelo</Serif>
          </div>
          <Serif size={v ? 84 : 92} style={{ marginTop: 34, padding: v ? "0 60px" : 0 }}>
            <Words text="Toute ta suite." start={5 * BEAT + 8} stagger={3} dur={12} />
            {v ? <br /> : " "}
            <Words text="Un seul compte." start={6 * BEAT + 4} stagger={3} dur={12} wordStyle={() => ({ fontStyle: "italic", ...gradientText() })} />
          </Serif>
        </AbsoluteFill>
      )}
      <SfxTrack events={sfx.filter((e) => e.f < dur)} />
    </Backdrop>
  );
};
