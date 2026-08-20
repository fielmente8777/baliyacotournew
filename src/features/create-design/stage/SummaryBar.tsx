'use client';

/**
 * Cart total + the primary CTA. The CTA label and disabled state are
 * derived from the current step, matching Stensil-3/4:
 *   fabric/embroidery  → "Buy Now"
 *   option (list)      → "Add To Cart"
 *   option (new form)  → "Save and add to cart", disabled until saved
 */

import { formatINR } from '@/lib/format';
import { MOCK_BASE_PRICE } from '@/mocks/design.mock';
import { useAppSelector } from '@/store/hooks';

export default function SummaryBar() {
  const { step, subview, selectedProfileId } = useAppSelector((s) => s.createDesign);

  const isMeasurementForm =
    subview.kind === 'newMeasurement' || subview.kind === 'editMeasurement';

  const label = isMeasurementForm
    ? 'Save and add to cart'
    : step === 'option'
      ? 'Add To Cart'
      : 'Buy Now';

  const disabled = isMeasurementForm || (step === 'option' && !selectedProfileId);

  return (
    <div className="mt-8 md:mt-10">
      <p className="text-base text-dark/80">1 item in your cart</p>

      <p className="mt-1 text-3xl font-bold text-dark md:text-4xl lg:text-5xl">
        {formatINR(MOCK_BASE_PRICE)}
      </p>

      <button
        type="button"
        disabled={disabled}
        className="mt-6 h-12 w-full rounded-md bg-secondary text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-[#EDEDED] disabled:text-dark/40 sm:w-56 md:h-14"
      >
        {label}
      </button>
    </div>
  );
}
