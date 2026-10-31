'use client';

/**
 * The photos to upload, one named slot each, with a drawing of what that
 * photo should show. The slot's name is sent with the photo ("left sleeve
 * close-up"), so the admin never has to type position names, and the AI
 * knows which side of the garment it is looking at.
 */

import { useRef } from 'react';
import { ImagePlus, Plus, RefreshCw, X } from 'lucide-react';

import { cn } from '@/lib/format';
import PositionMap, { type ZoneId } from './PositionMap';

export type SlotKey = 'front' | 'back' | 'neck' | 'sleeveLeft' | 'sleeveRight' | 'hem' | 'lower';

export interface SlotPhoto {
  preview: string;
  /** Full size for extraction (base64, no prefix). */
  base64: string;
  /** Small copy for the AI that names the pieces. */
  small: string;
}

/**
 * A close-up beyond the seven named slots, with the admin's own words for what
 * it shows ("left cuff, gota border, light gold"). The words go to the AI
 * with the photo, the same way a slot's name does.
 */
export interface ExtraPhoto {
  id: string;
  photo: SlotPhoto;
  description: string;
}

/** Seven slots + five extras = the 12 photos one extraction accepts. */
export const MAX_EXTRA_PHOTOS = 5;

/** What the AI is told an extra photo shows. */
export const extraLabel = (extra: ExtraPhoto) =>
  `extra close-up: ${extra.description.trim() || 'a detail of the embroidery'}`;

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
    key: 'lower',
    title: 'Lower (salwar / pajama)',
    label: 'close-up of the lower garment (salwar, pajama or sharara) and its embroidery',
    hint: 'Only if the lower has embroidery, e.g. an ankle border. It is extracted too.',
    zones: ['lower_garment'],
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
  extras,
  onAddExtra,
  onExtraChange,
  onRemoveExtra,
  disabled,
}: {
  photos: Partial<Record<SlotKey, SlotPhoto>>;
  onAdd: (key: SlotKey, file: File) => void;
  onRemove: (key: SlotKey) => void;
  extras: ExtraPhoto[];
  onAddExtra: (file: File) => void;
  onExtraChange: (id: string, description: string) => void;
  onRemoveExtra: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {PHOTO_SLOTS.map((slot) => (
        <Slot key={slot.key} slot={slot} photo={photos[slot.key]} onAdd={onAdd} onRemove={onRemove} disabled={disabled} />
      ))}
      {extras.map((extra, i) => (
        <Extra key={extra.id} extra={extra} n={i + 1} onChange={onExtraChange} onRemove={onRemoveExtra} disabled={disabled} />
      ))}
      {extras.length < MAX_EXTRA_PHOTOS && <AddExtra onAdd={onAddExtra} disabled={disabled} />}
    </div>
  );
}

/** An extra close-up: the photo, and a box for what it shows. */
function Extra({
  extra,
  n,
  onChange,
  onRemove,
  disabled,
}: {
  extra: ExtraPhoto;
  n: number;
  onChange: (id: string, description: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="group relative aspect-3/4 overflow-hidden rounded-lg border border-[#e6e0d6] bg-[#faf8f4]">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
        <img src={extra.photo.preview} alt={`Extra close-up ${n}`} className="absolute inset-0 size-full object-cover" />
        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(extra.id)}
            className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 transition hover:bg-white group-hover:opacity-100 max-md:opacity-100"
            aria-label={`Remove extra close-up ${n}`}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-dark">Extra close-up {n}</p>
      <textarea
        value={extra.description}
        onChange={(e) => onChange(extra.id, e.target.value)}
        disabled={disabled}
        rows={3}
        maxLength={200}
        placeholder="What it shows, e.g. left cuff, gota border, light gold"
        aria-label={`What extra close-up ${n} shows`}
        className="mt-1 w-full resize-none rounded-md border border-[#d8d2c8] bg-white px-2 py-1.5 text-[11px] leading-snug text-dark focus:border-secondary focus:outline-none"
      />
    </div>
  );
}

function AddExtra({ onAdd, disabled }: { onAdd: (file: File) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#d8cdbd] bg-[#fcfaf7] p-3 text-center transition hover:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Add another close-up photo"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
          <Plus className="size-5" aria-hidden />
        </span>
        <span className="text-[11px] font-medium text-secondary">Add close-up</span>
      </button>
      <p className="mt-1.5 text-xs font-semibold text-dark">More close-ups</p>
      <p className="text-[11px] leading-snug text-[#888]">Any detail the seven miss. Say what each one shows.</p>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((file) => onAdd(file));
          e.target.value = '';
        }}
      />
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
