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
