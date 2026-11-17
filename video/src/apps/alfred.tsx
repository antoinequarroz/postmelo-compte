import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Alfred ───────────────────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

