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

export default function ProductCard({ product, priority }: Props) {
  const price = product.salePrice ?? product.basePrice;
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.basePrice;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-white">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={primaryImage(product)}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            className="object-cover duration-500 group-hover:scale-105"
          />

          {/* Badges sit on the photo, so a long product name always gets
              the full card width underneath (on a phone, a badge beside the
              title squeezed it to one word per line). */}
          {product.isEditorsPick && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
              <Star size={10} fill="currentColor" aria-hidden="true" />
              Editor&apos;s Pick
            </span>
          )}

          <WishlistButton product={product} className="absolute right-2 top-2 sm:right-3 sm:top-3" />

          {isCustomizable(product) && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[#262626] backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-[10px]">
              <Scissors size={10} aria-hidden="true" />
              Customisable
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 sm:pt-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#262626] transition-colors duration-300 group-hover:text-secondary sm:text-[15px]">
          {product.name}
        </h3>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-[#8B6E54] sm:mt-2 sm:text-sm">
          {/* "Starting from" because options add to this at design time. */}
          <span>From {formatINR(price / 100)}</span>

          {hasDiscount && (
            <span className="text-xs text-[#A9A9A9] line-through">
              {formatINR(product.basePrice / 100)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
