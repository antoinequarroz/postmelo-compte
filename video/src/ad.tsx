import React from "react";
import type { LucideIcon } from "lucide-react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { MOCK_H, MOCK_W } from "./kit";
import { Sfx, SfxKind } from "./sound";
import { alpha, app, AppId, C, EASE, EASE_IN_OUT, MONO, SANS } from "./theme";
import { AppIcon, Backdrop, mix, prog, Serif, Window } from "./ui";

/** Music: 120 BPM, so one beat is 15 frames at 30 fps and one bar is 60 frames. */
export const BEAT = 15;
export const BAR = 60;

/** An app scene lasts 12 beats: 2 beats of title, 9 of product, 1 of exit. Mock time starts at MOCK_AT. */
export const APP_LEN = 12 * BEAT;
export const MOCK_AT = 2 * BEAT;

export type CursorKey = { f: number; x: number; y: number; click?: boolean };
export type Chip = { f: number; text: string; x: number; y: number; icon?: LucideIcon; until?: number };
export type Focus = { f: number; x: number; y: number; zoom: number };

/**
 * Everything one app brings to the ad. All frames are in mock time (0 = the window is on screen,
 * last useful frame ≈ 140) and all positions in mock pixels (the window is MOCK_W × MOCK_H).
 * Put actions on beats: multiples of 15.
 */
export type AppAd = {
  id: AppId;
  title: string;
  /** Punchy promise under the name, 2 to 6 words. */
  hook: string;
  Mock: React.FC<{ f: number }>;
  cursor: CursorKey[];
  chips: Chip[];
  focus: Focus[];
  sfx: { f: number; kind: SfxKind }[];
};

/* ─────────────── keyframe helpers ─────────────── */

const at = <T extends { f: number }>(keys: T[], f: number, pick: (k: T) => number, ease = EASE_IN_OUT) => {
  if (!keys.length) return 0;
  if (f <= keys[0].f) return pick(keys[0]);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) return interpolate(f, [a.f, b.f], [pick(a), pick(b)], { easing: ease });
  }
  return pick(keys[keys.length - 1]);
};

/** The macOS pointer, with a ripple on each click. */
export const Cursor: React.FC<{ keys: CursorKey[]; f: number; color: string }> = ({ keys, f, color }) => {
  if (!keys.length) return null;
  const x = at(keys, f, (k) => k.x);
  const y = at(keys, f, (k) => k.y);
  const clicks = keys.filter((k) => k.click);
  const press = clicks.reduce((m, k) => Math.max(m, f >= k.f - 2 && f < k.f + 4 ? 1 : 0), 0);
  const show = prog(f, keys[0].f - 8, 8);
  return (
    <>
      {clicks.map((k) => {
        const p = prog(f, k.f, 16, EASE);
        if (f < k.f || p >= 1) return null;
        return (
          <div
            key={k.f}
            style={{
              position: "absolute",
              left: k.x - 40,
              top: k.y - 40,
              width: 80,
              height: 80,
              borderRadius: 40,
              border: `3px solid ${color}`,
              opacity: 1 - p,
              transform: `scale(${mix(p, 0.2, 1.3)})`,
              zIndex: 40,
            }}
          />
        );
      })}
      <svg
        width={34}
        height={34}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: x - 6, top: y - 3, zIndex: 41, opacity: show, transform: `scale(${press ? 0.82 : 1})`, transformOrigin: "6px 3px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
      >
        <path d="M5 2.5 L5 19.5 L9.6 15.3 L12.6 21.6 L15.4 20.3 L12.4 14.1 L18.6 13.8 Z" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** A floating glass callout that pops on its beat. */
export const ChipView: React.FC<{ chip: Chip; f: number; color: string; scale: number }> = ({ chip, f, color, scale }) => {
  const p = prog(f, chip.f, 12, (t) => {
    // overshoot spring
    const s = 1.70158 * 1.4;
    return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  });
  const out = chip.until ? 1 - prog(f, chip.until, 8) : 1;
  if (f < chip.f) return null;
  const Icon = chip.icon;
  const bob = Math.sin((f - chip.f) / 12) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: chip.x,
        top: chip.y,
        transform: `translate(-50%, -50%) translateY(${bob}px) scale(${Math.max(0, p) / scale})`,
        opacity: Math.min(1, p * 2) * out,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 22px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        fontFamily: SANS,
        fontSize: 26,
        fontWeight: 500,
        color: C.ink,
        background: "rgba(28,28,26,0.82)",
        border: `1px solid ${alpha(color, 0.55)}`,
        boxShadow: `0 20px 50px -12px rgba(0,0,0,0.9), 0 0 40px -8px ${alpha(color, 0.6)}`,
        backdropFilter: "blur(14px)",
      }}
    >
      {Icon && (
        <span style={{ width: 36, height: 36, borderRadius: 18, background: alpha(color, 0.22), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={color} />
        </span>
      )}
      {chip.text}
    </div>
  );
};

/** Plays a list of sound effects, each at its frame. */
export const SfxTrack: React.FC<{ events: { f: number; kind: SfxKind }[]; offset?: number }> = ({ events, offset = 0 }) => (
  <>
    {events.map((e, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(e.f + offset))} layout="none">
        <Sfx kind={e.kind} />
      </Sequence>
    ))}
  </>
);

