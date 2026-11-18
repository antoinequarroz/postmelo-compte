import React from "react";
import { Check } from "lucide-react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { AppAd, BAR, ChipView, Cursor, SfxTrack } from "./ad";
import { Cta } from "./finale";
import { MOCK_H, MOCK_W } from "./kit";
import { SfxKind } from "./sound";
import { alpha, app, APPS, C, EASE, EASE_IN_OUT, MONO, SANS } from "./theme";
import { AppIcon, Backdrop, gradientText, mix, prog, Serif, Window, Words } from "./ui";

/**
 * One feature of an app in its long video. The mock plays from `from` to `to` (mock frames of the
 * app's Mock) at a calm pace, then holds; the camera frames `focus`.
 */
export type LongFeature = {
  title: string; // 2 to 5 words, the benefit
  text: string; // one or two sentences, tutoiement
  points?: string[]; // up to 3 short proof points
  from: number;
  to: number;
  focus: { x: number; y: number; zoom: number };
};

export const INTRO_LEN = BAR;
export const FEATURE_LEN = 3 * BAR;
export const SUITE_LEN = BAR;
export const CTA_LEN = 2 * BAR;

export const longLength = (features: LongFeature[]) => INTRO_LEN + features.length * FEATURE_LEN + SUITE_LEN + CTA_LEN;

const colOf = (ad: AppAd) => (ad.id === "tickup" ? "#e9e6df" : app(ad.id).color);

/* ─────────────── intro: the app takes the stage ─────────────── */

const LongIntro: React.FC<{ ad: AppAd; dur: number }> = ({ ad, dur }) => {
  const f = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const v = height > width;
  const a = app(ad.id);
  const col = colOf(ad);
  const slam = prog(f, 0, 12, EASE);
  const out = prog(f, dur - 8, 8, EASE_IN_OUT);
  return (
    <Backdrop glow={ad.id === "tickup" ? "#bbbbbb" : a.color} glow2={a.color}>
      {[0, 1].map((k) => {
        const p = prog(f, k * 6, 28, EASE);
        return (
          <div
            key={k}
            style={{ position: "absolute", left: width / 2 - 500, top: height / 2 - 600, width: 1000, height: 1000, borderRadius: 500, border: `2px solid ${alpha(col, 0.45 * (1 - p))}`, transform: `scale(${mix(p, 0.15, 1.5)})` }}
          />
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 1 - out, transform: `scale(${mix(out, 1, 1.06)})`, filter: `blur(${out * 12}px)` }}>
        <div style={{ transform: `perspective(900px) rotateY(${mix(slam, -200, 0)}deg) scale(${mix(slam, 2.4, 1)})`, opacity: Math.min(1, slam * 2) }}>
          <AppIcon icon={a.icon} size={v ? 260 : 220} glow={col} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: v ? 26 : 22, letterSpacing: "0.3em", textTransform: "uppercase", color: col, marginTop: 40, opacity: prog(f, 6, 10) }}>{a.category}</div>
        <Serif size={v ? 190 : 200} style={{ marginTop: 10, whiteSpace: "nowrap" }}>
          <Words text={a.name} start={5} stagger={3} dur={11} />
        </Serif>
        <div style={{ fontFamily: SANS, fontSize: v ? 44 : 40, color: C.ink2, marginTop: 18, padding: v ? "0 70px" : 0 }}>
          <Words text={a.tagline} start={12} stagger={1} dur={10} />
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "impact" }, { f: 8, kind: "swish" }]} />
    </Backdrop>
  );
};

/* ─────────────── one feature ─────────────── */

