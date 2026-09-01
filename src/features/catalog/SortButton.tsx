'use client';

/**
 * Sort control. Writes to the URL rather than local state, so a sorted grid is
 * shareable, survives a refresh, and the back button behaves. RTK Query then
 * caches each sort separately.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import type { ProductListQuery } from '@/@types/product';

const SORT_OPTIONS: { value: NonNullable<ProductListQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price : Low to High' },
  { value: 'price-desc', label: 'Price : High to Low' },
];

export default function SortButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = searchParams.get('sort');
  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? 'Sort By';

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="box-shadow flex items-center gap-3 rounded-sm bg-white px-5 py-3 text-sm"
      >
        {label}
        <ChevronDown size={18} className={`duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-3 w-64 overflow-hidden rounded-xl border bg-white shadow-xl"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={current === option.value}
              onClick={() => apply(option.value)}
              className={`w-full border-b px-5 py-4 text-left text-sm last:border-none hover:bg-[#F8F8F8] ${
                current === option.value ? 'font-medium text-secondary' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
