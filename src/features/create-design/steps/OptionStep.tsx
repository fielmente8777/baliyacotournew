'use client';

/**
 * Renders one configured option group. The layout adapts to `inputType` rather
 * than to the group's name, so a new group added in the dashboard renders
 * correctly with no frontend change.
 */

import Image from 'next/image';
import { Check, Lock } from 'lucide-react';

import type { DesignGroup } from '@/@types/design';
import { OptionIllustration } from '@/components/illustrations/optionIllustrations';
import { designImageKey } from '@/lib/designImages';
import { cn, formatINR } from '@/lib/format';
import { useGetDesignImagesQuery } from '@/store/api/designApi';
import { LIVE } from '@/lib/liveUpdates';

interface Props {
  group: DesignGroup;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  /** Shown under the heading, e.g. "Designs that suit your Boat Neck". */
  note?: string;
  /** Shown instead of the grid when this step needs an earlier choice first. */
  blockedMessage?: string;
  /** The chosen colour — tints the drawings shown for options with no photo. */
  tint?: string;
}

const priceText = (paise: number) => (paise > 0 ? `+ ${formatINR(paise / 100)}` : 'Included');

/** A white tick on dark swatches, a dark one on light swatches. */
function isLight(hex?: string) {
  const m = hex?.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return true;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

export default function OptionStep({ group, selectedId, onSelect, note, blockedMessage, tint }: Props) {
  const isColour = group.inputType === 'color_select';
  const isSize = group.inputType === 'size_select';
  const { data: images = {} } = useGetDesignImagesQuery(undefined, LIVE);
  const selected = group.options.find((o) => o._id === selectedId);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-semibold text-dark md:text-3xl">{group.label}</h2>
            {!group.isRequired && (
              <span className="rounded-full bg-[#EFE8DE] px-2.5 py-0.5 text-[11px] font-medium text-[#8B6E54]">
                Optional
              </span>
            )}
          </div>
          {note && <p className="mt-1.5 text-sm text-[#8B6E54]">{note}</p>}
        </div>

        {selected && (
          <p key={selected._id} className="flex animate-fade-in items-center gap-1.5 text-sm text-dark/60">
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary text-white">
              <Check size={11} strokeWidth={3} aria-hidden />
            </span>
            <span className="font-medium text-dark">{selected.label}</span>
            {selected.priceModifier > 0 && <span className="text-[#8B6E54]">{priceText(selected.priceModifier)}</span>}
          </p>
        )}
      </div>

      {blockedMessage && (
        <div className="flex animate-fade-in items-start gap-3 rounded-2xl border border-dashed border-[#E2D8CB] bg-white p-5 text-sm text-[#6B6B6B]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-secondary">
            <Lock size={16} aria-hidden />
          </span>
          <p className="pt-2">{blockedMessage}</p>
        </div>
      )}

      {!blockedMessage && group.options.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-sm text-[#6B6B6B]">No options are configured for this step yet.</p>
      )}

      <div
        role="radiogroup"
        aria-label={group.label}
        className={cn(
          'grid',
          isColour && 'grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 xl:grid-cols-7',
          isSize && 'grid-cols-3 gap-2.5 sm:grid-cols-4 md:gap-3',
          !isColour && !isSize && 'grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 2xl:grid-cols-4'
        )}
      >
        {group.options.map((option) => {
          const active = selectedId === option._id;
          const image = images[designImageKey.option(group.code, option.value)] ?? option.image;

          /* Colours are round swatches with the name underneath. */
          if (isColour) {
            return (
              <button
                key={option._id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(option._id)}
                title={option.label}
                className="group flex flex-col items-center gap-2 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
              >
                <span
                  style={{ backgroundColor: option.hex }}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] ring-offset-[3px] ring-offset-[#FAF7F2] transition-all duration-200 md:h-14 md:w-14',
                    active ? 'scale-105 ring-2 ring-secondary' : 'group-hover:scale-105'
                  )}
                >
                  {active && (
                    <Check
                      size={20}
                      strokeWidth={3}
                      aria-hidden
                      className={cn('animate-pop-in', isLight(option.hex) ? 'text-dark' : 'text-white')}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    'line-clamp-2 text-center text-xs leading-tight',
                    active ? 'font-semibold text-secondary' : 'text-dark/70'
                  )}
                >
                  {option.label}
                </span>
                {option.priceModifier > 0 && (
                  <span className="-mt-1.5 text-[10px] text-[#8B6E54]">{priceText(option.priceModifier)}</span>
                )}
              </button>
            );
          }

          if (isSize) {
            return (
              <button
                key={option._id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(option._id)}
                className={cn(
                  'relative flex min-h-12 flex-col items-center justify-center rounded-xl border-2 bg-white px-2 py-2.5 text-sm transition-all',
                  active
                    ? 'border-secondary font-semibold text-secondary shadow-[0_6px_18px_rgba(155,44,64,0.12)]'
                    : 'border-transparent text-dark shadow-[0_1px_3px_rgba(27,43,54,0.06)] hover:border-secondary/30'
                )}
              >
                {option.label}
                {option.priceModifier > 0 && (
                  <span className="text-[11px] font-normal text-[#8B6E54]">{priceText(option.priceModifier)}</span>
                )}
              </button>
            );
          }

          return (
            <button
              key={option._id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(option._id)}
              /* flex-col + justify-start: a <button> centres its content
                 vertically, which left a gap above shorter cards. */
              className={cn(
                'group relative flex flex-col justify-start rounded-2xl border-2 bg-white p-1.5 text-left transition-all duration-200 md:p-2',
                active
                  ? 'border-secondary shadow-[0_10px_28px_rgba(155,44,64,0.14)]'
                  : 'border-transparent shadow-[0_1px_3px_rgba(27,43,54,0.06)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(27,43,54,0.08)]'
              )}
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F1EDE6]">
                {image ? (
                  <Image
                    src={image}
                    alt={option.label}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1536px) 260px, 220px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <OptionIllustration
                    groupCode={group.code}
                    value={option.value}
                    tint={tint}
                    className="absolute inset-0 h-full w-full p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                <span
                  aria-hidden
                  className={cn(
                    'absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
                    active
                      ? 'animate-pop-in bg-secondary text-white shadow-md'
                      : 'border-[1.5px] border-white/90 bg-black/10 opacity-0 backdrop-blur-sm group-hover:opacity-100'
                  )}
                >
                  {active && <Check size={14} strokeWidth={3} />}
                </span>
              </div>

              <div className="px-1.5 pb-1 pt-2.5 md:px-2 md:pt-3">
                <p className={cn('truncate text-sm font-medium', active ? 'text-secondary' : 'text-dark')}>
                  {option.label}
                </p>
                <p className={cn('mt-0.5 text-xs', option.priceModifier > 0 ? 'text-[#8B6E54]' : 'text-dark/40')}>
                  {priceText(option.priceModifier)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
