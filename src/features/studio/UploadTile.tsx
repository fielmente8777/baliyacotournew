'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  label: string;
  hint: string;
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function UploadTile({
  label,
  hint,
  preview,
  onFile,
  onClear,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-dark">{label}</p>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#DDD] bg-white disabled:opacity-50"
        >
          {preview ? (
            <Image
              src={preview}
              alt={label}
              width={400}
              height={533}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 text-center text-[#9A9A9A]">
              <Upload size={20} />
              <span className="text-xs leading-relaxed">{hint}</span>
            </span>
          )}
        </button>

        {preview && !disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label}`}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          /* Reset so choosing the same file twice still fires onChange. */
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
