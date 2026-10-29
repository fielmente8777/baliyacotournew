'use client';

/**
 * The styling rail inside the product card: a vertical stepper of icon
 * circles joined by a progress line. Desktop only — phones and tablets get
 * the sticky StepTabs instead.
 *
 * A garment type can expose eleven or more steps, so the list scrolls inside
 * a fixed height; fades and arrow buttons show there is more above or below
 * instead of a scrollbar. Steps ahead of the first incomplete required one
 * are locked, which stops anyone reaching Review with gaps.
 */

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Lock } from 'lucide-react';
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

export const labelFor = (step: BuilderStep) => {
  if (step.kind === 'option') return step.group.label;
  if (step.kind === 'measurement') return 'Measurements';
  if (step.kind === 'instructions') return 'Notes';
  return 'Review';
};

/** How far one arrow click scrolls: about three steps. */
const SCROLL_STEP = 200;

export default function StepRail({
  steps,
  activeIndex,
  isComplete,
  isReachable,
  onSelect,
}: Props) {
  const railRef = useRef<HTMLOListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const doneCount = steps.filter((_, i) => isComplete(i)).length;

  /* Which ends have more to scroll to — drives the fades and arrows. Measured
     in observer and scroll callbacks, never during render. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => {
      const vertical = rail.scrollHeight > rail.clientHeight + 1;
      const horizontal = rail.scrollWidth > rail.clientWidth + 1;
      setEdges({
        start: vertical ? rail.scrollTop > 4 : horizontal && rail.scrollLeft > 4,
        end: vertical
          ? rail.scrollTop + rail.clientHeight < rail.scrollHeight - 4
          : horizontal && rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    rail.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      rail.removeEventListener('scroll', measure);
    };
  }, [steps.length]);

  /* Keep the active step in view. Scrolls the rail itself, never the page
     (scrollIntoView would jump the whole window to the rail on load). */
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !active) return;

    if (rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
    } else if (rail.scrollHeight > rail.clientHeight) {
      rail.scrollTo({ top: active.offsetTop - rail.clientHeight / 2 + active.clientHeight / 2, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    if (rail.scrollHeight > rail.clientHeight) rail.scrollBy({ top: direction * SCROLL_STEP, behavior: 'smooth' });
    else rail.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  };

  /* Fade whichever end has more steps hidden behind it. */
  const fade = (dir: 'bottom' | 'right') =>
    `linear-gradient(to ${dir}, ${edges.start ? 'transparent' : '#000'} 0, #000 28px, #000 calc(100% - 28px), ${edges.end ? 'transparent' : '#000'} 100%)`;

  return (
    <nav aria-label="Styling steps" className="w-full min-w-0 shrink-0 md:w-[96px]">
      <div className="mb-3 hidden md:block">
        <p className="text-center text-sm font-semibold text-dark">Styling</p>
        <p className="mt-0.5 text-center text-[11px] text-[#8A8A8A]">
          {doneCount} of {steps.length} done
        </p>
        <div className="mx-auto mt-1.5 h-1 w-14 overflow-hidden rounded-full bg-[#EFE8DE]">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="relative rounded-2xl bg-[#FAF7F2] p-1.5">
        <ArrowButton direction="up" visible={edges.start} onClick={() => scrollBy(-1)} />

        <ol
          ref={railRef}
          className={cn(
            'scrollbar-none flex flex-row overflow-x-auto px-1 py-2',
            'md:max-h-[468px] md:flex-col md:items-center md:overflow-y-auto md:overflow-x-hidden md:px-0',
            /* Sideways strip on phones, vertical list from tablet up. */
            '[mask-image:var(--fade-h)] md:[mask-image:var(--fade-v)]'
          )}
          style={{ '--fade-h': fade('right'), '--fade-v': fade('bottom') } as React.CSSProperties}
        >
          {steps.map((step, index) => {
            const active = index === activeIndex;
            const done = isComplete(index);
            const reachable = isReachable(index);
            const last = index === steps.length - 1;

            return (
              <li key={`${step.kind}-${index}`} className="flex shrink-0 flex-row items-start md:flex-col md:items-center">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => onSelect(index)}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${labelFor(step)}${done ? ' (done)' : ''}${reachable ? '' : ' (locked)'}`}
                  title={reachable ? labelFor(step) : 'Finish the earlier steps first'}
                  className="group flex w-[72px] flex-col items-center gap-1.5 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      'relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300',
                      active
                        ? 'border-secondary bg-secondary text-white shadow-[0_0_0_5px_rgba(155,44,64,0.14)]'
                        : done
                          ? 'border-secondary/50 bg-white text-secondary'
                          : reachable
                            ? 'border-[#E6DED3] bg-white text-dark/70 group-hover:border-secondary/50 group-hover:text-secondary'
                            : 'border-transparent bg-[#F1ECE4] text-[#C4BBAE]'
                    )}
                  >
                    <StepIcon
                      kind={step.kind}
                      code={step.kind === 'option' ? step.group.code : undefined}
                      size={20}
                    />

                    {done && !active && (
                      <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] animate-pop-in items-center justify-center rounded-full border-2 border-white bg-[#4C7A4E] text-white">
                        <Check size={10} strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                    {!reachable && (
                      <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#D8D0C4] text-white">
                        <Lock size={9} strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      'line-clamp-2 w-full text-center text-[11px] leading-[1.2]',
                      active
                        ? 'font-semibold text-secondary'
                        : reachable
                          ? 'text-dark/75'
                          : 'text-dark/35'
                    )}
                  >
                    {labelFor(step)}
                  </span>
                </button>

                {/* Connector to the next step: filled once this one is done. */}
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      'mt-[22px] h-0.5 w-3 shrink-0 rounded-full transition-colors md:mt-0 md:mb-1 md:h-4 md:w-0.5',
                      done ? 'bg-secondary/60' : 'bg-[#E6DED3]'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <ArrowButton direction="down" visible={edges.end} onClick={() => scrollBy(1)} />
      </div>
    </nav>
  );
}

function ArrowButton({
  direction,
  visible,
  onClick,
}: {
  direction: 'up' | 'down';
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-hidden
      className={cn(
        'absolute left-1/2 z-10 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-opacity md:flex',
        direction === 'up' ? '-top-3' : '-bottom-3',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <Icon size={14} strokeWidth={2.5} />
    </button>
  );
}
