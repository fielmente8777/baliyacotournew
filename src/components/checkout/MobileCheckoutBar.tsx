"use client";

import { ArrowRight } from "lucide-react";

import { formatINR } from "@/lib/format";

interface Props {
  /** Minor units. */
  total: number;
  buttonText: string;
  onAction: () => void;
  disabled?: boolean;
}

/**
 * Phones and tablets: the total and the next step stay pinned to the bottom
 * of the screen, so there's no scrolling past every item to continue. The
 * page adds bottom padding (pb-28 lg:pb-…) so nothing hides behind it.
 * Same bar as the product page's.
 */
export default function MobileCheckoutBar({ total, buttonText, onAction, disabled }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-[#EFE8DD] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#8A8A8A]">Total payable</p>
          <p key={total} className="animate-fade-in text-lg font-semibold leading-tight text-dark">
            {formatINR(total / 100)}
          </p>
        </div>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-secondary px-4 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="truncate">{buttonText}</span>
          {!disabled && <ArrowRight size={16} aria-hidden="true" className="shrink-0" />}
        </button>
      </div>
    </div>
  );
}
