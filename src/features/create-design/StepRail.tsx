'use client';

/**
 * The styling rail from Stensil — a white pill of circular icons inside the
 * product card, rather than a sidebar list.
 *
 * The Figma shows three fixed icons; a garment type can expose eight or more
 * steps, so this scrolls vertically while keeping the same shape. Steps ahead
 * of the first incomplete required one are locked, which stops anyone reaching
 * Review with gaps.
 */

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import type { BuilderStep } from '@/@types/design';
import { StepIcon } from '@/components/icons/customizationIcons';
import { cn } from '@/lib/format';

interface Props {
  steps: BuilderStep[];
  activeIndex: number;
  isComplete: (index: number) => boolean;
  isReachable: (index: number) => boolean;
  onSelect: (index: number) => void;
}

const labelFor = (step: BuilderStep) => {
  if (step.kind === 'option') return step.group.label;
  if (step.kind === 'measurement') return 'Measurements';
  if (step.kind === 'instructions') return 'Notes';
  return 'Review';
};

export default function StepRail({
  steps,
  activeIndex,
  isComplete,
  isReachable,
  onSelect,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null);

  /* Keep the active step in view when the rail scrolls (sideways on phones,
     up and down from tablet up). */
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !active) return;

    /* Scrolls the rail itself, never the page (scrollIntoView would jump
       the whole window to the rail on load). */
    if (rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
    } else if (rail.scrollHeight > rail.clientHeight) {
      rail.scrollTo({ top: active.offsetTop - rail.clientHeight / 2 + active.clientHeight / 2, behavior: 'smooth' });
    }
  }, [activeIndex]);

  return (
    <nav aria-label="Styling steps" className="shrink-0">
      <p className="mb-2 hidden text-center text-sm font-semibold text-[#1B2B36] md:block">
        Styling
      </p>

      <div
        ref={railRef}
        className={cn(
          'relative flex gap-4 rounded-full bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
          'flex-row overflow-x-auto md:max-h-[520px] md:flex-col md:overflow-y-auto md:overflow-x-visible'
        )}
      >
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const done = isComplete(index);
          const reachable = isReachable(index);

          return (
            <button
              key={`${step.kind}-${index}`}
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(index)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${labelFor(step)}${done ? ' (done)' : ''}`}
              className="group flex shrink-0 flex-col items-center gap-1.5 focus:outline-none disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300',
                  active
                    ? 'scale-110 border-secondary bg-[#FFF4F7] text-secondary shadow-[0_0_0_4px_rgba(155,44,64,0.10)]'
                    : done
                      ? 'border-secondary bg-secondary text-white'
                      : reachable
                        ? 'border-[#ECECEC] text-[#1B2B36]/70 group-hover:border-secondary/40 group-hover:text-secondary'
                        : 'border-[#F0F0F0] text-[#CFCFCF]'
                )}
              >
                <StepIcon
                  kind={step.kind}
                  code={step.kind === 'option' ? step.group.code : undefined}
                  size={20}
                />

                {/* Done steps keep their icon and gain a small tick badge. */}
                {done && !active && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-pop-in items-center justify-center rounded-full border-2 border-white bg-[#4C7A4E] text-white">
                    <Check size={9} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </span>

              <span
                className={cn(
                  'max-w-[72px] truncate text-[10px] leading-tight',
                  active ? 'text-secondary' : 'text-[#1B2B36]/60'
                )}
              >
                {labelFor(step)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
