import type { MetadataRoute } from "next";
import { MARKETING_LOCATIONS } from "./(marketing)/lieux/_data";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/fonctionnalites", "/tarifs", "/lieux", "/faq"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const locationRoutes = MARKETING_LOCATIONS.map((location) => ({
    url: `${SITE_URL}/lieux/${location.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...locationRoutes];
}
