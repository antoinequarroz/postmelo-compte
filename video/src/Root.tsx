import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { AppAdScene, APP_LEN } from "./ad";
import { ADS } from "./apps";
import { AppId, APPS, C } from "./theme";
import "./theme";

const FPS = 30;

export type Part = { len: number; el: (len: number) => React.ReactNode };

/** Plays parts back to back (hard cuts on the beat; each scene handles its own transition). */
export const Timeline: React.FC<{ parts: Part[]; audio?: React.ReactNode }> = ({ parts, audio }) => {
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
      {audio}
    </AbsoluteFill>
  );
};

export const total = (parts: Part[]) => parts.reduce((s, p) => s + p.len, 0);

const ALL = APPS.map((a) => a.id);

// One composition per app, to work on a scene alone.
const appTests = ALL.flatMap((id: AppId, i) => [
  { id: `App-${id}`, parts: [{ len: APP_LEN, el: (l: number) => <AppAdScene ad={ADS[id]} index={i} dur={l} /> }], w: 1920, h: 1080 },
  { id: `AppV-${id}`, parts: [{ len: APP_LEN, el: (l: number) => <AppAdScene ad={ADS[id]} index={i} dur={l} /> }], w: 1080, h: 1920 },
]);

const comps = [...appTests];

export const Root: React.FC = () => (
  <>
    {comps.map((c) => (
      <Composition key={c.id} id={c.id} component={() => <Timeline parts={c.parts} />} durationInFrames={total(c.parts)} fps={FPS} width={c.w} height={c.h} />
    ))}
  </>
);
