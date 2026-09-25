'use client';

/**
 * Review Design (§28) — the last screen before Add to Cart. Every choice with
 * its price contribution, so the total is never a surprise.
 */

import type { DesignGroup, PriceBreakdown } from '@/@types/design';
import { formatINR } from '@/lib/format';

interface Props {
  groups: DesignGroup[];
  selections: Record<string, string>;
  pricing: PriceBreakdown | null;
  measurementName?: string;
  instructions?: string;
  onEditStep: (index: number) => void;
}

export default function ReviewStep({
  groups,
  selections,
  pricing,
  measurementName,
  instructions,
  onEditStep,
}: Props) {
  /* `index` is the group's position among the visible steps, taken before
     dropping unselected ones, so "Change" opens the right step even when an
     optional step earlier on was skipped. */
  const chosen = groups
    .filter((g) => g.isVisible)
    .map((group, index) => {
      const option = group.options.find((o) => o._id === selections[group._id]);
      return { group, option, index };
    })
    .filter((row) => row.option);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-dark md:mb-8 md:text-3xl">
        Review your design
      </h2>

      <div className="divide-y divide-[#EFEBE4] rounded-2xl bg-white">
        {chosen.map(({ group, option, index }) => (
          <div key={group._id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#9A9A9A]">
                {group.label}
              </p>
              <p className="mt-0.5 text-dark">{option!.label}</p>
            </div>

            <div className="flex items-center gap-4">
              {option!.priceModifier > 0 && (
                <span className="text-sm text-[#8B6E54]">
                  + {formatINR(option!.priceModifier / 100)}
                </span>
              )}

              <button
                type="button"
                onClick={() => onEditStep(index)}
                className="text-sm font-medium text-secondary"
              >
                Change
              </button>
            </div>
          </div>
        ))}

        {measurementName && (
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#9A9A9A]">
              Measurements
            </p>
            <p className="mt-0.5 text-dark">{measurementName}</p>
          </div>
        )}

        {instructions && (
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#9A9A9A]">
              Your instructions
            </p>
            <p className="mt-0.5 whitespace-pre-line text-dark">{instructions}</p>
          </div>
        )}
      </div>

      {pricing && (
        <div className="mt-6 rounded-2xl bg-white p-5">
          <div className="flex justify-between text-sm text-[#6B6B6B]">
            <span>Base price</span>
            <span>{formatINR(pricing.basePrice / 100)}</span>
          </div>

          {pricing.adjustments.map((adjustment) => (
            <div
              key={adjustment.label}
              className="mt-2 flex justify-between text-sm text-[#6B6B6B]"
            >
              <span>{adjustment.label}</span>
              <span>+ {formatINR(adjustment.amount / 100)}</span>
            </div>
          ))}

          <div className="mt-4 flex justify-between border-t border-[#EFEBE4] pt-4 text-lg font-semibold text-dark">
            <span>Total</span>
            <span>{formatINR(pricing.total / 100)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
