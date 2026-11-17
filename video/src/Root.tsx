import React from "react";
import { AbsoluteFill, Audio, Composition, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { AppAdScene, APP_LEN, BAR } from "./ad";
import { ADS } from "./apps";
import { Cta, Flow, Hub, SectionTitle } from "./finale";
import { Hook, Reveal } from "./opening";
import { AppId, APPS, C } from "./theme";
import "./theme";

const FPS = 30;

export type Part = { len: number; el: (len: number) => React.ReactNode };

const MusicBed: React.FC<{ src: string }> = ({ src }) => {
  const { durationInFrames } = useVideoConfig();
  return <Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 6, durationInFrames - 30, durationInFrames], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />;
};

/** Plays parts back to back, cut on the beat: each scene handles its own transition. */
export const Timeline: React.FC<{ parts: Part[]; music?: string }> = ({ parts, music }) => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {parts.map((p, i) => {
        const from = at;
        at += p.len;
        return (
          <Sequence key={i} from={from} durationInFrames={p.len} premountFor={30}>
            {p.el(p.len)}
          </Sequence>
        );
      })}
      {music && <MusicBed src={music} />}
    </AbsoluteFill>
  );
};

export const total = (parts: Part[]) => parts.reduce((s, p) => s + p.len, 0);

const ALL = APPS.map((a) => a.id);
const EQUIPE: AppId[] = ["lamio", "cairn", "tickup", "alfred"];
const MEDIA: AppId[] = ["metricove", "nino", "maya"];
const idx = (id: AppId) => ALL.indexOf(id);

const apps = (ids: AppId[], opts: { quick?: boolean; local?: boolean } = {}): Part[] =>
  ids.map((id, i) => ({
    len: opts.quick ? BAR : APP_LEN,
    el: (l) => <AppAdScene ad={ADS[id]} index={opts.local ? i : idx(id)} total={opts.local ? ids.length : 7} dur={l} quick={opts.quick} />,
  }));

// Site and YouTube, 16:9, 36 bars = 72 s.
const presentation: Part[] = [
  { len: 3 * BAR, el: (l) => <Hook dur={l} /> },
  { len: 3 * BAR, el: (l) => <Reveal dur={l} /> },
  ...apps(ALL),
  { len: 3 * BAR, el: (l) => <Flow dur={l} /> },
  { len: 3 * BAR, el: (l) => <Hub dur={l} /> },
  { len: 3 * BAR, el: (l) => <Cta dur={l} /> },
];

// Reels / TikTok / Shorts, 9:16, 14 bars = 28 s.
const teaser: Part[] = [
  { len: 2 * BAR, el: (l) => <Hook dur={l} fast /> },
  { len: 2 * BAR, el: (l) => <Reveal dur={l} /> },
  ...apps(ALL, { quick: true }),
  { len: 3 * BAR, el: (l) => <Cta dur={l} /> },
];

// Team cut, 9:16, 16 bars = 32 s.
const equipe: Part[] = [
  { len: BAR, el: (l) => <SectionTitle dur={l} title="Travailler" italic="ensemble." ids={EQUIPE} /> },
  ...apps(EQUIPE, { local: true }),
  { len: 3 * BAR, el: (l) => <Cta dur={l} line="Messagerie, notes, projets, agenda. Un seul compte." /> },
];

// Media cut, 9:16, 16 bars = 32 s.
const media: Part[] = [
  { len: BAR, el: (l) => <SectionTitle dur={l} title="Créer et" italic="diffuser." ids={MEDIA} /> },
  ...apps(MEDIA, { local: true }),
  { len: 3 * BAR, el: (l) => <Flow dur={l} /> },
  { len: 3 * BAR, el: (l) => <Cta dur={l} line="Contenu, studio vidéo, direct. Un seul compte." /> },
];

const finals = [
  { id: "Presentation", parts: presentation, w: 1920, h: 1080, music: "music/ad.wav" },
  { id: "Teaser", parts: teaser, w: 1080, h: 1920, music: "music/teaser.wav" },
  { id: "Equipe", parts: equipe, w: 1080, h: 1920, music: "music/cut.wav" },
  { id: "Media", parts: media, w: 1080, h: 1920, music: "music/cut.wav" },
];

// One composition per app, to work on a scene alone (no music).
const appTests = ALL.flatMap((id: AppId, i) => [
  { id: `App-${id}`, parts: [{ len: APP_LEN, el: (l: number) => <AppAdScene ad={ADS[id]} index={i} dur={l} /> }], w: 1920, h: 1080, music: undefined },
  { id: `AppV-${id}`, parts: [{ len: APP_LEN, el: (l: number) => <AppAdScene ad={ADS[id]} index={i} dur={l} /> }], w: 1080, h: 1920, music: undefined },
]);

const comps = [...finals, ...appTests];

export const Root: React.FC = () => (
  <>
    {comps.map((c) => (
      <Composition key={c.id} id={c.id} component={() => <Timeline parts={c.parts} music={c.music} />} durationInFrames={total(c.parts)} fps={FPS} width={c.w} height={c.h} />
    ))}
  </>
);
