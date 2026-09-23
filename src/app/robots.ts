import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/seo";

/**
 * Production: allow public pages, block private ones, point to the sitemap.
 * Everywhere else (localhost, ngrok, staging): block everything, so a test
 * URL never ends up in Google.
 */
export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/my-account",
          "/cart",
          "/shipping",
          "/order-success",
          "/login",
          "/studio",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
