import React from "react";
import {
  CalendarDays,
  ChartColumn,
  Check,
  CircleCheck,
  Clock,
  Eye,
  Heart,
  LoaderCircle,
  Palette,
  Play,
  Send,
  Settings,
  Sparkles,
  SquarePen,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { mix, pop, prog, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Metricove ───────────────────────────── */

const ORANGE = app("metricove").color;
const PLUM = "#5b1a4a";
const CREAM = "#f6e7d4";

const NETS = [
  { n: "Instagram", c: "#e4405f" },
  { n: "LinkedIn", c: "#2f80d8" },
  { n: "YouTube", c: "#ff3b30" },
  { n: "X", c: "#e9e6df" },
  { n: "Facebook", c: "#4a7cf0" },
];

/* Beats of the story, in mock time. */
const T = {
  generate: 15,
  reveal: 30,
  all: 45,
  short: 60,
  schedule: 75,
  land: 90,
  publish: 105,
  stats: 120,
};

/* Layout (mock pixels). */
const RAIL = 64;
const COMP_X = RAIL;
const COMP_W = 430;
const PAD = 22;
const CX = COMP_X + PAD; // composer content left
const CW = COMP_W - PAD * 2; // composer content width (386)
const CAL_X = COMP_X + COMP_W;
const CAL_PAD = 20;
const GRID_X = CAL_X + CAL_PAD;
const GRID_W = 1040 - GRID_X - CAL_PAD;
const COL_GAP = 6;
const COL_W = (GRID_W - COL_GAP * 6) / 7;
const GRID_TOP = 108;
const HOUR = 40; // px per hour, from 8 h
const hourY = (h: number) => GRID_TOP + (h - 8) * HOUR;
const colX = (d: number) => GRID_X + d * (COL_W + COL_GAP);

const PREVIEW = { x: CX, y: 166, w: CW, h: 176 };
const SLOT = { x: colX(3) + 4, y: hourY(9) + 2, w: COL_W - 8, h: 92 };

/* Exported positions for the cursor. */
const BTN_GEN = { x: CX + CW - 92, y: 126 };
const BTN_ALL = { x: CX + CW - 22, y: 442 };
const BTN_SHORT = { x: CX + 290, y: 559 };
const BTN_SCHED = { x: CX + CW / 2 + 40, y: 619 };

const elastic = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1);
const bounce = (f: number, at: number, dur = 14) => (f < at ? 0 : elastic(Math.min(1, (f - at) / dur)));
const press = (f: number, at: number) => (f >= at - 2 && f < at + 4 ? 0.94 : 1);

/** The brand-kit visual the AI produces. */
const Visual: React.FC<{ f: number; small?: boolean }> = ({ f, small }) => {
  const short = f >= T.short;
  const sp = bounce(f, T.short, 16);
  const k = small ? 0.22 : 1;
  const drift = Math.sin(f / 20) * 6;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `radial-gradient(110% 120% at ${18 + drift}% 0%, ${ORANGE}, ${PLUM} 62%, #1b0d18)`,
      }}
    >
      {/* soft brand shapes */}
      <div style={{ position: "absolute", right: -40 * k * 4, top: -30 * k * 4, width: 220 * (small ? 0.4 : 1), height: 220 * (small ? 0.4 : 1), borderRadius: "50%", border: `2px solid ${alpha(CREAM, 0.35)}`, transform: `rotate(${f}deg)` }} />
      <div style={{ position: "absolute", right: 40 * (small ? 0.3 : 1), bottom: -60 * (small ? 0.3 : 1), width: 160 * (small ? 0.35 : 1), height: 160 * (small ? 0.35 : 1), borderRadius: "50%", background: alpha(CREAM, 0.12) }} />
      {!small && (
        <>
          <div style={{ position: "absolute", left: 20, top: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: CREAM, fontWeight: 600, letterSpacing: "0.04em" }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", color: PLUM, fontSize: 12, fontWeight: 800 }}>L</span>
            Studio Lumen
          </div>
          <div style={{ position: "absolute", left: 20, bottom: 18, fontFamily: SERIF, fontSize: 44, lineHeight: 0.92, color: "#fff" }}>
            Notre studio,
            <br />
            <i style={{ color: CREAM }}>épisode 14</i>
          </div>
          {!short && (
            <div style={{ position: "absolute", right: 16, bottom: 16, display: "flex", gap: 5 }}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ width: i === 0 ? 18 : 7, height: 7, borderRadius: 4, background: i === 0 ? "#fff" : alpha("#fff", 0.45) }} />
              ))}
            </div>
          )}
          {short && (
            <>
              <div
                style={{
                  position: "absolute",
                  right: 26,
                  top: "50%",
                  width: 58,
                  height: 58,
                  marginTop: -29,
                  borderRadius: 29,
                  background: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${sp})`,
                  boxShadow: `0 0 0 ${mix(prog(f, T.short, 20), 0, 22)}px ${alpha("#fff", 0.25 * (1 - prog(f, T.short, 20)))}`,
                }}
              >
                <Play size={24} color={PLUM} fill={PLUM} style={{ marginLeft: 3 }} />
              </div>
              <div style={{ position: "absolute", right: 16, top: 14, fontSize: 14, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(0,0,0,0.45)", color: "#fff", transform: `scale(${sp})`, transformOrigin: "right center" }}>
                Short · 0:15
              </div>
              <div style={{ position: "absolute", left: 0, bottom: 0, height: 4, width: `${Math.min(100, ((f - T.short) / 60) * 100)}%`, background: CREAM }} />
            </>
          )}
        </>
      )}
      {small && (
        <div style={{ position: "absolute", left: "50%", top: "42%", width: 28, height: 28, marginLeft: -14, marginTop: -14, borderRadius: 14, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={13} color={PLUM} fill={PLUM} style={{ marginLeft: 2 }} />
        </div>
      )}
    </div>
  );
};

/** A card on the editorial calendar. */
const CalCard: React.FC<{ day: number; h: number; dur?: number; col: string; label: string; at: number; f: number }> = ({ day, h, dur = 1, col, label, at, f }) => (
  <div
    style={{
      position: "absolute",
      left: colX(day) + 4,
      top: hourY(h) + 2,
      width: COL_W - 8,
      height: dur * HOUR - 6,
      borderRadius: 8,
      background: alpha(col, 0.16),
      borderLeft: `3px solid ${col}`,
      padding: "4px 7px",
      fontSize: 14,
      color: C.ink2,
      overflow: "hidden",
      ...pop(f, at, 12),
    }}
  >
    {label}
  </div>
);

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  const c = ORANGE;
  const prompt = "Teaser de l'épisode 14, ton chaleureux";
  const caption = "Épisode 14 : on t'ouvre les portes de notre studio à Sion. Dispo jeudi.";

  const generating = f >= T.generate && f < T.reveal;
  const revealed = f >= T.reveal;
  const reveal = prog(f, T.reveal, 14, EASE);
  const netOn = (i: number) => f >= T.all + i * 2;
  const netCount = NETS.filter((_, i) => netOn(i)).length;
  const scheduled = f >= T.schedule;
  const fly = prog(f, T.schedule, T.land - T.schedule, EASE_IN_OUT);
  const landed = f >= T.land;
  const published = f >= T.publish;

  // Fast-forward clock from Wednesday evening to Thursday 9:00 between the landing and the publish.
  const ff = prog(f, T.land + 2, T.publish - T.land - 2, EASE_IN_OUT);
  const minutes = Math.round(mix(ff, 21 * 60 + 44, 33 * 60));
  const clock = `${minutes >= 24 * 60 ? "jeu." : "mer."} ${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  // Stats counters.
  const sp = prog(f, T.publish + 4, 36, (t) => 1 - Math.pow(1 - t, 3));
  const views = Math.round(2418 * sp);
  const likes = Math.round(312 * prog(f, T.publish + 8, 32, (t) => 1 - Math.pow(1 - t, 3)));
  const fmt = (n: number) => n.toLocaleString("fr-CH").replace(/[’']/g, " ");

  // AI border spinning while generating.
  const glow = prog(f, T.generate, 4) * (1 - prog(f, T.reveal, 10));

  const land = bounce(f, T.land, 18);

  const railIcon = (Icon: typeof SquarePen, active?: boolean, key?: number) => (
    <div key={key} style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: active ? alpha(c, 0.18) : "transparent", boxShadow: active ? `inset 0 0 0 1px ${alpha(c, 0.3)}` : "none" }}>
      <Icon size={19} color={active ? c : C.ink3} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: 1040, height: 660, overflow: "hidden" }}>
      {/* Rail */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: RAIL, borderRight: `1px solid ${C.line}`, background: "rgba(255,255,255,0.015)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(140deg, ${c}, ${PLUM})`, marginBottom: 10 }} />
        {railIcon(SquarePen, !landed, 1)}
        {railIcon(CalendarDays, landed, 2)}
        {railIcon(ChartColumn, false, 3)}
        {railIcon(Palette, false, 4)}
        <div style={{ marginTop: "auto", marginBottom: 16 }}>{railIcon(Settings)}</div>
      </div>

      {/* ───────── Composer ───────── */}
      <div style={{ position: "absolute", left: COMP_X, top: 0, width: COMP_W, bottom: 0, borderRight: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", left: PAD, right: PAD, top: 20, height: 26, display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>Nouveau post</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink3 }}>
            Fiche de marque
            {[c, PLUM, CREAM].map((s, i) => {
              const ping = prog(f, T.reveal + i * 2, 14);
              return (
                <span
                  key={s}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: s,
                    border: `1px solid ${C.lineStrong}`,
                    marginLeft: i ? -6 : 0,
                    boxShadow: revealed ? `0 0 0 ${mix(ping, 0, 10)}px ${alpha(c, 0.5 * (1 - ping))}` : "none",
                    transform: `scale(${f >= T.reveal ? mix(bounce(f, T.reveal + i * 2, 14), 1.4, 1) : 1})`,
                  }}
                />
              );
            })}
          </span>
        </div>

        {/* Prompt box with the AI button */}
        <div
          style={{
            position: "absolute",
            left: PAD,
            top: 58,
            width: CW,
            height: 92,
            borderRadius: 14,
            border: `1px solid ${f < T.generate ? alpha(c, 0.5) : C.lineStrong}`,
            background: C.surface2,
            padding: "12px 14px",
            fontSize: 15,
            color: C.ink,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={15} color={c} />
            <span>
              {typed(prompt, f, -2, 3.2)}
              {f < T.generate && <span style={{ display: "inline-block", width: 2, height: 17, background: c, marginLeft: 2, verticalAlign: -3, opacity: Math.floor(f / 6) % 2 ? 0.2 : 1 }} />}
            </span>
          </div>
          <div style={{ position: "absolute", left: 14, bottom: 16, fontSize: 14, color: C.ink3 }}>Ton : chaleureux · FR</div>
          <div
            style={{
              position: "absolute",
              right: 10,
              bottom: 10,
              height: 34,
              padding: "0 14px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: generating ? alpha(c, 0.35) : revealed ? alpha(c, 0.18) : `linear-gradient(120deg, ${c}, #ff8f5c)`,
              boxShadow: f < T.generate ? `0 0 ${10 + Math.sin(f / 3) * 6}px ${alpha(c, 0.6)}` : "none",
              transform: `scale(${press(f, T.generate)})`,
            }}
          >
            {generating ? <LoaderCircle size={15} style={{ transform: `rotate(${f * 24}deg)` }} /> : revealed ? <Check size={15} color={c} /> : <Wand2 size={15} />}
            <span style={{ color: revealed ? c : "#fff" }}>{generating ? "Génération…" : revealed ? "Généré" : "Générer avec l'IA"}</span>
          </div>
        </div>

        {/* Preview: skeleton, then the visual */}
        <div style={{ position: "absolute", left: PAD - 2, top: PREVIEW.y - 2, width: CW + 4, height: PREVIEW.h + 4, borderRadius: 18, opacity: glow, background: `conic-gradient(from ${f * 14}deg, ${c}, #ffd2a8, ${PLUM}, ${c})`, filter: `blur(${1 + glow}px)` }} />
        <div style={{ position: "absolute", left: PAD, top: PREVIEW.y, width: CW, height: PREVIEW.h, borderRadius: 16, overflow: "hidden", background: C.surface2, border: `1px solid ${C.line}` }}>
          {/* skeleton */}
          {!revealed && (
            <>
              {generating && (
                <>
                  <div style={{ position: "absolute", left: 20, bottom: 58, width: 210, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.07)" }} />
                  <div style={{ position: "absolute", left: 20, bottom: 26, width: 150, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.07)" }} />
                  <div style={{ position: "absolute", left: 20, top: 18, width: 110, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                </>
              )}
              {generating && (
                <div style={{ position: "absolute", top: 0, bottom: 0, width: 160, left: interpolate((f - T.generate) % 10, [0, 10], [-180, CW + 20]), background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", transform: "skewX(-18deg)" }} />
              )}
              {!generating && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: C.ink3 }}>
                  <Sparkles size={15} /> Ton visuel apparaîtra ici
                </div>
              )}
            </>
          )}
          {revealed && (
            <div style={{ position: "absolute", inset: 0, clipPath: `circle(${mix(reveal, 0, 120)}% at 50% 50%)`, transform: `scale(${mix(reveal, 1.12, 1)})`, opacity: scheduled ? mix(fly, 1, 0.14) : 1, filter: scheduled ? `blur(${mix(fly, 0, 8)}px)` : "none" }}>
              <Visual f={f} />
            </div>
          )}
          {scheduled && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...pop(f, T.schedule + 8, 10) }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, padding: "8px 14px", borderRadius: 99, background: alpha(c, 0.16), border: `1px solid ${alpha(c, 0.5)}`, color: "#fff" }}>
                <CalendarDays size={16} /> Dans le calendrier
              </span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div style={{ position: "absolute", left: PAD, top: 352, width: CW, fontSize: 15, lineHeight: 1.4, color: C.ink, minHeight: 42 }}>
          {revealed ? (
            <>
              {typed(caption, f, T.reveal, 4.2)}
              {f < T.reveal + 18 && <span style={{ display: "inline-block", width: 2, height: 17, background: c, marginLeft: 1, verticalAlign: -3 }} />}
            </>
          ) : (
            <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ width: "92%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ width: "64%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
            </span>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {["#podcast", "#studio", "#sion"].map((h, i) => (
              <span key={h} style={{ color: c, fontSize: 14, ...pop(f, T.reveal + 14 + i * 2, 8) }}>
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Networks */}
        <div style={{ position: "absolute", left: PAD, top: 432, width: CW, display: "flex", alignItems: "center", fontSize: 14, color: C.ink3 }}>
          <span style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Réseaux</span>
          <span style={{ marginLeft: 8, fontFamily: MONO, color: netCount ? c : C.ink3 }}>{netCount}/5</span>
          <span
            style={{
              marginLeft: "auto",
              padding: "2px 10px",
              borderRadius: 7,
              color: f >= T.all ? c : C.ink2,
              border: `1px solid ${f >= T.all ? alpha(c, 0.5) : C.lineStrong}`,
              background: f >= T.all ? alpha(c, 0.12) : "transparent",
              transform: `scale(${press(f, T.all)})`,
            }}
          >
            Tous
          </span>
        </div>
        <div style={{ position: "absolute", left: PAD, top: 462, width: CW, display: "flex", flexWrap: "wrap", gap: 7 }}>
          {NETS.map((n, i) => {
            const on = netOn(i);
            const b = on ? mix(bounce(f, T.all + i * 2, 12), 1.25, 1) : 1;
            return (
              <span
                key={n.n}
                style={{
                  fontSize: 14,
                  padding: "4px 11px",
                  borderRadius: 99,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  border: `1px solid ${on ? alpha(n.c, 0.65) : C.lineStrong}`,
                  background: on ? alpha(n.c, 0.18) : "transparent",
                  color: on ? C.ink : C.ink3,
                  transform: `scale(${b})`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 4, background: on ? n.c : C.ink3, boxShadow: on ? `0 0 8px ${n.c}` : "none" }} /> {n.n}
                {on && <Check size={13} color={C.ink2} />}
              </span>
            );
          })}
        </div>

        {/* Format */}
        <div style={{ position: "absolute", left: PAD, top: 546, width: CW, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span style={{ color: C.ink3, letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 4 }}>Format</span>
          {[
            { t: "Post", on: f < T.short },
            { t: "Carrousel", on: false },
            { t: "Vidéo Short", on: f >= T.short },
          ].map((o) => (
            <span
              key={o.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 11px",
                borderRadius: 8,
                color: o.on ? "#fff" : C.ink2,
                background: o.on ? c : "rgba(255,255,255,0.04)",
                border: `1px solid ${o.on ? c : C.line}`,
                transform: `scale(${o.t === "Vidéo Short" ? press(f, T.short) * (f >= T.short ? mix(bounce(f, T.short, 12), 1.15, 1) : 1) : 1})`,
              }}
            >
              {o.t === "Vidéo Short" && <Play size={12} fill={o.on ? "#fff" : "none"} />}
              {o.t}
            </span>
          ))}
        </div>

        {/* Schedule button */}
        <div
          style={{
            position: "absolute",
            left: PAD,
            top: 596,
            width: CW,
            height: 46,
            borderRadius: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            fontSize: 16,
            fontWeight: 600,
            color: scheduled ? c : "#fff",
            background: scheduled ? alpha(c, 0.14) : `linear-gradient(120deg, ${c}, #ff8f5c)`,
            border: `1px solid ${scheduled ? alpha(c, 0.5) : "transparent"}`,
            boxShadow: !scheduled && f > T.short ? `0 10px 30px -8px ${alpha(c, 0.8)}` : "none",
            transform: `scale(${press(f, T.schedule)})`,
          }}
        >
          {scheduled ? <CircleCheck size={18} /> : <Send size={17} />}
          {scheduled ? "Programmé jeudi 9 h" : "Programmer jeudi 9 h"}
        </div>
      </div>

      {/* ───────── Editorial calendar ───────── */}
      <div style={{ position: "absolute", left: CAL_X, top: 0, right: 0, bottom: 0 }}>
        <div style={{ position: "absolute", left: CAL_PAD, right: CAL_PAD, top: 14, display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: SERIF, fontSize: 30, color: C.ink }}>Calendrier éditorial</span>
          <span
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: MONO,
              fontSize: 14,
              padding: "4px 10px",
              borderRadius: 8,
              color: ff > 0 && ff < 1 ? c : C.ink2,
              background: ff > 0 ? alpha(c, 0.12) : "rgba(255,255,255,0.04)",
              border: `1px solid ${ff > 0 ? alpha(c, 0.4) : C.line}`,
            }}
          >
            <Clock size={14} /> {clock}
          </span>
        </div>
        <div style={{ position: "absolute", left: CAL_PAD, top: 52, fontSize: 14, color: C.ink3 }}>Semaine du 16 novembre · 5 comptes</div>
      </div>
      {/* hour lines */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: GRID_X, width: GRID_W, top: hourY(8 + i), height: 1, background: C.line }} />
      ))}
      {["Lun 16", "Mar 17", "Mer 18", "Jeu 19", "Ven 20", "Sam 21", "Dim 22"].map((d, i) => (
        <React.Fragment key={d}>
          <div style={{ position: "absolute", left: colX(i), width: COL_W, top: GRID_TOP - 26, textAlign: "center", fontSize: 14, color: i === 3 ? c : C.ink3, fontWeight: i === 3 ? 600 : 400 }}>{d}</div>
          <div
            style={{
              position: "absolute",
              left: colX(i),
              width: COL_W,
              top: GRID_TOP,
              bottom: 14,
              borderRadius: 10,
              background: i === 3 && f > T.schedule ? alpha(c, 0.05 + 0.06 * fly) : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 3 && f > T.schedule ? alpha(c, 0.15 + 0.3 * fly) : C.line}`,
            }}
          />
        </React.Fragment>
      ))}
      <CalCard day={0} h={10} col="#e4405f" label="10 h" at={2} f={f} />
      <CalCard day={1} h={12} col="#2f80d8" label="12 h" at={4} f={f} />
      <CalCard day={1} h={17} dur={1.5} col="#ff3b30" label="17 h" at={6} f={f} />
      <CalCard day={2} h={11} col="#e9e6df" label="11 h" at={8} f={f} />
      <CalCard day={4} h={9} dur={1.5} col="#e4405f" label="9 h" at={10} f={f} />
      <CalCard day={4} h={13} col="#4a7cf0" label="13 h" at={12} f={f} />
      <CalCard day={5} h={11} col="#ff3b30" label="11 h" at={14} f={f} />
      <CalCard day={6} h={18} col="#2f80d8" label="18 h" at={16} f={f} />
      <CalCard day={3} h={12} col="#2f80d8" label="12 h" at={10} f={f} />

      {/* Fast-forward "now" line sweeping to Thursday 9:00 */}
      {ff > 0 && (
        <div
          style={{
            position: "absolute",
            left: colX(mix(ff, 2, 3)) - 4,
            width: COL_W + 8,
            top: mix(ff, 620, hourY(9)),
            height: 2,
            background: c,
            boxShadow: `0 0 12px ${c}`,
            opacity: 1 - prog(f, T.publish + 6, 8),
          }}
        >
          <span style={{ position: "absolute", left: -5, top: -4, width: 10, height: 10, borderRadius: 5, background: c }} />
        </div>
      )}

      {/* The landed post in Thursday 9 h */}
      {landed && (
        <div
          style={{
            position: "absolute",
            left: SLOT.x,
            top: SLOT.y,
            width: SLOT.w,
            height: SLOT.h,
            borderRadius: 10,
            overflow: "hidden",
            transform: `scale(${mix(land, 1.3, 1)})`,
            boxShadow: `0 0 ${published ? 30 : 18}px -4px ${alpha(published ? "#5fd3a8" : c, 0.9)}, inset 0 0 0 2px ${published ? "#5fd3a8" : c}`,
            zIndex: 5,
          }}
        >
          <Visual f={f} small />
          <div style={{ position: "absolute", left: 5, bottom: 5, display: "flex", gap: 3 }}>
            {NETS.map((n) => (
              <span key={n.n} style={{ width: 7, height: 7, borderRadius: 4, background: n.c }} />
            ))}
          </div>
          {published && (
            <div style={{ position: "absolute", right: 5, top: 5, width: 22, height: 22, borderRadius: 11, background: "#5fd3a8", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(f, T.publish, 14)})` }}>
              <Check size={14} color={C.accentInk} strokeWidth={3} />
            </div>
          )}
        </div>
      )}
      {/* Landing shockwave */}
      {f >= T.land && f < T.land + 18 && (
        <div
          style={{
            position: "absolute",
            left: SLOT.x + SLOT.w / 2 - 60,
            top: SLOT.y + SLOT.h / 2 - 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            border: `3px solid ${c}`,
            opacity: 1 - prog(f, T.land, 18),
            transform: `scale(${mix(prog(f, T.land, 18), 0.3, 1.8)})`,
            zIndex: 4,
          }}
        />
      )}

      {/* The flying post, with a trail */}
      {scheduled && !landed &&
        [0.16, 0.08, 0].map((lag, k) => {
          const p = Math.max(0, fly - lag);
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: mix(p, PREVIEW.x, SLOT.x),
                top: mix(p, PREVIEW.y, SLOT.y) - Math.sin(p * Math.PI) * 90,
                width: mix(p, PREVIEW.w, SLOT.w),
                height: mix(p, PREVIEW.h, SLOT.h),
                borderRadius: mix(p, 16, 10),
                overflow: "hidden",
                opacity: k === 2 ? 1 : 0.25 + k * 0.15,
                transform: `rotate(${Math.sin(p * Math.PI) * -6}deg)`,
                boxShadow: k === 2 ? `0 30px 60px -10px rgba(0,0,0,0.8), 0 0 40px -6px ${alpha(c, 0.8)}` : "none",
                zIndex: 10 + k,
              }}
            >
              <Visual f={f} small={p > 0.55} />
            </div>
          );
        })}

      {/* Published notification with live stats */}
      {published && (
        <div
          style={{
            position: "absolute",
            left: GRID_X + 150,
            top: 262,
            width: GRID_W - 170,
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(34,34,32,0.96)",
            border: `1px solid ${C.lineStrong}`,
            boxShadow: `0 24px 50px -12px rgba(0,0,0,0.9), 0 0 30px -10px ${alpha("#5fd3a8", 0.6)}`,
            zIndex: 20,
            transform: `translateY(${mix(prog(f, T.publish, 12, EASE), 60, 0)}px) scale(${mix(bounce(f, T.publish, 16), 0.85, 1)})`,
            opacity: prog(f, T.publish, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 15, background: alpha("#5fd3a8", 0.2), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircleCheck size={17} color="#5fd3a8" />
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Publié sur 5 réseaux</div>
              <div style={{ fontSize: 14, color: C.ink3 }}>jeu. 9:00 · automatiquement</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 14, color: C.ink3, display: "flex", alignItems: "center", gap: 5 }}>
                <Eye size={14} /> Vues
              </div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(views)}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: C.ink3, display: "flex", alignItems: "center", gap: 5 }}>
                <Heart size={14} /> J'aime
              </div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(likes)}</div>
            </div>
            <svg width={90} height={40} viewBox="0 0 90 40" style={{ marginLeft: "auto" }}>
              <polyline
                points="0,36 12,33 24,34 36,26 48,24 60,15 72,12 90,3"
                fill="none"
                stroke="#5fd3a8"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={140}
                strokeDashoffset={140 * (1 - sp)}
              />
            </svg>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#5fd3a8", ...pop(f, T.stats, 10) }}>
            <TrendingUp size={14} /> +38 % vs ta moyenne
          </div>
        </div>
      )}
    </div>
  );
};

