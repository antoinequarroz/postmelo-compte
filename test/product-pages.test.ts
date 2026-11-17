import { expect, test } from "vitest";
import { TRY } from "@/lib/demo-tips";
import { LOCALES } from "@/lib/i18n";
import { fallbackPage, PAGE_IDS, pageText, productPage } from "@/lib/product-pages";

const shape = (id: string, locale: (typeof LOCALES)[number]) => {
  const t = pageText(locale, id);
  return { features: t.features.length, uses: t.uses.length, links: t.links.map((l) => l.id), faq: t.faq.length };
};

test("every app page is written in French, English and German, with the same structure", () => {
  expect(PAGE_IDS.length).toBeGreaterThan(0);
  for (const id of PAGE_IDS) {
    for (const locale of LOCALES) {
      expect(pageText(locale, id), `${id} in ${locale}`).toBeTruthy();
      expect(shape(id, locale)).toEqual(shape(id, "fr"));
      expect(TRY[locale][id], `demo tip of ${id} in ${locale}`).toBeTruthy();
    }
    // German for Switzerland: never ß.
    expect(JSON.stringify(pageText("de", id))).not.toContain("ß");
  }
});

test("a page gets its icons and platforms, and an app without text gets one from the catalogue", () => {
  const lamio = productPage({ id: "lamio", name: "Lamio", tagline: "", category: "", description: "" }, "en");
  expect(lamio.title).toBe("Team messaging");
  expect(lamio.features.every((f) => typeof f.icon === "object" || typeof f.icon === "function")).toBe(true);
  expect(lamio.platforms).toBe("Web, macOS, iOS");

  const other = productPage({ id: "nouvelle", name: "Nouvelle", tagline: "Une app.", category: "Outil", description: "- Un\n- Deux" }, "de");
  expect(other).toEqual(fallbackPage({ name: "Nouvelle", tagline: "Une app.", category: "Outil", description: "- Un\n- Deux" }, "de"));
  expect(other.features.map((f) => f.title)).toEqual(["Un", "Deux"]);
  expect(other.faq[0].q).toBe("Wie kann ich Nouvelle testen?");
});
