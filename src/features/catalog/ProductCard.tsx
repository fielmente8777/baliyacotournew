'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/@types/product';
import { isCustomizable, primaryImage } from '@/@types/product';
import { formatINR } from '@/lib/format';

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

          {isCustomizable(product) && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[1.5px] text-[#262626]">
              Customisable
            </span>
          )}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-medium text-[#262626]">{product.name}</h3>

          {product.isEditorsPick && (
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-[2px] text-white">
              Editor&apos;s Pick
            </span>
          )}
        </div>

        <p className="mt-2 flex items-center gap-2 text-sm text-[#8B6E54]">
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
