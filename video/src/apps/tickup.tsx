import React from "react";
import { Check, ChartGantt, Download, GitMerge, GitPullRequest, Hand, List, Map as MapIcon, Plus, Search, SquareKanban } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, C, EASE, EASE_IN_OUT, MONO } from "../theme";
import { Avatar, mix, prog } from "../kit";
import type { AppAd } from "../ad";
import type { LongFeature } from "../long";

/* ───────────────────────────── TickUp ───────────────────────────── */

const INK = "#e9e6df";
const MERGE = "#a68cf0";

/* Layout, in mock pixels. Everything is absolutely placed so the cursor can grab exact spots. */
const COL_W = 241;
const COL_GAP = 12;
const BOARD_X = 20;
const COL_Y = 122;
const CARD_W = COL_W - 20;
const CARD_H = 104;
const SLOT0 = 170;
const SLOT = CARD_H + 10;
const colX = (i: number) => BOARD_X + i * (COL_W + COL_GAP);
const cardX = (i: number) => colX(i) + 10;
const slotY = (i: number) => SLOT0 + i * SLOT;

const TAB_W = 104;
const TAB_X0 = 20;
const tabX = (i: number) => TAB_X0 + i * (TAB_W + 6);

/* Timeline of the action (mock frames, all on beats). */
const GRAB = 30;
const DROP = 60;
const MERGED = 75;
const AUTO = 90;
const AUTO_END = 102;
const GANTT = 105;
// Long video only (never reached by the ad, whose mock time stops at 150).
const RM = 175;

// The cursor grabs the card at this point inside it.
const GRIP = { x: 132, y: 22 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, keys: [number, number][], dur = 9) => {
  // value steps on beats: each key = [frame, value], eased over `dur` frames
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v = mix(prog(f, keys[i][0], dur, EASE), v, keys[i][1]);
  return v;
};

const springy = (t: number) => {
  const s = 1.70158 * 1.2;
  return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};

type CardData = { id: string; t: string; tag: string; who: [string, string]; p: number; done?: boolean; pr?: "review" | "merged" };

