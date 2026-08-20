'use client';

import Image from 'next/image';
import { cn } from '@/lib/format';
import type { Fabric } from '@/@types/design';

interface Props {
  fabric: Fabric;
  selected: boolean;
  onSelect: () => void;
}

export default function FabricCard({ fabric, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group overflow-hidden rounded-xl text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
        selected && 'ring-2 ring-secondary'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        {fabric.swatchImage && (
          <Image
            src={fabric.swatchImage}
            alt={fabric.label}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {fabric.priceLabel && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-dark/85 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            {fabric.priceLabel}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-dark md:text-base">{fabric.label}</p>
    </button>
  );
}
