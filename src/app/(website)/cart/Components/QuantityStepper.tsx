"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  quantity: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}

/** − 2 + in a pill. Never goes below 1; removing is its own button. */
export default function QuantityStepper({ quantity, disabled, onChange }: Props) {
  const button =
    "flex size-10 items-center justify-center rounded-full text-dark transition-colors hover:bg-[#F1EDE6] active:scale-90 disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div className="flex h-11 items-center rounded-full border border-[#E0D6C8] bg-white px-0.5" role="group" aria-label="Quantity">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        className={button}
      >
        <Minus size={14} />
      </button>

      <span key={quantity} className="w-7 animate-check-pop text-center text-sm font-semibold text-dark" aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
        className={button}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
