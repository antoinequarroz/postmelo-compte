import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