const Card: React.FC<{ d: CardData; x: number; y: number; f: number; style?: React.CSSProperties; enter?: number; glow?: number }> = ({ d, x, y, f, style, enter = 0, glow = 0 }) => {
  const e = prog(f, enter, 12, EASE);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        padding: "12px 14px",
        borderRadius: 14,
        background: C.surface2,
        border: `1px solid ${glow > 0 ? alpha(INK, 0.2 + 0.5 * glow) : C.lineStrong}`,
        boxShadow: `0 10px 24px -14px rgba(0,0,0,0.85)${glow > 0 ? `, 0 0 ${30 * glow}px -4px ${alpha(INK, 0.35 * glow)}` : ""}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: e,
        filter: e < 1 ? `blur(${mix(e, 6, 0)}px)` : undefined,
        ...style,
        transform: `translateY(${mix(e, 16, 0)}px) ${style?.transform ?? ""}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink3 }}>
        {d.done ? (
          <span style={{ width: 16, height: 16, borderRadius: 8, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={11} color="#111" strokeWidth={3} />
          </span>
        ) : (
          <span style={{ width: 14, height: 14, borderRadius: 7, border: `1.5px solid ${C.ink3}` }} />
        )}
        <span style={{ fontFamily: MONO }}>{d.id}</span>
        <span style={{ marginLeft: "auto", padding: "1px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: C.ink2 }}>{d.tag}</span>
      </div>
      <div style={{ fontSize: 17, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.t}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {d.pr ? (
          <PrBadge kind={d.pr} f={f} />
        ) : (
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${Math.min(1, d.p) * 100}%`, height: "100%", borderRadius: 3, background: INK }} />
          </div>
        )}
        <span style={{ marginLeft: "auto" }}>
          <Avatar l={d.who[0]} c={d.who[1]} s={22} />
        </span>
      </div>
    </div>
  );
};

const PrBadge: React.FC<{ kind: "review" | "merged"; f: number; at?: number }> = ({ kind }) => {
  const merged = kind === "merged";
  const c = merged ? MERGE : C.ink2;
  const Icon = merged ? GitMerge : GitPullRequest;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        padding: "2px 9px",
        borderRadius: 99,
        color: merged ? "#efe9ff" : C.ink2,
        background: alpha(merged ? MERGE : "#ffffff", merged ? 0.28 : 0.06),
        border: `1px solid ${alpha(merged ? MERGE : "#ffffff", merged ? 0.55 : 0.1)}`,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={13} color={c} />
      {merged ? "PR #42 fusionnée" : "PR #40 en revue"}
    </span>
  );
};

/* ─────────── Gantt view ─────────── */

const G_X = 262;
const G_W = 1020 - G_X;
const WEEKS = ["S47", "S48", "S49", "S50", "S51", "S52"];
const WK = G_W / WEEKS.length;
const G_ROW0 = 176;
const G_ROW = 54;
const ROWS: { id: string; t: string; s: number; l: number; p: number; at: number; who: [string, string]; hot?: boolean }[] = [
  { id: "ATN-05", t: "Refonte accueil", s: 0, l: 1.3, p: 1, at: GANTT, who: ["J", "#8b63f5"] },
  { id: "ATN-06", t: "Correctif paiement", s: 0.7, l: 0.9, p: 1, at: GANTT, who: ["M", "#e0803a"] },
  { id: "ATN-12", t: "Mode sombre", s: 1.0, l: 1.3, p: 1, at: GANTT, who: ["C", "#5fd3a8"], hot: true },
  { id: "ATN-09", t: "Connexion Apple", s: 1.5, l: 1.7, p: 0.8, at: 120, who: ["L", "#2fc7b5"] },
  { id: "ATN-11", t: "Notifications push", s: 2.3, l: 1.6, p: 0.55, at: 120, who: ["N", "#e85d9a"] },
  { id: "ATN-14", t: "Export PDF", s: 3.4, l: 1.4, p: 0, at: 135, who: ["M", "#e0803a"] },
  { id: "ATN-15", t: "Page tarifs", s: 3.9, l: 1.5, p: 0, at: 135, who: ["J", "#8b63f5"] },
];
const TODAY = 2.05;

const Gantt: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const today = prog(f, GANTT + 4, 14, EASE);
  const mile = prog(f, 135, 12, springy);
  const dep = prog(f, 137, 10, EASE);
  const rowY = (i: number) => G_ROW0 + i * G_ROW;
  const barEnd = (i: number) => G_X + (ROWS[i].s + ROWS[i].l) * WK;
  const barStart = (i: number) => G_X + ROWS[i].s * WK;
  const depPath = (a: number, b: number) => {
    const x1 = barEnd(a);
    const y1 = rowY(a) + G_ROW / 2;
    const x2 = barStart(b);
    const y2 = rowY(b) + G_ROW / 2;
    return `M ${x1} ${y1} H ${x1 + 14} V ${y2} H ${x2 - 4}`;
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: show, transform: `translateX(${mix(show, 40, 0)}px)` }}>
      {/* week header */}
      <div style={{ position: "absolute", left: 20, top: COL_Y + 6, width: G_X - 40, fontSize: 14, color: C.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ticket</div>
      {WEEKS.map((w, i) => (
        <div key={w} style={{ position: "absolute", left: G_X + i * WK, top: COL_Y, width: WK, height: 660 - COL_Y - 24, borderLeft: `1px solid ${C.line}`, background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
          <div style={{ padding: "6px 10px", fontSize: 14, fontFamily: MONO, color: C.ink3 }}>{w}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 20, right: 20, top: COL_Y + 38, height: 1, background: C.line }} />
      {/* rows */}
      {ROWS.map((r, i) => {
        const g = prog(f, r.at, 12, EASE);
        const label = prog(f, r.at - 2, 10, EASE);
        const done = r.p >= 1;
        const w = r.l * WK * g;
        return (
          <React.Fragment key={r.id}>
            <div
              style={{
                position: "absolute",
                left: 20,
                top: rowY(i),
                width: G_X - 34,
                height: G_ROW,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 16,
                color: r.hot ? C.ink : C.ink2,
                opacity: label,
                transform: `translateX(${mix(label, -14, 0)}px)`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 14, color: C.ink3 }}>{r.id.slice(4)}</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.t}</span>
            </div>
            <div style={{ position: "absolute", left: 20, right: 20, top: rowY(i) + G_ROW, height: 1, background: C.line, opacity: label }} />
            <div
              style={{
                position: "absolute",
                left: G_X + r.s * WK,
                top: rowY(i) + 11,
                width: w,
                opacity: g > 0.02 ? 1 : 0,
                height: G_ROW - 22,
                borderRadius: 9,
                overflow: "hidden",
                background: done ? INK : "rgba(255,255,255,0.05)",
                border: done ? "none" : `1px solid ${alpha(INK, 0.35)}`,
                boxShadow: r.hot ? `0 0 26px -2px ${alpha(INK, 0.55)}` : "0 8px 18px -10px rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              {!done && r.p > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.p * 100 * prog(f, r.at + 6, 12, EASE)}%`, background: alpha(INK, 0.3) }} />}
              <span style={{ position: "relative", padding: "0 10px", fontSize: 14, fontWeight: 600, color: done ? "#151513" : C.ink, whiteSpace: "nowrap", opacity: prog(f, r.at + 6, 6) }}>
                {done ? "Livré" : r.p > 0 ? `${Math.round(r.p * 100 * prog(f, r.at + 6, 12, EASE))} %` : "Planifié"}
              </span>
              <span style={{ marginLeft: "auto", marginRight: 5, position: "relative", opacity: prog(f, r.at + 8, 6) }}>
                <Avatar l={r.who[0]} c={r.who[1]} s={22} />
              </span>
            </div>
          </React.Fragment>
        );
      })}
      {/* dependencies */}
      <svg width={1040} height={660} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {[
          [3, 5],
          [4, 6],
        ].map(([a, b]) => (
          <path key={a} d={depPath(a, b)} fill="none" stroke={alpha(INK, 0.45)} strokeWidth={1.5} strokeDasharray="400" strokeDashoffset={400 * (1 - dep)} />
        ))}
      </svg>
      {/* today line */}
      <div style={{ position: "absolute", left: G_X + TODAY * WK, top: COL_Y + 34, width: 2, height: (660 - COL_Y - 60) * today, background: INK, boxShadow: `0 0 14px ${alpha(INK, 0.6)}` }} />
      <div
        style={{
          position: "absolute",
          left: G_X + TODAY * WK,
          top: COL_Y + 4,
          transform: `translateX(-50%) scale(${today})`,
          fontSize: 14,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 99,
          background: INK,
          color: "#151513",
          whiteSpace: "nowrap",
        }}
      >
        Aujourd'hui
      </div>
      {/* milestone */}
      <div style={{ position: "absolute", left: 1000, top: G_ROW0 + 6 * G_ROW + 13, transform: `translate(-100%, 0) scale(${Math.max(0, mile)})`, transformOrigin: "85% 13px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div style={{ width: 26, height: 26, marginRight: 14, transform: "rotate(45deg)", background: INK, borderRadius: 4, boxShadow: `0 0 22px ${alpha(INK, 0.6)}` }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 8, background: C.bg2 }}>Lancement v2</div>
      </div>
    </div>
  );
};

