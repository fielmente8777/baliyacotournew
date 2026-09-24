'use client';

/**
 * The /products listing (all ready-made designs).
 *
 * Filters live in the URL, so the query is derived from searchParams and RTK
 * Query caches each combination. The navbar's "Bestsellers" link is just
 * /products?badge=bestseller, so it lands on the same state as the chip.
 * Every product is reachable through the page links under the grid.
 */

import { useSearchParams } from 'next/navigation';

import { Section } from '@/components/sectionComponants';
import { useGetProductsQuery } from '@/store/api/productApi';
import type { ProductListQuery } from '@/@types/product';

import Breadcrumb from './Breadcrumb';
import ProductFilters, { activeFilter } from './ProductFilters';
import Pagination from './Pagination';
import ProductGrid from './ProductGrid';
import SortButton from './SortButton';

/** Divides evenly into the 2-, 3- and 4-column grids. */
const PAGE_SIZE = 24;

export default function ProductsView() {
  const searchParams = useSearchParams();
  const filter = activeFilter(new URLSearchParams(searchParams.toString()));
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const query: ProductListQuery = {
    sort: (searchParams.get('sort') as ProductListQuery['sort']) ?? undefined,
    badge: (searchParams.get('badge') as ProductListQuery['badge']) ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(query);

  return (
    <main>
      <Section className="px-4 md:px-10">
        {/* Breadcrumb and sort share one row at every width, so the sort
            menu (anchored to the right) never opens off-screen. */}
        <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
          <Breadcrumb current={filter.heading} />
          <SortButton />
        </div>

        <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-medium text-[#222] md:text-3xl">{filter.heading}</h1>
          {data && (
            <p className="text-sm text-[#777]">
              {data.meta.total} {data.meta.total === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        <ProductFilters />

        {isError ? (
          <div className="py-20 text-center">
            <p className="text-secondary">We couldn&apos;t load the products.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 underline">
              Try again
            </button>
          </div>
        ) : (
          <ProductGrid products={data?.items ?? []} isLoading={isLoading || isFetching} />
        )}

        {data && <Pagination page={page} totalPages={data.meta.totalPages} />}
      </Section>
    </main>
  );
}
