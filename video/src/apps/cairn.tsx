import React from "react";
import { ArrowUp, Check, Cloud, Copy, CreditCard, Eye, EyeOff, FileText, Hash, KeyRound, Lock, LockOpen, Search, ShieldCheck, Smartphone, Sparkles, Terminal, Wifi } from "lucide-react";
import { alpha, app, C, EASE, MONO, SERIF } from "../theme";
import { mix, pop, prog, typed } from "../kit";
import type { AppAd } from "../ad";
import type { LongFeature } from "../long";

/* ───────────────────────────── Cairn ───────────────────────────── */
/*
 * Mock time, on the 120 BPM grid (1 beat = 15 frames):
 *   0   the title is typed in Markdown
 *   15  the checklist lands
 *   30  tick 1            45  tick 2
 *   60  click "Demande à tes notes", the AI panel slides in, the question is typed
 *   75  send, the AI reads the notes, the answer streams, sources at 90
 *   105 click the vault in the sidebar, Face ID scans
 *   120 unlocked, the secrets cascade in
 *   135 reveal the SSH key
 */

const T = {
  tick1: 30,
  tick2: 45,
  ask: 60,
  send: 75,
  sources: 90,
  vault: 105,
  unlock: 120,
  reveal: 135,
  // Long video only (never reached by the 6 s ad, which stops at mock frame 150).
  copy: 168,
  sync: 186,
};

const SIDE_W = 220;
const TOP_H = 56;

/** Ease-out-back for things that land with a bounce. */
const back = (t: number) => {
  const s = 2.2;
  return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};
const bounce = (f: number, at: number, dur = 12) => prog(f, at, dur, back);

/** Deterministic scramble that resolves left to right. */
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789+/";
const scramble = (text: string, f: number, at: number, dur: number) => {
  const p = Math.max(0, Math.min(1, (f - at) / dur));
  const done = Math.floor(p * text.length);
  return text
    .split("")
    .map((ch, i) => (i < done || ch === " " ? ch : GLYPHS[(i * 7 + Math.floor(f) * 13 + i * i) % GLYPHS.length]))
    .join("");
};

const SideLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3, padding: "16px 12px 6px" }}>{children}</div>
);

const Row: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; glow?: number; tag?: React.ReactNode; c: string }> = ({ icon, label, active, glow = 0, tag, c }) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 38,
      padding: "0 12px",
      borderRadius: 10,
      fontSize: 16,
      color: active || glow > 0.05 ? C.ink : C.ink2,
      background: active ? alpha(c, 0.18) : glow > 0 ? alpha(c, 0.12 * glow) : "transparent",
      boxShadow: active ? `inset 0 0 0 1px ${alpha(c, 0.3)}` : glow > 0 ? `inset 0 0 0 1px ${alpha(c, 0.4 * glow)}` : "none",
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    {tag}
  </div>
);

/* ─────────────── the Face ID glyph ─────────────── */

const FaceId: React.FC<{ f: number; c: string; size: number }> = ({ f, c, size }) => {
  const scan = f >= T.vault && f < T.unlock;
  const ok = prog(f, T.unlock, 10, EASE);
  const scanY = 14 + ((Math.sin((f - T.vault) / 3.2 - Math.PI / 2) + 1) / 2) * 72;
  const corner = (d: string) => <path d={d} fill="none" stroke={ok > 0 ? c : C.ink} strokeWidth={5} strokeLinecap="round" />;
  const pulse = scan ? 1 + Math.sin((f - T.vault) / 2) * 0.03 : 1 + (1 - ok) * 0;
  const checkLen = 60;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `scale(${pulse * mix(bounce(f, T.unlock, 14), 1, 1) })`, overflow: "visible" }}>
      {corner("M8 30 V16 Q8 8 16 8 H30")}
      {corner("M70 8 H84 Q92 8 92 16 V30")}
      {corner("M92 70 V84 Q92 92 84 92 H70")}
      {corner("M30 92 H16 Q8 92 8 84 V70")}
      <g opacity={1 - ok} stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
        <path d="M34 36 V44" />
        <path d="M66 36 V44" />
        <path d="M51 36 V56 Q51 60 46 60" />
        <path d="M36 70 Q50 80 64 70" />
      </g>
      {scan && (
        <>
          <rect x={10} y={scanY - 1.5} width={80} height={3} rx={1.5} fill={c} />
          <rect x={10} y={scanY - 14} width={80} height={14} fill={`url(#cairnScan)`} />
          <defs>
            <linearGradient id="cairnScan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity={0} />
              <stop offset="1" stopColor={c} stopOpacity={0.45} />
            </linearGradient>
          </defs>
        </>
      )}
      <path
        d="M28 52 L44 67 L73 35"
        fill="none"
        stroke={c}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={checkLen}
        strokeDashoffset={checkLen * (1 - prog(f, T.unlock + 1, 9, EASE))}
      />
    </svg>
  );
};

