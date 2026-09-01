import { Suspense } from "react";
import type { Metadata } from "next";
import OrderSuccessView from "@/features/checkout/OrderSuccessView";

export const metadata: Metadata = {
  title: "Order Placed | Baliye Couture",
};

/** useSearchParams needs a Suspense boundary or the whole route goes dynamic. */
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6EF]" />}>
      <OrderSuccessView />
    </Suspense>
  );
}
