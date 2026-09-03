'use client';

/**
 * Drag a box over the photo to isolate one border.
 *
 * Deliberately dependency-free — pointer events on an overlay div. A cropping
 * library would add 40kB to do the same job for a single internal tool.
 */

import { useRef, useState } from 'react';
import type { CropBox } from '@/lib/imageCrop';

interface Props {
  src: string;
  value: CropBox | null;
  onChange: (box: CropBox) => void;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export default function CropSelector({ src, value, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  /** Pointer position as a fraction of the element, clamped to its bounds. */
  const pointFrom = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / rect.width),
      y: clamp((e.clientY - rect.top) / rect.height),
    };
  };

  const handleDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setStart(pointFrom(e));
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!start) return;
    const now = pointFrom(e);

    onChange({
      x: Math.min(start.x, now.x),
      y: Math.min(start.y, now.y),
      width: Math.abs(now.x - start.x),
      height: Math.abs(now.y - start.y),
    });
  };

  const handleUp = () => setStart(null);

  return (
    <div
      ref={wrapRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      className="relative cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-[#F1EDE6]"
    >
      {/* Plain <img>: this is an object URL of a local file, so next/image
          optimisation has nothing to do and would only add complexity. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Crop the embroidery" className="w-full select-none" draggable={false} />

      {value && value.width > 0.01 && (
        <>
          {/* Dim everything outside the selection. */}
          <div className="pointer-events-none absolute inset-0 bg-black/45" />

          <div
            className="pointer-events-none absolute ring-2 ring-white"
            style={{
              left: `${value.x * 100}%`,
              top: `${value.y * 100}%`,
              width: `${value.width * 100}%`,
              height: `${value.height * 100}%`,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              clipPath: 'none',
            }}
          />
        </>
      )}

      {!value && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
          <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs text-white">
            Drag a box around one border
          </span>
        </div>
      )}
    </div>
  );
}
