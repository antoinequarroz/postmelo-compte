import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── TickUp ───────────────────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

