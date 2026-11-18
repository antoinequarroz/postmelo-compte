import React from "react";
import { Cable, Eye, Layers, MonitorPlay, Radio, RadioTower, Volume2 } from "lucide-react";
import { alpha, app, C, EASE, EASE_IN_OUT, MONO } from "../theme";
import { mix, prog, Shot } from "../kit";
import type { AppAd } from "../ad";
import type { LongFeature } from "../long";

/* ───────────────────────────── Maya Studio ───────────────────────────── */

const RED = app("maya").color;
const TEAL = "#2fc7b5";
const GREEN = "#5fd3a8";

/** Beats of the story, in mock time. */
const T = {
  pick: 15, // the cursor picks the "Invitée" scene: it lands in Aperçu
  cut: 45, // Transition: Programme wipes to the new scene
  live: 75, // Passer en direct
  dest: [75, 90, 105, 120], // REC, RTMP, SRT, Nino light up one by one
};

const SCENES = [
  { n: "Intro", hue: "#c0526f" },
  { n: "Plateau", hue: "#8b6fc0", wide: true },
  { n: "Invitée", hue: "#5a8bc5", who: 1 },
  { n: "Générique", hue: "#c58b5a" },
];

const DESTS = [
  { k: "REC", t: "Enregistrement MP4", dot: RED },
  { k: "RTMP", t: "Serveur 1", dot: "#e0803a" },
  { k: "SRT", t: "Régie", dot: "#8b63f5" },
  { k: "Nino", t: "Pilotage iPad", dot: TEAL },
];

// Layout, in mock pixels (shared with the cursor keys below).
const MON = { y: 86, h: 224, w: 431, lx: 20, rx: 589 };
const TR = { x: 465, y: 136, w: 110, h: 104 };
const TH = { x: 20, y: 380, w: 156, h: 88, gap: 12 };
const CARD = { x: 694, y: 352, w: 326, h: 288 };
const GO = { x: CARD.x + 16, y: CARD.y + CARD.h - 66, w: CARD.w - 32, h: 52 };
const thumbX = (i: number) => TH.x + i * (TH.w + TH.gap);

const nb = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const tc = (frames: number) => {
  const fr = Math.max(0, Math.floor(frames));
  const s = Math.floor(fr / 30);
  const p2 = (n: number) => String(n).padStart(2, "0");
  return `00:${p2(Math.floor(s / 60))}:${p2(s % 60)}:${p2(fr % 30)}`;
};
/** 1 on the beat, decaying to 0 before the next one. */
const beatPulse = (f: number, from: number) => (f < from ? 0 : Math.pow(1 - ((f - from) % 15) / 15, 2.2));

const Pill: React.FC<{ children: React.ReactNode; on?: boolean; color?: string; style?: React.CSSProperties }> = ({ children, on, color = RED, style }) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 12px",
      borderRadius: 99,
      fontSize: 14,
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: on ? alpha(color, 0.18) : "rgba(255,255,255,0.05)",
      border: `1px solid ${on ? alpha(color, 0.5) : C.line}`,
      color: on ? C.ink : C.ink3,
      ...style,
    }}
  >
    {children}
  </span>
);

