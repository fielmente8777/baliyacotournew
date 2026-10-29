'use client';

/**
 * Phones and tablets: the steps as a row of tabs pinned to the top of the
 * screen, so "where do I go next" is always in view while scrolling options.
 * Tapping a tab opens that step (the shell scrolls its options into view).
 * Desktop uses the vertical StepRail in the product card instead.
 */

import { useEffect, useRef } from 'react';
import { Check, Lock } from 'lucide-react';

import type { BuilderStep } from '@/@types/design';
import { StepIcon } from '@/components/icons/customizationIcons';
import { cn } from '@/lib/format';
import { labelFor } from './StepRail';

interface Props {
  steps: BuilderStep[];
  activeIndex: number;
  isComplete: (index: number) => boolean;
  isReachable: (index: number) => boolean;
  onSelect: (index: number) => void;
}

export default function StepTabs({ steps, activeIndex, isComplete, isReachable, onSelect }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const doneCount = steps.filter((_, i) => isComplete(i)).length;

  /* Keep the active tab centred. Scrolls the strip only, never the page. */
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !active) return;
    list.scrollTo({ left: active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
  }, [activeIndex]);

  return (
    <nav
      aria-label="Styling steps"
      className="sticky top-0 z-30 -mx-4 mb-4 border-b border-[#EFE8DE] bg-[#FAF7F2]/95 backdrop-blur md:-mx-6 lg:hidden"
    >
      <ol ref={listRef} className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-2.5 md:px-6">
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const done = isComplete(index);
          const reachable = isReachable(index);

          return (
            <li key={`${step.kind}-${index}`} className="shrink-0">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(index)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${labelFor(step)}${done ? ' (done)' : ''}${reachable ? '' : ' (locked)'}`}
                className={cn(
                  'flex h-9 items-center gap-1.5 rounded-full border pl-2 pr-3.5 text-[13px] transition-all duration-200',
                  active
                    ? 'border-secondary bg-secondary font-medium text-white shadow-[0_4px_12px_rgba(155,44,64,0.25)]'
                    : done
                      ? 'border-secondary/30 bg-white text-secondary'
                      : reachable
                        ? 'border-[#E6DED3] bg-white text-dark/75'
                        : 'border-transparent bg-[#F1ECE4] text-dark/35'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    active ? 'bg-white/20' : done ? 'bg-secondary text-white' : 'bg-[#F6F1EA]'
                  )}
                >
                  {done && !active ? (
                    <Check size={13} strokeWidth={3} aria-hidden />
                  ) : !reachable ? (
                    <Lock size={11} aria-hidden />
                  ) : (
                    <StepIcon kind={step.kind} code={step.kind === 'option' ? step.group.code : undefined} size={14} />
                  )}
                </span>
                {labelFor(step)}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Overall progress, under the tabs. */}
      <div className="h-0.5 bg-[#EFE8DE]">
        <div
          className="h-full bg-secondary transition-all duration-500"
          style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }}
        />
      </div>
    </nav>
  );
}