const FeatureScene: React.FC<{ ad: AppAd; feature: LongFeature; index: number; total: number; dur: number }> = ({ ad, feature, index, total, dur }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const a = app(ad.id);
  const col = colOf(ad);
  const Mock = ad.Mock;

  // Whip in, whip out.
  const enter = prog(frame, 0, 12, EASE);
  const exit = prog(frame, dur - 9, 9, EASE_IN_OUT);
  // The product plays at (close to) real speed, then the camera keeps cutting on the bar.
  const span = Math.max(1, feature.to - feature.from);
  const speed = Math.min(1.3, Math.max(0.8, span / 120));
  const f = feature.from + Math.min(span, Math.max(0, frame - 6) * speed); // mock time

  // Three shots per feature, one per bar: wide, punch on the focus, a tilted angle.
  const fx = feature.focus.x;
  const fy = feature.focus.y;
  const zMax = v ? 1.3 : Math.min(1.5, 1140 / Math.max(fx, 1));
  const shots = [
    { z: 1.0, pull: 0.25, tilt: 0 },
    { z: Math.min(zMax, feature.focus.zoom + 0.14), pull: 1, tilt: 0 },
    { z: Math.min(zMax, Math.max(1.04, feature.focus.zoom - 0.04)), pull: 0.7, tilt: -7 },
  ];
  const c1 = prog(frame, BAR, 10, EASE);
  const c2 = prog(frame, 2 * BAR, 10, EASE);
  const pick = (k: "z" | "pull" | "tilt") => mix(c2, mix(c1, shots[0][k], shots[1][k]), shots[2][k]);
  const local = frame % BAR;
  const drift = 0.035 * (local / BAR);
  const beat = Math.max(0, 1 - (frame % 15) / 7);
  const zoom = (v ? 1 + (pick("z") - 1) * 0.6 : pick("z")) + drift;
  const s = zoom * (1 + 0.006 * beat);
  const pull = pick("pull");
  const tilt = pick("tilt");
  const stageCx = v ? width / 2 : 1300;
  const stageCy = v ? height * 0.64 : height * 0.52;
  const W = MOCK_W * s;
  const H = (MOCK_H + 52) * s;
  const tx = stageCx - (MOCK_W / 2) * s - (fx - MOCK_W / 2) * s * pull;
  const ty = stageCy - ((MOCK_H + 52) / 2) * s - (fy - MOCK_H / 2) * s * pull;
  const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, Math.min(a, b)), Math.max(a, b));
  const txC = v ? tx : clamp(tx, 700, width - W - 20);
  const tyC = v ? Math.max(ty, 700) : clamp(ty, 50, height - H - 50);
  const whipX = v ? 0 : mix(enter, 520, 0) - 420 * exit;

  const keys = ad.cursor.filter((k) => k.f >= feature.from - 20 && k.f <= feature.to + 10);
  const chips = ad.chips.filter((c) => c.f >= feature.from && c.f <= feature.to);
  const sfx = ad.sfx
    .filter((e) => e.f >= feature.from && e.f <= feature.to)
    .map((e) => ({ f: 6 + (e.f - feature.from) / speed, kind: e.kind }));
  const pointAt = (i: number) => 2 * 15 + i * 15; // the proof points land on the beats

  const text = (
    <div style={{ fontFamily: SANS, textAlign: v ? "center" : "left", display: "flex", flexDirection: "column", alignItems: v ? "center" : "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: v ? 24 : 20, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink3, opacity: prog(frame, 2, 14) }}>
        <AppIcon icon={a.icon} size={v ? 44 : 38} />
        <span style={{ color: C.ink }}>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ width: 40, height: 1, background: C.lineStrong }} />
        <span style={{ color: col }}>{a.name}</span>
        <span>/ {String(total).padStart(2, "0")}</span>
      </div>
      <Serif size={v ? 104 : 92} style={{ marginTop: 26, maxWidth: v ? 960 : 540, lineHeight: 1.02 }}>
        <Words text={feature.title} start={4} stagger={2} dur={11} />
      </Serif>
      <div style={{ fontSize: v ? 36 : 29, color: C.ink2, marginTop: 24, maxWidth: v ? 900 : 520, lineHeight: 1.35 }}>
        <Words text={feature.text} start={12} stagger={0.5} dur={10} />
      </div>
      {feature.points && !v && (
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
          {feature.points.map((p, i) => {
            const pp = prog(frame, pointAt(i), 9, EASE);
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: C.ink, opacity: pp, transform: `translateX(${mix(pp, -24, 0)}px) scale(${mix(pp, 0.9, 1)})`, transformOrigin: "0 50%" }}>
                <span style={{ width: 30, height: 30, borderRadius: 15, background: alpha(col, 0.18), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={17} color={col} />
                </span>
                {p}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <Backdrop glow={ad.id === "tickup" ? "#bbbbbb" : a.color} glow2={a.color}>
      <AbsoluteFill style={{ opacity: 1 - exit, filter: `blur(${exit * 16 + (1 - enter) * 10}px)` }}>
        <div style={{ position: "absolute", inset: 0, perspective: 1600, transform: `translateX(${whipX}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: MOCK_W,
            height: MOCK_H + 52,
            transformOrigin: "0 0",
            transform: `translate(${txC}px, ${tyC + (v ? mix(enter, 200, 0) : 0)}px) rotateY(${tilt}deg) scale(${s * mix(enter, 0.94, 1)})`,
            opacity: Math.min(1, enter * 1.6),
          }}
        >
          <Window width={MOCK_W} height={MOCK_H + 52} title={ad.title} accent={col}>
            <Mock f={f} />
          </Window>
          <div style={{ position: "absolute", left: 0, top: 52, width: MOCK_W, height: MOCK_H }}>
            <Cursor keys={keys} f={f} color={col} />
          </div>
        </div>
        {chips.map((c, i) => {
          const sx = txC + c.x * s;
          const sy = tyC + (52 + c.y) * s;
          const x = Math.min(width - (v ? 260 : 230), Math.max(v ? 260 : 720, sx));
          const y = Math.min(height - 90, Math.max(v ? 640 : 90, sy));
          return <ChipView key={i} chip={{ ...c, x, y }} f={f} color={col} scale={1} />;
        })}
        </div>
        {!v && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 720, background: `linear-gradient(90deg, ${C.bg} 0%, ${alpha(C.bg, 0.92)} 75%, transparent)` }} />}
        {v && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700, background: `linear-gradient(180deg, ${C.bg} 0%, ${alpha(C.bg, 0.9)} 70%, transparent)` }} />}
        <div style={{ position: "absolute", left: v ? 0 : 110, right: v ? 0 : undefined, top: v ? 190 : 0, bottom: v ? undefined : 0, width: v ? undefined : 540, transform: `translateX(${v ? 0 : mix(enter, -80, 0) - 160 * exit}px)`, display: "flex", alignItems: "center", justifyContent: v ? "center" : "flex-start", padding: v ? "0 60px" : 0 }}>
          {text}
        </div>
      </AbsoluteFill>
      <SfxTrack
        events={[
          { f: 0, kind: "whoosh" as SfxKind },
          { f: BAR, kind: "swish" as SfxKind },
          { f: 2 * BAR, kind: "swish" as SfxKind },
          ...(feature.points && !v ? feature.points.map((_, i) => ({ f: pointAt(i), kind: "pop" as SfxKind })) : []),
          ...sfx,
        ].filter((e) => e.f < dur)}
      />
    </Backdrop>
  );
};

/* ─────────────── part of the suite ─────────────── */

const SuiteScene: React.FC<{ ad: AppAd; dur: number }> = ({ ad, dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const a = app(ad.id);
  const others = APPS.filter((x) => x.id !== ad.id);
  const out = prog(f, dur - 8, 8, EASE_IN_OUT);
  const cx = width / 2;
  const cy = height / 2 - (v ? 160 : 90);
  const R = v ? 340 : 290;
  const spin = interpolate(f, [0, dur], [0, 50]);
  return (
    <Backdrop glow={C.accent} glow2={a.color}>
      <AbsoluteFill style={{ opacity: 1 - out, filter: `blur(${out * 12}px)` }}>
        <div style={{ position: "absolute", left: cx - 90, top: cy - 90, transform: `scale(${mix(prog(f, 0, 14, EASE), 0.6, 1)})` }}>
          <AppIcon icon={a.icon} size={180} glow={colOf(ad)} />
        </div>
        {others.map((o, i) => {
          const p = prog(f, 3 + i * 2, 12, EASE);
          const ang = ((i / others.length) * 360 + spin - 90) * (Math.PI / 180);
          const r = mix(p, R * 2.4, R);
          const size = v ? 110 : 96;
          return (
            <div key={o.id} style={{ position: "absolute", left: cx + Math.cos(ang) * r - size / 2, top: cy + Math.sin(ang) * r * (v ? 1 : 0.62) - size / 2, opacity: p }}>
              <AppIcon icon={o.icon} size={size} glow={o.color} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: v ? cy + R + 160 : cy + R * 0.62 + 110, textAlign: "center", padding: v ? "0 60px" : 0 }}>
          <Serif size={v ? 92 : 84}>
            <Words text={`${a.name} fait partie de la suite.`} start={8} stagger={1.5} dur={10} />
          </Serif>
          <Serif size={v ? 92 : 84} italic style={{ marginTop: 6 }}>
            <Words text="Un seul compte pour les 7 apps." start={22} stagger={1.5} dur={10} wordStyle={() => gradientText()} />
          </Serif>
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "swish" as SfxKind }, ...others.map((_, i) => ({ f: 3 + i * 2, kind: "pop" as SfxKind }))]} />
    </Backdrop>
  );
};

/* ─────────────── the whole long video ─────────────── */

export const LongVideo: React.FC<{ ad: AppAd; features: LongFeature[] }> = ({ ad, features }) => {
  const a = app(ad.id);
  const parts: { len: number; el: (l: number) => React.ReactNode }[] = [
    { len: INTRO_LEN, el: (l) => <LongIntro ad={ad} dur={l} /> },
    ...features.map((feat, i) => ({ len: FEATURE_LEN, el: (l: number) => <FeatureScene ad={ad} feature={feat} index={i} total={features.length} dur={l} /> })),
    { len: SUITE_LEN, el: (l) => <SuiteScene ad={ad} dur={l} /> },
    { len: CTA_LEN, el: (l) => <Cta dur={l} line={`Essaie ${a.name}, inclus dans Postmelo.`} /> },
  ];
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {parts.map((p, i) => {
        const from = at;
        at += p.len;
        return (
          <Sequence key={i} from={from} durationInFrames={p.len} premountFor={30}>
            {p.el(p.len)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
