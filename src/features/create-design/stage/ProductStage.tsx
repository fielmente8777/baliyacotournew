'use client';

/**
 * Left card: styling rail + garment preview + the mannequin toggle.
 * The toggle only appears while a measurement is being entered.
 */

import Image from 'next/image';
import { Ruler } from 'lucide-react';
import { PREVIEW_IMAGES } from '@/mocks/design.mock';
import { cn } from '@/lib/format';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleMannequin } from '@/store/features/createDesignSlice';
import MannequinView from './MannequinView';
import StylingRail from './StylingRail';
import SummaryBar from './SummaryBar';

export default function ProductStage() {
  const dispatch = useAppDispatch();
  const { subview, showMannequin } = useAppSelector((s) => s.createDesign);

  const canToggle = subview.kind === 'newMeasurement' || subview.kind === 'editMeasurement';

  return (
    <section className="relative flex flex-col rounded-2xl bg-white p-4 md:p-6 lg:p-8">
      {canToggle && (
        <button
          type="button"
          onClick={() => dispatch(toggleMannequin())}
          aria-pressed={showMannequin}
          className={cn(
            'absolute right-4 top-4 z-10 flex h-8 w-14 items-center rounded-full p-1 transition-colors',
            showMannequin ? 'justify-end bg-dark' : 'justify-start bg-[#EFEFEF]'
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <Ruler size={14} className="text-dark" />
          </span>
        </button>
      )}

      <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-start md:gap-4">
        <StylingRail />

        <div className="flex flex-1 items-center justify-center">
          {showMannequin && canToggle ? (
            <MannequinView />
          ) : (
            <div className="relative aspect-[3/5] w-full max-w-[420px]">
              <Image
                // src={PREVIEW_IMAGES.garment}§
                src={"/image-54.png"}
                alt="Your design preview"
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      </div>

      <SummaryBar />
    </section>
  );
}
