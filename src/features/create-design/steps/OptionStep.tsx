'use client';

/**
 * Renders one configured option group. The layout adapts to `inputType` rather
 * than to the group's name, so a new group added in the dashboard renders
 * correctly with no frontend change.
 */

import Image from 'next/image';

import type { DesignGroup } from '@/@types/design';
import { cn, formatINR } from '@/lib/format';

interface Props {
  group: DesignGroup;
  selectedId?: string;
  onSelect: (optionId: string) => void;
}

export default function OptionStep({ group, selectedId, onSelect }: Props) {
  const isColour = group.inputType === 'color_select';
  const isSize = group.inputType === 'size_select';

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3 md:mb-8">
        <h2 className="text-2xl font-semibold text-dark md:text-3xl">{group.label}</h2>

        {!group.isRequired && (
          <span className="text-sm text-[#9A9A9A]">Optional</span>
        )}
      </div>

      {group.options.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-[#6B6B6B]">
          No options are configured for this step yet.
        </p>
      )}

      <div
        className={cn(
          'grid gap-4 md:gap-6',
          isColour && 'grid-cols-4 sm:grid-cols-6',
          isSize && 'grid-cols-3 sm:grid-cols-4',
          !isColour && !isSize && 'grid-cols-2 sm:grid-cols-3'
        )}
      >
        {group.options.map((option) => {
          const active = selectedId === option._id;

          /* Colour swatches are square chips; everything else is a card. */
          if (isColour) {
            return (
              <button
                key={option._id}
                type="button"
                onClick={() => onSelect(option._id)}
                aria-pressed={active}
                title={option.label}
                className="flex flex-col items-center gap-2"
              >
                <span
                  style={{ backgroundColor: option.hex }}
                  className={cn(
                    'block h-14 w-14 rounded-full ring-offset-2 transition-all',
                    active ? 'ring-2 ring-secondary' : 'ring-1 ring-[#E4E4E4]'
                  )}
                />
                <span className="text-xs text-dark/70">{option.label}</span>
              </button>
            );
          }

          if (isSize) {
            return (
              <button
                key={option._id}
                type="button"
                onClick={() => onSelect(option._id)}
                aria-pressed={active}
                className={cn(
                  'rounded-lg border py-3 text-sm transition-colors',
                  active
                    ? 'border-secondary bg-secondary/5 font-medium text-secondary'
                    : 'border-[#E4E4E4] bg-white text-dark hover:border-secondary/40'
                )}
              >
                {option.label}
              </button>
            );
          }

          return (
            <button
              key={option._id}
              type="button"
              onClick={() => onSelect(option._id)}
              aria-pressed={active}
              className={cn(
                'group overflow-hidden rounded-xl bg-white text-left transition-all',
                active && 'ring-2 ring-secondary'
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1EDE6]">
                {option.image && (
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className="object-cover duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-dark">{option.label}</p>

                {option.priceModifier > 0 && (
                  <p className="mt-0.5 text-xs text-[#8B6E54]">
                    + {formatINR(option.priceModifier / 100)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
