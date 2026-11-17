import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image.
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // The landing page is also served on postmelo.ch, next to another Next.js app (Postmelo Studio):
  // a prefix of our own keeps our /_next files from colliding with its files there.
  assetPrefix: "/_compte",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // A sign-in page: never inside someone else's page, never leaking its URLs.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