/* ─────────────── the note ─────────────── */

const CHECKS = ["Lancer la série vidéo en janvier", "Un épisode par semaine, 20 minutes", "Valider le générique avec Marc"];
const CHECK_Y = (i: number) => 232 + i * 44; // centre of each checklist row, in mock pixels
const BOX_X = SIDE_W + 48 + 13; // centre of the checkboxes

const Note: React.FC<{ f: number; c: string }> = ({ f, c }) => {
  const title = "Brief client";
  const titleTyped = typed(title, f, 0, 1.3);
  const ticks = [T.tick1, T.tick2];
  const done = ticks.filter((t) => f >= t).length;
  return (
    <div style={{ position: "absolute", left: 0, top: TOP_H, right: 0, bottom: 0, padding: "22px 48px 0" }}>
      <div style={{ fontSize: 14, color: C.ink3, display: "flex", alignItems: "center", gap: 10 }}>
        <span>Atelier Nord</span>
        <span style={{ width: 4, height: 4, borderRadius: 2, background: C.ink3 }} />
        <span style={{ color: f < 50 ? c : C.ink3 }}>{f < 50 ? "modification en cours" : "enregistré à l'instant"}</span>
      </div>
      {/* # title, Markdown token visible while it is being typed. */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 10, height: 56 }}>
        <span style={{ fontFamily: MONO, fontSize: 22, color: alpha(c, 0.9), opacity: 1 - prog(f, 14, 8) * 0.6 }}>#</span>
        <span style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1 }}>
          {titleTyped}
          {f < 16 && <span style={{ display: "inline-block", width: 3, height: 44, background: c, marginLeft: 3, verticalAlign: -6, opacity: Math.floor(f / 5) % 2 ? 0.3 : 1 }} />}
        </span>
      </div>
      {/* ## Objectifs */}
      <div style={{ ...pop(f, 15, 10), display: "flex", alignItems: "center", gap: 12, marginTop: 22, height: 30 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, color: alpha(c, 0.85) }}>##</span>
        <span style={{ fontSize: 23, fontWeight: 600 }}>Objectifs</span>
        <span style={{ marginLeft: 14, fontSize: 14, fontFamily: MONO, color: done ? c : C.ink3, padding: "2px 10px", borderRadius: 99, background: done ? alpha(c, 0.16) : "rgba(255,255,255,0.05)" }}>
          {done}/3
        </span>
      </div>
      {/* Checklist rows are absolutely placed so the cursor can hit them. */}
      {CHECKS.map((t, i) => {
        const at = ticks[i];
        const p = at !== undefined ? prog(f, at, 8, EASE) : 0;
        const b = at !== undefined ? bounce(f, at, 12) : 0;
        const burst = at !== undefined ? prog(f, at, 16, EASE) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 48, top: CHECK_Y(i) - TOP_H - 17, height: 34, display: "flex", alignItems: "center", gap: 14, ...pop(f, 17 + i * 3, 10) }}>
            <span style={{ fontFamily: MONO, fontSize: 15, color: alpha(c, 0.7), position: "absolute", left: -30 }}>-</span>
            <span
              style={{
                position: "relative",
                width: 26,
                height: 26,
                borderRadius: 7,
                background: p > 0 ? c : "transparent",
                border: `2px solid ${p > 0 ? c : C.lineStrong}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${p > 0 ? mix(b, 0.6, 1) : 1})`,
                boxShadow: p > 0 ? `0 0 ${24 * (1 - burst) + 6}px ${alpha(c, 0.7)}` : "none",
              }}
            >
              {p > 0 && <Check size={17} color="#fff" strokeWidth={3.2} />}
              {burst > 0 && burst < 1 &&
                Array.from({ length: 8 }).map((_, k) => {
                  const ang = (k / 8) * Math.PI * 2;
                  const r = mix(burst, 14, 34);
                  return (
                    <span key={k} style={{ position: "absolute", left: 11 + Math.cos(ang) * r, top: 11 + Math.sin(ang) * r, width: 5, height: 5, borderRadius: 3, background: c, opacity: 1 - burst }} />
                  );
                })}
            </span>
            <span style={{ position: "relative", fontSize: 19, color: p > 0.5 ? C.ink3 : C.ink }}>
              {t}
              <span style={{ position: "absolute", left: 0, top: "52%", height: 2, width: `${p * 100}%`, background: C.ink3 }} />
            </span>
          </div>
        );
      })}
      {/* ## Accès with a link to the vault, and a code block. */}
      <div style={{ position: "absolute", left: 48, top: 368 - TOP_H, ...pop(f, 50, 12) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 17, color: alpha(c, 0.85) }}>##</span>
          <span style={{ fontSize: 23, fontWeight: 600 }}>Accès</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 18, color: C.ink2, display: "flex", alignItems: "center", gap: 8 }}>
          Wi-Fi et serveur :
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c, background: alpha(c, 0.14), border: `1px solid ${alpha(c, 0.3)}`, borderRadius: 7, padding: "2px 9px", fontSize: 16 }}>
            <Lock size={14} /> Coffre · Studio
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 460 - TOP_H,
          width: 330,
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${C.line}`,
          fontFamily: MONO,
          fontSize: 15,
          color: C.ink2,
          ...pop(f, 54, 12),
        }}
      >
        <div style={{ color: C.ink3 }}>```bash</div>
        <div>
          <span style={{ color: c }}>ssh</span> lumen@serveur-montage
        </div>
      </div>
    </div>
  );
};

