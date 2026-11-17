import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Maya Studio ───────────────────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

