/** An app colour as text: a shade deeper on the paper, a shade lighter at night, so it stays readable at small sizes. */
export const readable = (c: string) => `light-dark(color-mix(in oklab, ${c} 78%, black), color-mix(in oklab, ${c} 72%, white))`;

/** The colour of an app, or the ink of the theme for an app without one (TickUp is black and white). */
export const appColor = (c: string | undefined) => c || "var(--ink)";
