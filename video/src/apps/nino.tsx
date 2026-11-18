import React from "react";
import { Check, Clapperboard, Eye, Film, Globe, LayoutGrid, Mic, MonitorUp, Music, Plus, Radio, RotateCcw, Sparkles, Tablet, User, UserPlus, Users, Wifi } from "lucide-react";
import { alpha, app, C, MONO } from "../theme";
import { mix, pop, prog, Shot } from "../kit";
import type { AppAd } from "../ad";
import type { LongFeature } from "../long";

/* ───────────────────────────── Nino Studio ───────────────────────────── */

const RED = "#ec4d5b";

/** Layout, in mock pixels, so the cursor and the chips can aim at real controls. */
const PGM = { x: 18, y: 62, w: 660, h: 372 };
const SRC = { x: 692, y: 62, w: 160, h: 100, gap: 10 };
const LIVE = { x: 692, y: 284, w: 330, h: 150 };
const MIX = { x: 18, y: 448, w: 640, h: 194 };
const DECK = { x: 672, y: 448, w: 350, h: 194 };
const KEY = { w: 76, h: 64, gap: 8, x0: 683, y0: 492 };
const keyCenter = (col: number, row: number) => ({ x: KEY.x0 + col * (KEY.w + KEY.gap) + KEY.w / 2, y: KEY.y0 + row * (KEY.h + KEY.gap) + KEY.h / 2 });
const TOAST = { x: 318, y: 118, w: 350, h: 62 };
const ACCEPT = { x: TOAST.x + TOAST.w - 12 - 92, y: TOAST.y + 13, w: 92, h: 34 };

/** The people on set. 0 Camille, 1 Léa, 2 Nora (remote), 3 the wide shot. */
const CAMS = [
  { name: "Camille Roux", role: "Animatrice", tag: "Cam 1 · Camille", hue: "#c58b5a", who: 0 },
  { name: "Léa Morel", role: "Chroniqueuse", tag: "Cam 2 · Léa", hue: "#4fae94", who: 1 },
  { name: "Nora Berclaz", role: "Invitée à distance", tag: "Nora · à distance", hue: "#5a8bc5", who: 2 },
  { name: "Studio Lumen", role: "Podcast · Épisode 15", tag: "Plan large", hue: "#8b6fc0", who: 3, wide: true },
];

/** The cut list: on every beat the auto-director (or the Stream Deck at 90) picks who is on air. */
const CUTS = [
  { f: -999, cam: 0 },
  { f: 15, cam: 1 },
  { f: 30, cam: 0 },
  { f: 45, cam: 1 },
  { f: 60, cam: 2 },
  { f: 75, cam: 0 },
  { f: 90, cam: 3, manual: true },
  { f: 120, cam: 2 },
  { f: 135, cam: 0 },
];
const cutAt = (f: number) => {
  let c = CUTS[0];
  for (const k of CUTS) if (f >= k.f) c = k;
  return c;
};

const JOIN = 45; // Nora accepted
const ASK = 30; // Nora asks to join
const GO_LIVE = 105;
const ISO = 120;

/** Our own tag (the kit's Shot label is 13 px, we lay a 14 px one over it). */
const Tag: React.FC<{ children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }> = ({ children, color = "#fff", bg = "rgba(0,0,0,0.62)", style }) => (
  <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, padding: "3px 9px", borderRadius: 6, background: bg, color, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);

