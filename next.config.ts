import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // pdfjs-dist locates its worker script relative to its own file on disk at
  // runtime; Turbopack bundling relocates that code into a .next chunk
  // without the sibling worker file, breaking that lookup. Keep it
  // un-bundled so it resolves against the real node_modules path instead.
  serverExternalPackages: ["pdfjs-dist"],
  async headers() {
    return [
      {
        // Browsers/CDNs must always re-fetch sw.js itself, or an update can
        // get stuck serving a stale service worker indefinitely.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