const HMeter: React.FC<{ level: number; color: string }> = ({ level, color }) => (
  <div style={{ flex: 1, display: "flex", gap: 3 }}>
    {Array.from({ length: 24 }).map((_, i) => {
      const on = i / 24 < level;
      return <div key={i} style={{ flex: 1, height: 10, borderRadius: 2, background: on ? (i > 20 ? "#ec4d5b" : i > 16 ? "#e8b14a" : color) : "rgba(255,255,255,0.07)" }} />;
    })}
  </div>
);

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  const c = RED;
  // Scene state: Programme on Plateau, Aperçu on Intro. Pick Invitée, then cut: they swap.
  const cutP = prog(f, T.cut, 10, EASE_IN_OUT);
  const preview = f < T.pick ? 0 : f < T.cut ? 2 : 1;
  const programOld = 1;
  const programNew = 2;
  const program = f < T.cut ? programOld : programNew;
  const flashPv = f >= T.pick ? 1 - prog(f, T.pick, 8) : 0;
  const live = f >= T.live;
  const liveP = prog(f, T.live, 10, EASE);
  const pulse = beatPulse(f, T.live);
  const viewers = live ? Math.round(1248 * EASE(prog(f, T.live, 62, (t) => t))) : 0;
  const kbps = (i: number) => 6000 + Math.round(Math.sin(f / 4 + i * 1.7) * 140 + Math.sin(f / 1.3 + i) * 30);
  const lvl = (i: number) => Math.min(1, Math.max(0.05, 0.5 + 0.28 * Math.sin(f / 3.1 + i * 2.1) + 0.16 * Math.sin(f / 1.4 + i * 4)) * (i === 2 ? 0.75 : 1));
  const hoverTr = f >= T.cut - 6 && f < T.cut + 3;
  const pressTr = f >= T.cut - 1 && f < T.cut + 4;
  const hoverGo = f >= T.live - 7 && f < T.live;
  const pressGo = f >= T.live - 1 && f < T.live + 4;
  const goGlow = prog(f, T.live - 15, 14);

  const monitor = (kind: "pv" | "pgm") => {
    const isPgm = kind === "pgm";
    const col = isPgm ? c : TEAL;
    const x = isPgm ? MON.rx : MON.lx;
    const s = isPgm ? SCENES[programOld] : SCENES[preview];
    const sNew = SCENES[programNew];
    const ring = isPgm && live ? 0.35 + 0.65 * pulse : 0;
    return (
      <div key={kind}>
        <div style={{ position: "absolute", left: x, top: MON.y - 28, width: MON.w, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: col }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: col }} />
          {isPgm ? "Programme" : "Aperçu"}
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 14, letterSpacing: 0, color: C.ink3 }}>{isPgm ? tc(f + 30 * 754) : "1080p · 60 i/s"}</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: x,
            top: MON.y,
            width: MON.w,
            height: MON.h,
            borderRadius: 14,
            overflow: "hidden",
            border: `2px solid ${alpha(col, 0.85)}`,
            boxShadow: isPgm ? `0 0 ${mix(ring, 0, 46)}px ${alpha(c, 0.55 * ring)}` : flashPv > 0 ? `0 0 ${30 * flashPv}px ${alpha(TEAL, 0.6 * flashPv)}` : "none",
          }}
        >
          <Shot f={f} hue={s.hue} label={s.n} who={s.who ?? 0} wide={s.wide} talking={isPgm && live} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
          {isPgm && f >= T.cut && (
            <>
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - cutP) * 100}% 0 0)` }}>
                <Shot f={f} hue={sNew.hue} label={sNew.n} who={sNew.who ?? 0} wide={sNew.wide} talking={live} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
              </div>
              {cutP < 1 && (
                <div style={{ position: "absolute", top: -20, bottom: -20, left: `${cutP * 100}%`, width: 10, marginLeft: -5, background: "#fff", boxShadow: `0 0 30px 10px ${alpha(c, 0.9)}`, transform: "skewX(-12deg)" }} />
              )}
            </>
          )}
          {!isPgm && flashPv > 0 && <div style={{ position: "absolute", inset: 0, background: alpha(TEAL, 0.35 * flashPv) }} />}
          {/* Lower third on the programme once live. */}
          {isPgm && f >= T.dest[1] && (
            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                display: "flex",
                overflow: "hidden",
                borderRadius: 8,
                clipPath: `inset(0 ${(1 - prog(f, T.dest[1], 12, EASE)) * 100}% 0 0)`,
              }}
            >
              <div style={{ width: 5, background: c }} />
              <div style={{ padding: "6px 12px", background: "rgba(10,10,10,0.82)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Nora Vidal</div>
                <div style={{ fontSize: 14, color: C.ink2 }}>Invitée · Atelier Nord</div>
              </div>
            </div>
          )}
          {isPgm && live && (
            <div
              style={{
                position: "absolute",
                right: 12,
                top: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 9px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#fff",
                background: c,
                opacity: liveP,
                transform: `scale(${mix(liveP, 1.8, 1) * (1 + 0.08 * pulse)})`,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} /> EN DIRECT
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Status bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 52, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", background: "rgba(255,255,255,0.015)" }}>
        <Layers size={17} color={C.ink3} />
        <span style={{ fontSize: 16, fontWeight: 600 }}>Émission du mardi</span>
        <span style={{ fontSize: 14, color: C.ink3 }}>Studio Lumen</span>
        {f >= T.dest[3] && (
          <Pill on color={TEAL} style={{ opacity: prog(f, T.dest[3], 8), transform: `scale(${mix(prog(f, T.dest[3], 12, EASE), 0.6, 1)})` }}>
            <Cable size={15} color={TEAL} /> Nino relié
          </Pill>
        )}
        <span style={{ marginLeft: "auto" }} />
        <Pill on={live} style={{ fontFamily: MONO, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: live ? c : C.ink3, opacity: live ? 0.45 + 0.55 * pulse : 1 }} />
          REC {tc(live ? f - T.live : 0)}
        </Pill>
        <div style={{ position: "relative" }}>
          {live && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 99,
                border: `2px solid ${c}`,
                opacity: 1 - prog((f - T.live) % 15, 0, 15),
                transform: `scale(${mix(prog((f - T.live) % 15, 0, 15), 1, 1.5)})`,
              }}
            />
          )}
          <Pill on={live} style={live ? { background: c, color: "#fff", border: `1px solid ${c}`, transform: `scale(${1 + 0.06 * pulse})` } : {}}>
            <Radio size={15} /> {live ? "EN DIRECT" : "Hors antenne"}
          </Pill>
        </div>
        <Pill on={live} color={GREEN}>
          <Eye size={15} color={live ? GREEN : C.ink3} />
          <span style={{ fontFamily: MONO, fontWeight: 500, minWidth: 44, textAlign: "right" }}>{nb(viewers)}</span>
        </Pill>
      </div>

      {monitor("pv")}
      {monitor("pgm")}

      {/* Transition column between the monitors */}
      <div
        style={{
          position: "absolute",
          left: TR.x,
          top: TR.y,
          width: TR.w,
          height: TR.h,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "#fff",
          background: pressTr ? c : hoverTr ? alpha(c, 0.45) : alpha(c, 0.2),
          border: `1px solid ${alpha(c, hoverTr ? 0.9 : 0.4)}`,
          boxShadow: pressTr ? `0 0 40px ${alpha(c, 0.7)}` : "none",
          transform: `scale(${pressTr ? 0.94 : 1})`,
        }}
      >
        <MonitorPlay size={22} />
        Transition
      </div>
      <div style={{ position: "absolute", left: TR.x, top: TR.y + TR.h + 10, width: TR.w, textAlign: "center", fontSize: 14, color: C.ink3 }}>Volet · 300 ms</div>
      <div style={{ position: "absolute", left: TR.x + 20, top: TR.y + TR.h + 40, width: TR.w - 40, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${(f >= T.cut && cutP < 1 ? cutP : 0) * 100}%`, height: "100%", background: c }} />
      </div>

      {/* Scenes */}
      <div style={{ position: "absolute", left: TH.x, top: TH.y - 28, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3 }}>Scènes</div>
      {SCENES.map((s, i) => {
        const isPgm = i === program;
        const isPv = i === preview;
        const hit = i === 2 && f >= T.pick - 1 && f < T.pick + 4;
        return (
          <div
            key={s.n}
            style={{
              position: "absolute",
              left: thumbX(i),
              top: TH.y,
              width: TH.w,
              height: TH.h,
              borderRadius: 10,
              overflow: "hidden",
              border: `2px solid ${isPgm ? c : isPv ? TEAL : C.lineStrong}`,
              transform: `scale(${hit ? 0.94 : 1})`,
            }}
          >
            <Shot f={f} hue={s.hue} label={s.n} who={s.who ?? 0} wide={s.wide} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
            {(isPgm || isPv) && (
              <span style={{ position: "absolute", right: 6, bottom: 6, fontFamily: MONO, fontSize: 14, padding: "1px 6px", borderRadius: 5, background: isPgm ? c : TEAL, color: "#fff" }}>{isPgm ? "PGM" : "PVW"}</span>
            )}
          </div>
        );
      })}

      {/* Audio mixer */}
      <div style={{ position: "absolute", left: TH.x, top: 488, width: 660, display: "flex", alignItems: "center", gap: 8, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3 }}>
        <Volume2 size={15} /> Mixeur audio
      </div>
      {["Micro Camille", "Micro Nora", "Musique"].map((m, i) => (
        <div key={m} style={{ position: "absolute", left: TH.x, top: 516 + i * 40, width: 660, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 128, fontSize: 15, color: C.ink2 }}>{m}</span>
          <HMeter level={lvl(i)} color={GREEN} />
          <span style={{ width: 84, whiteSpace: "nowrap", textAlign: "right", fontFamily: MONO, fontSize: 14, color: C.ink3 }}>{(-24 + lvl(i) * 20).toFixed(1).replace(".", ",")} dB</span>
        </div>
      ))}

      {/* Diffusion card */}
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y - 28, display: "flex", alignItems: "center", gap: 8, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3 }}>
        <RadioTower size={15} /> Diffusion
      </div>
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 16, background: C.surface2, border: `1px solid ${live ? alpha(c, 0.45) : C.lineStrong}` }}>
        {DESTS.map((d, i) => {
          const at = T.dest[i];
          const on = f >= at;
          const p = prog(f, at, 10, EASE);
          const ping = prog(f, at, 16, EASE);
          const isNino = i === 3;
          const hoverN = isNino && f >= at - 6 && f < at + 3;
          const pressN = isNino && f >= at - 1 && f < at + 4;
          return (
            <div
              key={d.k}
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                top: 10 + i * 50,
                height: 44,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 12px",
                background: on ? alpha(d.dot, 0.08 + 0.2 * (1 - p)) : "transparent",
                transform: `scale(${pressN ? 0.96 : on ? 1 + 0.04 * (1 - p) : 1})`,
                outline: hoverN ? `1px solid ${alpha(d.dot, 0.7)}` : "none",
              }}
            >
              <span style={{ position: "relative", width: 12, height: 12 }}>
                {on && ping < 1 && <span style={{ position: "absolute", inset: 0, borderRadius: 6, border: `2px solid ${d.dot}`, opacity: 1 - ping, transform: `scale(${mix(ping, 1, 3.2)})` }} />}
                <span style={{ position: "absolute", inset: 0, borderRadius: 6, background: on ? d.dot : "rgba(255,255,255,0.18)", boxShadow: on ? `0 0 12px ${d.dot}` : "none" }} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: on ? C.ink : C.ink2, whiteSpace: "nowrap" }}>
                {d.k} <span style={{ color: C.ink3, fontWeight: 400 }}>·</span> <span style={{ fontWeight: 400 }}>{d.t}</span>
              </span>
              {isNino && !on && live ? (
                <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600, padding: "3px 10px", borderRadius: 7, color: "#fff", background: hoverN ? d.dot : alpha(d.dot, 0.3), border: `1px solid ${alpha(d.dot, 0.7)}`, whiteSpace: "nowrap" }}>Relier</span>
              ) : (
                <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 14, color: on ? GREEN : C.ink3, whiteSpace: "nowrap" }}>
                  {!on ? "Prêt" : i === 0 ? tc(f - at).slice(3, 8) : i === 3 ? "Relié" : `${nb(kbps(i))} kb/s`}
                </span>
              )}
            </div>
          );
        })}
        {/* Passer en direct */}
        <div
          style={{
            position: "absolute",
            left: GO.x - CARD.x,
            top: GO.y - CARD.y,
            width: GO.w,
            height: GO.h,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 17,
            fontWeight: 600,
            color: "#fff",
            background: live ? alpha(c, 0.14) : c,
            border: `1px solid ${live ? alpha(c, 0.6) : c}`,
            boxShadow: !live ? `0 0 ${mix(goGlow, 0, 34)}px ${alpha(c, 0.55 * goGlow * (0.6 + 0.4 * Math.sin(f / 2)))}` : "none",
            transform: `scale(${pressGo ? 0.95 : hoverGo ? 1.03 : 1})`,
          }}
        >
          {live ? (
            <>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: c }} /> Arrêter le direct
            </>
          ) : (
            <>
              <Radio size={19} /> Passer en direct
            </>
          )}
        </div>
      </div>

      {/* The flash of going live */}
      {f >= T.live && f < T.live + 10 && <div style={{ position: "absolute", inset: 0, background: alpha(c, 0.12 * (1 - prog(f, T.live, 10))), pointerEvents: "none" }} />}
    </div>
  );
};

