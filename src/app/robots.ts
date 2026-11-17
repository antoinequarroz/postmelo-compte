import type { MetadataRoute } from "next";
import { publicOrigin } from "@/server/feeds";

export const dynamic = "force-dynamic";

/** The public pages are open to search engines; sign-in, account and admin are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/compte", "/connexion", "/autoriser", "/refus", "/api/"] },
    sitemap: `${publicOrigin()}/sitemap.xml`,
  };
}
