import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/app", "/historico", "/docs"].map((path) => ({
    url: `https://crystodolar.app${path}`,
    lastModified: new Date(),
  }));
}
