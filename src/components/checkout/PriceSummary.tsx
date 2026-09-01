"use client";

import CheckoutCard from "./CheckoutCard";
import PrimaryButton from "./PrimaryButton";
import { formatINR } from "@/lib/format";
import type { CartTotals } from "@/@types/cart";

interface Props {
  totals: CartTotals;
  buttonText?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export default function PriceSummary({
  totals,
  buttonText,
  onAction,
  disabled,
}: Props) {
  return (
    <div className="sticky top-24">
      <CheckoutCard className="p-6">
        <h3 className="text-xl font-semibold">Price Summary</h3>

        <div className="mt-8 space-y-5">
          <div className="flex justify-between">
            <span>Cart total</span>
            <strong>{formatINR(totals.subtotal)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Shipping cost</span>
            <strong>
              {totals.shipping === 0 ? "FREE" : formatINR(totals.shipping)}
            </strong>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <strong className="text-green-600">
                −{formatINR(totals.discount)}
              </strong>
            </div>
          )}
        </div>

        <div className="my-6 border-t" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total Payable</span>
          <span>{formatINR(totals.total)}</span>
        </div>
      </CheckoutCard>

      {buttonText && (
        <PrimaryButton
          className="mt-6"
          onClick={onAction}
          disabled={disabled || totals.itemCount === 0}
        >
          {buttonText}
        </PrimaryButton>
      )}
    </div>
  );
}
