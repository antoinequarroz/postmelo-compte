import React from "react";
import { ArrowRight, Bell, Check, Home, KeyRound, LayoutGrid, Lock, Search, Users } from "lucide-react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, App, app, AppId, APPS, C, EASE_IN_OUT, MONO, SANS, SERIF } from "./theme";
import { AppIcon, Backdrop, gradientText, mix, prog, rnd, Serif, Window, Words } from "./ui";

const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Fade + blur at the start and the end of a scene, so scenes melt into each other. */
const useInOut = (dur: number, inLen = 16, outLen = 16) => {
  const f = useCurrentFrame();
  const i = prog(f, 0, inLen);
  const o = 1 - prog(f, dur - outLen, outLen);
  return { opacity: Math.min(i, o), filter: `blur(${mix(Math.min(i, o), 12, 0)}px)` };
};

/* ───────────────────────────── 1. Le problème ───────────────────────────── */

const TOOL_COLORS = ["#7a7a7a", "#9a6b4a", "#4a6b9a", "#6b9a4a", "#9a4a7a", "#4a9a8f", "#8f8a4a", "#6a5a9a"];
const POPUPS = [
  { t: "Session expirée", s: "Reconnecte-toi pour continuer", icon: "lock" },
  { t: "Mot de passe oublié ?", s: "Un e-mail t'a été envoyé", icon: "key" },
  { t: "Nouveau message", s: "Dans une autre app…", icon: "bell" },
  { t: "Abonnement à renouveler", s: "Encore un", icon: "bell" },
  { t: "Connexion requise", s: "Compte 6 sur 9", icon: "lock" },
  { t: "Synchronisation échouée", s: "Réessaie plus tard", icon: "bell" },
];