/* ─────────────── the AI panel ─────────────── */

const QUESTION = "Quand sort le premier épisode ?";
const ANSWER_A = "Le premier épisode sort le 13 janvier";
const ANSWER_B = ", puis un par semaine";
/** "13 janvier [1]" stays on one line. */
const KEEP = ANSWER_A.indexOf("13 janvier");
const PANEL_X = 660;

const AskPanel: React.FC<{ f: number; c: string }> = ({ f, c }) => {
  const open = prog(f, T.ask, 12, EASE);
  const away = prog(f, T.vault, 10, EASE);
  if (f < T.ask) return null;
  const q = typed(QUESTION, f, T.ask + 2, 2.4);
  const typing = f < T.send && q.length < QUESTION.length + 1;
  const sent = f >= T.send;
  const thinking = f >= T.send && f < T.send + 6;
  const stream = Math.max(0, Math.floor((f - (T.send + 6)) * 5));
  const a = ANSWER_A.slice(0, stream);
  const b = ANSWER_B.slice(0, Math.max(0, stream - ANSWER_A.length));
  const streaming = stream > 0 && stream < ANSWER_A.length + ANSWER_B.length + 4;
  const caret = <span style={{ display: "inline-block", width: 9, height: 18, background: c, marginLeft: 2, verticalAlign: -3, borderRadius: 2 }} />;
  const sources = [
    { t: "Brief client", at: T.sources, icon: <FileText size={15} /> },
    { t: "Réunion du 12 nov.", at: T.sources + 4, icon: <FileText size={15} /> },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: PANEL_X,
        top: TOP_H,
        right: 0,
        bottom: 0,
        background: C.surface2,
        borderLeft: `1px solid ${alpha(c, 0.35)}`,
        boxShadow: `-30px 0 60px -20px rgba(0,0,0,0.8), -10px 0 80px -30px ${alpha(c, 0.5)}`,
        transform: `translateX(${mix(open, 420, 0) + away * 420}px)`,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(140deg, ${c}, #a98bf5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={17} color="#fff" />
        </span>
        Demande à tes notes
      </div>
      <div style={{ fontSize: 14, color: C.ink3, marginTop: -6 }}>Réponses tirées de tes 248 notes</div>
      {/* Question field */}
      <div
        style={{
          position: "relative",
          height: 54,
          borderRadius: 14,
          border: `1px solid ${typing ? alpha(c, 0.7) : C.lineStrong}`,
          boxShadow: typing ? `0 0 0 4px ${alpha(c, 0.15)}` : "none",
          background: "rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          padding: "0 54px 0 16px",
          fontSize: 16,
          color: sent ? C.ink3 : C.ink,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {sent ? "Pose une autre question" : q || <span style={{ color: C.ink3 }}>Pose ta question</span>}
        {typing && <span style={{ width: 2, height: 20, background: c, marginLeft: 2 }} />}
        <span
          style={{
            position: "absolute",
            right: 9,
            top: 9,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: q.length > 6 && !sent ? c : "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${f >= T.send - 1 && f < T.send + 4 ? 0.85 : 1})`,
          }}
        >
          <ArrowUp size={18} color="#fff" />
        </span>
      </div>
      {/* The conversation */}
      {sent && (
        <div style={{ ...pop(f, T.send, 8), alignSelf: "flex-end", maxWidth: 300, padding: "10px 14px", borderRadius: "14px 14px 4px 14px", background: alpha(c, 0.22), fontSize: 16 }}>{QUESTION}</div>
      )}
      {thinking && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.ink2 }}>
          <Search size={15} color={c} />
          Lecture de tes notes
          <span style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((k) => (
              <span key={k} style={{ width: 5, height: 5, borderRadius: 3, background: c, opacity: 0.3 + 0.7 * ((Math.floor(f / 2) + k) % 3 === 0 ? 1 : 0) }} />
            ))}
          </span>
        </div>
      )}
      {stream > 0 && (
        <div style={{ padding: "14px 16px", borderRadius: "14px 14px 14px 4px", background: C.surface, border: `1px solid ${C.lineStrong}`, fontSize: 17, lineHeight: 1.45, color: C.ink }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: c, marginBottom: 6 }}>
            <Sparkles size={14} /> Cairn IA
          </div>
          <span>{a.slice(0, KEEP)}</span>
          <span style={{ whiteSpace: "nowrap" }}>
            {a.slice(KEEP)}
            {stream >= ANSWER_A.length && <Cite n={1} c={c} f={f} at={T.send + 6 + ANSWER_A.length / 5} />}
          </span>
          <span>{b}</span>
          {stream >= ANSWER_A.length + ANSWER_B.length && (
            <>
              <Cite n={2} c={c} f={f} at={T.send + 6 + (ANSWER_A.length + ANSWER_B.length) / 5} />.
            </>
          )}
          {streaming && caret}
        </div>
      )}
      {f >= T.sources && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sources</div>
          {sources.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 10,
                fontSize: 15,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${alpha(c, 0.3)}`,
                opacity: Math.min(1, bounce(f, s.at, 10) * 2),
                transform: `translateX(${mix(prog(f, s.at, 10, EASE), 40, 0)}px) scale(${mix(Math.max(0, bounce(f, s.at, 12)), 0.8, 1)})`,
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 6, background: alpha(c, 0.25), color: c, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO }}>
                {i + 1}
              </span>
              <span style={{ color: C.ink3, display: "flex" }}>{s.icon}</span>
              {s.t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Cite: React.FC<{ n: number; c: string; f: number; at: number }> = ({ n, c, f, at }) => {
  const b = bounce(f, at, 10);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 6,
        marginLeft: 4,
        fontSize: 14,
        fontFamily: MONO,
        fontWeight: 600,
        background: alpha(c, 0.3),
        color: C.ink,
        verticalAlign: 2,
        transform: `scale(${Math.max(0, b)})`,
      }}
    >
      {n}
    </span>
  );
};

/* ─────────────── the vault ─────────────── */

const SECRETS = [
  { name: "Réseaux Studio Lumen", sub: "@studiolumen", icon: <span style={{ width: 12, height: 12, borderRadius: 6, background: "linear-gradient(140deg, #f7a35c, #e1306c)" }} />, val: "Lumen!Studio-2026" },
  { name: "Wi-Fi studio", sub: "Lumen-5G", icon: <Wifi size={18} />, val: "nord-atelier-48" },
  { name: "Clé SSH", sub: "serveur-montage", icon: <Terminal size={18} />, val: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9q" },
  { name: "Carte pro", sub: "Atelier Nord", icon: <CreditCard size={18} />, val: "5412 7700 1848 0762" },
];
const ROW_Y = (i: number) => 205 + i * 80; // centre of each secret row
const EYE_X = 1040 - 40 - 18 - 46; // centre of the eye button
const COPY_X = 1040 - 40 - 16 - 18; // centre of the copy button

const Vault: React.FC<{ f: number; c: string }> = ({ f, c }) => {
  const enter = prog(f, T.vault, 10, EASE);
  if (f < T.vault - 1) return null;
  const ok = prog(f, T.unlock, 10, EASE);
  const blur = mix(ok, 10, 0);
  const overlayOut = prog(f, T.unlock + 6, 10, EASE);
  const burst = prog(f, T.unlock, 18, EASE);
  return (
    <div style={{ position: "absolute", left: SIDE_W, top: TOP_H, right: 0, bottom: 0, opacity: enter, transform: `translateX(${mix(enter, 60, 0)}px)` }}>
      <div style={{ padding: "24px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1 }}>Coffre · Studio</span>
          <span
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              padding: "6px 12px",
              borderRadius: 99,
              color: ok > 0 ? C.ink : C.ink2,
              background: ok > 0 ? alpha(c, 0.18) : "rgba(255,255,255,0.05)",
              border: `1px solid ${ok > 0 ? alpha(c, 0.45) : C.line}`,
            }}
          >
            {ok > 0 ? <ShieldCheck size={15} color={c} /> : <Lock size={15} />}
            Chiffré de bout en bout
          </span>
        </div>
        <div style={{ fontSize: 15, color: C.ink3, marginTop: 8 }}>{ok > 0 ? "4 secrets · déverrouillé avec Face ID" : "4 secrets · verrouillé"}</div>
      </div>
      {SECRETS.map((s, i) => {
        const at = T.unlock + 2 + i * 3;
        const reveal = i === 2 && f >= T.reveal;
        const rp = prog(f, T.reveal, 8, EASE);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: ROW_Y(i) - TOP_H - 33,
              height: 66,
              borderRadius: 14,
              background: reveal ? alpha(c, 0.1 * rp) : C.surface2,
              border: `1px solid ${reveal ? alpha(c, 0.5) : C.line}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 16px",
              filter: `blur(${blur}px)`,
              opacity: f < T.unlock ? 0.5 : Math.min(1, 0.5 + prog(f, at, 8) * 0.5),
              transform: `translateY(${f < T.unlock ? 0 : mix(bounce(f, at, 12), 16, 0)}px)`,
            }}
          >
            <span style={{ width: 38, height: 38, borderRadius: 10, background: alpha(c, 0.18), color: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</span>
            <div style={{ width: 210, flexShrink: 0 }}>
              <div style={{ fontSize: 16, color: C.ink }}>{s.name}</div>
              <div style={{ fontSize: 14, color: C.ink3, marginTop: 2 }}>{s.sub}</div>
            </div>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 15, color: reveal ? C.ink : C.ink3, letterSpacing: reveal ? 0 : 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {reveal ? scramble(s.val, f, T.reveal, 6) : "••••••••••••••"}
            </div>
            <span style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: reveal ? alpha(c, 0.25) : "rgba(255,255,255,0.05)", color: reveal ? c : C.ink2 }}>
              {reveal ? <Eye size={18} /> : <EyeOff size={18} />}
            </span>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: i === 1 && f >= T.copy ? alpha(c, 0.3) : "rgba(255,255,255,0.05)",
                color: i === 1 && f >= T.copy ? c : C.ink2,
                transform: i === 1 && f >= T.copy ? `scale(${mix(bounce(f, T.copy, 12), 0.7, 1)})` : undefined,
              }}
            >
              {i === 1 && f >= T.copy ? <Check size={18} strokeWidth={3} /> : <Copy size={17} />}
            </span>
          </div>
        );
      })}
      {/* Long video only: the Wi-Fi password is copied. */}
      {f >= T.copy && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 34,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 14,
            fontSize: 16,
            color: C.ink,
            background: C.surface2,
            border: `1px solid ${alpha(c, 0.5)}`,
            boxShadow: `0 20px 50px -16px rgba(0,0,0,0.9), 0 0 40px -12px ${alpha(c, 0.6)}`,
            whiteSpace: "nowrap",
            opacity: prog(f, T.copy, 8),
            transform: `translateX(-50%) translateY(${mix(bounce(f, T.copy, 14), 30, 0)}px)`,
          }}
        >
          <span style={{ width: 26, height: 26, borderRadius: 8, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={16} color="#fff" strokeWidth={3} />
          </span>
          Mot de passe du Wi-Fi copié
        </div>
      )}
      {/* Face ID overlay */}
      {overlayOut < 1 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - overlayOut, background: alpha(C.bg, 0.35 * (1 - ok)) }}>
          <div
            style={{
              position: "relative",
              width: 270,
              height: 270,
              borderRadius: 36,
              background: "rgba(26,26,24,0.92)",
              border: `1px solid ${ok > 0 ? alpha(c, 0.6) : C.lineStrong}`,
              boxShadow: `0 40px 90px -20px rgba(0,0,0,0.9), 0 0 ${mix(ok, 30, 90)}px -10px ${alpha(c, 0.6)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              transform: `scale(${mix(prog(f, T.vault, 12, back), 0.6, 1) * mix(overlayOut, 1, 1.15)})`,
            }}
          >
            {burst > 0 && burst < 1 && (
              <div style={{ position: "absolute", inset: -10, borderRadius: 46, border: `3px solid ${alpha(c, 1 - burst)}`, transform: `scale(${mix(burst, 1, 1.5)})` }} />
            )}
            <FaceId f={f} c={c} size={110} />
            <div style={{ fontSize: 18, fontWeight: 500, color: ok > 0 ? c : C.ink }}>{ok > 0 ? "Déverrouillé" : "Face ID"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────── the screen ─────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("cairn").color;
  const inVault = f >= T.vault;
  const noteOut = prog(f, T.vault, 10, EASE);
  // While the AI reads, the notes in the sidebar light up one after the other.
  const read = (i: number) => (f >= T.send + 2 && f < T.sources + 12 ? Math.max(0, 1 - Math.abs(f - (T.send + 3 + i * 3)) / 4) : 0);
  const cited = (i: number) => (f >= T.sources && f < T.vault && (i === 0 || i === 2) ? 1 : 0);
  const notes = ["Brief client", "Idées d'épisodes", "Réunion du 12 nov.", "Process montage"];
  const askPress = f >= T.ask - 1 && f < T.ask + 4;
  const syncGlow = f >= T.sync ? 0.6 + 0.4 * (1 - prog(f, T.sync, 16)) : 0;
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: SIDE_W, borderRight: `1px solid ${C.line}`, background: "rgba(255,255,255,0.015)", padding: "16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 8px", fontSize: 17, fontWeight: 600, height: 28 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(140deg, ${c}, ${alpha(c, 0.5)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>A</span>
          Atelier Nord
        </div>
        <div style={{ marginTop: 12, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", fontSize: 14, color: C.ink3 }}>
          <Search size={14} /> Rechercher
        </div>
        <SideLabel>Notes</SideLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notes.map((n, i) => (
            <Row
              key={n}
              c={c}
              icon={<FileText size={16} color={cited(i) ? c : undefined} />}
              label={n}
              active={i === 0 && !inVault && !(read(i) > 0)}
              glow={Math.max(read(i), cited(i) * 0.6)}
              tag={cited(i) ? <Sparkles size={14} color={c} style={{ opacity: bounce(f, T.sources + (i ? 4 : 0), 10) }} /> : undefined}
            />
          ))}
        </div>
        <SideLabel>Coffre</SideLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Row c={c} icon={inVault && f >= T.unlock ? <LockOpen size={16} color={c} /> : <Lock size={16} />} label="Studio" active={inVault} />
          <Row c={c} icon={<KeyRound size={16} />} label="Serveurs" />
        </div>
        <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 14,
          padding: "10px 12px",
          borderRadius: 12,
          border: `1px solid ${f >= T.sync ? alpha(c, 0.25 + 0.4 * syncGlow) : C.line}`,
          background: f >= T.sync ? alpha(c, 0.1 * syncGlow) : undefined,
          boxShadow: f >= T.sync ? `0 0 ${30 * syncGlow}px -6px ${alpha(c, 0.7)}` : undefined,
          fontSize: 14,
          color: C.ink2,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Cloud size={15} color={c} /> Synchronisé
            <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: 4, background: "#5fd3a8", boxShadow: `0 0 ${6 + 4 * Math.sin(f / 5)}px #5fd3a8` }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: f >= T.sync ? C.ink : C.ink3 }}>
            <Smartphone size={15} color={f >= T.sync ? c : undefined} /> Mac et iPhone
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{ position: "absolute", left: SIDE_W, right: 0, top: 0, height: TOP_H, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 20px 0 28px", fontSize: 15, color: C.ink2, zIndex: 3, background: C.surface }}>
        {inVault ? <Lock size={16} /> : <FileText size={16} />}
        <span>{inVault ? "Coffre" : "Notes"}</span>
        <span style={{ color: C.ink3 }}>/</span>
        <span style={{ color: C.ink }}>{inVault ? "Studio" : "Brief client"}</span>
        {!inVault && (
          <span style={{ marginLeft: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.ink3, padding: "3px 10px", borderRadius: 99, border: `1px solid ${C.line}` }}>
            <Hash size={13} /> Markdown
          </span>
        )}
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 36,
            padding: "0 14px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            background: f >= T.ask && !inVault ? alpha(c, 0.45) : `linear-gradient(140deg, ${c}, #a98bf5)`,
            boxShadow: f < T.ask ? `0 0 ${18 + 10 * Math.sin(f / 4)}px -4px ${alpha(c, 0.9)}` : "none",
            transform: `scale(${askPress ? 0.92 : 1})`,
          }}
        >
          <Sparkles size={16} /> Demande à tes notes
        </span>
      </div>

      {/* Note, then vault */}
      <div style={{ position: "absolute", left: SIDE_W, top: 0, right: 0, bottom: 0, opacity: 1 - noteOut, transform: `translateX(${-noteOut * 60}px)` }}>
        <Note f={f} c={c} />
      </div>
      <Vault f={f} c={c} />
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        <AskPanel f={f} c={c} />
      </div>
    </div>
  );
};

