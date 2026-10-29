'use client';

import { useState } from 'react';

import { cn } from '@/lib/format';

/**
 * A country flag as an image. Flag emoji don't render on Windows (they show
 * as "IN", "US"), so the dropdowns use real SVG flags, with the ISO code as
 * the fallback if the image can't load.
 */
export default function Flag({ iso, className }: { iso: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span aria-hidden className={cn('inline-block w-5 text-center text-[10px] font-semibold text-[#6B6B6B]', className)}>
        {iso.toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG from the flag CDN
    <img
      src={`https://flagcdn.com/${iso.toLowerCase()}.svg`}
      alt=""
      aria-hidden
      width={20}
      height={15}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10', className)}
    />
  );
}