/* ─────────── Roadmap view (long video only, f > 150) ─────────── */

const MONTHS = ["Nov.", "Déc.", "Janv.", "Févr.", "Mars", "Avr."];
const MW = G_W / MONTHS.length;
const R_ROW0 = 176;
const R_ROW = 88;
const R_TODAY = 0.6;
type Epic = { t: string; s: number; l: number; p: number };
const PROJECTS: { name: string; meta: string; c: string; epics: Epic[]; mile?: { t: string; at: number } }[] = [
  { name: "Site Studio Lumen", meta: "24 tickets", c: "#5fd3a8", epics: [{ t: "Refonte v2", s: 0, l: 1.75, p: 0.71 }], mile: { t: "Lancement v2", at: 1.95 } },
  { name: "App Atelier Nord", meta: "31 tickets", c: "#2fc7b5", epics: [{ t: "Compte", s: 0.2, l: 1.3, p: 0.45 }, { t: "Paiements", s: 1.65, l: 1.6, p: 0 }] },
  { name: "Boutique Atelier Nord", meta: "18 tickets", c: "#e0803a", epics: [{ t: "Catalogue", s: 0, l: 0.95, p: 1 }, { t: "Livraison", s: 1.1, l: 1.5, p: 0.2 }] },
  { name: "Identité Studio Lumen", meta: "9 tickets", c: "#8b63f5", epics: [{ t: "Charte", s: 2.0, l: 1.3, p: 0 }, { t: "Kit réseaux", s: 3.45, l: 1.4, p: 0 }] },
  { name: "Support client", meta: "12 tickets", c: "#e85d9a", epics: [{ t: "Base d'aide", s: 0.9, l: 2.1, p: 0.3 }] },
];
const HOVER = { row: 1, epic: 1 };
const HOVER_AT = 205;

