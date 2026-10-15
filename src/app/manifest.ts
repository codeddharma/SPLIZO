import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Splizo",
    short_name: "Splizo",
    description: "Household finance tracker",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0B1120",
    theme_color: "#B45309",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard-wide.jpg",
        sizes: "800x500",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Splizo dashboard on desktop",
      },
      {
        src: "/screenshots/dashboard-narrow.jpg",
        sizes: "750x1624",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Splizo dashboard on mobile",
      },
    ],
  };
}
