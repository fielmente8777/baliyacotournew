import { Suspense } from "react";
import type { Metadata } from "next";
import CollectionsView from "@/features/catalog/CollectionsView";

export const metadata: Metadata = {
  title: "Pre-designed Collections | Baliye Couture",
  description:
    "Browse handcrafted ethnic wear — ready to buy, or customise to make it yours.",
};

/** useSearchParams needs a Suspense boundary or the route opts out of static. */
export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CollectionsView />
    </Suspense>
  );
}
