'use client';

import Image from 'next/image';
import { cn } from '@/lib/format';
import type { FabricColour } from '@/@types/design';

interface Props {
  colours: FabricColour[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ColourOptionRow({ colours, selectedId, onSelect }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-dark">Colour Option</p>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {colours.map((c, i) => {
          const active = selectedId ? selectedId === c._id : i === 0;
          return (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelect(c._id)}
              aria-label={c.label}
              aria-pressed={active}
              style={!c.swatchImage ? { backgroundColor: c.hex } : undefined}
              className={cn(
                'relative h-14 shrink-0 overflow-hidden rounded-md transition-all',
                i === 0 ? 'w-32' : 'w-14',
                active ? 'ring-2 ring-secondary ring-offset-2' : 'ring-1 ring-[#ECECEC]'
              )}
            >
              {c.swatchImage && (
                <Image src={c.swatchImage} alt="" fill sizes="128px" className="object-cover" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
