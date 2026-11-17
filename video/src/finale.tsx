import React from "react";
import { ArrowRight } from "lucide-react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, Cursor, SfxTrack } from "./ad";
import { HubWindow } from "./scenes";
import { SfxKind } from "./sound";
import { alpha, app, AppId, APPS, C, EASE, EASE_IN_OUT, MONO, SANS } from "./theme";
import { AppIcon, Backdrop, gradientText, mix, prog, Serif, Words } from "./ui";

/* ───────────────────────── They talk to each other ───────────────────────── */

const FLOW: { id: AppId; when: string; t: string }[] = [
  { id: "alfred", when: "Mardi 10 h", t: "Alfred cale l'enregistrement" },
  { id: "nino", when: "Mardi 14 h", t: "Nino Studio filme le podcast" },
  { id: "maya", when: "Mardi 20 h", t: "Maya Studio le diffuse en direct" },
  { id: "metricove", when: "Jeudi 9 h", t: "Metricove le publie partout" },
  { id: "lamio", when: "Jeudi 9 h 01", t: "Lamio prévient toute l'équipe" },
];

export const Flow: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const n = FLOW.length;
  const hit = (i: number) => (i + 1) * 2 * BEAT; // a node every two beats
  // The light travels between nodes and lands on each hit.
  let pos = 0;
  for (let i = 0; i < n; i++) {
    const from = i === 0 ? hit(0) - BEAT : hit(i - 1);
    pos = i + prog(f, from + (i === 0 ? 0 : 8), hit(i) - from - (i === 0 ? 0 : 8), EASE_IN_OUT) - 1;
    if (f < hit(i)) break;
    pos = i;
  }
  const P = (i: number) => (v ? { x: 190, y: 640 + i * 250 } : { x: 230 + i * ((width - 460) / (n - 1)), y: height / 2 + 100 });
  const head = (() => {
    const i = Math.max(0, Math.floor(pos));
    const t = pos - i;
    const a = P(i);
    const b = P(Math.min(n - 1, i + 1));
    return { x: mix(t, a.x, b.x), y: mix(t, a.y, b.y) };
  })();
  const out = 1 - prog(f, dur - 8, 8);
  const icon = v ? 150 : 150;
  const sfx: { f: number; kind: SfxKind }[] = FLOW.map((_, i) => ({ f: hit(i), kind: "pop" as SfxKind }));
  return (
    <Backdrop glow={app(FLOW[Math.max(0, Math.min(n - 1, Math.round(pos)))].id).color} glow2={C.accent}>
      <AbsoluteFill style={{ opacity: out, filter: `blur(${(1 - out) * 10}px)` }}>
        <div style={{ position: "absolute", top: v ? 210 : 140, width: "100%", textAlign: "center" }}>
          <Serif size={v ? 130 : 140}>
            <Words text="Et elles se" start={0} stagger={3} dur={12} />
            <Words text=" parlent." start={8} dur={12} wordStyle={() => ({ fontStyle: "italic", ...gradientText() })} />
          </Serif>
          <div style={{ fontFamily: SANS, fontSize: v ? 38 : 32, color: C.ink2, marginTop: 16 }}>
            <Words text="Une semaine de podcast, sans jamais changer d'outil." start={10} stagger={1} dur={12} />
          </div>
        </div>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <line x1={P(0).x + (v ? icon / 2 : 0)} y1={P(0).y} x2={P(n - 1).x + (v ? icon / 2 : 0)} y2={P(n - 1).y} stroke={C.lineStrong} strokeWidth={2} />
          <line x1={P(0).x + (v ? icon / 2 : 0)} y1={P(0).y} x2={head.x + (v ? icon / 2 : 0)} y2={head.y} stroke={C.accent} strokeWidth={5} strokeLinecap="round" opacity={prog(f, hit(0) - BEAT, 6)} style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }} />
          <circle cx={head.x + (v ? icon / 2 : 0)} cy={head.y} r={12} fill="#fff" opacity={prog(f, hit(0) - BEAT, 6)} style={{ filter: "drop-shadow(0 0 14px #fff)" }} />
        </svg>
        {FLOW.map((s, i) => {
          const a = app(s.id);
          const lit = prog(f, hit(i), 8, EASE);
          const bump = f >= hit(i) ? 1 + 0.25 * (1 - prog(f, hit(i), 12, EASE)) : 1;
          const appear = prog(f, 4 + i * 3, 14, EASE);
          const p = P(i);
          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: v ? p.x : p.x - 170,
                top: p.y - icon / 2,
                width: v ? 760 : 340,
                display: "flex",
                flexDirection: v ? "row" : "column",
                alignItems: "center",
                gap: v ? 34 : 22,
                opacity: appear,
                transform: `translateY(${mix(appear, 30, 0)}px)`,
                fontFamily: SANS,
                textAlign: v ? "left" : "center",
              }}
            >
              <div style={{ transform: `scale(${bump})`, filter: `grayscale(${1 - lit}) brightness(${mix(lit, 0.5, 1)})` }}>
                <AppIcon icon={a.icon} size={icon} glow={lit > 0.1 ? a.color : undefined} />
              </div>
              <div style={{ opacity: mix(lit, 0.3, 1), transform: `translateY(${mix(lit, 10, 0)}px)` }}>
                <div style={{ fontFamily: MONO, fontSize: v ? 26 : 20, letterSpacing: "0.12em", textTransform: "uppercase", color: a.color }}>{s.when}</div>
                <div style={{ fontSize: v ? 40 : 28, color: C.ink, marginTop: 10, lineHeight: 1.25 }}>{s.t}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <SfxTrack events={sfx.filter((e) => e.f < dur)} />
    </Backdrop>
  );
};

