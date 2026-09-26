'use client';

/**
 * Heart toggle for a Shopify product. Used on product cards (overlaid on the
 * photo) and on the product page (beside Add to Cart).
 *
 * Signed-out visitors are sent to login and brought back to the same page.
 */

import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';

import type { Product } from '@/@types/product';
import { primaryImage } from '@/@types/product';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/format';
import {
  useAddShopifyToWishlistMutation,
  useGetWishlistRefsQuery,
  useRemoveFromWishlistByRefMutation,
} from '@/store/api/wishlistApi';

interface Props {
  product: Product;
  /** "overlay": round white button on a photo. "inline": outlined, page-sized. */
  variant?: 'overlay' | 'inline';
  className?: string;
}

export default function WishlistButton({ product, variant = 'overlay', className }: Props) {
  const { isAuthenticated, isHydrated, openLogin } = useAuth();
  const pathname = usePathname();

  const { data: refs } = useGetWishlistRefsQuery(undefined, { skip: !isAuthenticated });
  const [add, { isLoading: adding }] = useAddShopifyToWishlistMutation();
  const [remove, { isLoading: removing }] = useRemoveFromWishlistByRefMutation();

  const saved = Boolean(refs?.shopifyProductIds.includes(product._id));
  const busy = adding || removing;

  const toggle = (event: React.MouseEvent) => {
    /* On a card the heart sits inside the product <Link>. */
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      openLogin(pathname);
      return;
    }
    if (busy) return;

    if (saved) {
      remove({ kind: 'shopify', ref: product._id });
    } else {
      const price = product.salePrice ?? product.basePrice;
      const image = primaryImage(product);
      add({
        kind: 'shopify',
        shopifyProductId: product._id,
        snapshot: {
          title: product.name.slice(0, 200),
          /* Only absolute URLs — the local placeholder isn't worth storing. */
          image: image.startsWith('http') ? image : undefined,
          /* Product prices are minor units; the snapshot stores major units. */
          price: price / 100,
          currency: product.currency,
          handle: product.slug,
        },
      });
    }
  };

  /* Avoid a hydration flash of the wrong state. */
  if (!isHydrated) return null;

  const label = saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`;

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          'flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border transition',
          saved ? 'border-[#8D2F46] bg-[#FBEFF2] text-[#8D2F46]' : 'border-[#DDD6CC] text-[#444] hover:border-[#8D2F46]',
          className,
        )}
      >
        <Heart size={22} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-105',
        saved ? 'text-[#8D2F46]' : 'text-[#444]',
        className,
      )}
    >
      <Heart size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
