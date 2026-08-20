'use client';

/**
 * Mannequin with one hotspot per measurement (Stensil-5/6). Hovering or
 * focusing a hotspot shows the how-to-measure illustration.
 */

import Image from 'next/image';
import { useState } from 'react';
import { MEASUREMENT_FIELDS } from '@/mocks/measurement.mock';
import { PREVIEW_IMAGES } from '@/mocks/design.mock';
import { cn } from '@/lib/format';
import type { MeasurementKey } from '@/@types/measurement';

export default function MannequinView() {
  const [active, setActive] = useState<MeasurementKey | null>(null);
  const field = MEASUREMENT_FIELDS.find((f) => f.key === active);

  return (
    <div className="relative mx-auto aspect-[3/5] w-full max-w-[420px]">
      <Image
        src={"/mannequin.png"}
        // src={PREVIEW_IMAGES.mannequin}
        alt="Measurement mannequin"
        fill
        sizes="(max-width: 768px) 80vw, 420px"
        className="object-cover ml-8"
        priority
      />

      {/* {MEASUREMENT_FIELDS.map((f) => (
        <button
          key={f.key}
          type="button"
          aria-label={`How to measure ${f.label}`}
          onMouseEnter={() => setActive(f.key)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(f.key)}
          onBlur={() => setActive(null)}
          style={{ top: `${f.hotspot.top}%`, left: `${f.hotspot.left}%` }}
          className={cn(
            'absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 transition-all',
            active === f.key
              ? 'bg-secondary ring-secondary/25'
              : 'bg-[#8E9BC4] ring-[#8E9BC4]/25 hover:bg-secondary'
          )}
        />
      ))} */}

      {field && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-2 top-6 w-40 overflow-hidden rounded-lg bg-white shadow-lg sm:w-48"
        >
          <Image
            src={field.guideImage}
            alt=""
            width={192}
            height={130}
            className="h-auto w-full object-cover"
          />
          <p className="px-2 py-1.5 text-xs font-medium">{field.label}</p>
        </div>
      )}
    </div>
  );
}
