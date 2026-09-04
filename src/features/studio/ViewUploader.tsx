'use client';

/**
 * Multi-angle upload for stage 1.
 *
 * Several photographs of the same garment give a far more complete sheet than
 * one: a front shot rarely shows a cuff clearly and never shows the back. Each
 * gets a label so the model knows what it is looking at rather than guessing.
 */

import Image from 'next/image';
import { useRef } from 'react';
import { Plus, X } from 'lucide-react';

export interface DonorView {
  id: string;
  preview: string;
  base64: string;
  label: string;
}

/** Common angles, offered as chips so nobody has to think about wording. */
const LABEL_SUGGESTIONS = [
  'front',
  'back',
  'left sleeve',
  'right sleeve',
  'neckline close-up',
  'hem detail',
  'placket detail',
];

interface Props {
  views: DonorView[];
  onAdd: (files: FileList) => void;
  onRelabel: (id: string, label: string) => void;
  onRemove: (id: string) => void;
  max?: number;
  disabled?: boolean;
}

export default function ViewUploader({
  views,
  onAdd,
  onRelabel,
  onRemove,
  max = 6,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {views.map((view) => (
          <div key={view.id} className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white ring-1 ring-[#EEE]">
              <Image
                src={view.preview}
                alt={view.label}
                fill
                unoptimized
                sizes="200px"
                className="object-cover"
              />

              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(view.id)}
                  aria-label={`Remove ${view.label}`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <input
              value={view.label}
              onChange={(e) => onRelabel(view.id, e.target.value)}
              disabled={disabled}
              list="view-labels"
              placeholder="What does this show?"
              className="mt-2 w-full rounded border border-[#E4E0D8] px-2 py-1.5 text-xs outline-none focus:border-secondary disabled:bg-[#FAFAFA]"
            />
          </div>
        ))}

        {views.length < max && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DDD] bg-white text-[#9A9A9A]"
          >
            <Plus size={22} />
            <span className="px-3 text-center text-xs leading-relaxed">
              Add another angle
            </span>
          </button>
        )}
      </div>

      {/* Shared suggestion list for every label input. */}
      <datalist id="view-labels">
        {LABEL_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files);
          /* Reset so picking the same file twice still fires onChange. */
          e.target.value = '';
        }}
        className="hidden"
      />

      <p className="mt-3 text-xs text-[#9A9A9A]">
        {views.length}/{max} photos. More angles means a more complete sheet —
        one generation regardless of how many you add.
      </p>
    </div>
  );
}
