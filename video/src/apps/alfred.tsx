import React from "react";
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Mic,
  MonitorUp,
  PhoneOff,
  RefreshCw,
  Users,
  Video,
} from "lucide-react";
import { alpha, app, C, EASE, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Alfred ───────────────────────────── */

const COL = app("alfred").color;

/** Overshoot pop for things that land on a beat. */
const back = (t: number) => {
  const s = 1.9;
  return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};
const spring = (f: number, at: number, dur = 12) => {
  const p = prog(f, at, dur, back);
  return { opacity: Math.min(1, Math.max(0, p * 2)), transform: `scale(${Math.max(0, mix(p, 0.6, 1))})` };
};
type Rect = { x: number; y: number; w: number; h: number };
const lerpRect = (p: number, a: Rect, b: Rect): Rect => ({ x: mix(p, a.x, b.x), y: mix(p, a.y, b.y), w: mix(p, a.w, b.w), h: mix(p, a.h, b.h) });

/* Calendar geometry (mock pixels). */
const HEAD = 64;
const DAYS_Y = 72;
const GRID_Y = 110;
const ROW = 58;
const GUT = 58;
const PANEL_W = 340;
const H0 = 9;

/* Key beats (mock time). */
const T_PANEL = 15;
const T_SLOT = 30;
const T_CONFIRM = 45;
const T_FLY = 60;
const T_POPOVER = 75;
const T_JOIN = 90;
const T_SHARE = 120;
const T_SPEAKER = 135;

/* Call controls. */
const CTRL_Y = 616;
const SHARE_X = 520;

/* ─────────────── week calendar ─────────────── */

const EVENTS: { d: number; h: number; len: number; t: string; col: string; at: number; video?: boolean }[] = [
  { d: 0, h: 9, len: 1, t: "Point d'équipe", col: COL, at: 0, video: true },
  { d: 2, h: 10, len: 1.5, t: "Devis Studio Lumen", col: "#e0803a", at: 3 },
  { d: 4, h: 11, len: 2, t: "Direct « Les Coulisses »", col: "#ec4d5b", at: 6 },
  { d: 0, h: 14, len: 2, t: "Montage ép. 14", col: "#2fc7b5", at: 9 },
  { d: 1, h: 10, len: 1, t: "Visio · Léa", col: "#8b63f5", at: 12, video: true },
  { d: 3, h: 9, len: 1, t: "Posts de la semaine", col: "#ff6a33", at: 15 },
  { d: 3, h: 15, len: 1.5, t: "Revue de sprint", col: "#9a9890", at: 18, video: true },
  { d: 2, h: 16, len: 1, t: "Café · Julie", col: "#5fd3a8", at: 21 },
];

const Calendar: React.FC<{ f: number; calW: number }> = ({ f, calW }) => {
  const colW = (calW - GUT - 16) / 5;
  const days = ["Lun 16", "Mar 17", "Mer 18", "Jeu 19", "Ven 20"];
  const hours = Array.from({ length: 9 }).map((_, i) => H0 + i);
  const synced = f >= T_FLY + 14;
  const spin = synced ? 0 : f >= T_FLY ? (f - T_FLY) * 26 : 0;
  // The booked call flies from the booking page into Tuesday 14:00.
  const fly = prog(f, T_FLY, 14, EASE_IN_OUT);
  const from: Rect = { x: MOCK_W - PANEL_W + 24, y: 512, w: 284, h: 50 };
  const to: Rect = { x: GUT + colW + 4, y: GRID_Y + (14 - H0) * ROW + 3, w: colW - 8, h: ROW - 6 };
  const r = lerpRect(fly, from, to);
  const land = prog(f, T_FLY + 14, 10);
  const selected = f >= T_POPOVER;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: calW, height: MOCK_H }}>
      {/* Header */}
      <div style={{ position: "absolute", left: 0, top: 0, width: calW, height: HEAD, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 14 }}>
        <span style={{ fontFamily: SERIF, fontSize: 30, whiteSpace: "nowrap" }}>Novembre 2026</span>
        <span style={{ display: "flex", gap: 4, color: C.ink3 }}>
          <ChevronLeft size={18} />
          <ChevronRight size={18} />
        </span>
        <div style={{ display: "flex", padding: 3, borderRadius: 10, background: C.surface2, border: `1px solid ${C.line}`, fontSize: 14 }}>
          {["Jour", "Semaine", "Mois"].map((t) => (
            <span key={t} style={{ padding: "4px 12px", borderRadius: 7, background: t === "Semaine" ? alpha(COL, 0.22) : "transparent", color: t === "Semaine" ? C.ink : C.ink3 }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "6px 12px", borderRadius: 99, border: `1px solid ${synced ? alpha(COL, 0.5) : C.lineStrong}`, background: synced ? alpha(COL, 0.14) : "transparent", color: synced ? C.ink : C.ink2, whiteSpace: "nowrap" }}>
          <Cloud size={16} color={COL} />
          iCloud
          {synced ? <Check size={15} color={COL} style={{ transform: `scale(${mix(prog(f, T_FLY + 14, 8, back), 0.3, 1)})` }} /> : <RefreshCw size={14} color={C.ink3} style={{ transform: `rotate(${spin}deg)` }} />}
        </div>
        <Avatar l="C" c="#5fd3a8" s={32} />
      </div>
      {/* Days */}
      {days.map((d, i) => (
        <div key={d} style={{ position: "absolute", left: GUT + i * colW, top: DAYS_Y, width: colW, textAlign: "center", fontSize: 15, color: i === 1 ? C.ink : C.ink2, fontWeight: i === 1 ? 600 : 400 }}>
          {i === 1 ? <span style={{ padding: "4px 12px", borderRadius: 99, background: COL, color: "#fff" }}>{d}</span> : d}
        </div>
      ))}
      {/* Hours */}
      {hours.map((h, i) => (
        <div key={h} style={{ position: "absolute", left: 14, top: GRID_Y + i * ROW, width: calW - 30, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.ink3, paddingTop: 3 }}>
          {h}:00
        </div>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: GUT + i * colW, top: GRID_Y, height: 9 * ROW, borderLeft: `1px solid ${C.line}` }} />
      ))}
      {/* Today column glow and now line */}
      <div style={{ position: "absolute", left: GUT + colW, top: GRID_Y, width: colW, height: 9 * ROW, background: alpha(COL, 0.04) }} />
      {/* Events */}
      {EVENTS.map((e) => (
        <div
          key={e.t}
          style={{
            position: "absolute",
            left: GUT + e.d * colW + 4,
            top: GRID_Y + (e.h - H0) * ROW + 3,
            width: colW - 8,
            height: e.len * ROW - 6,
            borderRadius: 10,
            background: alpha(e.col, 0.2),
            borderLeft: `3px solid ${e.col}`,
            padding: "6px 9px",
            fontSize: 14,
            lineHeight: 1.25,
            overflow: "hidden",
            transformOrigin: "left top",
            ...spring(f, e.at, 12),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden" }}>
            {e.video && <Video size={14} color={e.col} style={{ flexShrink: 0 }} />}
            {e.t}
          </div>
          {e.len > 1 && <div style={{ color: C.ink3, marginTop: 2 }}>{e.h}:00</div>}
        </div>
      ))}
      <div style={{ position: "absolute", left: GUT + colW - 5, top: GRID_Y + 4.93 * ROW - 5, width: colW + 5, height: 10, display: "flex", alignItems: "center", zIndex: 3 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ec4d5b" }} />
        <div style={{ flex: 1, height: 2, background: "#ec4d5b" }} />
      </div>
      {/* The booked call */}
      {f >= T_FLY && (
        <div
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            zIndex: 4,
            borderRadius: 10,
            background: mix(fly, 0, 1) > 0.5 ? alpha(COL, 0.32) : alpha(COL, 0.6),
            borderLeft: `3px solid ${COL}`,
            boxShadow: `0 0 0 ${selected ? 2 : 0}px ${COL}, 0 0 ${mix(land, 60, 30)}px -6px ${alpha(COL, 0.9 * (1 - prog(f, T_FLY + 20, 30)) + (selected ? 0.5 : 0))}`,
            transform: `rotate(${Math.sin(fly * Math.PI) * -6}deg) scale(${1 + Math.sin(fly * Math.PI) * 0.08 + (1 - land) * (fly >= 1 ? 0.06 : 0)})`,
            padding: "6px 9px",
            fontSize: 14,
            lineHeight: 1.25,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap" }}>
            <Video size={14} color="#fff" style={{ flexShrink: 0 }} /> Appel client
          </div>
          <div style={{ color: C.ink2, whiteSpace: "nowrap" }}>Atelier Nord</div>
        </div>
      )}
    </div>
  );
};

/* ─────────────── public booking page ─────────────── */

const SLOTS = ["09:30", "11:00", "14:00", "15:30", "16:30", "17:00"];
const SLOT_TOP = 300;
const SLOT_H = 42;
const NAME_TOP = 452;
const BTN_TOP = 512;

const Booking: React.FC<{ f: number; x: number }> = ({ f, x }) => {
  const picked = f >= T_SLOT;
  const done = f >= T_CONFIRM;
  const press = f >= T_CONFIRM - 2 && f < T_CONFIRM + 3;
  const name = "Nora · Atelier Nord";
  const sentIn = prog(f, T_CONFIRM + 4, 10, back);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 14,
        width: PANEL_W - 16,
        height: MOCK_H - 28,
        borderRadius: 18,
        background: C.surface2,
        border: `1px solid ${C.lineStrong}`,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
        zIndex: 6,
      }}
    >
      <div style={{ position: "absolute", left: 20, top: 18, right: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.ink3, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <Link2 size={14} color={COL} /> Page publique
      </div>
      <div style={{ position: "absolute", left: 20, top: 46, display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.ink2 }}>
        <Avatar l="S" c="#e0803a" s={28} /> Studio Lumen
      </div>
      <div style={{ position: "absolute", left: 20, top: 82, fontFamily: SERIF, fontSize: 34, lineHeight: 1 }}>Appel découverte</div>
      <div style={{ position: "absolute", left: 20, top: 126, display: "flex", gap: 14, fontSize: 15, color: C.ink2 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={15} /> 1 h
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Video size={15} color={COL} /> Appel vidéo
        </span>
      </div>
      {/* Date strip */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 168, display: "flex", justifyContent: "space-between" }}>
        {[
          ["L", "16"],
          ["M", "17"],
          ["M", "18"],
          ["J", "19"],
          ["V", "20"],
        ].map(([d, n], i) => (
          <div key={n} style={{ width: 50, padding: "7px 0", borderRadius: 12, textAlign: "center", background: i === 1 ? COL : "transparent", border: `1px solid ${i === 1 ? COL : C.line}`, color: i === 1 ? "#fff" : C.ink2 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{d}</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 20, top: 268, fontSize: 15, color: C.ink2 }}>Mardi 17 novembre</div>
      {SLOTS.map((t, i) => {
        const on = t === "14:00" && picked;
        const p = t === "14:00" ? prog(f, T_SLOT, 10, back) : 0;
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 20 + (i % 2) * 147,
              top: SLOT_TOP + Math.floor(i / 2) * (SLOT_H + 8),
              width: 137,
              height: SLOT_H,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 16,
              border: `1px solid ${on ? COL : C.lineStrong}`,
              background: on ? alpha(COL, 0.3) : "transparent",
              color: on ? C.ink : C.ink2,
              fontWeight: on ? 600 : 400,
              transform: `scale(${on ? mix(p, 0.9, 1) : 1})`,
              boxShadow: on ? `0 0 24px -4px ${alpha(COL, 0.7)}` : "none",
              ...(i < 6 ? pop(f, T_PANEL + 2 + i, 10) : {}),
            }}
          >
            {on && <Check size={15} />} {t}
          </div>
        );
      })}
      {/* Name field */}
      <div style={{ position: "absolute", left: 20, right: 20, top: NAME_TOP, height: 44, borderRadius: 10, border: `1px solid ${picked && !done ? alpha(COL, 0.6) : C.lineStrong}`, background: C.surface, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 16, color: picked ? C.ink : C.ink3 }}>
        {picked ? typed(name, f, T_SLOT + 1, 1.8) : "Ton nom"}
        {picked && !done && <span style={{ width: 2, height: 20, background: COL, marginLeft: 2, opacity: Math.floor(f / 6) % 2 }} />}
      </div>
      {/* Confirm */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: BTN_TOP,
          height: 50,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 17,
          fontWeight: 600,
          background: done ? "#2fbf7a" : COL,
          color: "#fff",
          transform: `scale(${press ? 0.95 : 1})`,
          boxShadow: `0 10px 30px -8px ${alpha(done ? "#2fbf7a" : COL, 0.8)}`,
        }}
      >
        {done ? (
          <>
            <Check size={18} /> Confirmé
          </>
        ) : (
          "Confirmer"
        )}
      </div>
      {/* Email sent */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 576, display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.ink2, opacity: Math.min(1, Math.max(0, sentIn)), transform: `translateY(${mix(Math.min(1, sentIn), 10, 0)}px)` }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: alpha(COL, 0.2), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={15} color={COL} />
        </span>
        E-mail envoyé avec le lien d'appel
      </div>
    </div>
  );
};

/* ─────────────── event popover ─────────────── */

const POP: Rect = { x: 470, y: 250, w: 320, h: 290 };
const JOIN = { x: POP.x + POP.w / 2, y: POP.y + 248 };

const Popover: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, T_POPOVER, 12, back);
  const pulse = (Math.sin((f - T_POPOVER) / 3) + 1) / 2;
  const press = f >= T_JOIN - 2 && f < T_JOIN + 3;
  return (
    <div
      style={{
        position: "absolute",
        left: POP.x,
        top: POP.y,
        width: POP.w,
        height: POP.h,
        zIndex: 8,
        borderRadius: 16,
        background: C.surface2,
        border: `1px solid ${C.lineStrong}`,
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.9)",
        padding: 20,
        opacity: Math.min(1, Math.max(0, p * 2)),
        transform: `scale(${Math.max(0, mix(p, 0.5, 1))})`,
        transformOrigin: "0% 60%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COL, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: "#ec4d5b", opacity: 0.5 + pulse * 0.5 }} /> Commence maintenant
      </div>
      <div style={{ fontSize: 21, fontWeight: 600, marginTop: 10 }}>Appel client · Atelier Nord</div>
      <div style={{ fontSize: 15, color: C.ink2, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={15} /> Mardi 17, 14:00 à 15:00
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
        {[
          ["N", "#e0803a"],
          ["C", "#5fd3a8"],
          ["M", "#8b63f5"],
          ["J", "#2fc7b5"],
        ].map(([l, c], i) => (
          <div key={l} style={{ marginLeft: i ? -8 : 0, borderRadius: 99, boxShadow: `0 0 0 3px ${C.surface2}`, ...spring(f, T_POPOVER + 4 + i * 2, 10) }}>
            <Avatar l={l} c={c} s={34} />
          </div>
        ))}
        <span style={{ marginLeft: 12, fontSize: 15, color: C.ink2 }}>4 participants</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, color: C.ink3 }}>
        <Link2 size={14} color={COL} /> Lien envoyé, rien à installer
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 224,
          height: 48,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontSize: 17,
          fontWeight: 600,
          background: COL,
          color: "#fff",
          transform: `scale(${press ? 0.94 : 1})`,
          boxShadow: `0 0 ${10 + pulse * 26}px ${-4 + pulse * 4}px ${alpha(COL, 0.8)}`,
        }}
      >
        <Video size={19} /> Rejoindre
      </div>
    </div>
  );
};

