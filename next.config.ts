import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // pdfjs-dist locates its worker script relative to its own file on disk at
  // runtime; Turbopack bundling relocates that code into a .next chunk
  // without the sibling worker file, breaking that lookup. Keep it
  // un-bundled so it resolves against the real node_modules path instead.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
