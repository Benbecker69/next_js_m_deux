import type { MetadataRoute } from "next";
import { listLocations } from "@/lib/data/locations";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/fonctionnalites", "/tarifs", "/lieux", "/faq"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const locations = await listLocations();
  const locationRoutes = locations.map((location) => ({
    url: `${SITE_URL}/lieux/${location.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...locationRoutes];
}
