"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import CheckoutCard from "./CheckoutCard";
import PrimaryButton from "./PrimaryButton";
import { formatINR } from "@/lib/format";
import type { CartTotals } from "@/@types/cart";

interface Props {
  totals: CartTotals;
  buttonText?: string;
  onAction?: () => void;
  disabled?: boolean;
  /** Extra content inside the card, above the figures (e.g. the items being bought). */
  children?: ReactNode;
}

export default function PriceSummary({
  totals,
  buttonText,
  onAction,
  disabled,
  children,
}: Props) {
  return (
    <div>
      <CheckoutCard className="overflow-hidden">
        <h3 className="border-b border-[#F2EEE8] px-5 py-4 text-base font-semibold uppercase tracking-wide text-[#333]">
          Price Details{" "}
          <span className="font-normal normal-case tracking-normal text-[#8A8A8A]">
            ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})
          </span>
        </h3>

        {children}

        <div className="space-y-3.5 px-5 py-5 text-sm text-[#555]">
          <div className="flex justify-between">
            <span>Bag total</span>
            <span className="font-medium text-[#222]">{formatINR(totals.subtotal / 100)}</span>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-medium text-[#4E6B3C]">−{formatINR(totals.discount / 100)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            {totals.shipping === 0 ? (
              <span className="font-semibold text-[#4E6B3C]">FREE</span>
            ) : (
              <span className="font-medium text-[#222]">{formatINR(totals.shipping / 100)}</span>
            )}
          </div>

          <div className="flex items-baseline justify-between border-t border-dashed border-[#E4DED4] pt-4 text-base font-semibold text-[#222]">
            <span>Total Payable</span>
            {/* Keyed on the amount so a quantity change fades the new figure in. */}
            <span key={totals.total} className="animate-fade-in text-lg">
              {formatINR(totals.total / 100)}
            </span>
          </div>
        </div>
      </CheckoutCard>

      {buttonText && (
        <PrimaryButton
          className="mt-4 hidden h-12 text-[15px] shadow-[0_8px_20px_-10px_rgba(151,46,71,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 lg:block"
          onClick={onAction}
          disabled={disabled || totals.itemCount === 0}
        >
          {buttonText}
        </PrimaryButton>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8A8A8A]">
        <Lock size={12} aria-hidden="true" />
        Secure checkout powered by Shopify
      </p>
    </div>
  );
}
