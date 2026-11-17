import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { AppScene, Connect, Hub, Outro, Pivot, Problem, Title } from "./scenes";
import { AppId, APPS, C } from "./theme";
import "./theme";

const FPS = 30;

type Part = { len: number; el: (len: number) => React.ReactNode };

/** Plays parts one after the other, each overlapping the previous one by `overlap` frames. */
const Timeline: React.FC<{ parts: Part[]; overlap?: number }> = ({ parts, overlap = 8 }) => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {parts.map((p, i) => {
        const from = at;
        at += p.len - overlap;
        return (
          <Sequence key={i} from={from} durationInFrames={p.len} premountFor={30}>
            {p.el(p.len)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const total = (parts: Part[], overlap = 8) => parts.reduce((s, p) => s + p.len, 0) - overlap * (parts.length - 1);

const appParts = (ids: AppId[], len: number, opts: { mockStart?: number; compact?: boolean; numbered?: boolean } = {}): Part[] =>
  ids.map((id, i) => ({
    len,
    el: (l) => <AppScene id={id} dur={l} index={opts.numbered === false ? i : APPS.findIndex((a) => a.id === id)} mockStart={opts.mockStart} compact={opts.compact} total={opts.numbered === false ? ids.length : 7} />,
  }));

const ALL = APPS.map((a) => a.id);
const EQUIPE: AppId[] = ["lamio", "cairn", "tickup", "alfred"];
const MEDIA: AppId[] = ["metricove", "nino", "maya"];

// Site version, 16:9, ~75 s.
const presentation: Part[] = [
  { len: 220, el: (l) => <Problem dur={l} /> },
  { len: 130, el: (l) => <Pivot dur={l} /> },
  ...appParts(ALL, 186),
  { len: 300, el: (l) => <Connect dur={l} /> },
  { len: 240, el: (l) => <Hub dur={l} /> },
  { len: 140, el: (l) => <Outro dur={l} /> },
];

// Teaser, 9:16, ~20 s.
const teaser: Part[] = [
  { len: 110, el: (l) => <Problem dur={l} fast /> },
  { len: 80, el: (l) => <Pivot dur={l} /> },
  ...appParts(ALL, 54, { mockStart: 50, compact: true }),
  { len: 120, el: (l) => <Hub dur={l} /> },
  { len: 90, el: (l) => <Outro dur={l} /> },
];

// Team cut, 9:16, ~25 s.
const equipe: Part[] = [
  { len: 80, el: (l) => <Title dur={l} kicker="La suite Postmelo" title="Travailler" italic="ensemble." ids={EQUIPE} /> },
  ...appParts(EQUIPE, 140, { mockStart: 10, compact: true, numbered: false }),
  { len: 130, el: (l) => <Outro dur={l} line="Messagerie, notes, projets et agenda, avec un seul compte." /> },
];

// Media cut, 9:16, ~25 s.
const media: Part[] = [
  { len: 80, el: (l) => <Title dur={l} kicker="La suite Postmelo" title="Créer et" italic="diffuser." ids={MEDIA} /> },
  ...appParts(MEDIA, 150, { mockStart: 10, compact: true, numbered: false }),
  { len: 150, el: (l) => <Connect dur={l} /> },
  { len: 130, el: (l) => <Outro dur={l} line="Contenu, vidéo et direct, avec un seul compte." /> },
];

const comps = [
  { id: "Presentation", parts: presentation, w: 1920, h: 1080 },
  { id: "Teaser", parts: teaser, w: 1080, h: 1920 },
  { id: "Equipe", parts: equipe, w: 1080, h: 1920 },
  { id: "Media", parts: media, w: 1080, h: 1920 },
];

export const Root: React.FC = () => (
  <>
    {comps.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={() => <Timeline parts={c.parts} />}
        durationInFrames={total(c.parts)}
        fps={FPS}
        width={c.w}
        height={c.h}
      />
    ))}
  </>
);
