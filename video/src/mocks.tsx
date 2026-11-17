import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "./theme";
import { mix, prog } from "./ui";

/** All mocks are drawn at this size and scaled by the scenes. */
export const MOCK_W = 1040;
export const MOCK_H = 660;

const pop = (f: number, at: number, dur = 14) => {
  const p = prog(f, at, dur);
  return { opacity: p, transform: `translateY(${mix(p, 14, 0)}px) scale(${mix(p, 0.97, 1)})`, filter: `blur(${mix(p, 6, 0)}px)` };
};

const typed = (text: string, f: number, at: number, cps = 1.4) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));

const Avatar: React.FC<{ l: string; c: string; s?: number }> = ({ l, c, s = 38 }) => (
  <div
    style={{
      width: s,
      height: s,
      borderRadius: s / 2,
      background: `linear-gradient(140deg, ${c}, ${alpha(c, 0.55)})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: s * 0.42,
      fontWeight: 600,
      color: "#fff",
      flexShrink: 0,
    }}
  >
    {l}
  </div>
);

const Side: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 230 }) => (
  <div style={{ width: w, borderRight: `1px solid ${C.line}`, background: "rgba(255,255,255,0.015)", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
    {children}
  </div>
);

const SideItem: React.FC<{ icon?: React.ReactNode; label: string; active?: boolean; color?: string; badge?: number }> = ({ icon, label, active, color = C.accent, badge }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 10,
      fontSize: 17,
      color: active ? C.ink : C.ink2,
      background: active ? alpha(color, 0.16) : "transparent",
      boxShadow: active ? `inset 0 0 0 1px ${alpha(color, 0.22)}` : "none",
    }}
  >
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
    {badge ? <span style={{ fontSize: 13, fontWeight: 600, padding: "1px 8px", borderRadius: 99, background: color, color: "#fff" }}>{badge}</span> : null}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink3, padding: "14px 12px 6px" }}>{children}</div>
);

/* ───────────────────────────── Lamio ───────────────────────────── */

export const LamioMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("lamio").color;
  const msgs = [
    { who: "Léa", l: "L", col: "#2fc7b5", t: "Le montage de l'épisode 14 est prêt, je le dépose ici.", at: 8, file: true },
    { who: "Marc", l: "M", col: "#e0803a", t: "Top ! Je relis ce soir et je valide le générique.", at: 44 },
    { who: "Julie", l: "J", col: "#8b63f5", t: "Je prépare les posts dans Metricove pour jeudi.", at: 82 },
  ];
  const draft = "On enregistre le 15 à 14 h avec @Nora";
  const reacts = prog(f, 64, 12);
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Side>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 12px", fontSize: 18, fontWeight: 600 }}>Studio Lumen</div>
        <Label>Canaux</Label>
        <SideItem icon={<Hash size={17} />} label="général" color={c} />
        <SideItem icon={<Hash size={17} />} label="studio" active color={c} badge={f > 82 ? 3 : f > 44 ? 2 : 1} />
        <SideItem icon={<Hash size={17} />} label="podcast" color={c} />
        <SideItem icon={<Hash size={17} />} label="clients" color={c} />
        <Label>Messages directs</Label>
        <SideItem icon={<Avatar l="L" c="#2fc7b5" s={22} />} label="Léa" color={c} />
        <SideItem icon={<Avatar l="M" c="#e0803a" s={22} />} label="Marc" color={c} />
      </Side>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 62, display: "flex", alignItems: "center", gap: 10, padding: "0 26px", borderBottom: `1px solid ${C.line}`, fontSize: 19, fontWeight: 600 }}>
          <Hash size={19} color={C.ink3} /> studio
          <span style={{ marginLeft: "auto", display: "flex", gap: 14, color: C.ink3 }}>
            <Search size={18} />
            <Bell size={18} />
          </span>
        </div>
        <div style={{ flex: 1, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 22, justifyContent: "flex-end" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 14, ...pop(f, m.at) }}>
              <Avatar l={m.l} c={m.col} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {m.who} <span style={{ fontWeight: 400, color: C.ink3, marginLeft: 6 }}>21:{14 + i * 2}</span>
                </div>
                <div style={{ fontSize: 18, color: C.ink2, marginTop: 3 }}>{m.t}</div>
                {m.file && (
                  <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: C.surface2 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: alpha(c, 0.25), display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={18} color={c} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15 }}>episode-14-final.mp4</div>
                      <div style={{ fontSize: 13, color: C.ink3 }}>1,2 Go</div>
                    </div>
                  </div>
                )}
                {i === 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, opacity: reacts, transform: `scale(${mix(reacts, 0.6, 1)})`, transformOrigin: "left center" }}>
                    <span style={{ fontSize: 14, padding: "3px 10px", borderRadius: 99, background: alpha(c, 0.18), border: `1px solid ${alpha(c, 0.35)}`, color: C.ink }}>
                      <Check size={13} style={{ verticalAlign: -2 }} /> 3
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ margin: "0 26px 22px", padding: "14px 18px", borderRadius: 14, border: `1px solid ${f > 110 ? alpha(c, 0.5) : C.lineStrong}`, fontSize: 18, color: f > 110 ? C.ink : C.ink3, display: "flex", alignItems: "center" }}>
          {f > 110 ? (
            <>
              {typed(draft, f, 110)}
              <span style={{ width: 2, height: 22, background: c, marginLeft: 2, opacity: Math.floor(f / 8) % 2 }} />
            </>
          ) : (
            "Écrire dans #studio"
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── Cairn ───────────────────────────── */

export const CairnMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("cairn").color;
  const lines = [
    { t: "## Objectifs", at: 30, h: true },
    { t: "Lancer la série vidéo en janvier", at: 38, check: true },
    { t: "Un épisode par semaine, 20 minutes", at: 46, check: true },
    { t: "## Accès", at: 56, h: true },
    { t: "Compte Instagram : voir le coffre", at: 64 },
  ];
  const vault = prog(f, 78, 22);
  const locked = f > 122;
  const lockP = prog(f, 122, 12);
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Side w={220}>
        <Label>Notes</Label>
        <SideItem icon={<FileText size={16} />} label="Brief Atelier Nord" active color={c} />
        <SideItem icon={<FileText size={16} />} label="Idées d'épisodes" color={c} />
        <SideItem icon={<FileText size={16} />} label="Process montage" color={c} />
        <Label>Coffre</Label>
        <SideItem icon={<Lock size={16} />} label="Studio" color={c} />
        <SideItem icon={<KeyRound size={16} />} label="Serveurs" color={c} />
      </Side>
      <div style={{ flex: 1, padding: "34px 40px", position: "relative" }}>
        <div style={{ fontSize: 14, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Atelier Nord · modifié à l'instant</div>
        <div style={{ fontFamily: SERIF, fontSize: 50, marginTop: 10, lineHeight: 1 }}>
          {typed("Brief client", f, 4, 0.9)}
          {f < 30 && <span style={{ display: "inline-block", width: 3, height: 44, background: c, marginLeft: 3, verticalAlign: -6 }} />}
        </div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ ...pop(f, l.at, 12), display: "flex", alignItems: "center", gap: 12, fontSize: l.h ? 22 : 19, fontWeight: l.h ? 600 : 400, color: l.h ? C.ink : C.ink2, marginTop: l.h && i > 0 ? 10 : 0 }}>
              {l.check && (
                <span style={{ width: 22, height: 22, borderRadius: 6, background: alpha(c, 0.25), border: `1px solid ${alpha(c, 0.5)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={14} color={c} />
                </span>
              )}
              {l.h ? l.t.replace("## ", "") : l.t}
            </div>
          ))}
        </div>
        <div style={{ ...pop(f, 70), position: "absolute", left: 40, bottom: 30, display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: c }}>
          <Sparkles size={17} /> Demande à tes notes
        </div>
        {/* The vault slides in from the right. */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 34,
            width: 330,
            padding: 22,
            borderRadius: 18,
            background: C.surface2,
            border: `1px solid ${locked ? alpha(c, 0.5) : C.lineStrong}`,
            boxShadow: `0 30px 60px -20px rgba(0,0,0,0.7), 0 0 80px -20px ${alpha(c, 0.35 * lockP)}`,
            opacity: vault,
            transform: `translateX(${mix(vault, 80, 0)}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600 }}>
            {locked ? <ShieldCheck size={20} color={c} /> : <Lock size={20} color={C.ink2} />} Coffre · Studio
          </div>
          {[
            ["Instagram", "@studiolumen"],
            ["Wi-Fi studio", "Lumen-5G"],
            ["Clé SSH", "serveur-montage"],
          ].map(([k, v], i) => (
            <div key={k} style={{ ...pop(f, 86 + i * 6, 12), marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(0,0,0,0.25)", border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 15, color: C.ink }}>{k}</div>
              <div style={{ fontSize: 14, color: C.ink3, display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span>{v}</span>
                <span style={{ fontFamily: MONO, letterSpacing: 2 }}>••••••••</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 0", borderRadius: 12, fontSize: 16, background: locked ? alpha(c, 0.2) : "rgba(255,255,255,0.05)", color: locked ? C.ink : C.ink2 }}>
            <Fingerprint size={18} color={locked ? c : C.ink2} />
            {locked ? "Chiffré, déverrouillé avec Face ID" : "Face ID"}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── TickUp ───────────────────────────── */

export const TickUpMock: React.FC<{ f: number }> = ({ f }) => {
  const ink = "#e9e6df";
  const cols = ["À faire", "En cours", "Terminé"];
  const card = (id: string, t: string, p: number, extra?: React.CSSProperties) => (
    <div style={{ padding: "14px 16px", borderRadius: 14, background: C.surface2, border: `1px solid ${C.lineStrong}`, boxShadow: "0 10px 24px -14px rgba(0,0,0,0.8)", ...extra }}>
      <div style={{ fontSize: 13, color: C.ink3, fontFamily: MONO }}>{id}</div>
      <div style={{ fontSize: 18, marginTop: 4 }}>{t}</div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", marginTop: 12 }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 3, background: ink }} />
      </div>
    </div>
  );
  // « Brief vidéo » fills its bar, lifts and lands in Terminé.
  const fill = interpolate(f, [16, 52], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const lift = prog(f, 54, 10);
  const move = prog(f, 60, 30, EASE_IN_OUT);
  const drop = prog(f, 88, 10);
  const colW = 300;
  const gap = 18;
  const cardX = mix(move, colW + gap, 2 * (colW + gap));
  const cardY = mix(move, 0, 0);
  const shift = prog(f, 62, 26, EASE_IN_OUT); // Terminé makes room
  const newCard = prog(f, 104, 16);
  return (
    <div style={{ height: "100%", padding: 22, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        {["Kanban", "Liste", "Gantt", "Roadmap"].map((v, i) => (
          <span key={v} style={{ fontSize: 15, padding: "6px 14px", borderRadius: 99, background: i === 0 ? "rgba(255,255,255,0.1)" : "transparent", color: i === 0 ? C.ink : C.ink3 }}>
            {v}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 15, color: C.ink3, display: "flex", alignItems: "center", gap: 8 }}>
          <CircleDot size={15} /> Sprint 4 · 12 tickets
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", gap, position: "relative" }}>
        {cols.map((name, ci) => (
          <div key={name} style={{ width: colW, borderRadius: 16, background: "rgba(255,255,255,0.025)", border: `1px solid ${C.line}`, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 15, color: C.ink2, display: "flex", alignItems: "center", gap: 8, padding: "2px 2px 4px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, border: `1.5px solid ${C.ink2}`, background: ci === 2 ? C.ink2 : "transparent" }} /> {name}
            </div>
            {ci === 0 && (
              <>
                {card("STU-13", "Maquette accueil", 0.25)}
                {card("STU-14", "Sous-titres épisode 13", 0.25)}
                <div style={{ ...pop(f, 104), fontSize: 15, color: C.ink3 }}>
                  <Plus size={14} style={{ verticalAlign: -2 }} /> Ticket
                </div>
              </>
            )}
            {ci === 1 && (
              <>
                <div style={{ height: 100 * (1 - drop), marginBottom: -12 * drop, borderRadius: 14, border: `1.5px dashed ${alpha(ink, 0.18 * lift * (1 - drop))}` }} />
                {card("STU-16", "Visuels LinkedIn", 0.65)}
                <div style={{ opacity: newCard, transform: `translateY(${mix(newCard, 10, 0)}px)` }}>{card("STU-21", "Teaser épisode 15", 0.1)}</div>
              </>
            )}
            {ci === 2 && (
              <>
                <div style={{ height: shift * 112, flexShrink: 0 }} />
                {card("STU-18", "Logo final", 1)}
                {card("STU-19", "Charte", 1)}
              </>
            )}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: cardX + 14,
            top: 44 + cardY,
            width: colW - 28,
            transform: `rotate(${mix(lift, 0, 2.5) * (1 - drop)}deg) scale(${1 + 0.04 * lift * (1 - drop)})`,
            zIndex: 2,
          }}
        >
          {card("STU-12", "Brief vidéo", fill, {
            boxShadow: `0 ${mix(lift * (1 - drop), 10, 40)}px ${mix(lift * (1 - drop), 24, 60)}px -14px rgba(0,0,0,0.9)`,
            border: `1px solid ${drop > 0.5 ? C.lineStrong : alpha(ink, 0.35)}`,
          })}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── Alfred ───────────────────────────── */

export const AlfredMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("alfred").color;
  const days = ["Lun 14", "Mar 15", "Mer 16", "Jeu 17", "Ven 18"];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const top = 50;
  const rowH = 58;
  const left = 70;
  const colW = (MOCK_W - 40 - left - 340) / 5;
  const ev = (d: number, h: number, len: number, t: string, col: string, at: number) => (
    <div
      key={t}
      style={{
        position: "absolute",
        left: left + d * colW + 4,
        top: top + (h - 9) * rowH + 3,
        width: colW - 8,
        height: len * rowH - 6,
        borderRadius: 10,
        background: alpha(col, 0.22),
        borderLeft: `3px solid ${col}`,
        padding: "6px 9px",
        fontSize: 14,
        lineHeight: 1.25,
        ...pop(f, at, 12),
      }}
    >
      {t}
    </div>
  );
  const slot = f > 60;
  const confirm = prog(f, 78, 14);
  const fly = prog(f, 96, 26, EASE_IN_OUT);
  return (
    <div style={{ height: "100%", position: "relative", padding: 20 }}>
      <div style={{ position: "absolute", left: 20, top: 14, display: "flex", width: MOCK_W - 380 }}>
        <div style={{ width: left }} />
        {days.map((d, i) => (
          <div key={d} style={{ width: colW, fontSize: 15, color: i === 1 ? c : C.ink2, textAlign: "center", fontWeight: i === 1 ? 600 : 400 }}>
            {d}
          </div>
        ))}
      </div>
      {hours.map((h, i) => (
        <div key={h} style={{ position: "absolute", left: 20, top: top + i * rowH, width: MOCK_W - 380, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.ink3, paddingTop: 4 }}>
          {h}:00
        </div>
      ))}
      <div style={{ position: "absolute", left: 20, top: 0, width: MOCK_W - 380, height: "100%" }}>
        {ev(0, 9, 1, "Point d'équipe", c, 4)}
        {ev(0, 14, 2, "Montage ép. 14", "#2fc7b5", 8)}
        {ev(2, 10, 1.5, "Atelier Nord", "#e0803a", 12)}
        {ev(3, 9, 1, "Posts de la semaine", "#ff6a33", 16)}
        {ev(4, 11, 2, "Direct « Les Coulisses »", "#ec4d5b", 20)}
        {/* The booked meeting lands on Tuesday 14:00. */}
        <div
          style={{
            position: "absolute",
            left: mix(fly, MOCK_W - 380, left + colW + 4),
            top: mix(fly, 220, top + 5 * rowH + 3),
            width: mix(fly, 300, colW - 8),
            height: mix(fly, 60, 2 * rowH - 6),
            borderRadius: 10,
            background: alpha(c, mix(fly, 0.0, 0.35)),
            borderLeft: `3px solid ${c}`,
            padding: "6px 9px",
            fontSize: 14,
            opacity: fly > 0 ? 1 : 0,
            boxShadow: `0 0 50px -10px ${alpha(c, 0.7 * (1 - prog(f, 122, 20)))}`,
          }}
        >
          Enregistrement podcast · Nora
        </div>
      </div>
      {/* The public booking page. */}
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 16,
          width: 320,
          bottom: 16,
          borderRadius: 18,
          background: C.surface2,
          border: `1px solid ${C.lineStrong}`,
          padding: 20,
          ...pop(f, 24, 16),
        }}
      >
        <div style={{ fontSize: 13, color: C.ink3, letterSpacing: "0.12em", textTransform: "uppercase" }}>Prendre rendez-vous</div>
        <div style={{ fontFamily: SERIF, fontSize: 32, marginTop: 6 }}>Enregistrement</div>
        <div style={{ fontSize: 15, color: C.ink2, display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Clock size={14} /> 2 h · Studio Lumen
        </div>
        <div style={{ marginTop: 18, fontSize: 15, color: C.ink2 }}>Mardi 15 novembre</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          {["10:00", "11:30", "14:00", "16:00"].map((t) => {
            const on = t === "14:00" && slot;
            return (
              <div key={t} style={{ padding: "11px 0", textAlign: "center", borderRadius: 10, fontSize: 16, border: `1px solid ${on ? c : C.lineStrong}`, background: on ? alpha(c, 0.25) : "transparent", color: on ? C.ink : C.ink2 }}>
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, padding: "13px 0", borderRadius: 12, textAlign: "center", fontSize: 16, fontWeight: 600, background: c, color: "#fff", transform: `scale(${f > 72 && f < 78 ? 0.96 : 1})` }}>
          {confirm > 0.5 ? (
            <span>
              <Check size={16} style={{ verticalAlign: -3 }} /> Confirmé, e-mail envoyé
            </span>
          ) : (
            "Confirmer"
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── Metricove ───────────────────────────── */

const NETS = [
  { n: "Instagram", c: "#e4405f" },
  { n: "LinkedIn", c: "#2f80d8" },
  { n: "YouTube", c: "#ff3b30" },
  { n: "X", c: "#e9e6df" },
  { n: "Facebook", c: "#4a7cf0" },
];

export const MetricoveMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("metricove").color;
  const caption = "Épisode 14 : comment on a monté notre studio à Sion.";
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const sched = prog(f, 104, 22, EASE_IN_OUT);
  const press = f > 98 && f < 104;
  return (
    <div style={{ height: "100%", display: "flex" }}>
      {/* Composer */}
      <div style={{ width: 430, padding: 24, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 13, color: C.ink3, letterSpacing: "0.12em", textTransform: "uppercase" }}>Nouveau post</div>
        <div
          style={{
            height: 210,
            borderRadius: 16,
            position: "relative",
            overflow: "hidden",
            background: `radial-gradient(120% 90% at 20% 10%, ${alpha(c, 0.9)}, #6b1d4a 60%, #1c0f1c)`,
            transform: `scale(${(1 - 0.5 * sched) * mix(prog(f, 4, 16), 0.96, 1)})`,
            opacity: (1 - sched) * prog(f, 4, 16),
            transformOrigin: "100% 100%",
          }}
        >
          <div style={{ position: "absolute", left: 20, bottom: 18, fontFamily: SERIF, fontSize: 38, lineHeight: 0.95, color: "#fff" }}>
            Notre studio,
            <br />
            <i>épisode 14</i>
          </div>
          <div style={{ position: "absolute", top: 14, right: 14, fontSize: 13, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,0.35)", color: "#fff", display: "flex", gap: 6, alignItems: "center" }}>
            <Sparkles size={13} /> Fiche de marque
          </div>
        </div>
        <div style={{ fontSize: 17, color: C.ink, minHeight: 50, lineHeight: 1.35 }}>
          {typed(caption, f, 18, 1.6)}
          {f > 18 && f < 54 && <span style={{ display: "inline-block", width: 2, height: 20, background: c, verticalAlign: -3 }} />}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NETS.map((n, i) => {
            const on = f > 56 + i * 6 && i < 4;
            return (
              <span
                key={n.n}
                style={{
                  fontSize: 14,
                  padding: "6px 12px",
                  borderRadius: 99,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  border: `1px solid ${on ? alpha(n.c, 0.6) : C.lineStrong}`,
                  background: on ? alpha(n.c, 0.16) : "transparent",
                  color: on ? C.ink : C.ink3,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 4, background: on ? n.c : C.ink3 }} /> {n.n}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: "auto", padding: "13px 0", borderRadius: 12, textAlign: "center", fontSize: 16, fontWeight: 600, background: c, color: "#fff", transform: `scale(${press ? 0.96 : 1})` }}>
          {f > 104 ? (
            <span>
              <Check size={16} style={{ verticalAlign: -3 }} /> Programmé jeudi 9 h
            </span>
          ) : (
            "Programmer · jeudi 9 h"
          )}
        </div>
      </div>
      {/* Editorial calendar */}
      <div style={{ flex: 1, padding: 22 }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, marginBottom: 14 }}>Calendrier éditorial</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, height: 470 }}>
          {days.map((d, i) => (
            <div key={d} style={{ borderRadius: 12, background: "rgba(255,255,255,0.025)", border: `1px solid ${i === 3 && sched > 0.6 ? alpha(c, 0.5) : C.line}`, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, color: i === 3 ? c : C.ink3, textAlign: "center" }}>{d}</div>
              {[
                [0, "#e4405f", 8],
                [1, "#2f80d8", 12],
                [2, "#ff3b30", 16],
                [4, "#e4405f", 20],
                [4, "#2f80d8", 24],
                [5, "#e4405f", 28],
              ]
                .filter(([day]) => day === i)
                .map(([, col, at], k) => (
                  <div key={k} style={{ height: 54, borderRadius: 8, background: alpha(col as string, 0.2), borderLeft: `3px solid ${col}`, ...pop(f, at as number, 12) }} />
                ))}
              {i === 3 && (
                <div
                  style={{
                    height: 120,
                    borderRadius: 8,
                    background: `radial-gradient(120% 90% at 20% 10%, ${alpha(c, 0.9)}, #6b1d4a 60%, #1c0f1c)`,
                    opacity: sched,
                    transform: `scale(${mix(sched, 1.6, 1)}) translateX(${mix(sched, -120, 0)}px)`,
                    boxShadow: `0 0 40px -6px ${alpha(c, 0.8 * sched)}`,
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 6, left: 6, display: "flex", gap: 3 }}>
                    {NETS.slice(0, 4).map((n) => (
                      <span key={n.n} style={{ width: 7, height: 7, borderRadius: 4, background: n.c }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── Nino Studio ───────────────────────────── */

/** A person in front of a camera, drawn with light and shapes. */
export const Shot: React.FC<{ hue: string; label: string; who?: number; wide?: boolean; talking?: boolean; f: number; style?: React.CSSProperties }> = ({
  hue,
  label,
  who = 0,
  wide,
  talking,
  f,
  style,
}) => {
  const people = wide ? [-0.22, 0.22] : [0];
  const bob = Math.sin(f / 9 + who) * 2;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: `radial-gradient(90% 80% at 50% 30%, ${alpha(hue, 0.45)}, #121212 75%)`,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5))" }} />
      {people.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: `${50 + x * 100}%`, bottom: 0, transform: `translateX(-50%) translateY(${bob}px)`, height: wide ? "62%" : "84%", aspectRatio: "1 / 1.1" }}>
          <div style={{ position: "absolute", left: "31%", width: "38%", aspectRatio: "1 / 1.12", top: "6%", borderRadius: "50%", background: `linear-gradient(160deg, #e9d2c0, #a77d64)`, zIndex: 1 }} />
          <div style={{ position: "absolute", left: "42%", width: "16%", height: "14%", top: "42%", background: "#b88b70" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "48%", borderRadius: "46% 46% 0 0", zIndex: 2, background: `linear-gradient(160deg, ${i === 1 || who === 1 ? "#3a4a5e" : "#2b2b2b"}, #111)` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 10, top: 9, fontSize: 13, padding: "3px 9px", borderRadius: 6, background: "rgba(0,0,0,0.5)", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
        {talking && <Mic size={12} color="#5fd3a8" />} {label}
      </div>
    </div>
  );
};

const Meter: React.FC<{ level: number; c: string }> = ({ level, c }) => (
  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 26 }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} style={{ width: 5, height: 6 + i * 2, borderRadius: 2, background: i / 10 < level ? (i > 7 ? "#ec4d5b" : c) : "rgba(255,255,255,0.1)" }} />
    ))}
  </div>
);

export const NinoMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("nino").color;
  // Who talks: Camille, then Nora, then both (wide).
  const speaker = f < 48 ? 0 : f < 96 ? 1 : 2;
  const cut = (at: number) => (f >= at && f < at + 4 ? 1 - (f - at) / 4 : 0);
  const flash = Math.max(cut(48), cut(96));
  const lvl = (i: number) => (speaker === i || speaker === 2 ? 0.45 + 0.45 * Math.abs(Math.sin(f / 3.3 + i * 2)) : 0.08);
  const cams = [
    { label: "Cam 1 · Camille", hue: "#c58b5a", who: 0 },
    { label: "Cam 2 · Nora", hue: "#5a8bc5", who: 1 },
    { label: "Large", hue: "#8b6fc0", who: 2, wide: true },
  ];
  const secs = 1520 + Math.floor(f / 30);
  const time = `00:${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <div style={{ height: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 99, background: "rgba(236,77,91,0.16)", color: "#ff8a94" }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: "#ec4d5b", opacity: Math.floor(f / 15) % 2 ? 1 : 0.4 }} /> REC {time}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 99, background: alpha(c, 0.16), color: c }}>
          <Sparkles size={14} /> Réalisation auto
        </span>
        <span style={{ marginLeft: "auto", color: C.ink3 }}>Podcast · Épisode 15</span>
      </div>
      <div style={{ display: "flex", gap: 14, flex: 1 }}>
        <div style={{ flex: 1, position: "relative", borderRadius: 14, overflow: "hidden", border: `2px solid ${alpha("#ec4d5b", 0.8)}` }}>
          <Shot f={f} hue={cams[speaker].hue} label={`PROGRAMME · ${cams[speaker].label}`} who={cams[speaker].who} wide={cams[speaker].wide} talking style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.25 }} />
          <div style={{ position: "absolute", left: 22, bottom: 20, padding: "10px 16px", borderRadius: 10, background: "rgba(10,10,10,0.7)", borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 17, color: "#fff", fontWeight: 600 }}>{speaker === 1 ? "Nora Berclaz" : "Camille Roux"}</div>
            <div style={{ fontSize: 13, color: C.ink2 }}>{speaker === 1 ? "Invitée" : "Animateur"}</div>
          </div>
        </div>
        <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 10 }}>
          {cams.map((cam, i) => (
            <div key={i} style={{ position: "relative" }}>
              <Shot f={f} hue={cam.hue} label={cam.label} who={cam.who} wide={cam.wide} style={{ height: 128, border: `2px solid ${speaker === i ? "#ec4d5b" : "transparent"}` }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 26, alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.line}` }}>
        {["Camille", "Nora"].map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.ink2 }}>
            <Mic size={15} /> {n} <Meter level={lvl(i)} c={c} />
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 14, color: C.ink3 }}>OBS connecté · Stream Deck</span>
      </div>
    </div>
  );
};

