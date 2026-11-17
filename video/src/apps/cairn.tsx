import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";

/* ───────────────────────────── Cairn ───────────────────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
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