export const ad: AppAd = {
  id: "metricove",
  title: "Metricove · Studio Lumen",
  hook: "Poste partout, sans y penser.",
  Mock,
  cursor: [
    { f: 2, x: 620, y: 360 },
    { f: 12, x: BTN_GEN.x, y: BTN_GEN.y },
    { f: T.generate, x: BTN_GEN.x, y: BTN_GEN.y, click: true },
    { f: 32, x: 380, y: 300 },
    { f: 42, x: BTN_ALL.x, y: BTN_ALL.y },
    { f: T.all, x: BTN_ALL.x, y: BTN_ALL.y, click: true },
    { f: 57, x: BTN_SHORT.x, y: BTN_SHORT.y },
    { f: T.short, x: BTN_SHORT.x, y: BTN_SHORT.y, click: true },
    { f: 72, x: BTN_SCHED.x, y: BTN_SCHED.y },
    { f: T.schedule, x: BTN_SCHED.x, y: BTN_SCHED.y, click: true },
    { f: 92, x: SLOT.x + SLOT.w + 30, y: SLOT.y + 40 },
    { f: 118, x: SLOT.x + SLOT.w + 40, y: 400 },
    { f: 140, x: SLOT.x + SLOT.w + 70, y: 412 },
  ],
  chips: [
    { f: T.reveal, text: "L'IA suit ta charte", x: 610, y: 246, icon: Palette, until: 70 },
    { f: T.all, text: "5 réseaux, 1 clic", x: 600, y: 470, icon: Sparkles, until: 80 },
    { f: T.publish, text: "Publié tout seul", x: 830, y: 470, icon: Send },
  ],
  focus: [
    { f: 0, x: 300, y: 200, zoom: 1 },
    { f: 12, x: 280, y: 180, zoom: 1.22 },
    { f: 32, x: 280, y: 250, zoom: 1.32 },
    { f: 46, x: 280, y: 330, zoom: 1.28 },
    { f: 64, x: 280, y: 370, zoom: 1.2 },
    { f: 77, x: 280, y: 370, zoom: 1.2 },
    { f: 86, x: 450, y: 130, zoom: 1.12 },
    { f: 94, x: 760, y: 170, zoom: 1.24 },
    { f: 110, x: 840, y: 180, zoom: 1.26 },
    { f: 128, x: 820, y: 180, zoom: 1.22 },
    { f: 145, x: 520, y: 40, zoom: 1 },
  ],
  sfx: [
    { f: 0, kind: "type" },
    { f: T.generate, kind: "click" },
    { f: T.generate + 1, kind: "riser" },
    { f: T.reveal, kind: "pop" },
    { f: T.reveal + 2, kind: "type" },
    { f: T.all, kind: "click" },
    { f: T.all + 2, kind: "pop" },
    { f: T.all + 6, kind: "pop" },
    { f: T.short, kind: "click" },
    { f: T.short + 1, kind: "pop" },
    { f: T.schedule, kind: "click" },
    { f: T.schedule + 1, kind: "swish" },
    { f: T.land, kind: "pop" },
    { f: T.land + 1, kind: "cut" },
    { f: T.publish, kind: "ding" },
    { f: T.stats, kind: "pop" },
  ],
};
