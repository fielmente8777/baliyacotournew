import { ClipboardCheck, PackageCheck, Scissors, Sparkles, Truck, type LucideIcon } from 'lucide-react';

import type { StepIcon, TimelineItem as OrderTimelineItem } from '../orderView';

const ICONS: Record<StepIcon, LucideIcon> = {
  placed: ClipboardCheck,
  stitching: Scissors,
  embroidery: Sparkles,
  shipping: Truck,
  delivered: PackageCheck,
};

interface Props {
  items: OrderTimelineItem[];
  /** Drop the card background/shadow when the timeline sits inside another card. */
  bare?: boolean;
}

/**
 * Production timeline with an icon per step instead of 1-2-3.
 *
 * Phones: vertical list, icon on the left, label and date beside it.
 * Tablet and up: the horizontal row from the design, one column per step
 * (custom orders have five, Shopify ready-to-wear orders three).
 *
 * The connector line between steps turns maroon up to the current step and
 * animates in, so progress reads at a glance.
 */
export default function OrderTimeline({ items, bare = false }: Props) {
  return (
    <div className={bare ? '' : 'mt-5 border-[#9BA1B04D] box-shadow bg-[#FAFAFB] px-4 py-5 sm:px-4 sm:py-6'}>
      <ol
        className="flex flex-col gap-5 sm:grid sm:gap-0"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => {
          const isDone = item.status === 'completed';
          const isCurrent = item.status === 'current';
          const reached = isDone || isCurrent;
          const Icon = ICONS[item.icon];

          return (
            <li
              key={item.id}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex items-center gap-3 sm:flex-col sm:gap-0 sm:px-2 sm:text-center"
            >
              {/* Connector to the previous step: vertical on phones, horizontal from sm. */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={[
                    'absolute left-[19px] bottom-1/2 h-[calc(100%+1.25rem)] w-0.5 origin-bottom',
                    'sm:bottom-auto sm:left-auto sm:right-1/2 sm:top-[19px] sm:h-0.5 sm:w-full sm:origin-left',
                    'transition-colors duration-500',
                    reached ? 'bg-[#A52C45]' : 'bg-[#E2DDD5]',
                  ].join(' ')}
                />
              )}

              <span
                className={[
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500',
                  isDone
                    ? 'border-[#A52C45] bg-[#A52C45] text-white'
                    : isCurrent
                      ? 'border-[#A52C45] bg-white text-[#A52C45] shadow-[0_0_0_5px_rgba(165,44,69,0.12)]'
                      : 'border-[#DEDAD3] bg-white text-[#B5B0A8]',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
              </span>

              <div className="min-w-0 sm:mt-3">
                <p
                  className={[
                    'text-[13px] leading-tight',
                    reached ? 'font-medium text-[#222]' : 'text-[#9A9A9A]',
                  ].join(' ')}
                >
                  {item.title}
                  {isCurrent && <span className="sr-only"> (current step)</span>}
                </p>

                {/* Pending steps have no date in the design. */}
                {item.date && reached && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[#8A8A8A] sm:mt-1.5">
                    {item.date}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
