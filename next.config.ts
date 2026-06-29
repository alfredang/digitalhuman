import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for a small Docker image (Coolify).
  output: "standalone",
  async headers() {
    return [
      {
        // Allow the chat widget to be embedded as an iframe on any website.
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        source: "/embed.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
