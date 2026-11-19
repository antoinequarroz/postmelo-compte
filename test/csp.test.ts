import { describe, expect, test } from "vitest";
import { contentSecurityPolicy, newNonce, toolOrigins } from "@/lib/csp";

const parse = (csp: string) => Object.fromEntries(csp.split("; ").map((d) => [d.split(" ")[0], d.split(" ").slice(1)]));

describe("Content-Security-Policy", () => {
  test("scripts need the nonce, nothing can frame or rebase the page", () => {
    const p = parse(contentSecurityPolicy("abc", { https: true }));
    expect(p["script-src"]).toEqual(["'self'", "'nonce-abc'", "'strict-dynamic'"]);
    expect(p["script-src"]).not.toContain("'unsafe-inline'");
    expect(p["script-src"]).not.toContain("'unsafe-eval'");
    expect(p["object-src"]).toEqual(["'none'"]);
    expect(p["base-uri"]).toEqual(["'none'"]);
    expect(p["frame-ancestors"]).toEqual(["'none'"]);
    expect(p["upgrade-insecure-requests"]).toEqual([]);
  });

  test("eval only in development, and no https upgrade on localhost", () => {
    const p = parse(contentSecurityPolicy("abc", { https: false, dev: true }));
    expect(p["script-src"]).toContain("'unsafe-eval'");
    expect(p["upgrade-insecure-requests"]).toBeUndefined();
  });

  test("forms may only go to this site, the tools switched on and Stripe", () => {
    const tools = toolOrigins({ CAIRN_URL: "https://cairn.exemple.ch/", LAMIO_URL: "pas une adresse", OTHER_URL: "https://x.ch" });
    expect(tools).toEqual(["https://cairn.exemple.ch"]);
    const p = parse(contentSecurityPolicy("abc", { https: true, formTargets: tools }));
    expect(p["form-action"]).toEqual(["'self'", "https://cairn.exemple.ch", "https://checkout.stripe.com", "https://billing.stripe.com"]);
  });

  test("each nonce is new and long enough", () => {
    const a = newNonce();
    expect(atob(a)).toHaveLength(16);
    expect(newNonce()).not.toBe(a);
  });
});
