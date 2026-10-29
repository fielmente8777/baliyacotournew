'use client';

import type { Product } from '@/@types/product';
import EmptyState from '@/components/EmptyState';
import { NoProductsIllustration } from '@/components/illustrations';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  isLoading?: boolean;
  /** Desktop cards per row — the listing lets shoppers choose 3 or 4. */
  columns?: 3 | 4;
  /** Shown instead of the default empty state. */
  empty?: React.ReactNode;
}

/** Matches the grid so the layout doesn't jump when results arrive. */
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-3/4 w-full bg-black/5" />
      <div className="mt-4 h-4 w-2/3 rounded bg-black/5" />
      <div className="mt-2 h-4 w-1/3 rounded bg-black/5" />
    </div>
  );
}

export default function ProductGrid({ products, isLoading, columns = 4, empty }: Props) {
  return (
    <section className="mt-6 md:mt-10">
      <div
        className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-y-12 lg:gap-x-7 ${
          columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {isLoading &&
          products.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}

        {products.map((product, index) => (
          <div
            key={product._id}
            className="animate-page-in"
            /* Cards rise in one after another; capped so page 2 isn't slow. */
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>

      {!isLoading && products.length === 0 && empty}
      {!isLoading && products.length === 0 && !empty && (
        <EmptyState
          className="py-16"
          illustration={<NoProductsIllustration />}
          title="Nothing here yet"
          message="No designs match this filter right now. Try another one, or create your own."
          action={{ label: 'Design your own', href: '/create-your-own-design' }}
        />
      )}
    </section>
  );
}
