import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SfxTrack } from "./ad";
import { SfxKind } from "./sound";
import { alpha, APPS, C, EASE, EASE_IN_OUT, MONO } from "./theme";
import { Backdrop, gradientText, mix, prog, Serif } from "./ui";

/* ───────────────────────── Hook: an editorial opening ─────────────────────────
   Type and light only: a label, two lines that slide out of a mask, a hairline of light,
   seven points (one per app) that gather into one before the drop. */

/** Words that slide up out of a mask, one after the other. */
const MaskWords: React.FC<{ text: string; start: number; stagger: number; wordStyle?: React.CSSProperties }> = ({ text, start, stagger, wordStyle }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => {
        const p = prog(f, start + i * stagger, 16, EASE);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", height: "1.18em", lineHeight: "1.18em", padding: "0 0.06em", margin: "0 -0.06em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${mix(p, 120, 0)}%)`, whiteSpace: "pre", ...wordStyle }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </>
  );
};

export const Hook: React.FC<{ dur: number; fast?: boolean }> = ({ dur, fast }) => {
  const f0 = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  // The fast cut (two bars) keeps the reading speed and shortens the holds.
  const T = fast ? { l1: 6, st: 4, l2: 30, dots: 50, out: 82, shrink: 90, pulse: 105 } : { l1: 14, st: 6, l2: 60, dots: 92, out: 118, shrink: 140, pulse: 164 };
  const f = f0;
  const k = 1;
  const line = prog(f, 0, 34, EASE);
  const out = prog(f, T.out, fast ? 20 : 30, EASE_IN_OUT);
  const shrink = prog(f, T.shrink, fast ? 16 : 24, EASE_IN_OUT);
  const pulse = prog(f, T.pulse, 14, EASE);
  const lineY = height / 2 + (v ? 250 : 210);
  const lineW = (v ? 860 : 1200) * line * (1 - shrink);
  const sfx: { f: number; kind: SfxKind }[] = [
    { f: 0, kind: "swish" },
    { f: T.l2, kind: "whoosh" },
    ...APPS.map((_, i) => ({ f: T.dots + i * 3, kind: "pop" as SfxKind })),
    { f: Math.max(0, dur - 60), kind: "riser" },
  ];
  return (
    <Backdrop glow={C.accent} glowOpacity={0.35 + 0.4 * line}>
      {/* The hairline of light that holds the composition. */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - lineW / 2,
          top: lineY,
          width: lineW,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(C.accent, 0.9)}, #fff, ${alpha("#a98bf5", 0.9)}, transparent)`,
          boxShadow: `0 0 30px 4px ${alpha(C.accent, 0.35)}`,
          opacity: line * (1 - pulse),
        }}
      />
      {/* Seven points of light, one per app, gathering into one. */}
      {APPS.map((a, i) => {
        const p = prog(f, T.dots + i * 3, 14, EASE);
        const gap = v ? 100 : 130;
        const x = mix(shrink, width / 2 + (i - 3) * gap, width / 2);
        const col = a.id === "tickup" ? "#e9e6df" : a.color;
        const r = 8 + 2.5 * Math.sin((f + i * 9) / 7) * (1 - shrink);
        return (
          <div
            key={a.id}
            style={{
              position: "absolute",
              left: x - r,
              top: lineY - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              background: col,
              boxShadow: `0 0 26px 7px ${alpha(col, 0.6)}`,
              opacity: p * (1 - pulse),
              transform: `scale(${p})`,
            }}
          />
        );
      })}
      {/* The point flares before the drop. */}
      {shrink > 0.95 && (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 10,
            top: lineY - 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "#fff",
            transform: `scale(${1 + 1.5 * pulse})`,
          }}
        />
      )}
      {shrink > 0.95 && (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 400,
            top: lineY - 400,
            width: 800,
            height: 800,
            borderRadius: 400,
            background: `radial-gradient(circle, ${alpha("#ffffff", 0.5 * pulse)}, ${alpha(C.accent, 0.35)} 12%, transparent 60%)`,
            transform: `scale(${0.2 + 0.8 * pulse})`,
          }}
        />
      )}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: v ? "0 60px" : 0 }}>
        <div style={{ transform: `translateY(${mix(out, 0, -40)}px) scale(${mix(out, 1, 0.96)})`, opacity: 1 - out, filter: `blur(${out * 10}px)`, marginTop: v ? -140 : -90 }}>
          <div style={{ fontFamily: MONO, fontSize: v ? 26 : 22, letterSpacing: "0.32em", textTransform: "uppercase", color: C.ink3, opacity: prog(f, 4, 20) }}>Postmelo · la suite</div>
          <Serif size={v ? 112 : 168} style={{ marginTop: 22, lineHeight: 1.18 }}>
            <MaskWords text="Tout ton travail." start={T.l1} stagger={T.st} />
          </Serif>
          <Serif size={v ? 112 : 168} style={{ lineHeight: 1.18 }}>
            <MaskWords text="Dans" start={T.l2} stagger={T.st} /> <MaskWords text="une seule suite." start={T.l2 + T.st} stagger={T.st} wordStyle={{ fontStyle: "italic", ...gradientText() }} />
          </Serif>
        </div>
      </AbsoluteFill>
      <SfxTrack events={sfx.filter((e) => e.f < dur)} />
    </Backdrop>
  );
};
