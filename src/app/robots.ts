import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Not built yet, but reserved: authenticated areas should never be indexed.
      disallow: [
        "/tableau-de-bord",
        "/reserver",
        "/reservations",
        "/parametres",
        "/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