export const ad: AppAd = {
  id: "cairn",
  title: "Cairn · Atelier Nord",
  hook: "Ta deuxième mémoire.",
  Mock,
  cursor: [
    { f: 8, x: 640, y: 520 },
    { f: 26, x: BOX_X, y: CHECK_Y(0) },
    { f: T.tick1, x: BOX_X, y: CHECK_Y(0), click: true },
    { f: 41, x: BOX_X, y: CHECK_Y(1) },
    { f: T.tick2, x: BOX_X, y: CHECK_Y(1), click: true },
    { f: 56, x: 920, y: 28 },
    { f: T.ask, x: 920, y: 28, click: true },
    { f: 71, x: 993, y: 172 },
    { f: T.send, x: 993, y: 172, click: true },
    { f: 100, x: 110, y: 347 },
    { f: T.vault, x: 110, y: 347, click: true },
    { f: 128, x: EYE_X, y: ROW_Y(2) + 40 },
    { f: 132, x: EYE_X, y: ROW_Y(2) },
    { f: T.reveal, x: EYE_X, y: ROW_Y(2), click: true },
    { f: 150, x: EYE_X - 60, y: ROW_Y(2) + 70 },
    // Long video only, past the ad's last mock frame (150).
    { f: 162, x: COPY_X, y: ROW_Y(1) },
    { f: T.copy, x: COPY_X, y: ROW_Y(1), click: true },
    { f: 184, x: 120, y: 598 },
    { f: 200, x: 150, y: 560 },
  ],
  chips: [
    { f: 15, text: "Notes en Markdown", x: 560, y: 70, icon: Hash, until: 58 },
    { f: T.sources, text: "L'IA lit tes notes", x: 830, y: 600, icon: Sparkles, until: 103 },
    { f: T.unlock, text: "Coffre chiffré", x: 820, y: 560, icon: ShieldCheck },
    { f: T.sync, text: "Synchro Mac et iPhone", x: 400, y: 530, icon: Smartphone },
  ],
  focus: [
    { f: 0, x: 520, y: 220, zoom: 1.12 },
    { f: 15, x: 470, y: 240, zoom: 1.2 },
    { f: 30, x: 440, y: 260, zoom: 1.28 },
    { f: 50, x: 460, y: 300, zoom: 1.22 },
    { f: 60, x: 620, y: 260, zoom: 1.08 },
    { f: 75, x: 820, y: 230, zoom: 1.2 },
    { f: 95, x: 820, y: 330, zoom: 1.22 },
    { f: 105, x: 620, y: 330, zoom: 1.08 },
    { f: 118, x: 630, y: 360, zoom: 1.28 },
    { f: 132, x: 700, y: 360, zoom: 1.2 },
    { f: 150, x: 520, y: 330, zoom: 1.02 },
  ],
  sfx: [
    { f: 0, kind: "type" },
    { f: 15, kind: "pop" },
    { f: 30, kind: "click" },
    { f: 45, kind: "click" },
    { f: 60, kind: "click" },
    { f: 60, kind: "swish" },
    { f: 63, kind: "type" },
    { f: 75, kind: "click" },
    { f: 82, kind: "type" },
    { f: 90, kind: "pop" },
    { f: 105, kind: "click" },
    { f: 105, kind: "cut" },
    { f: 120, kind: "lock" },
    { f: 122, kind: "ding" },
    { f: 135, kind: "click" },
    { f: T.copy, kind: "click" },
    { f: T.copy + 2, kind: "pop" },
    { f: T.sync, kind: "ding" },
  ],
};

