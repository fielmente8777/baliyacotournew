'use client';

/**
 * The step list. Replaces the fixed three-icon pill: a garment type can expose
 * any number of steps, so this scrolls and is built from the config.
 *
 * Steps ahead of the first incomplete required one are locked, which keeps the
 * customer from reaching Review with gaps.
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
  if (step.kind === 'instructions') return 'Instructions';
  return 'Review';
};

export default function StepRail({
  steps,
  activeIndex,
  isComplete,
  isReachable,
  onSelect,
}: Props) {
  return (
    <nav
      aria-label="Design steps"
      className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
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
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors lg:w-full',
              active && 'bg-white font-medium text-secondary shadow-sm',
              !active && reachable && 'text-dark/70 hover:text-secondary',
              !reachable && 'cursor-not-allowed text-dark/30'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]',
                done
                  ? 'border-secondary bg-secondary text-white'
                  : active
                    ? 'border-secondary text-secondary'
                    : 'border-[#D5D5D5] text-[#AFAFAF]'
              )}
            >
              {done ? <Check size={13} /> : index + 1}
            </span>

            <span className="whitespace-nowrap">{labelFor(step)}</span>
          </button>
        );
      })}
    </nav>
  );
}
