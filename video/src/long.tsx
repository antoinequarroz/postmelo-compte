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

export const INTRO_LEN = 2 * BAR;
export const FEATURE_LEN = 4 * BAR;
export const SUITE_LEN = 2 * BAR;
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
  const slam = prog(f, 0, 16, EASE);
  const out = prog(f, dur - 12, 12, EASE_IN_OUT);
  return (
    <Backdrop glow={ad.id === "tickup" ? "#bbbbbb" : a.color} glow2={a.color}>
      {[0, 1].map((k) => {
        const p = prog(f, k * 8, 40, EASE);
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
        <div style={{ fontFamily: MONO, fontSize: v ? 26 : 22, letterSpacing: "0.3em", textTransform: "uppercase", color: col, marginTop: 40, opacity: prog(f, 10, 14) }}>{a.category}</div>
        <Serif size={v ? 190 : 200} style={{ marginTop: 10, whiteSpace: "nowrap" }}>
          <Words text={a.name} start={8} stagger={4} dur={16} />
        </Serif>
        <div style={{ fontFamily: SANS, fontSize: v ? 44 : 40, color: C.ink2, marginTop: 18, padding: v ? "0 70px" : 0 }}>
          <Words text={a.tagline} start={20} stagger={1.5} dur={14} />
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

  const enter = prog(frame, 0, 22, EASE);
  const exit = prog(frame, dur - 14, 14, EASE_IN_OUT);
  const span = Math.max(1, feature.to - feature.from);
  const playFrames = dur - 60;
  const speed = Math.min(1, Math.max(0.35, span / playFrames));
  const f = feature.from + Math.min(span, Math.max(0, frame - 14) * speed); // mock time

  const drift = interpolate(frame, [0, dur], [0, 0.04]);
  const zoom = (v ? 1 + (feature.focus.zoom - 1) * 0.6 : feature.focus.zoom) + drift;
  const base = v ? 1.0 : 1.0;
  const s = base * zoom;
  const stageCx = v ? width / 2 : 1300;
  const stageCy = v ? height * 0.64 : height * 0.52;
  const pull = Math.min(1, (zoom - 1) * 2.4);
  const tx = stageCx - (MOCK_W / 2) * s - (feature.focus.x - MOCK_W / 2) * s * pull;
  const ty = stageCy - ((MOCK_H + 52) / 2) * s - (feature.focus.y - MOCK_H / 2) * s * pull;
  const txC = v ? tx : Math.max(700, Math.min(tx, width - MOCK_W * s - 20 > 700 ? width - MOCK_W * s - 20 : 700));
  const H = (MOCK_H + 52) * s;
  const tyC = v ? Math.max(ty, 700) : Math.min(Math.max(ty, Math.min(50, height - H - 50)), Math.max(50, height - H - 50));

  const keys = ad.cursor.filter((k) => k.f >= feature.from - 20 && k.f <= feature.to + 10);
  const chips = ad.chips.filter((c) => c.f >= feature.from && c.f <= feature.to);
  const sfx = ad.sfx
    .filter((e) => e.f >= feature.from && e.f <= feature.to)
    .map((e) => ({ f: 14 + (e.f - feature.from) / speed, kind: e.kind }));

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
        <Words text={feature.title} start={6} stagger={3} dur={16} />
      </Serif>
      <div style={{ fontSize: v ? 36 : 29, color: C.ink2, marginTop: 24, maxWidth: v ? 900 : 520, lineHeight: 1.35 }}>
        <Words text={feature.text} start={18} stagger={0.8} dur={14} />
      </div>
      {feature.points && !v && (
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
          {feature.points.map((p, i) => {
            const pp = prog(frame, 40 + i * 8, 16, EASE);
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: C.ink, opacity: pp, transform: `translateX(${mix(pp, -16, 0)}px)` }}>
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
      <AbsoluteFill style={{ opacity: 1 - exit, filter: `blur(${exit * 14}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: MOCK_W,
            height: MOCK_H + 52,
            transformOrigin: "0 0",
            transform: `translate(${txC + (v ? 0 : mix(enter, 160, 0))}px, ${tyC + (v ? mix(enter, 200, 0) : 0)}px) scale(${s * mix(enter, 0.92, 1)})`,
            opacity: enter,
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
        {!v && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 720, background: `linear-gradient(90deg, ${C.bg} 0%, ${alpha(C.bg, 0.92)} 75%, transparent)` }} />}
        {v && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700, background: `linear-gradient(180deg, ${C.bg} 0%, ${alpha(C.bg, 0.9)} 70%, transparent)` }} />}
        <div style={{ position: "absolute", left: v ? 0 : 110, right: v ? 0 : undefined, top: v ? 190 : 0, bottom: v ? undefined : 0, width: v ? undefined : 540, display: "flex", alignItems: "center", justifyContent: v ? "center" : "flex-start", padding: v ? "0 60px" : 0 }}>
          {text}
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "whoosh" as SfxKind }, ...sfx].filter((e) => e.f < dur)} />
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
  const out = prog(f, dur - 10, 10, EASE_IN_OUT);
  const cx = width / 2;
  const cy = height / 2 - (v ? 160 : 90);
  const R = v ? 340 : 290;
  const spin = interpolate(f, [0, dur], [0, 40]);
  return (
    <Backdrop glow={C.accent} glow2={a.color}>
      <AbsoluteFill style={{ opacity: 1 - out, filter: `blur(${out * 12}px)` }}>
        <div style={{ position: "absolute", left: cx - 90, top: cy - 90, transform: `scale(${mix(prog(f, 0, 14, EASE), 0.6, 1)})` }}>
          <AppIcon icon={a.icon} size={180} glow={colOf(ad)} />
        </div>
        {others.map((o, i) => {
          const p = prog(f, 6 + i * 4, 18, EASE);
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
            <Words text={`${a.name} fait partie de la suite.`} start={20} stagger={2.5} dur={14} />
          </Serif>
          <Serif size={v ? 92 : 84} italic style={{ marginTop: 6 }}>
            <Words text="Un seul compte pour les 7 apps." start={34} stagger={2.5} dur={14} wordStyle={() => gradientText()} />
          </Serif>
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "swish" as SfxKind }, ...others.map((_, i) => ({ f: 6 + i * 4, kind: "pop" as SfxKind }))]} />
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
