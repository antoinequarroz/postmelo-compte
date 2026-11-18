import type { AppAd } from "../ad";
import type { LongFeature } from "../long";
import { MOCK_TITLES } from "./titles";
import { AppId } from "../theme";
import * as lamio from "./lamio";
import * as cairn from "./cairn";
import * as tickup from "./tickup";
import * as alfred from "./alfred";
import * as metricove from "./metricove";
import * as nino from "./nino";
import * as maya from "./maya";

type Mod = { Mock: AppAd["Mock"]; ad?: AppAd; long?: LongFeature[] };

const fallback = (id: AppId, m: Mod): AppAd =>
  m.ad ?? { id, title: MOCK_TITLES[id], hook: "", Mock: m.Mock, cursor: [], chips: [], focus: [], sfx: [] };

const mods: Record<AppId, Mod> = { lamio, cairn, tickup, alfred, metricove, nino, maya } as unknown as Record<AppId, Mod>;

export const ADS: Record<AppId, AppAd> = Object.fromEntries(Object.entries(mods).map(([id, m]) => [id, fallback(id as AppId, m)])) as Record<AppId, AppAd>;

/** Features of each app's long video (empty until the app defines them). */
export const LONG: Record<AppId, LongFeature[]> = Object.fromEntries(Object.entries(mods).map(([id, m]) => [id, m.long ?? []])) as Record<AppId, LongFeature[]>;
