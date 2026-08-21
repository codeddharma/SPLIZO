import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Splizo",
    short_name: "Splizo",
    description: "Household finance tracker",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0B1120",
    theme_color: "#0D9488",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
