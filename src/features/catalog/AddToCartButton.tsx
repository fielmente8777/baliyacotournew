'use client';

/**
 * Add to Cart for a pre-designed product.
 *
 * Signed-out visitors are routed to /login and returned here, rather than
 * being shown an error — the cart endpoint is authenticated.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/hooks/useCart';
import type { Product, ProductVariant } from '@/@types/product';

interface Props {
  product: Product;
  /** The size/option currently picked in VariantSelector, if the product has options. */
  variant?: ProductVariant | null;
  className?: string;
}

export default function AddToCartButton({ product, variant, className }: Props) {
  const router = useRouter();
  const { add, isAdding } = useCart();
  const [state, setState] = useState<'idle' | 'added'>('idle');
  const [error, setError] = useState<string | null>(null);

  /* Per-variant availableForSale is what Shopify actually knows here —
     product.trackInventory/stock stay false/0 until the Storefront token
     has the unauthenticated_read_product_inventory scope (see earlier
     debugging), so they're not reliable yet. */
  const outOfStock = variant ? !variant.availableForSale : false;

  const handleClick = async () => {
    setError(null);

    /* kind:'product' + variantId routes through useCart to Shopify's own
       Cart API now (see hooks/useCart.ts, store/api/cartApi.ts) — this no
       longer goes near baliye-node's /cart at all for catalog products.
       productId is harmless to still send but unused on that path. */
    try {
      const result = await add(
        {
          kind: 'product',
          productId: product._id,
          ...(variant ? { variantId: variant.id } : {}),
          quantity: 1,
        },
        `/products/${product.slug}`
      );

      /* null means we redirected to login — don't flash "Added". */
      if (!result) return;

      setState('added');
      setTimeout(() => setState('idle'), 2500);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'Could not add this to your cart.');
    }
  };

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`flex-1 cursor-not-allowed rounded-full bg-[#E4E4E4] py-4 font-medium text-[#999] ${className ?? ''}`}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={isAdding}
          className={`flex-1 rounded-full bg-black py-4 font-medium text-white transition-opacity disabled:opacity-60 ${className ?? ''}`}
        >
          {isAdding ? 'Adding…' : state === 'added' ? 'Added ✓' : 'Add to Cart'}
        </button>

        {state === 'added' && (
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="rounded-full border border-black px-6 py-4 text-sm font-medium"
          >
            View Cart
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-secondary">{error}</p>}
    </div>
  );
}
