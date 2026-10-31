"use client";

import type { ReactNode } from "react";
import { ArrowRight, Lock } from "lucide-react";

import CheckoutCard from "./CheckoutCard";
import PrimaryButton from "./PrimaryButton";
import { Eyebrow } from "@/app/(website)/Home/Components/ui";
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      {children}
    </div>
  );
}

export default function PriceSummary({
  totals,
  buttonText,
  onAction,
  disabled,
  children,
}: Props) {
  const busy = disabled || totals.itemCount === 0;

  return (
    <div>
      <CheckoutCard className="overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#F1EBE2] px-5 py-4 sm:px-6">
          <Eyebrow>Order summary</Eyebrow>
          <span className="text-[13px] text-[#8A8A8A]">
            {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {children}

        <div className="space-y-3.5 px-5 py-5 text-sm text-[#555] sm:px-6">
          <Row label="Bag total">
            <span className="font-medium text-dark">{formatINR(totals.subtotal / 100)}</span>
          </Row>

          {totals.discount > 0 && (
            <Row label="Discount">
              <span className="font-medium text-[#4E6B3C]">−{formatINR(totals.discount / 100)}</span>
            </Row>
          )}

          <Row label="Shipping">
            {totals.shipping === 0 ? (
              <span className="rounded-sm bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#4E6B3C]">
                Free
              </span>
            ) : (
              <span className="font-medium text-dark">{formatINR(totals.shipping / 100)}</span>
            )}
          </Row>

          <div className="flex items-baseline justify-between border-t border-[#E8DFD3] pt-4 text-dark">
            <span className="text-[15px] font-semibold">Total payable</span>
            {/* Keyed on the amount so a quantity change fades the new figure in. */}
            <span key={totals.total} className="animate-fade-in text-2xl font-semibold">
              {formatINR(totals.total / 100)}
            </span>
          </div>
        </div>
      </CheckoutCard>

      {/* Desktop only: phones use the pinned MobileCheckoutBar. */}
      {buttonText && (
        <div className="mt-4 hidden lg:block">
          <PrimaryButton
            className="group min-h-14 shadow-[0_10px_24px_-12px_rgba(155,44,64,0.7)]"
            onClick={onAction}
            disabled={busy}
          >
            {buttonText}
            {!busy && <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />}
          </PrimaryButton>
        </div>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8A8A8A]">
        <Lock size={12} aria-hidden="true" />
        Secure checkout powered by Shopify
      </p>
    </div>
  );
}