/* ───────────────────────────── The ad ───────────────────────────── */

const thumbC = { x: thumbX(2) + TH.w / 2, y: TH.y + TH.h / 2 };
const trC = { x: TR.x + TR.w / 2, y: TR.y + TR.h / 2 };
const goC = { x: GO.x + GO.w / 2, y: GO.y + GO.h / 2 };
const ninoC = { x: CARD.x + CARD.w - 48, y: CARD.y + 10 + 3 * 50 + 22 };

export const ad: AppAd = {
  id: "maya",
  title: "Maya Studio · Émission du mardi",
  hook: "Ton direct, en un clic.",
  Mock,
  // Pick the scene, cut it to air, go live, then watch the destinations.
  cursor: [
    { f: 2, x: 720, y: 260 },
    { f: 12, x: thumbC.x, y: thumbC.y },
    { f: T.pick, x: thumbC.x, y: thumbC.y, click: true },
    { f: 38, x: trC.x, y: trC.y },
    { f: T.cut, x: trC.x, y: trC.y, click: true },
    { f: 66, x: goC.x, y: goC.y },
    { f: T.live, x: goC.x, y: goC.y, click: true },
    { f: 92, x: 900, y: 590 },
    { f: 112, x: ninoC.x, y: ninoC.y },
    { f: T.dest[3], x: ninoC.x, y: ninoC.y, click: true },
    { f: 140, x: 985, y: 330 },
  ],
  chips: [
    { f: T.cut, text: "Change de plan en un clic", x: 470, y: 334, icon: MonitorPlay, until: 72 },
    { f: T.dest[1], text: "Diffuse partout à la fois", x: 470, y: 556, icon: RadioTower },
    { f: T.dest[3], text: "Nino Studio s'y branche", x: 470, y: 618, icon: Cable },
  ],
  focus: [
    { f: 0, x: 520, y: 330, zoom: 1 },
    { f: 15, x: 420, y: 330, zoom: 1.14 },
    { f: 45, x: 545, y: 230, zoom: 1.22 },
    { f: 72, x: 640, y: 360, zoom: 1.22 },
    { f: 112, x: 560, y: 420, zoom: 1.12 },
    { f: 140, x: 520, y: 330, zoom: 1.03 },
  ],
  sfx: [
    { f: T.pick, kind: "click" },
    { f: T.pick + 1, kind: "pop" },
    { f: T.cut, kind: "click" },
    { f: T.cut + 1, kind: "cut" },
    { f: T.cut + 2, kind: "swish" },
    { f: 58, kind: "riser" },
    { f: T.live, kind: "click" },
    { f: T.live + 1, kind: "impact" },
    { f: T.dest[1], kind: "pop" },
    { f: T.dest[1] + 1, kind: "swish" },
    { f: T.dest[2], kind: "pop" },
    { f: T.dest[3], kind: "click" },
    { f: T.dest[3] + 1, kind: "ding" },
  ],
};

