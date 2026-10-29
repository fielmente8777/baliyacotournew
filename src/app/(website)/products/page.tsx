import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsView from "@/features/catalog/ProductsView";
import { getSiteContent } from "@/lib/siteContent";
import { productsPageData } from "./pageData";

export const metadata: Metadata = {
  title: "Shop All Designs | Baliye Couture",
  description:
    "Browse handcrafted ethnic wear: ready to buy, or customise to make it yours. Bestsellers, editor's picks and customisable designs.",
  alternates: { canonical: "/products" },
};

/**
 * Words and banner pictures are edited in the admin panel (Admin → Pre-made
 * Designs page); pageData.ts holds the defaults.
 * useSearchParams needs a Suspense boundary or the route opts out of static.
 */
export default async function ProductsPage() {
  const content = await getSiteContent("products", productsPageData);

  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProductsView content={content} />
    </Suspense>
  );
}
