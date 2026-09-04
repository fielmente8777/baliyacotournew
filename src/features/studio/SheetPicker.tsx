'use client';

/**
 * Chooses which embroidery sheets go onto the target garment.
 *
 * Two sources, because they serve different moments:
 *   - a sheet just produced by stage 1 in this session
 *   - a sheet downloaded earlier and re-uploaded, which is how one approved
 *     embroidery gets reused across five colourways without re-extracting
 */

import Image from 'next/image';
import { useRef } from 'react';
import { Check, Plus, X } from 'lucide-react';

export interface SheetChoice {
  id: string;
  /** URL from stage 1, or base64 for an uploaded file. */
  image: string;
  /** What to show in the picker. */
  preview: string;
  label: string;
  source: 'generated' | 'uploaded';
}

interface Props {
  available: SheetChoice[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onUpload: (files: FileList) => void;
  onRelabel: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}

export default function SheetPicker({
  available,
  selectedIds,
  onToggle,
  onUpload,
  onRelabel,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-dark">Embroidery to apply</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {available.map((sheet) => {
          const selected = selectedIds.includes(sheet.id);

          return (
            <div key={sheet.id} className="relative">
              <button
                type="button"
                onClick={() => onToggle(sheet.id)}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-white ring-1 transition-all ${
                  selected ? 'ring-2 ring-secondary' : 'ring-[#EEE]'
                }`}
              >
                <Image
                  src={sheet.preview}
                  alt={sheet.label}
                  fill
                  unoptimized
                  sizes="180px"
                  className="object-contain p-1"
                />

                {selected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white">
                    <Check size={13} />
                  </span>
                )}
              </button>

              {sheet.source === 'uploaded' && (
                <button
                  type="button"
                  onClick={() => onRemove(sheet.id)}
                  aria-label={`Remove ${sheet.label}`}
                  className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <X size={12} />
                </button>
              )}

              <input
                value={sheet.label}
                onChange={(e) => onRelabel(sheet.id, e.target.value)}
                list="sheet-labels"
                placeholder="Where does it go?"
                className="mt-2 w-full rounded border border-[#E4E0D8] px-2 py-1.5 text-xs outline-none focus:border-secondary"
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DDD] bg-white text-[#9A9A9A]"
        >
          <Plus size={20} />
          <span className="px-2 text-center text-[11px] leading-tight">
            Upload a saved sheet
          </span>
        </button>
      </div>

      <datalist id="sheet-labels">
        <option value="neckline sheet" />
        <option value="cuff sheet" />
        <option value="hem sheet" />
        <option value="placket sheet" />
        <option value="motif sheet" />
      </datalist>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) onUpload(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