/* ───────────────────────────── The long video ───────────────────────────── */

export const long: LongFeature[] = [
  {
    title: "Prépare chaque plan sereinement.",
    text: "Tes scènes t'attendent en bas de l'écran. Un clic, et la suivante se cale dans l'Aperçu, sans toucher à ce qui passe à l'antenne.",
    points: ["Scènes prêtes à l'emploi", "Aperçu séparé du programme", "Image en 1080p à 60 i/s"],
    from: 0,
    to: 40,
    focus: { x: 380, y: 330, zoom: 1.15 },
  },
  {
    title: "Change de plan en un clic.",
    text: "Quand c'est le moment, appuie sur Transition : un volet propre fait passer l'Invitée à l'antenne, et ton mixeur audio reste à portée de main.",
    points: ["Aperçu et programme", "Volet de 300 ms", "Mixeur audio intégré"],
    from: 30,
    to: 72,
    focus: { x: 520, y: 230, zoom: 1.12 },
  },
  {
    title: "Passe en direct, sans stress.",
    text: "Un seul bouton lance l'émission. Le chrono démarre, l'enregistrement tourne et tu vois tes spectateurs arriver en temps réel.",
    points: ["Passer en direct en un clic", "Enregistrement MP4", "Spectateurs en direct"],
    from: 58,
    to: 88,
    focus: { x: 520, y: 330, zoom: 1.04 },
  },
  {
    title: "Diffuse partout à\u00a0la fois.",
    text: "RTMP, SRT et enregistrement partent ensemble, bandeau de titre à l'écran. Relie Nino Studio et pilote toute l'émission depuis ton iPad.",
    points: ["Diffusion RTMP / SRT", "Plusieurs destinations", "Nino s'y branche"],
    from: 88,
    to: 140,
    focus: { x: 520, y: 330, zoom: 1.0 },
  },
];
