import React from "react";
import { Bell, Check, CircleDot, Clock, FileText, Fingerprint, Hash, KeyRound, Lock, Mic, Plus, Radio, Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { interpolate } from "remotion";
import { alpha, app, C, EASE_IN_OUT, MONO, SERIF } from "../theme";
import { Avatar, Label, Meter, mix, MOCK_H, MOCK_W, pop, prog, Shot, Side, SideItem, typed } from "../kit";
import type { AppAd } from "../ad";
import { MessagesSquare, Send, Smartphone, Zap } from "lucide-react";

/* ───────────────────────────── Lamio ───────────────────────────── */

export const Mock: React.FC<{ f: number }> = ({ f }) => {
  const c = app("lamio").color;
  const msgs = [
    { who: "Léa", l: "L", col: "#2fc7b5", t: "Le montage de l'épisode 14 est prêt, je le dépose ici.", at: 6, file: true },
    { who: "Marc", l: "M", col: "#e0803a", t: "Top ! Je relis ce soir et je valide le générique.", at: 26 },
    { who: "Julie", l: "J", col: "#8b63f5", t: "Je prépare les posts dans Metricove pour jeudi.", at: 46 },
  ];
  const draft = "On enregistre le 15 à 14 h avec @Nora";
  const reacts = prog(f, 60, 12);
  const sent = f >= 105;
  const all = sent ? [...msgs, { who: "Camille", l: "C", col: "#5fd3a8", t: draft, at: 105 }] : msgs;
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Side>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 12px", fontSize: 18, fontWeight: 600 }}>Studio Lumen</div>
        <Label>Canaux</Label>
        <SideItem icon={<Hash size={17} />} label="général" color={c} />
        <SideItem icon={<Hash size={17} />} label="studio" active color={c} badge={f > 46 ? 3 : f > 26 ? 2 : 1} />
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
          {all.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 14, ...pop(f, m.at) }}>
              <Avatar l={m.l} c={m.col} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {m.who} <span style={{ fontWeight: 400, color: C.ink3, marginLeft: 6 }}>21:{14 + i * 2}</span>
                </div>
                <div style={{ fontSize: 18, color: C.ink2, marginTop: 3 }}>
                  {m.t.includes("@Nora") ? (
                    <>
                      {m.t.replace("@Nora", "")}
                      <span style={{ color: c, background: alpha(c, 0.18), borderRadius: 6, padding: "0 5px" }}>@Nora</span>
                    </>
                  ) : (
                    m.t
                  )}
                </div>
                {"file" in m && m.file && (
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
        <div style={{ margin: "0 26px 22px", padding: "14px 18px", borderRadius: 14, border: `1px solid ${f > 72 && !sent ? alpha(c, 0.5) : C.lineStrong}`, fontSize: 18, color: f > 72 && !sent ? C.ink : C.ink3, display: "flex", alignItems: "center" }}>
          {f > 72 && !sent ? (
            <>
              {typed(draft, f, 72, 1.6)}
              <span style={{ width: 2, height: 22, background: c, marginLeft: 2, opacity: Math.floor(f / 8) % 2 }} />
            </>
          ) : (
            "Écrire dans #studio"
          )}
          <span style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: 10, background: f > 98 && !sent ? c : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={16} color="#fff" />
          </span>
        </div>
      </div>
    </div>
  );
};


export const ad: AppAd = {
  id: "lamio",
  title: "Lamio · Studio Lumen",
  hook: "Ton équipe, en direct.",
  Mock,
  // Click the message to react, then the composer, then send.
  cursor: [
    { f: 40, x: 760, y: 470 },
    { f: 58, x: 300, y: 300 },
    { f: 60, x: 300, y: 300, click: true },
    { f: 68, x: 520, y: 620 },
    { f: 70, x: 520, y: 620, click: true },
    { f: 100, x: 990, y: 620 },
    { f: 104, x: 990, y: 620, click: true },
    { f: 140, x: 900, y: 560 },
  ],
  chips: [
    { f: 15, text: "Tout arrive en direct", x: 1010, y: 90, icon: Zap },
    { f: 60, text: "Fils, réactions, mentions", x: 120, y: 380, icon: MessagesSquare },
    { f: 105, text: "App Mac et iPhone", x: 1000, y: 470, icon: Smartphone },
  ],
  focus: [
    { f: 0, x: 520, y: 330, zoom: 1 },
    { f: 50, x: 560, y: 360, zoom: 1.12 },
    { f: 75, x: 640, y: 560, zoom: 1.28 },
    { f: 112, x: 600, y: 480, zoom: 1.15 },
    { f: 140, x: 520, y: 330, zoom: 1.02 },
  ],
  sfx: [
    { f: 6, kind: "ding" },
    { f: 26, kind: "pop" },
    { f: 46, kind: "pop" },
    { f: 60, kind: "click" },
    { f: 70, kind: "click" },
    { f: 74, kind: "type" },
    { f: 104, kind: "click" },
    { f: 105, kind: "swish" },
  ],
};
