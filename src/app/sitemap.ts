import type { MetadataRoute } from "next";
import { getCachedLocations } from "@/lib/data/locations";
import { SITE_URL } from "@/lib/site-config";

// Built on request, not frozen at build time: the list of locations comes
// from the database, which is not reachable while the Docker image is built
// (and a sitemap frozen at build would miss locations added afterwards).
// Still cheap: `getCachedLocations` is served from the data cache.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/fonctionnalites", "/tarifs", "/lieux", "/faq"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const locations = await getCachedLocations();
  const locationRoutes = locations.map((location) => ({
    url: `${SITE_URL}/lieux/${location.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...locationRoutes];
}