/* ─────────────── video call ─────────────── */

const GRID: Rect[] = [
  { x: 16, y: 68, w: 498, h: 247 },
  { x: 526, y: 68, w: 498, h: 247 },
  { x: 16, y: 327, w: 498, h: 247 },
  { x: 526, y: 327, w: 498, h: 247 },
];
const SIDE: Rect[] = [0, 1, 2, 3].map((i) => ({ x: 776, y: 68 + i * 128, w: 248, h: 118 }));
const PEOPLE = [
  { label: "Nora · Atelier Nord", hue: "#e0803a", who: 0 },
  { label: "Camille (toi)", hue: "#5fd3a8", who: 1 },
  { label: "Marc", hue: "#8b63f5", who: 0 },
  { label: "Julie", hue: "#2fc7b5", who: 1 },
];

const Call: React.FC<{ f: number }> = ({ f }) => {
  const share = prog(f, T_SHARE, 14, EASE_IN_OUT);
  const sharing = f >= T_SHARE;
  const speaker = f >= T_SPEAKER ? 1 : 0;
  const secs = Math.max(0, Math.floor((f - T_JOIN) / 6));
  const timer = `00:${String(secs).padStart(2, "0")}`;
  const level = 0.35 + 0.55 * Math.abs(Math.sin(f / 2.3) * Math.cos(f / 5.1));
  const pressShare = f >= T_SHARE - 2 && f < T_SHARE + 3;
  const screenIn = prog(f, T_SHARE + 5, 12, EASE);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: MOCK_W, height: MOCK_H, background: "#0d0d0c", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ position: "absolute", left: 16, right: 16, top: 0, height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: alpha(COL, 0.22), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Video size={18} color={COL} />
        </span>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Appel client · Atelier Nord</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.ink2, padding: "4px 10px", borderRadius: 99, border: `1px solid ${alpha("#5fd3a8", 0.45)}`, background: alpha("#5fd3a8", 0.1), transformOrigin: "right center", ...spring(f, T_JOIN + 18, 10) }}>
          <Lock size={13} color="#5fd3a8" /> Chiffré de bout en bout
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 16, color: C.ink }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: "#ec4d5b", opacity: Math.floor(f / 10) % 2 ? 1 : 0.35 }} />
          {timer}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: C.ink2 }}>
          <Users size={16} /> 4
        </span>
      </div>
      {/* Shared screen */}
      {sharing && (
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 68,
            width: 748,
            height: 506,
            borderRadius: 14,
            overflow: "hidden",
            border: `2px solid ${alpha(COL, speaker ? 0.9 : 0.5)}`,
            background: "#141413",
            opacity: screenIn,
            transform: `translateY(${mix(screenIn, 40, 0)}px) scale(${mix(screenIn, 0.9, 1)})`,
            transformOrigin: "50% 100%",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontSize: 14, color: "#fff", background: alpha(COL, 0.85) }}>
            <MonitorUp size={16} /> Tu partages ton écran
            <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: 6, background: "rgba(0,0,0,0.25)" }}>Arrêter</span>
          </div>
          <div style={{ position: "absolute", left: 40, top: 76, fontSize: 14, color: C.ink3, letterSpacing: "0.14em", textTransform: "uppercase" }}>Proposition · Atelier Nord</div>
          <div style={{ position: "absolute", left: 40, top: 102, fontFamily: SERIF, fontSize: 52, lineHeight: 1.05 }}>
            Votre série vidéo,
            <br />
            <span style={{ fontStyle: "italic", color: COL }}>en 6 épisodes.</span>
          </div>
          {[
            ["Tournage", 0.72, "#2fc7b5"],
            ["Montage", 0.5, COL],
            ["Diffusion", 0.86, "#e0803a"],
          ].map(([t, v, c], i) => (
            <div key={t as string} style={{ position: "absolute", left: 40, right: 40, top: 270 + i * 64, ...pop(f, T_SHARE + 8 + i * 3, 10) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: C.ink2 }}>
                <span>{t}</span>
                <span style={{ fontFamily: MONO }}>{Math.round((v as number) * 100 * Math.min(1, prog(f, T_SHARE + 8 + i * 3, 18)))} %</span>
              </div>
              <div style={{ marginTop: 8, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.07)" }}>
                <div style={{ height: 10, borderRadius: 5, width: `${(v as number) * 100 * prog(f, T_SHARE + 8 + i * 3, 18)}%`, background: c as string }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Participants */}
      {PEOPLE.map((p, i) => {
        const r = lerpRect(share, GRID[i], SIDE[i]);
        const active = i === speaker;
        return (
          <div
            key={p.label}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              borderRadius: 14,
              boxShadow: active ? `0 0 0 3px ${COL}, 0 0 40px -6px ${alpha(COL, 0.8)}` : `0 0 0 1px ${C.line}`,
              ...spring(f, T_JOIN + 1 + i * 2, 10),
            }}
          >
            <Shot hue={p.hue} label={p.label} who={p.who} talking={active} f={f + i * 7} style={{ width: "100%", height: "100%", borderRadius: 14 }} />
            {active && (
              <div style={{ position: "absolute", right: 12, bottom: 10, transform: `scale(${mix(share, 1, 0.7)})`, transformOrigin: "right bottom" }}>
                <Meter level={level} c={COL} />
              </div>
            )}
          </div>
        );
      })}
      {/* Controls */}
      <div style={{ position: "absolute", left: 0, right: 0, top: CTRL_Y - 30, height: 60, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, ...pop(f, T_JOIN + 6, 10) }}>
        {[
          { k: "mic", el: <Mic size={20} /> },
          { k: "cam", el: <Video size={20} /> },
        ].map((b) => (
          <span key={b.k} style={{ width: 48, height: 48, borderRadius: 24, background: C.surface2, border: `1px solid ${C.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
            {b.el}
          </span>
        ))}
        <span
          style={{
            width: 200,
            height: 48,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 16,
            fontWeight: 600,
            background: sharing ? COL : C.surface2,
            border: `1px solid ${sharing ? COL : C.lineStrong}`,
            color: C.ink,
            transform: `scale(${pressShare ? 0.94 : 1})`,
            boxShadow: sharing ? `0 0 30px -4px ${alpha(COL, 0.8)}` : "none",
          }}
        >
          <MonitorUp size={18} /> Partager l'écran
        </span>
        <span style={{ width: 48, height: 48, borderRadius: 24, background: C.surface2, border: `1px solid ${C.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
          <MessageSquare size={20} />
        </span>
        <span style={{ width: 64, height: 48, borderRadius: 24, background: "#e5484d", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <PhoneOff size={20} />
        </span>
      </div>
    </div>
  );
};

/* ─────────────── the mock ─────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  // Booking page slides in, then out while the booked call flies into the week.
  const pin = prog(f, T_PANEL, 12, EASE);
  const pout = prog(f, T_FLY, 14, EASE_IN_OUT);
  const panel = pin * (1 - pout);
  const calW = MOCK_W - PANEL_W * panel;
  const panelX = MOCK_W - (PANEL_W - 2) * panel + 40 * (1 - panel);
  // Join: the calendar zooms through the Rejoindre button and the call grows out of it.
  const join = prog(f, T_JOIN, 14, EASE_IN_OUT);
  const callR = lerpRect(join, POP, { x: 0, y: 0, w: MOCK_W, h: MOCK_H });
  const callS = Math.max(callR.w / MOCK_W, callR.h / MOCK_H);
  return (
    <div style={{ position: "relative", width: MOCK_W, height: MOCK_H, overflow: "hidden" }}>
      {join < 1 && (
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${JOIN.x}px ${JOIN.y}px`, transform: `scale(${mix(join, 1, 2.2)})`, opacity: 1 - join, filter: `blur(${join * 10}px)` }}>
          <Calendar f={f} calW={calW} />
          {panel > 0.001 && <Booking f={f} x={panelX} />}
          {f >= T_POPOVER && <Popover f={f} />}
        </div>
      )}
      {f >= T_JOIN && (
        <div
          style={{
            position: "absolute",
            left: callR.x,
            top: callR.y,
            width: callR.w,
            height: callR.h,
            borderRadius: mix(join, 24, 0),
            overflow: "hidden",
            opacity: Math.min(1, join * 2.5),
            zIndex: 10,
          }}
        >
          {/* Uniform scale (no stretch), cropped by the growing frame. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: MOCK_W,
              height: MOCK_H,
              transformOrigin: "0 0",
              transform: `translate(${(callR.w - MOCK_W * callS) / 2}px, ${(callR.h - MOCK_H * callS) / 2}px) scale(${callS})`,
            }}
          >
            <Call f={f} />
          </div>
        </div>
      )}
    </div>
  );
};

export const ad: AppAd = {
  id: "alfred",
  title: "Alfred · Studio Lumen",
  hook: "Tes rendez-vous, en visio.",
  Mock,
  cursor: [
    { f: 16, x: 600, y: 330 },
    { f: 27, x: 790, y: 371 },
    { f: T_SLOT, x: 790, y: 371, click: true },
    { f: 42, x: 864, y: BTN_TOP + 25 },
    { f: T_CONFIRM, x: 864, y: BTN_TOP + 25, click: true },
    { f: 58, x: 760, y: 470 },
    { f: 72, x: 350, y: 432 },
    { f: T_POPOVER, x: 350, y: 432, click: true },
    { f: 87, x: JOIN.x, y: JOIN.y },
    { f: T_JOIN, x: JOIN.x, y: JOIN.y, click: true },
    { f: 102, x: 620, y: 520 },
    { f: 116, x: SHARE_X, y: CTRL_Y },
    { f: T_SHARE, x: SHARE_X, y: CTRL_Y, click: true },
    { f: 140, x: 640, y: 520 },
  ],
  chips: [
    { f: T_SLOT, text: "Prise de rendez-vous en ligne", x: 500, y: 272, icon: CalendarCheck, until: T_FLY + 4 },
    { f: T_FLY + 15, text: "Synchro iCloud", x: 830, y: 104, icon: Cloud, until: T_JOIN + 4 },
    { f: T_JOIN + 15, text: "Appels vidéo intégrés", x: 540, y: 34, icon: Video },
  ],
  focus: [
    { f: 0, x: 520, y: 330, zoom: 1 },
    { f: 14, x: 560, y: 330, zoom: 1.04 },
    { f: 28, x: 850, y: 370, zoom: 1.18 },
    { f: 47, x: 860, y: 380, zoom: 1.2 },
    { f: 64, x: 480, y: 380, zoom: 1.06 },
    { f: 80, x: 560, y: 360, zoom: 1.2 },
    { f: T_JOIN, x: 620, y: 360, zoom: 1.24 },
    { f: 105, x: 520, y: 330, zoom: 1.0 },
    { f: 118, x: 520, y: 520, zoom: 1.16 },
    { f: 130, x: 470, y: 330, zoom: 1.1 },
    { f: 145, x: 520, y: 330, zoom: 1.02 },
  ],
  sfx: [
    { f: 0, kind: "pop" },
    { f: 9, kind: "pop" },
    { f: T_PANEL, kind: "swish" },
    { f: T_SLOT, kind: "click" },
    { f: T_SLOT + 2, kind: "type" },
    { f: T_CONFIRM, kind: "click" },
    { f: T_CONFIRM + 4, kind: "ding" },
    { f: T_FLY, kind: "swish" },
    { f: T_FLY + 14, kind: "pop" },
    { f: T_POPOVER, kind: "click" },
    { f: T_POPOVER + 2, kind: "pop" },
    { f: T_JOIN, kind: "click" },
    { f: T_JOIN + 1, kind: "cut" },
    { f: T_JOIN + 18, kind: "lock" },
    { f: T_SHARE, kind: "click" },
    { f: T_SHARE + 2, kind: "swish" },
    { f: T_SPEAKER, kind: "pop" },
  ],
};
