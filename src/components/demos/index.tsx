"use client";

import { AppMock } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { AlfredDemo } from "./alfred";
import { CairnDemo } from "./cairn";
import { LamioDemo } from "./lamio";
import { MayaDemo } from "./maya";
import { MetricoveDemo } from "./metricove";
import { NinoDemo } from "./nino";
import { TickUpDemo } from "./tickup";

const DEMOS: Record<string, (p: { color: string; locale: Locale }) => React.ReactElement> = {
  lamio: LamioDemo,
  cairn: CairnDemo,
  tickup: TickUpDemo,
  alfred: AlfredDemo,
  metricove: MetricoveDemo,
  nino: NinoDemo,
  maya: MayaDemo,
};

/** The apps that have a live demo. */
export const hasDemo = (id: string) => id in DEMOS;

/**
 * The live demo of an app: it plays by itself, then the visitor takes over and uses it.
 * An app added to the catalogue without a demo shows its still interface instead.
 */
export function LiveDemo({ id, name, color, locale = "fr" }: { id: string; name: string; color: string; locale?: Locale }) {
  const Demo = DEMOS[id];
  const c = color || "var(--ink)";
  return Demo ? <Demo color={c} locale={locale} /> : <AppMock id={id} name={name} color={c} on locale={locale} />;
}
