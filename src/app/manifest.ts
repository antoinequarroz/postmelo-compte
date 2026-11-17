import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

// Lets the account be added to the home screen. Installed icons use the dark variant, as the identity kit asks.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Compte",
    description: APP_TAGLINE,
    start_url: "/compte",
    display: "standalone",
    background_color: "#efede8",
    theme_color: "#efede8",
    icons: [
      { src: "/_compte/brand/compte/app-dark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/_compte/brand/compte/app-dark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/_compte/brand/compte/maskable-dark-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/_compte/brand/compte/maskable-dark-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