/* ───────────────────────── The hub ───────────────────────── */

export const Hub: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const rise = prog(f, 0, 24, EASE);
  const straighten = prog(f, 4, 40, EASE_IN_OUT);
  const w = v ? 960 : 1440;
  const h = v ? 1200 : 860;
  const out = 1 - prog(f, dur - 8, 8);
  const push = mix(prog(f, 40, dur - 40), 1, 1.06);
  return (
    <Backdrop glow={C.accent} glow2="#a98bf5">
      <AbsoluteFill style={{ alignItems: "center", opacity: out, filter: `blur(${(1 - out) * 12}px)` }}>
        <div style={{ textAlign: "center", marginTop: v ? 190 : 56, zIndex: 2 }}>
          <Serif size={v ? 118 : 104}>
            <Words text="Un seul compte." start={BEAT} stagger={3} dur={10} />
            {v ? <br /> : " "}
            <Words text="Un seul design." start={2 * BEAT} stagger={3} dur={10} />
          </Serif>
          <Serif size={v ? 118 : 104} italic style={{ marginTop: 6 }}>
            <Words text="Toutes tes applications." start={3 * BEAT} stagger={3} dur={10} wordStyle={() => gradientText()} />
          </Serif>
        </div>
        <div style={{ position: "absolute", top: v ? 720 : 330, left: "50%", perspective: 2400 }}>
          <div
            style={{
              transform: `translateX(-50%) translateY(${mix(rise, 600, 0)}px) rotateX(${mix(straighten, 40, 0)}deg) scale(${0.98 * mix(straighten, 0.88, 1) * push})`,
              transformOrigin: "50% 0%",
              opacity: rise,
              filter: `drop-shadow(0 0 90px ${alpha(C.accent, 0.3)})`,
            }}
          >
            <HubWindow f={(f - 20) * 1.6} w={w} h={h} narrow={v} />
          </div>
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "whoosh" as SfxKind }, ...APPS.map((_, i) => ({ f: 20 + i * 5, kind: "click" as SfxKind }))].filter((e) => e.f < dur)} />
    </Backdrop>
  );
};

/* ───────────────────────── Call to action ───────────────────────── */

