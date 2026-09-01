'use client';

/**
 * Cart totals and an add-to-cart helper.
 *
 * Totals are derived in one place so the cart page, the price summary and the
 * navbar badge can never disagree. Prices from the API are in minor units;
 * everything here works in minor units and only the display layer divides.
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useAddToCartMutation, useGetCartQuery } from '@/store/api/cartApi';
import { useAppSelector } from '@/store/hooks';
import type { AddToCartBody, CartTotals } from '@/@types/cart';

const SHIPPING_COST = 0;
const DISCOUNT = 0;

export function useCart() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.accessToken));

  /* The cart endpoint is authenticated — don't fire it for a signed-out visitor. */
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

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

  /**
   * Adds an item, sending a signed-out visitor to login first and returning
   * them to where they were. Throws on failure so callers can show a message.
   */
  const add = async (body: AddToCartBody, redirectTo?: string) => {
    if (!isAuthenticated) {
      const target = redirectTo ?? window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return null;
    }

    return addToCart(body).unwrap();
  };

  return { cart, items, totals, isLoading, isError, refetch, add, isAdding, isAuthenticated };
}