const Roadmap: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const today = prog(f, RM + 8, 14, EASE);
  const hover = prog(f, HOVER_AT, 10, springy);
  const rowY = (i: number) => R_ROW0 + i * R_ROW;
  const he = PROJECTS[HOVER.row].epics[HOVER.epic];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: show, transform: `translateX(${mix(show, 40, 0)}px)` }}>
      <div style={{ position: "absolute", left: 20, top: COL_Y + 6, width: G_X - 40, fontSize: 14, color: C.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Projet</div>
      {MONTHS.map((m, i) => (
        <div key={m} style={{ position: "absolute", left: G_X + i * MW, top: COL_Y, width: MW, height: 660 - COL_Y - 24, borderLeft: `1px solid ${C.line}`, background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
          <div style={{ padding: "6px 10px", fontSize: 14, color: C.ink3 }}>{m}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 20, right: 20, top: COL_Y + 38, height: 1, background: C.line }} />
      {/* today line (under the epics) */}
      <div style={{ position: "absolute", left: G_X + R_TODAY * MW, top: COL_Y + 34, width: 2, height: (660 - COL_Y - 60) * today, background: INK, boxShadow: `0 0 14px ${alpha(INK, 0.6)}` }} />
      <div style={{ position: "absolute", left: G_X + R_TODAY * MW, top: COL_Y + 4, transform: `translateX(-50%) scale(${today})`, fontSize: 14, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: INK, color: "#151513", whiteSpace: "nowrap" }}>
        Aujourd'hui
      </div>
            {PROJECTS.map((pr, i) => {
        const at = RM + 4 + i * 4;
        const label = prog(f, at - 2, 10, EASE);
        return (
          <React.Fragment key={pr.name}>
            <div style={{ position: "absolute", left: 20, top: rowY(i), width: G_X - 34, height: R_ROW, display: "flex", alignItems: "center", gap: 12, opacity: label, transform: `translateX(${mix(label, -14, 0)}px)` }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: pr.c, flexShrink: 0 }} />
              <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 16, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pr.name}</span>
                <span style={{ fontSize: 13, color: C.ink3 }}>{pr.meta}</span>
              </span>
            </div>
            <div style={{ position: "absolute", left: 20, right: 20, top: rowY(i) + R_ROW, height: 1, background: C.line, opacity: label }} />
            {pr.epics.map((e, j) => {
              const g = prog(f, at + j * 5, 14, EASE);
              const done = e.p >= 1;
              const hot = i === HOVER.row && j === HOVER.epic ? hover : 0;
              const pct = Math.round(e.p * 100 * prog(f, at + j * 5 + 8, 12, EASE));
              return (
                <div
                  key={e.t}
                  style={{
                    position: "absolute",
                    left: G_X + e.s * MW + 3,
                    top: rowY(i) + 24,
                    width: Math.max(0, e.l * MW * g - 6),
                    height: R_ROW - 48,
                    opacity: g > 0.02 ? 1 : 0,
                    borderRadius: 10,
                    overflow: "hidden",
                    boxSizing: "border-box",
                    background: done ? INK : C.surface2,
                    border: done ? "none" : `1px solid ${alpha(INK, 0.3 + 0.5 * hot)}`,
                    boxShadow: hot > 0 ? `0 0 ${26 * hot}px -2px ${alpha(INK, 0.55 * hot)}` : "0 8px 18px -10px rgba(0,0,0,0.8)",
                    display: "flex",
                    alignItems: "center",
                    transform: `scale(${1 + 0.03 * hot})`,
                  }}
                >
                  {!done && e.p > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: alpha(INK, 0.3) }} />}
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: pr.c }} />
                  <span style={{ position: "relative", padding: "0 10px 0 14px", fontSize: 14, fontWeight: 600, color: done ? "#151513" : C.ink, whiteSpace: "nowrap", opacity: prog(f, at + j * 5 + 6, 6) }}>
                    {e.t}
                  </span>
                  <span style={{ position: "relative", marginLeft: "auto", marginRight: 10, fontSize: 13, fontFamily: MONO, color: done ? "#151513" : C.ink3, whiteSpace: "nowrap", opacity: prog(f, at + j * 5 + 8, 6) }}>
                    {done ? <Check size={14} color="#151513" strokeWidth={3} /> : e.p > 0 ? `${pct} %` : ""}
                  </span>
                </div>
              );
            })}
            {pr.mile && (
              <div style={{ position: "absolute", left: G_X + pr.mile.at * MW, top: rowY(i) + R_ROW / 2, transform: `translate(-13px, -13px) scale(${Math.max(0, prog(f, at + 14, 12, springy))})`, transformOrigin: "13px 13px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, transform: "rotate(45deg)", background: INK, borderRadius: 4, boxShadow: `0 0 22px ${alpha(INK, 0.6)}`, flexShrink: 0 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 8, background: C.bg2 }}>{pr.mile.t}</div>
              </div>
            )}
          </React.Fragment>
        );
      })}
{/* hover card on an epic */}
      {f >= HOVER_AT && (
        <div
          style={{
            position: "absolute",
            left: G_X + (he.s + he.l) * MW + 14,
            top: rowY(HOVER.row) + R_ROW / 2,
            transform: `translate(0, -50%) scale(${Math.max(0, hover)})`,
            transformOrigin: "0 50%",
            zIndex: 6,
            padding: "10px 14px",
            borderRadius: 12,
            background: C.surface,
            border: `1px solid ${C.lineStrong}`,
            boxShadow: "0 18px 38px -12px rgba(0,0,0,0.95)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 13, color: C.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Epic · App Atelier Nord</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Paiements</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.ink2 }}>
            14 tickets · Févr. à mars
            <span style={{ display: "flex" }}>
              {[
                ["L", "#2fc7b5"],
                ["M", "#e0803a"],
              ].map(([l, c], k) => (
                <span key={l} style={{ marginLeft: k ? -6 : 0, borderRadius: 12, boxShadow: `0 0 0 2px ${C.surface}` }}>
                  <Avatar l={l} c={c} s={22} />
                </span>
              ))}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

/* ─────────── the screen ─────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  // Drag of ATN-12, glued to the cursor (same easing as the shell's cursor).
  const lift = prog(f, GRAB, 6, EASE);
  const land = prog(f, DROP, 8, EASE);
  const held = lift * (1 - land);
  const dragT = interpolate(f, [GRAB, DROP], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const autoT = interpolate(f, [AUTO, AUTO_END], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const autoLand = prog(f, AUTO_END, 8, EASE);
  const mx = f < AUTO ? mix(dragT, cardX(0), cardX(2)) : mix(autoT, cardX(2), cardX(3));
  const my = slotY(0) - 26 * Math.sin(Math.PI * autoT);
  const autoHeld = Math.sin(Math.PI * autoT);
  const overCol = Math.round((mx - BOARD_X) / (COL_W + COL_GAP));
  const dragging = f >= GRAB && f < DROP;

  // Board reshuffles.
  const col0Up = prog(f, 45, 12, EASE_IN_OUT);
  const col2Down = prog(f, 48, 12, EASE_IN_OUT) * (1 - prog(f, AUTO + 2, 12, EASE_IN_OUT));
  const col3Down = prog(f, AUTO - 2, 12, EASE_IN_OUT);

  // Progress bars stepping on beats.
  const pApple = ramp(f, [[0, 0.35], [15, 0.55], [45, 0.7], [75, 0.8]]);
  const pPush = ramp(f, [[0, 0.15], [30, 0.3], [60, 0.45], [90, 0.55]]);
  const pDark = ramp(f, [[0, 0.6], [DROP, 0.9], [AUTO, 1]]);
  const sprint = ramp(f, [[-6, 0], [4, 0.42], [DROP, 0.5], [AUTO, 0.67], [120, 0.71]], 10);
  const merged = f >= MERGED;
  const mergePop = prog(f, MERGED, 12, springy);
  const mergeGlow = prog(f, MERGED, 6) * (1 - prog(f, AUTO + 4, 14));

  // View switch.
  const sw = prog(f, GANTT, 9, EASE);
  const tabPos = interpolate(f, [GANTT, GANTT + 9], [0, 2], { ...clamp, easing: EASE });
  const hoverGantt = f > 96 && f < GANTT ? 1 : 0;
  // Long video only: Gantt -> Roadmap (all zero below 150).
  const rm = f >= 150 ? prog(f, RM, 9, EASE) : 0;
  const tabPosAll = tabPos + rm;
  const hoverRoadmap = f > 165 && f < RM ? 1 : 0;

  const dark: CardData = { id: "ATN-12", t: "Mode sombre", tag: "Front", who: ["C", "#5fd3a8"], p: pDark, done: f >= AUTO_END - 4, pr: merged ? "merged" : undefined };
  const counts = [f >= GRAB ? 2 : 3, 2, f >= DROP && f < AUTO + 6 ? 2 : 1, f >= AUTO_END ? 3 : 2];
  const cols = ["À faire", "En cours", "En revue", "Terminé"];

  return (
    <div style={{ position: "relative", width: 1040, height: 660, overflow: "hidden", background: C.bg2 }}>
      {/* header */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: `1px solid ${C.line}` }}>
        <span style={{ fontSize: 15, color: C.ink3 }}>Projets /</span>
        {rm < 0.5 ? (
          <>
            <span style={{ fontSize: 18, fontWeight: 600, opacity: 1 - 2 * rm }}>Site Studio Lumen</span>
            <span style={{ fontSize: 14, color: C.ink3, padding: "2px 9px", borderRadius: 6, border: `1px solid ${C.line}`, opacity: 1 - 2 * rm }}>v2</span>
          </>
        ) : (
          <span style={{ fontSize: 18, fontWeight: 600, opacity: 2 * rm - 1 }}>Tous les projets</span>
        )}
        <span style={{ marginLeft: "auto", display: "flex" }}>
          {[
            ["C", "#5fd3a8"],
            ["L", "#2fc7b5"],
            ["M", "#e0803a"],
            ["J", "#8b63f5"],
          ].map(([l, c], i) => (
            <span key={l} style={{ marginLeft: i ? -8 : 0, borderRadius: 14, boxShadow: `0 0 0 2px ${C.bg2}` }}>
              <Avatar l={l} c={c} s={26} />
            </span>
          ))}
        </span>
        <span style={{ fontSize: 15, color: C.ink2, marginLeft: 10 }}>Sprint 4</span>
        <span style={{ width: 130, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <span style={{ display: "block", width: `${sprint * 100}%`, height: "100%", borderRadius: 3, background: INK, boxShadow: `0 0 10px ${alpha(INK, 0.5)}` }} />
        </span>
        <span style={{ fontSize: 15, fontFamily: MONO, color: C.ink, width: 44, textAlign: "right" }}>{Math.round(sprint * 100)} %</span>
      </div>
      {/* tabs */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 48, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", left: tabX(0) + tabPosAll * (TAB_W + 6), top: 7, width: TAB_W, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.1)", boxShadow: `inset 0 0 0 1px ${C.lineStrong}` }} />
        {[
          ["Kanban", SquareKanban],
          ["Liste", List],
          ["Gantt", ChartGantt],
          ["Roadmap", MapIcon],
        ].map(([label, Icon], i) => {
          const I = Icon as typeof List;
          const active = (i === 0 && sw < 0.5) || (i === 2 && sw >= 0.5 && rm < 0.5) || (i === 3 && rm >= 0.5);
          return (
            <div
              key={label as string}
              style={{
                position: "absolute",
                left: tabX(i),
                top: 7,
                width: TAB_W,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                fontSize: 15,
                color: active ? C.ink : C.ink3,
                background: (i === 2 && hoverGantt) || (i === 3 && hoverRoadmap) ? "rgba(255,255,255,0.05)" : "transparent",
              }}
            >
              <I size={15} /> {label as string}
            </div>
          );
        })}
        <div style={{ position: "absolute", right: 20, top: 7, height: 34, display: "flex", gap: 10, alignItems: "center" }}>
          <Search size={17} color={C.ink3} style={{ marginRight: 4 }} />
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 15, color: C.ink2, padding: "6px 12px", borderRadius: 9, border: `1px solid ${C.lineStrong}` }}>
            <Download size={15} /> Importer de Linear
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: "#151513", padding: "6px 12px", borderRadius: 9, background: INK }}>
            <Plus size={15} strokeWidth={2.5} /> Ticket
          </span>
        </div>
      </div>

      {/* kanban */}
      {sw < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - sw, transform: `translateX(${-40 * sw}px) scale(${1 - 0.03 * sw})`, filter: sw > 0 ? `blur(${sw * 6}px)` : undefined }}>
          {cols.map((name, ci) => {
            const hot = dragging && overCol === ci ? prog(f, GRAB, 4) : 0;
            const target = (ci === 2 && f >= 48 && f < DROP + 4) || (ci === 3 && f >= AUTO - 2 && f < AUTO_END + 2);
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: colX(ci),
                  top: COL_Y,
                  width: COL_W,
                  height: 660 - COL_Y - 18,
                  boxSizing: "border-box",
                  borderRadius: 16,
                  background: hot || target ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.022)",
                  border: `1px solid ${hot || target ? alpha(INK, 0.28) : C.line}`,
                  ...(f < 14 ? { opacity: prog(f, ci * 2 - 4, 10), transform: `translateY(${mix(prog(f, ci * 2 - 4, 10, EASE), 20, 0)}px)` } : {}),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 14px", fontSize: 15, color: C.ink2 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, border: `1.5px solid ${C.ink2}`, background: ci === 3 ? C.ink2 : ci === 2 ? `linear-gradient(90deg, ${C.ink2} 50%, transparent 50%)` : "transparent" }} />
                  {name}
                  <span style={{ fontFamily: MONO, fontSize: 14, color: C.ink3 }}>{counts[ci]}</span>
                  <Plus size={15} color={C.ink3} style={{ marginLeft: "auto" }} />
                </div>
              </div>
            );
          })}
          {/* drop placeholders */}
          <div style={{ position: "absolute", left: cardX(2), top: slotY(0), width: CARD_W, height: CARD_H, boxSizing: "border-box", borderRadius: 14, border: `1.5px dashed ${alpha(INK, 0.4)}`, opacity: prog(f, 48, 6) * (1 - prog(f, DROP, 4)) }} />
          <div style={{ position: "absolute", left: cardX(3), top: slotY(0), width: CARD_W, height: CARD_H, boxSizing: "border-box", borderRadius: 14, border: `1.5px dashed ${alpha(INK, 0.4)}`, opacity: prog(f, AUTO - 2, 6) * (1 - prog(f, AUTO_END, 4)) }} />

          {/* À faire */}
          <Card d={{ id: "ATN-14", t: "Export PDF", tag: "Back", who: ["M", "#e0803a"], p: 0.1 }} x={cardX(0)} y={slotY(1) - SLOT * col0Up} f={f} enter={2} />
          <Card d={{ id: "ATN-15", t: "Page tarifs", tag: "Design", who: ["J", "#8b63f5"], p: 0 }} x={cardX(0)} y={slotY(2) - SLOT * col0Up} f={f} enter={4} />
          {/* En cours */}
          <Card d={{ id: "ATN-09", t: "Connexion Apple", tag: "iOS", who: ["L", "#2fc7b5"], p: pApple }} x={cardX(1)} y={slotY(0)} f={f} enter={3} />
          <Card d={{ id: "ATN-11", t: "Notifications push", tag: "iOS", who: ["N", "#e85d9a"], p: pPush }} x={cardX(1)} y={slotY(1)} f={f} enter={5} />
          {/* En revue */}
          <Card d={{ id: "ATN-08", t: "Onboarding", tag: "Front", who: ["L", "#2fc7b5"], p: 0.9, pr: "review" }} x={cardX(2)} y={slotY(0) + SLOT * col2Down} f={f} enter={5} />
          {/* Terminé */}
          <Card d={{ id: "ATN-05", t: "Refonte accueil", tag: "Design", who: ["J", "#8b63f5"], p: 1, done: true }} x={cardX(3)} y={slotY(0) + SLOT * col3Down} f={f} enter={6} />
          <Card d={{ id: "ATN-06", t: "Correctif paiement", tag: "Back", who: ["M", "#e0803a"], p: 1, done: true }} x={cardX(3)} y={slotY(1) + SLOT * col3Down} f={f} enter={8} />

          {/* the card that travels */}
          <Card
            d={dark}
            x={mx}
            y={my}
            f={f}
            glow={mergeGlow}
            style={{
              zIndex: 5,
              transform: `rotate(${3 * held - 2 * autoHeld}deg) scale(${1 + 0.06 * held + 0.04 * autoHeld + 0.05 * (1 - autoLand) * (f >= AUTO_END ? 1 : 0)})`,
              boxShadow: `0 ${mix(Math.max(held, autoHeld), 10, 44)}px ${mix(Math.max(held, autoHeld), 24, 60)}px -14px rgba(0,0,0,0.95)${mergeGlow > 0 ? `, 0 0 ${34 * mergeGlow}px -4px ${alpha(MERGE, 0.55 * mergeGlow)}` : ""}`,
            }}
          />
          {/* merge pop: a floating GitHub notice above the card */}
          {f >= MERGED && f < AUTO + 4 && (
            <div
              style={{
                position: "absolute",
                left: cardX(2) + CARD_W / 2,
                top: slotY(2) + 6,
                transform: `translate(-50%, 0) scale(${Math.max(0, mergePop)}) translateY(${-6 * prog(f, MERGED, 30)}px)`,
                opacity: 1 - prog(f, AUTO - 2, 6),
                zIndex: 6,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                borderRadius: 12,
                background: C.surface,
                border: `1px solid ${alpha(MERGE, 0.6)}`,
                boxShadow: `0 16px 34px -12px rgba(0,0,0,0.9), 0 0 30px -6px ${alpha(MERGE, 0.6)}`,
                whiteSpace: "nowrap",
                fontSize: 15,
              }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 8, background: alpha(MERGE, 0.3), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GitMerge size={15} color={MERGE} />
              </span>
              <span>
                <span style={{ color: C.ink3, fontFamily: MONO, fontSize: 14 }}>main</span> <span style={{ color: C.ink }}>PR #42 fusionnée</span>
              </span>
            </div>
          )}
          {/* landing ripple in Terminé */}
          {f >= AUTO_END - 2 && f < AUTO_END + 16 &&
            [0, 4].map((d) => {
              const p = prog(f, AUTO_END - 2 + d, 14, EASE);
              return (
                <div
                  key={d}
                  style={{
                    position: "absolute",
                    left: cardX(3),
                    top: slotY(0),
                    width: CARD_W,
                    height: CARD_H,
                    boxSizing: "border-box",
                    borderRadius: 14,
                    border: `2px solid ${alpha(INK, 0.7 * (1 - p))}`,
                    transform: `scale(${mix(p, 1, 1.25)})`,
                    zIndex: 4,
                  }}
                />
              );
            })}
        </div>
      )}

      {/* gantt */}
      {sw > 0 && rm < 1 && (
        <div style={{ position: "absolute", inset: 0, ...(rm > 0 ? { opacity: 1 - rm, transform: `translateX(${-40 * rm}px)`, filter: `blur(${rm * 6}px)` } : {}) }}>
          <Gantt f={f} show={prog(f, GANTT + 2, 10, EASE)} />
        </div>
      )}
      {rm > 0 && <Roadmap f={f} show={prog(f, RM + 2, 10, EASE)} />}
    </div>
  );
};

