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

import { Check } from 'lucide-react';
import type { BuilderStep } from '@/@types/design';
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

/** Two or three characters that read as an icon at 14px. */
const glyphFor = (step: BuilderStep, index: number) => {
  if (step.kind === 'measurement') return '⌗';
  if (step.kind === 'instructions') return '✎';
  if (step.kind === 'review') return '✓';
  return String(index + 1);
};

export default function StepRail({
  steps,
  activeIndex,
  isComplete,
  isReachable,
  onSelect,
}: Props) {
  return (
    <nav aria-label="Styling steps" className="shrink-0">
      <p className="mb-2 hidden text-center text-sm font-semibold text-[#1B2B36] md:block">
        Styling
      </p>

      <div
        className={cn(
          'flex gap-4 rounded-full bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
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
              className="flex shrink-0 flex-col items-center gap-1.5 focus:outline-none disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border text-sm transition-colors',
                  active
                    ? 'border-secondary bg-[#FFF4F7] text-secondary'
                    : done
                      ? 'border-secondary bg-secondary text-white'
                      : reachable
                        ? 'border-[#ECECEC] text-[#1B2B36]/70 hover:border-secondary/40'
                        : 'border-[#F0F0F0] text-[#CFCFCF]'
                )}
              >
                {done && !active ? <Check size={15} /> : glyphFor(step, index)}
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
