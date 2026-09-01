'use client';

/**
 * Cart totals, derived in one place so the cart page, the price summary and
 * the navbar badge can never disagree.
 *
 * The API returns line items, not a total — deliberately, since the authoritative
 * total is recomputed at order placement anyway. Shipping and discount are
 * placeholders until the backend exposes them.
 */

import { useMemo } from 'react';
import { useGetCartQuery } from '@/store/api/cartApi';
import type { CartTotals } from '@/@types/cart';

const SHIPPING_COST = 0;
const DISCOUNT = 0;

export function useCart() {
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery();

  const items = cart?.items ?? [];

  const totals: CartTotals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      itemCount,
      subtotal,
      shipping: SHIPPING_COST,
      discount: DISCOUNT,
      total: Math.max(subtotal + SHIPPING_COST - DISCOUNT, 0),
    };
  }, [items]);

  return { cart, items, totals, isLoading, isError, refetch };
}