const gripAt = (x: number) => ({ x: x + GRIP.x, y: slotY(0) + GRIP.y });

export const ad: AppAd = {
  id: "tickup",
  title: "TickUp · Studio · Sprint 4",
  hook: "Tes projets, livrés.",
  Mock,
  cursor: [
    { f: 4, x: 520, y: 520 },
    { f: 26, ...gripAt(cardX(0)) },
    { f: GRAB, ...gripAt(cardX(0)), click: true },
    { f: DROP, ...gripAt(cardX(2)), click: true },
    { f: 80, x: 505, y: 330 },
    { f: 100, x: tabX(2) + TAB_W / 2, y: 84 },
    { f: GANTT, x: tabX(2) + TAB_W / 2, y: 84, click: true },
    { f: 126, x: 560, y: 470 },
    { f: 140, x: 600, y: 490 },
    // Long video only (beyond the ad's last mock frame, 150).
    { f: 150, x: 600, y: 490 },
    { f: 170, x: tabX(3) + TAB_W / 2, y: 84 },
    { f: RM, x: tabX(3) + TAB_W / 2, y: 84, click: true },
    { f: HOVER_AT - 4, x: G_X + 2.45 * MW, y: R_ROW0 + R_ROW + 44 },
    { f: 230, x: G_X + 2.5 * MW, y: R_ROW0 + R_ROW + 48 },
  ],
  chips: [
    { f: DROP, text: "Glisser, déposer, livré", x: 640, y: 530, icon: Hand, until: 86 },
    { f: AUTO, text: "Relié à GitHub", x: 880, y: 570, icon: GitMerge, until: 114 },
    { f: 120, text: "Gantt et roadmap", x: 760, y: 610, icon: ChartGantt },
    { f: 190, text: "Tous tes projets", x: 700, y: 620, icon: MapIcon },
  ],
  focus: [
    { f: 0, x: 520, y: 330, zoom: 1 },
    { f: 28, x: 200, y: 250, zoom: 1.2 },
    { f: 45, x: 400, y: 250, zoom: 1.26 },
    { f: 62, x: 640, y: 240, zoom: 1.3 },
    { f: 80, x: 660, y: 220, zoom: 1.34 },
    { f: 96, x: 820, y: 240, zoom: 1.24 },
    { f: 106, x: 420, y: 200, zoom: 1.14 },
    { f: 122, x: 600, y: 380, zoom: 1.1 },
    { f: 140, x: 520, y: 330, zoom: 1.02 },
  ],
  sfx: [
    { f: 2, kind: "pop" },
    { f: GRAB, kind: "click" },
    { f: 36, kind: "swish" },
    { f: DROP, kind: "click" },
    { f: DROP, kind: "pop" },
    { f: MERGED, kind: "ding" },
    { f: AUTO, kind: "swish" },
    { f: AUTO_END, kind: "pop" },
    { f: GANTT, kind: "click" },
    { f: GANTT, kind: "cut" },
    { f: 120, kind: "pop" },
    { f: 135, kind: "pop" },
    { f: 135, kind: "ding" },
    { f: RM, kind: "click" },
    { f: RM, kind: "cut" },
    { f: 190, kind: "pop" },
    { f: HOVER_AT, kind: "pop" },
  ],
};

