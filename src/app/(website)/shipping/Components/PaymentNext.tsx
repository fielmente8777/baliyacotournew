import { Lock } from "lucide-react";

import CheckoutCard from "@/components/checkout/CheckoutCard";

/** The step after this one, shown muted so the customer knows what comes next. */
export default function PaymentNext() {
  return (
    <CheckoutCard className="flex items-center gap-3.5 px-5 py-4 sm:px-6 sm:py-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-[#8B6E54]">
        <Lock size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6E54]">Next</p>
        <h2 className="text-[15px] font-semibold text-dark">Payment</h2>
        <p className="text-[13px] text-[#6B6B6B]">You pay on Shopify&apos;s secure checkout page.</p>
      </div>
    </CheckoutCard>
  );
}
