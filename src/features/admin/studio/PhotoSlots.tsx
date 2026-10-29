'use client';

/**
 * The photos to upload, one named slot each, with a drawing of what that
 * photo should show. The slot's name is sent with the photo ("left sleeve
 * close-up"), so the admin never has to type position names, and the AI
 * knows which side of the garment it is looking at.
 */

import { useRef } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';

import { cn } from '@/lib/format';
import PositionMap, { type ZoneId } from './PositionMap';

export type SlotKey = 'front' | 'back' | 'neck' | 'sleeveLeft' | 'sleeveRight' | 'hem';

export interface SlotPhoto {
  preview: string;
  /** Full size for extraction (base64, no prefix). */
  base64: string;
  /** Small copy for the AI that names the pieces. */
  small: string;
}

export const PHOTO_SLOTS: {
  key: SlotKey;
  title: string;
  /** Sent to the AI with the photo. */
  label: string;
  hint: string;
  zones: ZoneId[];
  back?: boolean;
  recommended?: boolean;
}[] = [
  {
    key: 'front',
    title: 'Front, full garment',
    label: 'front of the whole garment',
    hint: 'Neck to hem, straight on. The most important photo.',
    zones: ['garment'],
    recommended: true,
  },
  {
    key: 'neck',
    title: 'Neckline close-up',
    label: 'close-up of the neckline and yoke',
    hint: 'Neck, yoke and upper chest, sharp and close.',
    zones: ['neckline', 'yoke', 'placket'],
    recommended: true,
  },
  {
    key: 'sleeveLeft',
    title: 'Left sleeve',
    label: 'close-up of the left sleeve and cuff (as seen in the photo)',
    hint: 'Shoulder to cuff on the left of the photo.',
    zones: ['shoulder-left', 'sleeve_body-left', 'sleeve_cuff-left'],
  },
  {
    key: 'sleeveRight',
    title: 'Right sleeve',
    label: 'close-up of the right sleeve and cuff (as seen in the photo)',
    hint: 'Only if it differs from the left one.',
    zones: ['shoulder-right', 'sleeve_body-right', 'sleeve_cuff-right'],
  },
  {
    key: 'hem',
    title: 'Hem / daaman close-up',
    label: 'close-up of the hem border (daaman)',
    hint: 'The bottom border, laid flat if you can.',
    zones: ['hem_border', 'lower_hem'],
    recommended: true,
  },
  {
    key: 'back',
    title: 'Back',
    label: 'back of the garment',
    hint: 'Only if the back has embroidery.',
    zones: ['garment'],
    back: true,
  },
];

export default function PhotoSlots({
  photos,
  onAdd,
  onRemove,
  disabled,
}: {
  photos: Partial<Record<SlotKey, SlotPhoto>>;
  onAdd: (key: SlotKey, file: File) => void;
  onRemove: (key: SlotKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {PHOTO_SLOTS.map((slot) => (
        <Slot key={slot.key} slot={slot} photo={photos[slot.key]} onAdd={onAdd} onRemove={onRemove} disabled={disabled} />
      ))}
    </div>
  );
}

function Slot({
  slot,
  photo,
  onAdd,
  onRemove,
  disabled,
}: {
  slot: (typeof PHOTO_SLOTS)[number];
  photo?: SlotPhoto;
  onAdd: (key: SlotKey, file: File) => void;
  onRemove: (key: SlotKey) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'group relative aspect-3/4 overflow-hidden rounded-lg border transition',
          photo ? 'border-[#e6e0d6] bg-[#faf8f4]' : 'border-dashed border-[#d8cdbd] bg-[#fcfaf7] hover:border-secondary/60'
        )}
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={photo.preview} alt={slot.title} className="absolute inset-0 size-full object-cover" />
            {!disabled && (
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-linear-to-t from-black/55 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100 max-md:opacity-100">
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="flex size-7 items-center justify-center rounded-full bg-white/90 text-dark hover:bg-white"
                  aria-label={`Replace ${slot.title}`}
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(slot.key)}
                  className="flex size-7 items-center justify-center rounded-full bg-white/90 text-red-700 hover:bg-white"
                  aria-label={`Remove ${slot.title}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-3 disabled:cursor-not-allowed"
            aria-label={`Add ${slot.title}`}
          >
            {/* The example: which part of the garment this photo shows. */}
            <PositionMap highlight={slot.zones} back={slot.back} className="w-[62%] opacity-90" />
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-secondary">
              <ImagePlus className="size-3.5" aria-hidden /> Add photo
            </span>
          </button>
        )}

        {slot.recommended && !photo && (
          <span className="absolute left-1.5 top-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-white">
            Recommended
          </span>
        )}
      </div>

      <p className="mt-1.5 text-xs font-semibold text-dark">{slot.title}</p>
      <p className="text-[11px] leading-snug text-[#888]">{slot.hint}</p>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(slot.key, file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