export const long: LongFeature[] = [
  {
    title: "Glisse, c'est à jour.",
    text: "Tu attrapes un ticket, tu le déposes dans la bonne colonne : toute l'équipe voit où en est le sprint, d'un coup d'œil.",
    points: ["Kanban ou liste", "Sprints et avancement", "Importer de Linear"],
    from: 0,
    to: 64,
    focus: { x: 380, y: 270, zoom: 1.2 },
  },
  {
    title: "Ton code fait le suivi.",
    text: "Relie GitHub à tes tickets : quand la PR de Camille est fusionnée, son ticket passe tout seul dans Terminé.",
    points: ["Pull requests sur les tickets", "Statut mis à jour seul", "Plus de tickets oubliés"],
    from: 58,
    to: 104,
    focus: { x: 640, y: 260, zoom: 1.12 },
  },
  {
    title: "Vois venir la livraison.",
    text: "Un clic et le sprint devient un Gantt : les dépendances, la ligne du jour et le jalon de lancement sous les yeux.",
    points: ["Gantt en un clic", "Dépendances visibles", "Jalons et échéances"],
    from: 102,
    to: 142,
    focus: { x: 560, y: 380, zoom: 1.06 },
  },
  {
    title: "Tous tes projets, une vue.",
    text: "La roadmap réunit Studio Lumen, Atelier Nord et le reste : chaque epic, son avancement et ce qui arrive ensuite.",
    points: ["Roadmap multi-projets", "Epics et avancement", "Projets, epics et tickets"],
    from: 150,
    to: 225,
    focus: { x: 540, y: 360, zoom: 1.05 },
  },
];