/* ─────────────── long video ─────────────── */

export const long: LongFeature[] = [
  {
    title: "Écris vite, range bien.",
    text: "Tu prends tes notes en Markdown : un titre, une checklist, un lien vers ton coffre. Tout s'enregistre au fil de la frappe.",
    points: ["Notes en Markdown", "Checklists à cocher", "Enregistrement automatique"],
    from: 0,
    to: 54,
    focus: { x: 440, y: 280, zoom: 1.22 },
  },
  {
    title: "Tes notes te répondent.",
    text: "Pose ta question à Cairn : l'IA lit tes notes et te répond en citant ses sources. Fini de fouiller dans tes dossiers.",
    points: ["IA qui répond depuis tes notes", "Sources citées", "Questions en langage courant"],
    from: 56,
    to: 100,
    focus: { x: 830, y: 300, zoom: 1.1 },
  },
  {
    title: "Tes secrets, sous clé.",
    text: "Mots de passe, clés SSH, carte pro : tout dort dans un coffre chiffré que tu ouvres d'un regard avec Face ID.",
    points: ["Coffre chiffré de bout en bout", "Déverrouillage Face ID", "Mots de passe et clés SSH"],
    from: 100,
    to: 132,
    focus: { x: 630, y: 330, zoom: 1.12 },
  },
  {
    title: "Tout reste chez toi.",
    text: "Tu révèles une clé, tu copies le Wi-Fi en un clic. Tes notes et ton coffre te suivent sur ton Mac et ton iPhone.",
    points: ["Copie en un clic", "Synchro Mac et iPhone", "Tes données, chez toi"],
    from: 130,
    to: 205,
    focus: { x: 560, y: 380, zoom: 1.06 },
  },
];