export const Cta: React.FC<{ dur: number; line?: string }> = ({ dur, line = "Essaie toute la suite Postmelo." }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const logo = prog(f, 0, 14, EASE);
  const btn = prog(f, BEAT, 12, EASE);
  const clickAt = 3 * BEAT;
  const pressed = f >= clickAt;
  const burst = prog(f, clickAt, 30, EASE);
  const cx = width / 2;
  const btnY = v ? height / 2 + 160 : height / 2 + 150;
  const sfx: { f: number; kind: SfxKind }[] = [
    { f: 0, kind: "impact" },
    { f: clickAt, kind: "click" },
    { f: clickAt, kind: "ding" },
    ...APPS.map((_, i) => ({ f: clickAt + 2 + i * 2, kind: "pop" as SfxKind })),
  ];
  return (
    <Backdrop glow={C.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
        {/* Icons burst out of the button. */}
        {APPS.map((a, i) => {
          const ang = (-90 + (i - 3) * (v ? 26 : 22)) * (Math.PI / 180);
          const r = mix(burst, 0, v ? 640 : 560);
          const size = v ? 120 : 100;
          return (
            <div
              key={a.id}
              style={{
                position: "absolute",
                left: cx + Math.cos(ang) * r * (v ? 0.9 : 1.5) - size / 2,
                top: btnY + Math.sin(ang) * r * (v ? 1.15 : 0.95) - size / 2 - 40,
                opacity: pressed ? Math.min(1, burst * 3) : 0,
                transform: `scale(${mix(burst, 0.2, 1)}) rotate(${mix(burst, -40, 0)}deg)`,
              }}
            >
              <AppIcon icon={a.icon} size={size} glow={a.color} />
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 28, opacity: logo, transform: `scale(${mix(logo, 1.3, 1)})`, filter: `blur(${mix(logo, 12, 0)}px)`, marginTop: pressed ? mix(burst, 0, v ? 80 : 60) : 0 }}>
          <Img src={staticFile("brand/postmelo.png")} style={{ width: v ? 150 : 128, height: v ? 150 : 128, borderRadius: 32 }} />
          <Serif size={v ? 170 : 160}>Postmelo</Serif>
        </div>
        <div style={{ fontSize: v ? 44 : 38, color: C.ink, marginTop: 30, textAlign: "center", padding: v ? "0 70px" : 0, marginBottom: 0 }}>
          <Words text={line} start={6} stagger={2} dur={12} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 50,
            padding: v ? "26px 46px" : "22px 40px",
            borderRadius: 99,
            background: C.accent,
            color: C.accentInk,
            fontSize: v ? 40 : 34,
            fontWeight: 500,
            opacity: btn,
            transform: `translateY(${mix(btn, 20, 0)}px) scale(${f >= clickAt - 2 && f < clickAt + 4 ? 0.94 : 1 + 0.04 * Math.sin(f / 6) * (pressed ? 0 : 1)})`,
            boxShadow: `0 10px ${60 + 60 * burst}px -10px ${alpha(C.accent, 0.8)}`,
          }}
        >
          Demander un accès <ArrowRight size={v ? 36 : 30} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: v ? 40 : 34, color: C.ink, marginTop: 34, letterSpacing: "0.04em", opacity: prog(f, 2 * BEAT, 10) }}>postmelo.ch</div>
        <div style={{ position: "absolute", left: 0, top: 0, width, height }}>
          <Cursor
            f={f}
            color={C.accent}
            keys={[
              { f: BEAT + 6, x: cx + 380, y: btnY + 160 },
              { f: clickAt - 2, x: cx + 60, y: btnY + 10 },
              { f: clickAt, x: cx + 60, y: btnY + 10, click: true },
              { f: dur, x: cx + 90, y: btnY + 60 },
            ]}
          />
        </div>
      </AbsoluteFill>
      <SfxTrack events={sfx.filter((e) => e.f < dur)} />
    </Backdrop>
  );
};

/* ───────────────────────── Section title for the cuts ───────────────────────── */

export const SectionTitle: React.FC<{ dur: number; title: string; italic: string; ids: AppId[] }> = ({ dur, title, italic, ids }) => {
  const f = useCurrentFrame();
  const out = 1 - prog(f, dur - 6, 6);
  return (
    <Backdrop glow={C.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: out }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: "0.2em", color: C.ink3, textTransform: "uppercase", opacity: prog(f, 0, 8) }}>La suite Postmelo</div>
        <Serif size={150} style={{ marginTop: 26 }}>
          <Words text={title} start={0} dur={10} />
        </Serif>
        <Serif size={150} italic>
          <Words text={italic} start={6} dur={10} wordStyle={() => gradientText()} />
        </Serif>
        <div style={{ display: "flex", gap: 22, marginTop: 60 }}>
          {ids.map((id, i) => {
            const p = prog(f, 8 + i * 4, 12, EASE);
            return (
              <div key={id} style={{ opacity: p, transform: `translateY(${mix(p, 60, 0)}px) rotate(${mix(p, -20, 0)}deg)` }}>
                <AppIcon icon={app(id).icon} size={120} glow={app(id).color} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "impact" }, ...ids.map((_, i) => ({ f: 8 + i * 4, kind: "pop" as SfxKind }))]} />
    </Backdrop>
  );
};
