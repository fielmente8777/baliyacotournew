'use client';

/**
 * The three styling icons. Vertical pill on desktop (inside the white
 * card, as in Stensil), horizontal scroll strip on mobile.
 */

import { Scissors } from 'lucide-react';
import { EmbroideryIcon, FabricIcon } from '@/utils/icon';
import { cn } from '@/lib/format';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setStep } from '@/store/features/createDesignSlice';
import type { StylingStep } from '@/@types/design';

const RAIL: Array<{ id: StylingStep; label: string; Icon: React.ComponentType }> = [
  { id: 'fabric', label: 'Fabric', Icon: FabricIcon },
  { id: 'embroidery', label: 'Embroidery', Icon: EmbroideryIcon },
  { id: 'option', label: 'Option', Icon: () => <Scissors size={22} /> },
];

export default function StylingRail() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.createDesign.step);

  return (
    <nav
      aria-label="Styling steps"
      className={cn(
        'flex shrink-0 items-center gap-3 rounded-full bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
        'flex-row overflow-x-auto md:flex-col md:gap-5 md:p-4'
      )}
    >
      <span className="hidden text-center text-sm font-semibold text-dark md:block">
        Styling
      </span>

      {RAIL.map(({ id, label, Icon }) => {
        const active = step === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => dispatch(setStep(id))}
            aria-current={active ? 'step' : undefined}
            className="flex shrink-0 flex-col items-center gap-1.5 focus:outline-none"
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border transition-colors md:h-14 md:w-14',
                active
                  ? 'border-secondary bg-[#FFF4F7] text-secondary'
                  : 'border-[#ECECEC] text-dark/70 hover:border-secondary/40'
              )}
            >
              <Icon />
            </span>
            <span className={cn('text-[11px] md:text-xs', active && 'text-secondary')}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
