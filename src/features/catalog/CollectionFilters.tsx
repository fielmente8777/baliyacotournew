'use client';

/**
 * Filter chips above the grid: All / Bestsellers / Editor's Picks /
 * Customisable. Each chip is a link that rewrites the query string, so the
 * navbar's "Bestsellers" link (/collections?badge=bestseller) lands on the
 * same state as tapping the chip. On phones the row scrolls sideways
 * instead of wrapping onto three lines.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface CollectionFilter {
  key: string;
  label: string;
  /** Page heading and breadcrumb text when this filter is active. */
  heading: string;
  params: { badge?: string; tag?: string };
}

export const COLLECTION_FILTERS: CollectionFilter[] = [
  { key: 'all', label: 'All', heading: 'Pre-designed Collection', params: {} },
  { key: 'bestseller', label: 'Bestsellers', heading: 'Bestsellers', params: { badge: 'bestseller' } },
  { key: 'editors-pick', label: "Editor's Picks", heading: "Editor's Picks", params: { badge: 'editors-pick' } },
  { key: 'custom', label: 'Customisable', heading: 'Customisable Designs', params: { tag: 'custom' } },
];

/** Which chip matches the current URL (falls back to "All"). */
export function activeFilter(searchParams: URLSearchParams): CollectionFilter {
  const badge = searchParams.get('badge') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  return (
    COLLECTION_FILTERS.find((f) => f.params.badge === badge && f.params.tag === tag) ??
    COLLECTION_FILTERS[0]
  );
}

export default function CollectionFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = activeFilter(new URLSearchParams(searchParams.toString()));

  const hrefFor = (filter: CollectionFilter) => {
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
    <nav aria-label="Filter products" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {COLLECTION_FILTERS.map((filter) => {
          const isActive = filter.key === current.key;
          return (
            <li key={filter.key}>
              <Link
                href={hrefFor(filter)}
                scroll={false}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-4 text-sm transition-colors ${
                  isActive
                    ? 'border-secondary bg-secondary text-white'
                    : 'border-[#E4DED4] bg-white text-[#444] hover:border-secondary hover:text-secondary'
                }`}
              >
                {filter.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
