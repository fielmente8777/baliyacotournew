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
import type { Product } from '@/@types/product';

interface Props {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className }: Props) {
  const router = useRouter();
  const { add, isAdding } = useCart();
  const [state, setState] = useState<'idle' | 'added'>('idle');
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.trackInventory && product.stock <= 0;

  const handleClick = async () => {
    setError(null);

    try {
      const result = await add(
        { kind: 'product', productId: product._id, quantity: 1 },
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
