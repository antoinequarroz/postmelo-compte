import type { MetadataRoute } from "next";
import { baseUrl } from "@/server/auth";
import { listProducts } from "@/server/crm";
import { siteUrl } from "@/server/http";

export const dynamic = "force-dynamic";

/** The public pages for search engines: the home page and the page of each app of the catalogue. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl() ?? baseUrl();
  return [
    { url: site, changeFrequency: "weekly", priority: 1 },
    ...listProducts(true).map((p) => ({ url: `${site}/${p.id}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
