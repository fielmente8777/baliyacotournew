"use client";

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
 * page adds bottom padding (pb-28 lg:pb-12) so nothing hides behind it.
 */
export default function MobileCheckoutBar({ total, buttonText, onAction, disabled }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-[#EFE8DD] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
      <div className="container mx-auto flex items-center gap-4">
        <div className="min-w-0">
          <p key={total} className="animate-fade-in text-lg font-semibold leading-tight text-[#222]">
            {formatINR(total / 100)}
          </p>
          <p className="text-[11px] text-[#8A8A8A]">Total payable</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="h-12 flex-1 rounded-md bg-[#972E47] text-[15px] font-medium text-white transition hover:bg-[#84263d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
