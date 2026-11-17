import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Metricove ───────────────────────────── */

const NETS = [
  { n: "Instagram", c: "#e4405f" },
  { n: "LinkedIn", c: "#2f80d8" },
  { n: "YouTube", c: "#ff3b30" },
  { n: "X", c: "#e9e6df" },
  { n: "Facebook", c: "#4a7cf0" },
];

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

