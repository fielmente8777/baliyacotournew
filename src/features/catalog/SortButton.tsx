'use client';

/**
 * Sort control. Writes to the URL rather than local state, so a sorted grid is
 * shareable, survives a refresh, and the back button behaves. RTK Query then
 * caches each sort separately.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react';

import type { ProductListQuery } from '@/@types/product';

const SORT_OPTIONS: { value: NonNullable<ProductListQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function SortButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = searchParams.get('sort');
  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? 'Sort by';

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apply = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    /* Any sort change resets to page one, or you land on an empty page 4. */
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        /* Same pill as the filter chips beside it. */
        className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border bg-white pl-3.5 pr-3 text-[13px] font-medium transition-colors md:h-11 md:gap-2 md:pl-5 md:pr-4 md:text-sm ${
          open || current ? 'border-secondary text-secondary' : 'border-[#E4DED4] text-[#444] hover:border-secondary hover:text-secondary'
        }`}
      >
        <ArrowDownUp aria-hidden className="size-3.5 shrink-0 md:size-4" />
        {label}
        <ChevronDown size={16} aria-hidden="true" className={`shrink-0 duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1.5 w-[min(15rem,calc(100vw-2rem))] origin-top-right animate-pop-in overflow-hidden rounded-xl border border-[#EFE8DE] bg-white shadow-xl"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={current === option.value}
              onClick={() => apply(option.value)}
              className={`flex w-full items-center justify-between gap-3 border-b border-[#F2EEE8] px-4 py-3 text-left text-sm last:border-none hover:bg-[#FBF6F7] ${
                current === option.value ? 'font-medium text-secondary' : ''
              }`}
            >
              {option.label}
              {current === option.value && <Check size={15} aria-hidden className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
