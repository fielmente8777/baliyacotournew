'use client';

import type { Product } from '@/@types/product';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  isLoading?: boolean;
}

/** Matches the grid so the layout doesn't jump when results arrive. */
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full bg-black/5" />
      <div className="mt-4 h-4 w-2/3 rounded bg-black/5" />
      <div className="mt-2 h-4 w-1/3 rounded bg-black/5" />
    </div>
  );
}

export default function ProductGrid({ products, isLoading }: Props) {
  return (
    <section className="mt-10">
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading &&
          products.length === 0 &&
          Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}

        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} priority={index < 5} />
        ))}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="py-20 text-center text-[#777]">
          No products match your filters yet.
        </p>
      )}
    </section>
  );
}