/* ─────────────── the app scene ─────────────── */

export const AppAdScene: React.FC<{ ad: AppAd; index: number; total?: number; dur?: number; quick?: boolean }> = ({ ad, index, total = 7, dur = APP_LEN, quick }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const a = app(ad.id);
  const col = ad.id === "tickup" ? "#e9e6df" : a.color;
  const intro = quick ? 0.6 * BEAT : MOCK_AT;
  const f = frame - intro + (quick ? 40 : 0); // mock time
  const Mock = ad.Mock;

  // Title: the icon slams in on the downbeat, then the title block docks.
  const slam = prog(frame, 0, 10, EASE);
  const dock = quick ? 1 : prog(frame, intro - 10, 18, EASE_IN_OUT);
  const ring = prog(frame, 0, 24, EASE);

  // Window: flies up from depth.
  const win = prog(frame, intro - 6, 20, EASE);

  // Camera on the mock.
  const fx = ad.focus.length ? at(ad.focus, f, (k) => k.x) : MOCK_W / 2;
  const fy = ad.focus.length ? at(ad.focus, f, (k) => k.y) : MOCK_H / 2;
  const zoomRaw = ad.focus.length ? at(ad.focus, f, (k) => k.zoom) : 1;
  const zoom = v ? 1 + (zoomRaw - 1) * 0.6 : zoomRaw;

  // Exit: a whip to the left on the last half beat.
  const exit = prog(frame, dur - 9, 9, (t) => t * t);
  const enter = 1 - prog(frame, 0, 7, EASE);

  const baseScale = v ? 1.0 : 1.08;
  const stageW = v ? width : width * 0.66;
  const stageCx = v ? width / 2 : width * 0.6;
  const stageCy = v ? height * 0.6 : height * 0.54;
  const s = baseScale * zoom;
  // Keep the focus point near the stage centre, but never pull the window too far.
  const txRaw = stageCx - (MOCK_W / 2) * s - (fx - MOCK_W / 2) * s * Math.min(1, (zoom - 1) * 2.2);
  // In 16:9 the window never slides under the title column.
  const tx = v ? txRaw : Math.max(txRaw, 640 - MOCK_W * s * 0.08);
  const tyRaw = stageCy - (MOCK_H / 2) * s - (fy - MOCK_H / 2) * s * Math.min(1, (zoom - 1) * 2.2);
  const ty = v ? Math.max(tyRaw, 420 - MOCK_H * s * 0.15) : Math.max(tyRaw, 250 - MOCK_H * s * 0.2);

  const titleBig = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ transform: `perspective(900px) rotateY(${mix(slam, -160, 0)}deg) scale(${mix(slam, 2.6, 1)})`, opacity: Math.min(1, slam * 2) }}>
        <AppIcon icon={a.icon} size={v ? 230 : 200} glow={col} />
      </div>
      <Serif size={v ? 170 : 170} style={{ whiteSpace: "nowrap", overflow: "hidden", paddingBottom: 12 }}>
        <span style={{ display: "inline-block", transform: `translateY(${mix(prog(frame, 3, 12), 110, 0)}%)` }}>{a.name}</span>
      </Serif>
      <div style={{ fontFamily: SANS, fontSize: v ? 44 : 40, color: col, opacity: prog(frame, 8, 10), transform: `translateY(${mix(prog(frame, 8, 12), 20, 0)}px)`, whiteSpace: "nowrap" }}>{ad.hook}</div>
    </div>
  );

  const titleSmall = (
    <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: SANS }}>
      <AppIcon icon={a.icon} size={v ? 110 : 96} glow={col} />
      <div>
        <div style={{ fontFamily: MONO, fontSize: v ? 22 : 18, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink3 }}>
          <span style={{ color: C.ink }}>{String(index + 1).padStart(2, "0")}</span>
          {!v && ` / ${String(total).padStart(2, "0")}`} · <span style={{ color: col }}>{a.category}</span>
        </div>
        <Serif size={v ? 96 : 86} style={{ marginTop: 6, whiteSpace: "nowrap" }}>
          {a.name}
        </Serif>
        <div style={{ fontSize: v ? 34 : 28, color: C.ink2, marginTop: 6, whiteSpace: "nowrap" }}>{ad.hook}</div>
      </div>
    </div>
  );

  return (
    <Backdrop glow={ad.id === "tickup" ? "#bbbbbb" : a.color} glow2={a.color}>
      <AbsoluteFill
        style={{
          transform: `translateX(${-exit * width * 0.9 + enter * width * 0.5}px) skewX(${(exit - enter) * -8}deg)`,
          filter: `blur(${(exit + enter) * 26}px)`,
          opacity: 1 - exit * 0.6,
        }}
      >
        {/* Shockwave of the app colour on the downbeat. */}
        {!quick && (
          <div
            style={{
              position: "absolute",
              left: width / 2 - 500,
              top: height / 2 - 500,
              width: 1000,
              height: 1000,
              borderRadius: 500,
              border: `${mix(ring, 40, 1)}px solid ${alpha(col, 0.5 * (1 - ring))}`,
              transform: `scale(${mix(ring, 0.1, 1.6)})`,
            }}
          />
        )}
        {/* Big centred title, then docked title. */}
        {dock < 1 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - dock, transform: `scale(${mix(dock, 1, 0.6)}) translateY(${mix(dock, 0, v ? -500 : -200)}px)`, filter: `blur(${dock * 10}px)` }}>
            {titleBig}
          </AbsoluteFill>
        )}
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            left: v ? 0 : 90,
            right: v ? 0 : undefined,
            top: v ? 170 : 90,
            display: "flex",
            justifyContent: v ? "center" : "flex-start",
            opacity: dock,
            transform: `translateY(${mix(dock, 30, 0)}px)`,
          }}
        >
          {titleSmall}
        </div>

        {/* The product. */}
        {!v && <div style={{ position: "absolute", zIndex: 19, left: 0, top: 0, bottom: 0, width: 720, opacity: dock, background: `linear-gradient(90deg, ${C.bg} 0%, ${alpha(C.bg, 0.85)} 55%, transparent)` }} />}
        {v && <div style={{ position: "absolute", zIndex: 19, left: 0, right: 0, top: 0, height: 470, opacity: dock, background: `linear-gradient(180deg, ${C.bg} 0%, ${alpha(C.bg, 0.85)} 60%, transparent)` }} />}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: MOCK_W,
            height: MOCK_H + 52,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty + mix(win, 500, 0)}px) scale(${s * mix(win, 0.85, 1)})`,
            opacity: win,
          }}
        >
          <div style={{ transform: `perspective(2400px) rotateX(${mix(win, 30, 0)}deg)`, transformOrigin: "50% 100%" }}>
            <Window width={MOCK_W} height={MOCK_H + 52} title={ad.title} accent={col}>
              <Mock f={f} />
            </Window>
          </div>
          {/* Cursor and chips live in mock coordinates (52 px of title bar above the mock). */}
          <div style={{ position: "absolute", left: 0, top: 52, width: MOCK_W, height: MOCK_H }}>
            <Cursor keys={ad.cursor} f={f} color={col} />
          </div>
        </div>
        {/* Chips in screen space, kept inside the frame. */}
        {ad.chips.map((c, i) => {
          const sx = tx + c.x * s * mix(win, 0.85, 1);
          const sy = ty + mix(win, 500, 0) + (52 + c.y) * s * mix(win, 0.85, 1);
          const margin = v ? 260 : 230;
          const x = Math.min(width - margin, Math.max(v ? margin : 640, sx));
          const y = Math.min(height - 90, Math.max(v ? 470 : 90, sy));
          return <ChipView key={i} chip={{ ...c, x, y }} f={f} color={col} scale={1} />;
        })}
      </AbsoluteFill>
      <SfxTrack events={[{ f: 0, kind: "impact" as SfxKind }, { f: intro - 12, kind: "whoosh" as SfxKind }, ...(quick ? [] : ad.sfx.map((e) => ({ ...e, f: e.f + intro })))].filter((e) => e.f < dur)} />
    </Backdrop>
  );
};
