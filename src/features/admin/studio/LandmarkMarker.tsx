'use client';

/**
 * Click six points on a blank garment to define where embroidery anchors.
 *
 * Needed because automatic detection cannot separate a pale garment from a
 * similar backdrop — measured at 0.19 confidence on the client's own pale blue
 * silk against their grey studio wall. A blank suit is reused across many
 * generations, so marking it once is cheap and exact.
 */

import { useRef, useState } from 'react';
import { Check } from 'lucide-react';

import type { Landmarks } from '@/@types/embroidery';

type PointKey =
  | 'neckline'
  | 'shoulderLeft'
  | 'shoulderRight'
  | 'cuffLeft'
  | 'cuffRight'
  | 'hemCenter';

const STEPS: { key: PointKey; label: string; hint: string }[] = [
  { key: 'neckline', label: 'Neckline', hint: 'The lowest point of the neckline' },
  { key: 'shoulderLeft', label: 'Left shoulder', hint: 'Outer edge of the left shoulder seam' },
  { key: 'shoulderRight', label: 'Right shoulder', hint: 'Outer edge of the right shoulder seam' },
  { key: 'cuffLeft', label: 'Left cuff', hint: 'Centre of the left cuff opening' },
  { key: 'cuffRight', label: 'Right cuff', hint: 'Centre of the right cuff opening' },
  { key: 'hemCenter', label: 'Hem', hint: 'Centre of the bottom hem edge' },
];

interface Props {
  imageSrc: string;
  onComplete: (landmarks: Landmarks) => void;
}

export default function LandmarkMarker({ imageSrc, onComplete }: Props) {
  const [points, setPoints] = useState<Partial<Record<PointKey, { x: number; y: number }>>>({});
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const current = STEPS[step];

  const handleClick = (e: React.MouseEvent) => {
    if (!current) return;

    const rect = ref.current!.getBoundingClientRect();
    const point = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };

    const next = { ...points, [current.key]: point };
    setPoints(next);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    /* Derive the widths and bounds the compositor needs from the six points,
       so the operator never has to think about them. */
    const shoulderWidth = Math.abs(next.shoulderRight!.x - next.shoulderLeft!.x);
    const hemWidth = shoulderWidth * 1.25;

    onComplete({
      confidence: 1,
      neckline: next.neckline!,
      shoulderLeft: next.shoulderLeft!,
      shoulderRight: next.shoulderRight!,
      cuffLeft: next.cuffLeft!,
      cuffRight: next.cuffRight!,
      hemCenter: next.hemCenter!,
      bodyCenter: {
        x: (next.shoulderLeft!.x + next.shoulderRight!.x) / 2,
        y: (next.neckline!.y + next.hemCenter!.y) / 2,
      },
      shoulderWidth,
      garmentWidth: Math.abs(next.cuffRight!.x - next.cuffLeft!.x),
      hemWidth,
      top: next.shoulderLeft!.y,
      bottom: next.hemCenter!.y,
    });
  };

  const done = step >= STEPS.length - 1 && points.hemCenter;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              points[s.key]
                ? 'bg-[#E7F3E5] text-[#3F6B3D]'
                : i === step
                  ? 'bg-secondary text-white'
                  : 'bg-[#F2EEE8] text-[#6B6B6B]'
            }`}
          >
            {points[s.key] && <Check size={12} />}
            {s.label}
          </button>
        ))}
      </div>

      {current && !done && (
        <p className="mb-2 text-sm text-dark">
          Click: <strong>{current.hint}</strong>
        </p>
      )}

      <div
        ref={ref}
        onClick={handleClick}
        className="relative cursor-crosshair overflow-hidden rounded-xl bg-[#F1EDE6]"
      >
        {/* Plain img: an object URL of a local file, so next/image would only
            add complexity for no optimisation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="Mark the garment landmarks" className="w-full select-none" draggable={false} />

        {STEPS.map((s) => {
          const point = points[s.key];
          if (!point) return null;

          return (
            <span
              key={s.key}
              style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary ring-2 ring-white"
            />
          );
        })}
      </div>
    </div>
  );
}
