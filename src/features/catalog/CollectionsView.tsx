'use client';

/**
 * Pre-designed Collections grid.
 *
 * Filters live in the URL, so the query is derived from searchParams and RTK
 * Query caches each combination. `keepPreviousData` holds the old grid on
 * screen while a new sort loads instead of flashing skeletons.
 */

import { useSearchParams } from 'next/navigation';

import { Section } from '@/components/sectionComponants';
import { useGetProductsQuery } from '@/store/api/productApi';
import type { ProductListQuery } from '@/@types/product';

import Breadcrumb from '../../app/(website)/collections/Components/Breadcrumb';
import ProductGrid from './ProductGrid';
import SortButton from './SortButton';

const PAGE_SIZE = 20;

export default function CollectionsView() {
  const searchParams = useSearchParams();

  const query: ProductListQuery = {
    sort: (searchParams.get('sort') as ProductListQuery['sort']) ?? undefined,
    badge: (searchParams.get('badge') as ProductListQuery['badge']) ?? undefined,
    garmentTypeId: searchParams.get('garmentType') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(query);

  return (
    <main>
      <Section className="px-4 md:px-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Breadcrumb />
          <SortButton />
        </div>

        {isError ? (
          <div className="py-20 text-center">
            <p className="text-secondary">We couldn&apos;t load the collection.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProductGrid
            products={data?.items ?? []}
            isLoading={isLoading || isFetching}
          />
        )}

        {data && data.meta.totalPages > 1 && (
          <p className="mt-12 text-center text-sm text-[#777]">
            Showing {data.items.length} of {data.meta.total} products
          </p>
        )}
      </Section>
    </main>
  );
}