const level = (f: number, who: number) => {
  const cam = cutAt(f).cam;
  const talking = cam === who || (cam === 3 && who < 2);
  if (who === 2 && f < JOIN) return 0;
  if (who === 3) return 0.32 + 0.06 * Math.sin(f / 5);
  const base = talking ? 0.55 + 0.38 * Math.abs(Math.sin(f / 3.1 + who * 1.7)) * (0.7 + 0.3 * Math.sin(f / 7.3 + who)) : 0.06 + 0.05 * Math.abs(Math.sin(f / 4 + who));
  return Math.min(1, base);
};

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("nino").color;
  const cut = cutAt(f);
  const cam = CAMS[cut.cam];
  const since = f - Math.max(0, cut.f);
  const punch = cut.f > 0 ? prog(f, cut.f, 10) : 1;
  const flash = cut.f > 0 && since >= 0 && since < 5 ? 1 - since / 5 : 0;
  const lower = cut.f > 0 ? prog(f, cut.f, 8) : prog(f, 0, 8);
  const manual = !!cut.manual || (f >= 90 && f < 120);
  const live = f >= GO_LIVE;
  const liveP = prog(f, GO_LIVE, 12);
  const viewers = live ? Math.floor(mix(prog(f, GO_LIVE, 40), 0, 1284)) : 0;
  const secs = 1520 + Math.floor(f / 30);
  const time = `00:${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const joined = f >= JOIN;
  const pressed = (at: number) => f >= at - 2 && f < at + 4;

  const toastIn = prog(f, ASK, 10);
  const toastOut = 1 - prog(f, 76, 8);
  const isoIn = prog(f, ISO, 12);

  const keys = [
    { label: "Camille", icon: User, on: cut.cam === 0 },
    { label: "Léa", icon: User, on: cut.cam === 1 },
    { label: "Nora", icon: Globe, on: cut.cam === 2 },
    { label: "Large", icon: Users, on: cut.cam === 3, press: 90 },
    { label: "Jingle", icon: Music, on: false },
    { label: "Écran", icon: MonitorUp, on: false },
    { label: "Replay", icon: RotateCcw, on: false },
    { label: "En direct", icon: Radio, on: live, red: true, press: GO_LIVE },
  ];

  return (
    <div style={{ position: "relative", height: "100%", fontSize: 15 }}>
      {/* ── Top bar ── */}
      <div style={{ position: "absolute", left: 18, right: 18, top: 14, height: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 99, background: alpha(RED, 0.16), color: "#ff8a94", fontFamily: MONO, fontSize: 14 }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: RED, opacity: Math.floor(f / 15) % 2 ? 1 : 0.35, boxShadow: `0 0 10px ${RED}` }} /> REC {time}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 99, background: alpha(c, manual ? 0.06 : 0.16), color: manual ? C.ink3 : c, fontSize: 14 }}>
          <Sparkles size={14} /> Réalisation auto
        </span>
        {live && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              borderRadius: 99,
              background: RED,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              transform: `scale(${mix(liveP, 0.4, 1)})`,
              opacity: liveP,
              boxShadow: `0 0 ${18 + 8 * Math.sin(f / 4)}px ${alpha(RED, 0.7)}`,
            }}
          >
            <Radio size={14} /> EN DIRECT
          </span>
        )}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: C.ink2, fontSize: 14 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#5fd3a8" }} /> OBS connecté
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 14 }}>
          <Tablet size={14} /> iPad
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, border: `1px solid ${f >= 84 && f < 112 ? alpha(c, 0.6) : C.line}`, color: f >= 84 && f < 112 ? c : C.ink2, fontSize: 14 }}>
          <LayoutGrid size={14} /> Stream Deck
        </span>
      </div>

      {/* ── Programme ── */}
      <div
        style={{
          position: "absolute",
          left: PGM.x,
          top: PGM.y,
          width: PGM.w,
          height: PGM.h,
          borderRadius: 14,
          overflow: "hidden",
          border: `2px solid ${live ? RED : alpha(RED, 0.65)}`,
          boxShadow: live ? `0 0 ${30 + 10 * Math.sin(f / 4)}px -6px ${alpha(RED, 0.7)}` : "none",
          background: "#111",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `scale(${mix(punch, 1.1, 1)})` }}>
          <Shot f={f} hue={cam.hue} label="" who={cam.who} wide={cam.wide} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        </div>
        {cut.cam === 2 && (
          <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 6px ${alpha("#5a8bc5", 0.25)}` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.35 }} />
        <Tag bg={RED} style={{ left: 12, top: 12, fontWeight: 600, letterSpacing: "0.06em" }}>
          PROGRAMME
        </Tag>
        <Tag bg="rgba(0,0,0,0.6)" color={manual ? "#fff" : c} style={{ left: 134, top: 12 }}>
          {manual ? <LayoutGrid size={14} /> : <Sparkles size={14} />}
          {manual ? "Stream Deck" : "Auto"} · {cam.tag}
        </Tag>
        {/* Lower third, re-wiped on every cut. */}
        <div
          style={{
            position: "absolute",
            left: 22,
            bottom: 22,
            display: "flex",
            alignItems: "stretch",
            opacity: lower,
            transform: `translateX(${mix(lower, -60, 0)}px)`,
            clipPath: `inset(0 ${mix(lower, 100, 0)}% 0 0)`,
          }}
        >
          <div style={{ width: 5, background: c, borderRadius: "4px 0 0 4px" }} />
          <div style={{ padding: "10px 18px 10px 14px", background: "rgba(10,10,10,0.78)", borderRadius: "0 10px 10px 0" }}>
            <div style={{ fontSize: 20, color: "#fff", fontWeight: 600 }}>{cam.name}</div>
            <div style={{ fontSize: 14, color: cut.cam === 2 ? "#9cc3f0" : C.ink2, display: "flex", alignItems: "center", gap: 6 }}>
              {cut.cam === 2 && <Wifi size={14} />} {cam.role}
            </div>
          </div>
        </div>
        {/* Nora asks to join, the cursor accepts. */}
        {f >= ASK && toastOut > 0 && (
          <div
            style={{
              position: "absolute",
              left: TOAST.x - PGM.x,
              top: TOAST.y - PGM.y,
              width: TOAST.w,
              height: TOAST.h,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 12px",
              borderRadius: 14,
              background: "rgba(24,24,22,0.94)",
              border: `1px solid ${joined ? alpha(c, 0.6) : C.lineStrong}`,
              boxShadow: "0 18px 40px -10px rgba(0,0,0,0.8)",
              opacity: toastIn * toastOut,
              transform: `translateY(${mix(toastIn, -24, 0)}px) scale(${mix(toastIn, 0.9, 1)})`,
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 17, background: joined ? c : "linear-gradient(140deg,#5a8bc5,#2c4a72)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {joined ? <Check size={18} color="#06251a" /> : <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>N</span>}
            </div>
            <div style={{ flex: 1, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 15, color: C.ink, fontWeight: 600 }}>{joined ? "Nora est sur le plateau" : "Nora veut rejoindre"}</div>
              <div style={{ fontSize: 14, color: C.ink3 }}>{joined ? "Source ajoutée" : "Invitée à distance"}</div>
            </div>
            {!joined && (
              <div
                style={{
                  width: ACCEPT.w,
                  height: ACCEPT.h,
                  borderRadius: 10,
                  background: c,
                  color: "#06251a",
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  transform: `scale(${pressed(JOIN) ? 0.92 : 1})`,
                }}
              >
                <UserPlus size={14} /> Accepter
              </div>
            )}
          </div>
        )}
        {/* Takes ready for DaVinci Resolve. */}
        {f >= ISO && (
          <div
            style={{
              position: "absolute",
              right: 14,
              bottom: 22,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(24,24,22,0.94)",
              border: `1px solid ${alpha(c, 0.5)}`,
              boxShadow: "0 18px 40px -10px rgba(0,0,0,0.8)",
              opacity: isoIn,
              transform: `translateX(${mix(isoIn, 40, 0)}px)`,
            }}
          >
            <Film size={16} color={c} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 15, color: C.ink, fontWeight: 600 }}>4 prises ISO enregistrées</div>
              <div style={{ fontSize: 14, color: C.ink3 }}>Prêtes pour DaVinci Resolve</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sources ── */}
      {CAMS.map((s, i) => {
        // Slot order on screen: Camille, Léa, Large, Nora.
        const slot = i === 2 ? 3 : i === 3 ? 2 : i;
        const x = SRC.x + (slot % 2) * (SRC.w + SRC.gap);
        const y = SRC.y + Math.floor(slot / 2) * (SRC.h + SRC.gap);
        const onAir = cut.cam === i;
        const talking = level(f, i) > 0.4 && i !== 3;
        if (i === 2 && !joined) {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: SRC.w,
                height: SRC.h,
                borderRadius: 12,
                border: `1.5px dashed ${f >= ASK ? alpha(c, 0.4 + 0.4 * Math.abs(Math.sin(f / 4))) : C.lineStrong}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                color: f >= ASK ? c : C.ink3,
                fontSize: 14,
              }}
            >
              <Plus size={18} /> Invité
            </div>
          );
        }
        const pIn = i === 2 ? prog(f, JOIN, 12) : 1;
        const ring = i === 2 ? prog(f, JOIN, 22) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: SRC.w, height: SRC.h, transform: `scale(${i === 2 ? mix(pIn, 0.5, 1) : 1})`, opacity: pIn }}>
            <Shot f={f} hue={s.hue} label="" who={s.who} wide={s.wide} style={{ position: "absolute", inset: 0, border: `2px solid ${onAir ? RED : C.line}` }} />
            <Tag style={{ left: 6, top: 6, padding: "2px 7px" }}>
              {talking && <Mic size={13} color={c} />}
              {s.tag.replace("Cam 1 · ", "").replace("Cam 2 · ", "").replace(" · à distance", "")}
            </Tag>
            {onAir && (
              <Tag bg={RED} style={{ right: 6, bottom: 6, padding: "1px 7px", fontWeight: 700, fontSize: 14 }}>
                PGM
              </Tag>
            )}
            {i === 2 && (
              <Tag bg={alpha("#5a8bc5", 0.85)} style={{ left: 6, bottom: 6, padding: "1px 7px" }}>
                <Wifi size={13} /> à distance
              </Tag>
            )}
            {i === 2 && ring < 1 && (
              <div style={{ position: "absolute", inset: -4, borderRadius: 14, border: `3px solid ${c}`, opacity: 1 - ring, transform: `scale(${mix(ring, 1, 1.25)})` }} />
            )}
          </div>
        );
      })}

      {/* ── Live panel ── */}
      <div
        style={{
          position: "absolute",
          left: LIVE.x,
          top: LIVE.y,
          width: LIVE.w,
          height: LIVE.h,
          borderRadius: 14,
          background: C.surface2,
          border: `1px solid ${live ? alpha(RED, 0.6) : C.line}`,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Diffusion
          <span style={{ marginLeft: "auto", letterSpacing: 0, textTransform: "none", color: live ? "#ff8a94" : C.ink2, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: live ? RED : C.ink3, opacity: live ? (Math.floor(f / 8) % 2 ? 1 : 0.4) : 1 }} />
            {live ? "En direct" : "Prête"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Eye size={18} color={live ? C.ink : C.ink3} style={{ alignSelf: "center" }} />
          <span style={{ fontSize: 34, fontWeight: 600, color: live ? C.ink : C.ink3, fontVariantNumeric: "tabular-nums" }}>{viewers.toLocaleString("fr-CH").replace(/ |’|'/g, " ")}</span>
          <span style={{ fontSize: 14, color: C.ink3 }}>spectateurs</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { t: "Vidéo", d: "#ec4d5b" },
            { t: "Social", d: "#8b63f5" },
            { t: "SRT", d: "#3b9ae6" },
          ].map((d, i) => {
            const p = live ? prog(f, GO_LIVE + 3 + i * 4, 10) : 0;
            return (
              <span
                key={d.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  padding: "4px 9px",
                  borderRadius: 99,
                  border: `1px solid ${p > 0.5 ? alpha(d.d, 0.6) : C.line}`,
                  color: p > 0.5 ? C.ink : C.ink3,
                  background: alpha(d.d, 0.14 * p),
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 4, background: d.d, opacity: 0.4 + 0.6 * p }} />
                {d.t}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Audio ── */}
      <div style={{ position: "absolute", left: MIX.x, top: MIX.y, width: MIX.w, height: MIX.h, borderRadius: 14, background: C.surface2, border: `1px solid ${C.line}`, padding: "12px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 14, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Audio · qui parle
          <span style={{ marginLeft: "auto", letterSpacing: 0, textTransform: "none", color: c, display: "flex", alignItems: "center", gap: 6 }}>
            <Clapperboard size={14} /> {CUTS.filter((k) => k.f > 0 && k.f <= f).length + 37} coupes auto
          </span>
        </div>
        {[
          { n: "Camille", who: 0, col: "#c58b5a" },
          { n: "Léa", who: 1, col: "#4fae94" },
          { n: "Nora", who: 2, col: "#5a8bc5" },
          { n: "Musique", who: 3, col: "#8b6fc0" },
        ].map((ch) => {
          const lv = level(f, ch.who);
          const talking = lv > 0.4 && ch.who !== 3;
          const off = ch.who === 2 && !joined;
          const segs = 30;
          return (
            <div key={ch.n} style={{ display: "flex", alignItems: "center", gap: 12, height: 36, opacity: off ? 0.4 : 1 }}>
              <span style={{ width: 22, display: "flex", justifyContent: "center" }}>{ch.who === 3 ? <Music size={15} color={C.ink3} /> : <Mic size={15} color={talking ? c : C.ink3} />}</span>
              <span style={{ width: 82, fontSize: 15, color: talking ? C.ink : C.ink2, fontWeight: talking ? 600 : 400 }}>{ch.n}</span>
              <div style={{ flex: 1, display: "flex", gap: 3, height: 14 }}>
                {Array.from({ length: segs }).map((_, i) => {
                  const lit = i / segs < lv;
                  const hot = i >= segs - 4;
                  return <div key={i} style={{ flex: 1, borderRadius: 2, background: lit ? (hot ? RED : i >= segs - 9 ? "#e8c35a" : c) : "rgba(255,255,255,0.07)" }} />;
                })}
              </div>
              <span
                style={{
                  width: 66,
                  fontSize: 14,
                  textAlign: "center",
                  padding: "2px 0",
                  borderRadius: 99,
                  color: talking ? "#06251a" : C.ink3,
                  background: talking ? c : "transparent",
                  fontWeight: talking ? 600 : 400,
                }}
              >
                {off ? "absente" : talking ? "parle" : ch.who === 3 ? "-18 dB" : "écoute"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Stream Deck ── */}
      <div style={{ position: "absolute", left: DECK.x, top: DECK.y, width: DECK.w, height: DECK.h, borderRadius: 14, background: "#121211", border: `1px solid ${C.lineStrong}` }}>
        <div style={{ position: "absolute", left: 14, top: 12, right: 14, display: "flex", alignItems: "center", fontSize: 14, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Scènes
          <span style={{ marginLeft: "auto", letterSpacing: 0, textTransform: "none", display: "flex", alignItems: "center", gap: 6, color: C.ink2 }}>
            <LayoutGrid size={14} /> Stream Deck
          </span>
        </div>
        {keys.map((k, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const kc = keyCenter(col, row);
          const isPressed = k.press !== undefined && pressed(k.press);
          const glowP = k.press !== undefined ? prog(f, k.press, 14) : 0;
          const tint = k.red ? RED : c;
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                position: "absolute",
                left: kc.x - KEY.w / 2 - DECK.x,
                top: kc.y - KEY.h / 2 - DECK.y,
                width: KEY.w,
                height: KEY.h,
                borderRadius: 10,
                background: k.on ? `linear-gradient(160deg, ${alpha(tint, 0.95)}, ${alpha(tint, 0.6)})` : "linear-gradient(160deg, #2a2a27, #1c1c1a)",
                border: `1px solid ${k.on ? alpha(tint, 0.9) : "rgba(255,255,255,0.08)"}`,
                boxShadow: k.on ? `0 0 ${18 + 14 * (1 - glowP) * (k.press !== undefined ? 1 : 0)}px -2px ${alpha(tint, 0.75)}` : "inset 0 -3px 0 rgba(0,0,0,0.4)",
                transform: `scale(${isPressed ? 0.88 : 1})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                color: k.on ? (k.red ? "#fff" : "#06251a") : C.ink2,
                fontSize: 14,
                fontWeight: k.on ? 600 : 500,
              }}
            >
              <Icon size={19} />
              {k.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LARGE = keyCenter(3, 0);
const GOLIVE = keyCenter(3, 1);
const ACC = { x: ACCEPT.x + ACCEPT.w / 2, y: ACCEPT.y + ACCEPT.h / 2 };

export const ad: AppAd = {
  id: "nino",
  title: "Nino Studio · Régie",
  hook: "Ta régie tourne seule.",
  Mock,
  // Accept Nora, take the wide shot on the Stream Deck, then go live.
  cursor: [
    { f: 22, x: 820, y: 330 },
    { f: 42, x: ACC.x, y: ACC.y },
    { f: 45, x: ACC.x, y: ACC.y, click: true },
    { f: 66, x: 760, y: 420 },
    { f: 86, x: LARGE.x, y: LARGE.y },
    { f: 90, x: LARGE.x, y: LARGE.y, click: true },
    { f: 101, x: GOLIVE.x, y: GOLIVE.y },
    { f: 105, x: GOLIVE.x, y: GOLIVE.y, click: true },
    { f: 140, x: 880, y: 380 },
  ],
  chips: [
    { f: 15, text: "Réalisation automatique", x: 535, y: 30, icon: Sparkles, until: 40 },
    { f: 45, text: "Invités à distance", x: 940, y: 292, icon: Globe, until: 84 },
    { f: 90, text: "Pilote OBS et Stream Deck", x: 560, y: 446, icon: LayoutGrid, until: 118 },
  ],
  focus: [
    { f: 0, x: 520, y: 330, zoom: 1 },
    { f: 15, x: 360, y: 250, zoom: 1.14 },
    { f: 38, x: 540, y: 200, zoom: 1.26 },
    { f: 60, x: 700, y: 220, zoom: 1.18 },
    { f: 84, x: 860, y: 520, zoom: 1.2 },
    { f: 108, x: 880, y: 470, zoom: 1.22 },
    { f: 125, x: 560, y: 380, zoom: 1.12 },
    { f: 140, x: 520, y: 330, zoom: 1.02 },
  ],
  sfx: [
    { f: 15, kind: "cut" },
    { f: 30, kind: "cut" },
    { f: 30, kind: "ding" },
    { f: 45, kind: "click" },
    { f: 45, kind: "pop" },
    { f: 60, kind: "cut" },
    { f: 75, kind: "cut" },
    { f: 90, kind: "click" },
    { f: 90, kind: "cut" },
    { f: 105, kind: "click" },
    { f: 105, kind: "impact" },
    { f: 120, kind: "cut" },
    { f: 120, kind: "swish" },
    { f: 135, kind: "cut" },
  ],
};

export const long: LongFeature[] = [
  {
    title: "Ta régie tourne seule.",
    text: "Nino écoute qui parle et coupe sur la bonne caméra. Camille lance le sujet, Léa répond : le programme suit, sans que tu touches à rien.",
    points: ["Coupes selon qui parle", "Bandeau nom à chaque plan", "Enregistrement en continu"],
    from: 0,
    to: 28,
    focus: { x: 360, y: 250, zoom: 1.15 },
  },
  {
    title: "Tes invités, de partout.",
    text: "Nora rejoint le plateau depuis chez elle. Un clic sur Accepter, et elle devient une source prête à passer à l'antenne.",
    points: ["Demande d'accès en direct", "Source ajoutée en un clic", "Micro suivi comme sur place"],
    from: 26,
    to: 74,
    focus: { x: 520, y: 220, zoom: 1.12 },
  },
  {
    title: "Reprends la main, d'une touche.",
    text: "Une touche sur le Stream Deck ou l'iPad, et le plan large passe au programme. Nino pilote OBS pour toi.",
    points: ["Pilote OBS depuis l'iPad", "Stream Deck intégré", "Scènes, jingle et replay"],
    from: 74,
    to: 104,
    focus: { x: 820, y: 500, zoom: 1.1 },
  },
  {
    title: "En direct, en un geste.",
    text: "Tu appuies sur En direct et la diffusion part. Chaque caméra est aussi enregistrée à part, prête pour le montage.",
    points: ["Diffusion vidéo, social et SRT", "Une prise ISO par caméra", "Prêtes pour DaVinci Resolve"],
    from: 100,
    to: 140,
    focus: { x: 560, y: 330, zoom: 1.05 },
  },
];