/* ───────────────────────────── Maya Studio ───────────────────────────── */

export const MayaMock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("maya").color;
  const scenes = [
    { n: "Intro", hue: "#c0526f" },
    { n: "Plateau", hue: "#8b6fc0" },
    { n: "Invitée", hue: "#5a8bc5" },
    { n: "Générique", hue: "#c58b5a" },
  ];
  const preview = f < 40 ? 0 : 1;
  const program = f < 70 ? 0 : 1;
  const nextPreview = f > 90 ? 2 : preview;
  const tr = prog(f, 64, 10);
  const live = f > 70;
  const kbps = 6000 + Math.round(Math.sin(f / 5) * 140);
  return (
    <div style={{ height: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flex: 1 }}>
        {[
          { t: "Aperçu", s: nextPreview, col: "#2fc7b5" },
          { t: "Programme", s: program, col: c },
        ].map((m, i) => (
          <div key={m.t} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 14, color: m.col, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              {m.t}
              {i === 1 && live && (
                <span style={{ marginLeft: "auto", fontSize: 13, letterSpacing: 0, textTransform: "none", padding: "3px 10px", borderRadius: 99, background: c, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <Radio size={13} /> En direct
                </span>
              )}
            </div>
            <div style={{ position: "relative", flex: 1, borderRadius: 14, overflow: "hidden", border: `2px solid ${alpha(m.col, 0.8)}` }}>
              <Shot f={f} hue={scenes[m.s].hue} label={scenes[m.s].n} who={m.s === 2 ? 1 : 0} wide={m.s === 1} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
              {i === 1 && (
                <div style={{ position: "absolute", inset: 0, opacity: tr > 0 && tr < 1 ? 1 - Math.abs(tr - 0.5) * 2 : 0, background: "#000" }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        {scenes.map((s, i) => (
          <div key={s.n} style={{ flex: 1, borderRadius: 10, overflow: "hidden", border: `2px solid ${i === program ? c : i === nextPreview ? "#2fc7b5" : C.line}`, position: "relative" }}>
            <Shot f={f} hue={s.hue} label={s.n} who={i === 2 ? 1 : 0} wide={i === 1} style={{ height: 92, borderRadius: 0 }} />
          </div>
        ))}
        <div style={{ width: 150, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ flex: 1, borderRadius: 10, background: f > 62 && f < 70 ? c : alpha(c, 0.2), color: "#fff", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>Transition</div>
          <div style={{ fontSize: 13, color: C.ink3, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Wifi size={13} /> SRT · {live ? kbps : 0} kb/s
          </div>
        </div>
      </div>
    </div>
  );
};

export const MOCKS: Record<string, React.FC<{ f: number }>> = {
  lamio: LamioMock,
  cairn: CairnMock,
  tickup: TickUpMock,
  alfred: AlfredMock,
  metricove: MetricoveMock,
  nino: NinoMock,
  maya: MayaMock,
};

export const MOCK_TITLES: Record<string, string> = {
  lamio: "Lamio · Studio Lumen",
  cairn: "Cairn · Notes",
  tickup: "TickUp · Studio · Sprint 4",
  alfred: "Alfred · Semaine du 14 novembre",
  metricove: "Metricove · Studio Lumen",
  nino: "Nino Studio · Régie",
  maya: "Maya Studio · Production",
};