const ToolWindow: React.FC<{ i: number; f: number; collapse: number }> = ({ i, f, collapse }) => {
  const { width, height } = useVideoConfig();
  const x = rnd(`x${i}`) * width * 0.9 - width * 0.05;
  const y = rnd(`y${i}`) * height * 0.85;
  const w = 300 + rnd(`w${i}`) * 260;
  const h = w * (0.55 + rnd(`h${i}`) * 0.25);
  const at = i * 5;
  const p = prog(f, at, 18);
  const col = TOOL_COLORS[i % TOOL_COLORS.length];
  const drift = Math.sin((f + i * 20) / 30) * 8;
  const cx = width / 2 - w / 2;
  const cy = height / 2 - h / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: mix(collapse, x, cx),
        top: mix(collapse, y + drift, cy),
        width: w,
        height: h,
        borderRadius: 14,
        background: "#1b1b19",
        border: `1px solid ${C.lineStrong}`,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
        opacity: p * (1 - collapse * 0.9),
        transform: `scale(${mix(p, 0.85, 1) * mix(collapse, 1, 0.05)}) rotate(${(rnd(`r${i}`) - 0.5) * 8 * (1 - collapse)}deg)`,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 28, background: alpha(col, 0.35), display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: 8, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.25)" }} />
        ))}
        <div style={{ marginLeft: 10, width: 60 + rnd(`t${i}`) * 80, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.25)" }} />
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
        {[0.9, 0.6, 0.75, 0.4, 0.8].map((l, k) => (
          <div key={k} style={{ width: `${l * 100}%`, height: 9, borderRadius: 5, background: k === 0 ? alpha(col, 0.5) : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
    </div>
  );
};

const Popup: React.FC<{ i: number; f: number; collapse: number }> = ({ i, f, collapse }) => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  const pp = POPUPS[i];
  const side = i % 2;
  const x = v ? 60 + rnd(`px${i}`) * (width - 520) : side ? width - 480 - rnd(`px${i}`) * 120 : 70 + rnd(`px${i}`) * 120;
  const y = v
    ? side ? 140 + rnd(`py${i}`) * 380 : height - 560 + rnd(`py${i}`) * 380
    : 70 + (Math.floor(i / 2) / 3) * (height - 220) + rnd(`py${i}`) * 60;
  const at = 26 + i * 16;
  const p = prog(f, at, 14);
  const Icon = pp.icon === "lock" ? Lock : pp.icon === "key" ? KeyRound : Bell;
  return (
    <div
      style={{
        position: "absolute",
        left: mix(collapse, x, width / 2 - 200),
        top: mix(collapse, y, height / 2 - 40),
        width: 400,
        padding: "16px 18px",
        borderRadius: 18,
        background: "rgba(40,40,38,0.92)",
        border: `1px solid ${C.lineStrong}`,
        boxShadow: "0 30px 60px -10px rgba(0,0,0,0.8)",
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: SANS,
        opacity: p * (1 - collapse),
        transform: `translateY(${mix(p, -20, 0)}px) scale(${mix(p, 0.9, 1) * mix(collapse, 1, 0.1)})`,
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={C.ink2} />
      </div>
      <div>
        <div style={{ fontSize: 19, color: C.ink, fontWeight: 600 }}>{pp.t}</div>
        <div style={{ fontSize: 16, color: C.ink3 }}>{pp.s}</div>
      </div>
    </div>
  );
};

export const Problem: React.FC<{ dur: number; fast?: boolean }> = ({ dur, fast }) => {
  const f0 = useCurrentFrame();
  const f = fast ? f0 * 2 : f0;
  const v = useVertical();
  const collapseAt = dur - 40;
  const collapse = prog(f0, collapseAt, 34, EASE_IN_OUT);
  const lines = ["Une messagerie ici.", "Des notes là.", "Un agenda ailleurs."];
  const step = fast ? 22 : 42;
  const shake = f0 < collapseAt ? Math.sin(f0 * 1.7) * prog(f0, collapseAt - 50, 50) * 3 : 0;
  return (
    <Backdrop glow="#ff9650" glowOpacity={0.35}>
      <AbsoluteFill style={{ filter: `blur(${mix(prog(f0, 20, 40), 0, 3)}px)`, opacity: 0.85, transform: `translateX(${shake}px)` }}>
        {Array.from({ length: v ? 12 : 16 }).map((_, i) => (
          <ToolWindow key={i} i={i} f={f} collapse={collapse} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${v ? "90% 40%" : "55% 50%"} at 50% 50%, rgba(15,15,14,${mix(prog(f0, 4, 30), 0, 0.92)}), rgba(15,15,14,${mix(prog(f0, 20, 30), 0, 0.4)}) 100%)` }} />
      {POPUPS.map((_, i) => (
        <Popup key={i} i={i} f={f} collapse={collapse} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: v ? 60 : 0, opacity: 1 - prog(f0, collapseAt, 16) }}>
        {lines.map((l, i) => (
          <Serif key={l} size={v ? 112 : 124} color={i === 2 ? C.ink : C.ink2} style={{ textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            <Words text={l} start={8 + i * step} />
          </Serif>
        ))}
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: v ? 34 : 30, color: C.ink3 }}>
          <Words text="Et un mot de passe pour chacun." start={8 + 3 * step} stagger={2} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ───────────────────────────── 2. La bascule ───────────────────────────── */

export const Pivot: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = useVertical();
  const burst = prog(f, 0, 30);
  const lock = prog(f, 4, 26);
  const out = 1 - prog(f, dur - 16, 16);
  return (
    <Backdrop glow={C.accent} glowOpacity={burst}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(C.accent, 0.35)}, transparent 60%)`,
            transform: `scale(${mix(burst, 0.1, 1.2)})`,
            opacity: 1 - prog(f, 10, 50) * 0.5,
          }}
        />
        <div style={{ transform: `scale(${mix(lock, 0.3, 1)})`, opacity: lock, filter: `blur(${mix(lock, 10, 0)}px)`, marginBottom: 50 }}>
          <Img src={staticFile("brand/compte-512.png")} style={{ width: v ? 220 : 200, height: v ? 220 : 200, borderRadius: 48, boxShadow: `0 0 120px ${alpha(C.accent, 0.5)}` }} />
        </div>
        <Serif size={v ? 104 : 104} style={{ textAlign: "center", padding: v ? "0 70px" : 0 }}>
          <Words text="Et si tout tenait" start={18} />
          {v ? <br /> : " "}
          <Words text="dans un seul compte ?" start={26} wordStyle={() => ({ fontStyle: "italic", ...gradientText() })} />
        </Serif>
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ───────────────────────────── 4. Elles se parlent ───────────────────────────── */

const FLOW: { id: AppId; when: string; t: string }[] = [
  { id: "alfred", when: "Mardi 10 h", t: "Alfred cale l'enregistrement" },
  { id: "nino", when: "Mardi 14 h", t: "Nino Studio le filme" },
  { id: "maya", when: "Mardi 20 h", t: "Maya Studio le diffuse en direct" },
  { id: "metricove", when: "Jeudi 9 h", t: "Metricove le publie partout" },
  { id: "lamio", when: "Jeudi 9 h 01", t: "Lamio prévient toute l'équipe" },
];

export const Connect: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = useVertical();
  const { width, height } = useVideoConfig();
  const io = useInOut(dur, 14, 16);
  const n = FLOW.length;
  const start = 34;
  const span = dur - start - 60;
  const pulse = interpolate(f, [start, start + span], [0, n - 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const pos = (i: number) =>
    v ? { x: 150, y: 620 + i * 260 } : { x: 230 + i * ((width - 460) / (n - 1)), y: height / 2 + 90 };
  const p0 = pos(0);
  const pN = pos(n - 1);
  const head = pos(0);
  const headPos = v ? { x: head.x, y: mix(pulse / (n - 1), p0.y, pN.y) } : { x: mix(pulse / (n - 1), p0.x, pN.x), y: head.y };
  const icon = v ? 150 : 150;
  return (
    <Backdrop glow={C.accent}>
      <AbsoluteFill style={{ ...io }}>
        <div style={{ position: "absolute", top: v ? 200 : 150, width: "100%", textAlign: "center" }}>
          <Serif size={v ? 124 : 130}>
            <Words text="Et elles se" start={4} />
            <Words text=" parlent." start={10} wordStyle={() => ({ fontStyle: "italic", ...gradientText() })} />
          </Serif>
          <div style={{ fontFamily: SANS, fontSize: v ? 36 : 30, color: C.ink2, marginTop: 18 }}>
            <Words text="La semaine d'un podcast, d'une app à l'autre." start={14} stagger={1.5} />
          </div>
        </div>
        {/* The rail and its light. */}
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="rail" x1={p0.x} y1={p0.y} x2={pN.x} y2={pN.y} gradientUnits="userSpaceOnUse">
              {FLOW.map((s, i) => (
                <stop key={s.id} offset={i / (n - 1)} stopColor={app(s.id).color} />
              ))}
            </linearGradient>
          </defs>
          <line x1={p0.x + (v ? icon / 2 : 0)} y1={p0.y + (v ? 0 : 0)} x2={pN.x + (v ? icon / 2 : 0)} y2={pN.y} stroke={C.lineStrong} strokeWidth={2} />
          <line
            x1={p0.x + (v ? icon / 2 : 0)}
            y1={p0.y}
            x2={headPos.x + (v ? icon / 2 : 0)}
            y2={headPos.y}
            stroke="url(#rail)"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={prog(f, start, 8)}
          />
          <circle cx={headPos.x + (v ? icon / 2 : 0)} cy={headPos.y} r={10} fill="#fff" opacity={prog(f, start, 8) * (1 - prog(f, start + span, 20))} style={{ filter: "blur(2px)" }} />
        </svg>
        {FLOW.map((s, i) => {
          const a = app(s.id);
          const lit = Math.max(0, Math.min(1, (pulse - i + 0.35) / 0.35));
          const appear = prog(f, 10 + i * 4, 20);
          const pp = pos(i);
          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: v ? pp.x : pp.x - 170,
                top: v ? pp.y - icon / 2 : pp.y - icon / 2,
                width: v ? 700 : 340,
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
              <div style={{ transform: `scale(${1 + 0.12 * lit})`, filter: `grayscale(${1 - lit}) brightness(${mix(lit, 0.6, 1)})` }}>
                <AppIcon icon={a.icon} size={icon} glow={lit > 0.1 ? a.color : undefined} />
              </div>
              <div style={{ opacity: mix(lit, 0.35, 1) }}>
                <div style={{ fontFamily: MONO, fontSize: v ? 26 : 20, letterSpacing: "0.12em", textTransform: "uppercase", color: s.id === "tickup" ? C.ink2 : a.color }}>{s.when}</div>
                <div style={{ fontSize: v ? 40 : 28, color: C.ink, marginTop: 10, lineHeight: 1.25 }}>{s.t}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ───────────────────────────── 5. Le hub ───────────────────────────── */

const TILE_SUB: Record<AppId, string> = {
  lamio: "3 messages · #studio",
  cairn: "Brief client à jour",
  tickup: "12 tâches cette semaine",
  alfred: "Point d'équipe à 14 h",
  metricove: "Post jeudi 9 h",
  nino: "Épisode 15 · 62 %",
  maya: "Direct ce soir à 20 h",
};

export const HubWindow: React.FC<{ f: number; w: number; h: number; narrow?: boolean }> = ({ f, w, h, narrow }) => (
  <Window width={w} height={h} title="postmelo.app/accueil" accent={C.accent}>
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 260, borderRight: `1px solid ${C.line}`, padding: "20px 16px", display: narrow ? "none" : "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 6px 16px" }}>
          <Img src={staticFile("brand/postmelo.png")} style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Studio Lumen</div>
            <div style={{ fontSize: 13, color: C.ink3 }}>14 membres</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.line}`, color: C.ink3, fontSize: 15, marginBottom: 8 }}>
          <Search size={15} /> Rechercher <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 12 }}>⌘K</span>
        </div>
        {[
          [Home, "Accueil", true],
          [Bell, "Activité", false],
          [Users, "Équipe", false],
          [LayoutGrid, "Toutes les apps", false],
        ].map(([I, l, on]) => {
          const Icon = I as typeof Home;
          return (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 10, fontSize: 16, background: on ? "rgba(255,255,255,0.07)" : "transparent", color: on ? C.ink : C.ink2 }}>
              <Icon size={17} /> {l as string}
            </div>
          );
        })}
        <div style={{ fontSize: 12, letterSpacing: "0.14em", color: C.ink3, padding: "18px 12px 8px" }}>TES APPLICATIONS</div>
        {APPS.slice(0, 5).map((a) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 12px", fontSize: 16, color: C.ink2 }}>
            <AppIcon icon={a.icon} size={24} /> {a.name}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "30px 34px" }}>
        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", color: C.ink3 }}>MARDI 15 NOVEMBRE</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: narrow ? 56 : 48, marginTop: 8 }}>
            Bonjour Camille,{narrow ? <br /> : " "}<i style={{ color: C.ink2 }}>tout est prêt.</i>
          </div>
          <div style={{ marginLeft: "auto", display: narrow ? "none" : "block", padding: "10px 18px", borderRadius: 12, background: C.accent, color: C.accentInk, fontSize: 16, fontWeight: 600 }}>+ Nouveau</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 2 : 4}, 1fr)`, gap: 16, marginTop: 26 }}>
          {APPS.map((a, i) => {
            const p = prog(f, 6 + i * 4, 18);
            return (
              <div
                key={a.id}
                style={{
                  height: 150,
                  borderRadius: 18,
                  padding: 18,
                  background: `linear-gradient(160deg, ${alpha(a.color, 0.16)}, rgba(255,255,255,0.02) 70%)`,
                  border: `1px solid ${C.line}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: p,
                  transform: `translateY(${mix(p, 20, 0)}px)`,
                }}
              >
                <AppIcon icon={a.icon} size={48} />
                <div>
                  <div style={{ fontSize: 19, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 14, color: C.ink3, marginTop: 2 }}>{TILE_SUB[a.id]}</div>
                </div>
              </div>
            );
          })}
          <div style={{ height: 150, borderRadius: 18, border: `1.5px dashed ${C.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, fontSize: 16 }}>
            Une seule connexion
          </div>
        </div>
      </div>
    </div>
  </Window>
);

export const Hub: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = useVertical();
  const io = useInOut(dur, 16, 18);
  const rise = prog(f, 0, 70);
  const straighten = prog(f, 10, 110, EASE_IN_OUT);
  const w = v ? 960 : 1440;
  const h = v ? 1200 : 860;
  const scale = v ? 0.98 : 0.98;
  return (
    <Backdrop glow={C.accent} glow2="#a98bf5">
      <AbsoluteFill style={{ ...io, alignItems: "center" }}>
        <div style={{ textAlign: "center", marginTop: v ? 200 : 60 }}>
          <Serif size={v ? 112 : 100}>
            <Words text="Un seul compte." start={6} />
            {v ? <br /> : " "}
            <Words text="Un seul design." start={16} />
          </Serif>
          <Serif size={v ? 112 : 100} italic style={{ marginTop: 6 }}>
            <Words text="Toutes tes applications." start={28} wordStyle={() => gradientText()} />
          </Serif>
        </div>
        <div style={{ position: "absolute", top: v ? 720 : 330, left: "50%", perspective: 2400 }}>
          <div
            style={{
              transform: `translateX(-50%) translateY(${mix(rise, 400, 0)}px) rotateX(${mix(straighten, 38, 0)}deg) scale(${scale * mix(straighten, 0.9, 1)})`,
              transformOrigin: "50% 0%",
              opacity: rise,
              filter: `drop-shadow(0 0 80px ${alpha(C.accent, 0.25)})`,
            }}
          >
            <HubWindow f={f - 30} w={w} h={h} narrow={v} />
          </div>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ───────────────────────────── 6. Fin ───────────────────────────── */

export const Outro: React.FC<{ dur: number; line?: string }> = ({ dur, line = "Toute ta suite, ouverte avec une seule connexion." }) => {
  const f = useCurrentFrame();
  const v = useVertical();
  const io = useInOut(dur, 14, 1);
  const logo = prog(f, 0, 26);
  const btn = prog(f, 22, 20);
  return (
    <Backdrop glow={C.accent}>
      <AbsoluteFill style={{ ...io, alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, opacity: logo, transform: `scale(${mix(logo, 0.9, 1)})`, filter: `blur(${mix(logo, 10, 0)}px)` }}>
          <Img src={staticFile("brand/postmelo.png")} style={{ width: v ? 150 : 128, height: v ? 150 : 128, borderRadius: 32 }} />
          <Serif size={v ? 170 : 160}>Postmelo</Serif>
        </div>
        <div style={{ fontSize: v ? 38 : 32, color: C.ink2, marginTop: 34, textAlign: "center", padding: v ? "0 80px" : 0 }}>
          <Words text={line} start={10} stagger={1.5} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 50, opacity: btn, transform: `translateY(${mix(btn, 16, 0)}px)`, flexDirection: v ? "column" : "row" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: v ? "22px 40px" : "18px 34px", borderRadius: 99, background: C.accent, color: C.accentInk, fontSize: v ? 34 : 28, fontWeight: 500, boxShadow: `0 10px 60px -10px ${alpha(C.accent, 0.7)}` }}>
            Demander un accès <ArrowRight size={v ? 30 : 26} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: v ? 34 : 28, color: C.ink, letterSpacing: "0.04em" }}>postmelo.ch</div>
        </div>
        <div style={{ position: "absolute", bottom: v ? 220 : 90, display: "flex", gap: v ? 22 : 26 }}>
          {APPS.map((a, i) => {
            const p = prog(f, 30 + i * 3, 18);
            return (
              <div key={a.id} style={{ opacity: p * 0.9, transform: `translateY(${mix(p, 20, 0)}px)` }}>
                <AppIcon icon={a.icon} size={v ? 96 : 72} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ───────────────────────────── Titre de section (coupes) ───────────────────────────── */

export const Title: React.FC<{ dur: number; kicker: string; title: string; italic: string; ids: AppId[] }> = ({ dur, kicker, title, italic, ids }) => {
  const f = useCurrentFrame();
  const io = useInOut(dur, 1, 14);
  return (
    <Backdrop glow={C.accent}>
      <AbsoluteFill style={{ ...io, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.2em", color: C.ink3, textTransform: "uppercase", opacity: prog(f, 0, 14) }}>{kicker}</div>
        <Serif size={140} style={{ marginTop: 26 }}>
          <Words text={title} start={2} />
        </Serif>
        <Serif size={140} italic>
          <Words text={italic} start={10} wordStyle={() => gradientText()} />
        </Serif>
        <div style={{ display: "flex", gap: 22, marginTop: 60 }}>
          {ids.map((id, i) => {
            const p = prog(f, 14 + i * 4, 18);
            return (
              <div key={id} style={{ opacity: p, transform: `translateY(${mix(p, 30, 0)}px)` }}>
                <AppIcon icon={app(id).icon} size={110} glow={app(id).color} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};
