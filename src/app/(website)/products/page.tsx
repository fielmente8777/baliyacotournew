import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsView from "@/features/catalog/ProductsView";

export const metadata: Metadata = {
  title: "Shop All Designs | Baliye Couture",
  description:
    "Browse handcrafted ethnic wear: ready to buy, or customise to make it yours. Bestsellers, editor's picks and customisable designs.",
  alternates: { canonical: "/products" },
};

/** useSearchParams needs a Suspense boundary or the route opts out of static. */
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProductsView />
    </Suspense>
  );
}
