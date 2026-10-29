'use client';

/**
 * Filter chips above the product grid: All / Bestsellers / Editor's Picks /
 * Customisable, each with its icon. Each chip is a link that rewrites the
 * query string, so the navbar's "Bestsellers" link (/products?badge=bestseller)
 * lands on the same state as tapping the chip. On phones the row scrolls
 * sideways instead of wrapping onto three lines.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Flame, LayoutGrid, Scissors, Star, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/format';

export interface ProductFilter {
  key: string;
  label: string;
  /** Page heading and breadcrumb text when this filter is active. */
  heading: string;
  params: { badge?: string; tag?: string };
  icon: LucideIcon;
}

const PRODUCT_FILTERS: ProductFilter[] = [
  { key: 'all', label: 'All designs', heading: 'Pre-made Designs', params: {}, icon: LayoutGrid },
  { key: 'bestseller', label: 'Bestsellers', heading: 'Bestsellers', params: { badge: 'bestseller' }, icon: Flame },
  { key: 'editors-pick', label: "Editor's Picks", heading: "Editor's Picks", params: { badge: 'editors-pick' }, icon: Star },
  { key: 'custom', label: 'Customisable', heading: 'Customisable Designs', params: { tag: 'custom' }, icon: Scissors },
];

/** Which chip matches the current URL (falls back to "All"). */
export function activeFilter(searchParams: URLSearchParams): ProductFilter {
  const badge = searchParams.get('badge') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  return (
    PRODUCT_FILTERS.find((f) => f.params.badge === badge && f.params.tag === tag) ??
    PRODUCT_FILTERS[0]
  );
}

export default function ProductFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = activeFilter(new URLSearchParams(searchParams.toString()));

  const hrefFor = (filter: ProductFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('badge');
    params.delete('tag');
    /* Changing the filter always goes back to page one. */
    params.delete('page');
    if (filter.params.badge) params.set('badge', filter.params.badge);
    if (filter.params.tag) params.set('tag', filter.params.tag);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    /* scrollbar-none: the sideways chip row on phones scrolls by swipe. The
       trailing padding keeps the last chip from being cut at the screen edge. */
    <nav aria-label="Filter products" className="scrollbar-none -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-1.5 pr-4 md:w-auto md:gap-2 md:pr-0">
        {PRODUCT_FILTERS.map((filter) => {
          const isActive = filter.key === current.key;
          const Icon = filter.icon;
          return (
            <li key={filter.key}>
              <Link
                href={hrefFor(filter)}
                scroll={false}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors md:h-11 md:gap-2 md:px-5 md:text-sm',
                  isActive
                    ? 'border-secondary bg-secondary text-white shadow-[0_6px_16px_-8px_rgba(155,44,64,0.7)]'
                    : 'border-[#E4DED4] bg-white text-[#444] hover:border-secondary hover:text-secondary'
                )}
              >
                <Icon
                  aria-hidden
                  className="size-3.5 md:size-4"
                  fill={isActive && filter.key === 'editors-pick' ? 'currentColor' : 'none'}
                />
                {filter.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
