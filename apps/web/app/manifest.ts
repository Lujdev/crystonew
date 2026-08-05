import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CrystoDolar",
    short_name: "CrystoDolar",
    description: "Tasas venezolanas en tiempo real",
    start_url: "/app",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
