'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Scissors, Star } from 'lucide-react';

import type { Product } from '@/@types/product';
import { isCustomizable, primaryImage } from '@/@types/product';
import { formatINR } from '@/lib/format';
import WishlistButton from '@/features/wishlist/WishlistButton';

interface Props {
  product: Product;
  /** Rendered eagerly for the first row; the rest lazy-load. */
  priority?: boolean;
}

const badge = 'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]';

/**
 * One design in a grid. The whole card links to the product; on devices with
 * a mouse, hovering also offers "View" and — for customisable designs — a
 * direct "Customise" that opens the builder seeded with this product.
 */
export default function ProductCard({ product, priority }: Props) {
  const price = product.salePrice ?? product.basePrice;
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.basePrice;
  const customisable = isCustomizable(product);
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative flex min-w-0 flex-col gap-3 sm:gap-3.5">
      <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-[#F1EDE6]">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <Image
            src={primaryImage(product)}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {/* Every badge in one place — the top-left corner, stacked. */}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {customisable && (
            <span className={`${badge} bg-[#FAF7F2] text-dark`}>
              <Scissors size={10} aria-hidden="true" />
              Customisable
            </span>
          )}
          {product.isEditorsPick && (
            <span className={`${badge} bg-secondary text-white`}>
              <Star size={10} fill="currentColor" aria-hidden="true" />
              Editor&apos;s Pick
            </span>
          )}
          {product.isBestseller && <span className={`${badge} bg-dark text-white`}>Bestseller</span>}
        </div>

        <WishlistButton product={product} className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2" />

        {/* Hover actions — mouse only; on touch the card itself is the link. */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 gap-2 opacity-0 transition duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:flex">
          <Link
            href={href}
            className="flex h-11 flex-1 items-center justify-center rounded-sm bg-[#FAF7F2] text-[13px] font-medium text-dark transition-colors hover:bg-white"
          >
            View design
          </Link>
          {customisable && (
            <Link
              href={`/create-your-own-design?product=${product._id}`}
              className="flex h-11 flex-1 items-center justify-center rounded-sm bg-secondary text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Customise
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {product.productType && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6E54] sm:text-[11px]">
            {product.productType}
          </span>
        )}
        <Link
          href={href}
          className="line-clamp-2 text-sm font-medium leading-snug text-dark transition-colors duration-300 hover:text-secondary sm:text-[17px]"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[13px] sm:gap-x-2 sm:text-sm">
          {/* "From" because options add to this at design time. */}
          <span className="text-[#6B6B6B]">From</span>
          <span className="text-sm font-semibold text-dark sm:text-[15px]">{formatINR(price / 100)}</span>
          {hasDiscount && (
            <span className="text-xs text-[#A9A9A9] line-through">{formatINR(product.basePrice / 100)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
