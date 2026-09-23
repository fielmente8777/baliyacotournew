import type { MetadataRoute } from "next";
import { SITE_URL, getAllProductHandles } from "@/lib/seo";

/** Rebuilt at most once an hour, so new Shopify products appear without a redeploy. */
export const revalidate = 3600;

/**
 * Only public, indexable pages. Account, cart, checkout, login and the
 * studio are deliberately left out (robots.ts also blocks them).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/create-your-own-design`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/terms-and-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const products = await getAllProductHandles();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
