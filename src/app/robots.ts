import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated areas should never be indexed (they are guarded on the
      // server anyway: a crawler would only be redirected to /connexion).
      disallow: [
        "/tableau-de-bord",
        "/reserver",
        "/reservations",
        "/arrivees",
        "/parametres",
        "/admin",
        "/qrcode",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
