'use client';

/**
 * Price breakdown under the garment preview.
 *
 * The Figma shows only a total; a configurator needs the adjustments visible
 * or the number looks arbitrary once options start adding to it. Collapsed by
 * default so the card still reads as the design.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { PriceBreakdown } from '@/@types/design';
import { cn, formatINR } from '@/lib/format';

interface Props {
  pricing: PriceBreakdown | null;
  basePrice: number;
}

export default function PriceSummary({ pricing, basePrice }: Props) {
  const [open, setOpen] = useState(false);
  const total = pricing?.total ?? basePrice;
  const adjustments = pricing?.adjustments ?? [];

  return (
    <div>
      <p className="text-base text-[#1B2B36]/70">Your price</p>

      <p className="mt-1 text-3xl font-bold text-[#1B2B36] md:text-4xl lg:text-5xl">
        {formatINR(total / 100)}
      </p>

      {adjustments.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-2 flex items-center gap-1 text-sm text-[#8B6E54]"
          >
            {adjustments.length} option{adjustments.length > 1 ? 's' : ''} added
            <ChevronDown
              size={15}
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </button>

          {open && (
            <dl className="mt-3 space-y-1.5 border-t border-[#EFEBE4] pt-3 text-sm">
              <div className="flex justify-between text-[#6B6B6B]">
                <dt>Base price</dt>
                <dd>{formatINR((pricing?.basePrice ?? basePrice) / 100)}</dd>
              </div>

              {adjustments.map((adjustment) => (
                <div key={adjustment.label} className="flex justify-between gap-4 text-[#6B6B6B]">
                  <dt className="truncate">{adjustment.label}</dt>
                  <dd className="shrink-0">+ {formatINR(adjustment.amount / 100)}</dd>
                </div>
              ))}

              <div className="flex justify-between border-t border-[#EFEBE4] pt-2 font-semibold text-[#1B2B36]">
                <dt>Total</dt>
                <dd>{formatINR(total / 100)}</dd>
              </div>
            </dl>
          )}
        </>
      )}
    </div>
  );
}
