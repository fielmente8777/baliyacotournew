'use client';

/**
 * Additional tailoring instructions (§18). Free text, attached to the design
 * rather than to the product — "keep the neckline slightly less deep".
 */

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDesignName, setInstructions } from '@/store/features/createDesignSlice';

const MAX_LENGTH = 1000;

export default function InstructionsStep() {
  const dispatch = useAppDispatch();
  const { instructions, designName } = useAppSelector((s) => s.createDesign);

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-dark md:text-3xl">
        Anything else?
      </h2>

      <p className="mb-6 text-[#6B6B6B]">
        Tell our tailors about any adjustments you&apos;d like.
      </p>

      <input
        value={designName}
        onChange={(e) => dispatch(setDesignName(e.target.value))}
        placeholder="Name this design (optional)"
        maxLength={120}
        className="h-14 w-full rounded-lg bg-white px-4 text-dark outline-none ring-1 ring-transparent placeholder:text-dark/40 focus:ring-secondary"
      />

      <textarea
        value={instructions}
        onChange={(e) => dispatch(setInstructions(e.target.value.slice(0, MAX_LENGTH)))}
        placeholder="e.g. Please make the sleeves a little loose."
        rows={6}
        className="mt-4 w-full rounded-lg bg-white p-4 text-dark outline-none ring-1 ring-transparent placeholder:text-dark/40 focus:ring-secondary"
      />

      <p className="mt-2 text-right text-xs text-[#9A9A9A]">
        {instructions.length}/{MAX_LENGTH}
      </p>
    </div>
  );
}
