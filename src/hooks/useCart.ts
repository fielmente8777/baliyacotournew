'use client';

/**
 * Cart totals and an add-to-cart helper.
 *
 * Two separate carts feed into one list here:
 *   - baliye-node's own cart — custom designs only now (see cartApi.ts).
 *   - Shopify's Cart API — catalog products.
 *
 * `items` is a merged, UI-shaped list (MergedCartItem) rather than either
 * backend's raw shape — CartItem.tsx renders this, not Cart/ShopifyCart
 * directly, so it doesn't need to know which source a line came from
 * except to call the right remove/update mutation.
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import {
  useAddToCartMutation,
  useGetCartQuery,
  useAddToShopifyCartMutation,
  useGetShopifyCartQuery,
  useRemoveShopifyCartLineMutation,
  useUpdateShopifyCartLineMutation,
} from '@/store/api/cartApi';
import { useAppSelector } from '@/store/hooks';
import { cartDesign, type AddToCartBody, type CartTotals } from '@/@types/cart';

const SHIPPING_COST = 0;
const DISCOUNT = 0;
const DESIGN_PLACEHOLDER_IMAGE = '/Rectangle-23959.png';

/** Shopify amounts are decimal strings ("1299.00"); everything downstream
    (formatINR, CartTotals) works in minor units like the rest of the app. */
const toMinorUnits = (amount: string) => Math.round(parseFloat(amount) * 100);

export type MergedCartItem = {
  /** For a Shopify line this is the cart LINE id (not the variant id) —
      that's what update/remove need. For a design it's the backend
      CartItem's _id. */
  id: string;
  source: 'shopify' | 'backend';
  kind: 'product' | 'design';
  title: string;
  image: string;
  slug?: string;
  quantity: number;
  /** Minor units. */
  unitPrice: number;
  availableForSale?: boolean;
  selections?: { groupLabel: string; optionLabel: string }[];
};

export function useCart() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.accessToken));

  /* The design cart is authenticated — don't fire it for a signed-out
     visitor. The Shopify cart is guest-cart style (id in localStorage), so
     it fetches regardless of auth — a size someone picked before signing
     in shouldn't vanish once they do. */
  const {
    data: backendCart,
    isLoading: isBackendLoading,
    isError: isBackendError,
    refetch: refetchBackend,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const {
    data: shopifyCartData,
    isLoading: isShopifyLoading,
    isError: isShopifyError,
    refetch: refetchShopify,
  } = useGetShopifyCartQuery();

  const [addToCart] = useAddToCartMutation();
  const [addToShopifyCart, { isLoading: isAddingShopify }] = useAddToShopifyCartMutation();
  const [updateShopifyLine] = useUpdateShopifyCartLineMutation();
  const [removeShopifyLine] = useRemoveShopifyCartLineMutation();

  const isLoading = isBackendLoading || isShopifyLoading;
  const isError = isBackendError || isShopifyError;
  const isAdding = isAddingShopify;

  const items: MergedCartItem[] = useMemo(() => {
    const designItems: MergedCartItem[] = (backendCart?.items ?? [])
      .filter((item) => item.kind === 'design')
      .map((item) => {
        const design = cartDesign(item);
        return {
          id: item._id,
          source: 'backend' as const,
          kind: 'design' as const,
          title: design?.name ?? 'Custom Design',
          image: DESIGN_PLACEHOLDER_IMAGE,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selections: design?.selections.map((s) => ({
            groupLabel: s.groupLabel,
            optionLabel: s.optionLabel,
          })),
        };
      });

    const shopifyItems: MergedCartItem[] = (shopifyCartData?.lines ?? []).map((line) => ({
      id: line.id,
      source: 'shopify' as const,
      kind: 'product' as const,
      title: line.merchandise.product.title,
      image: line.merchandise.image?.url ?? DESIGN_PLACEHOLDER_IMAGE,
      slug: line.merchandise.product.handle,
      quantity: line.quantity,
      unitPrice: toMinorUnits(line.merchandise.price.amount),
      availableForSale: line.merchandise.availableForSale,
    }));

    return [...shopifyItems, ...designItems];
  }, [backendCart, shopifyCartData]);

  const totals: CartTotals = useMemo(() => {
    const shopifySubtotal = shopifyCartData
      ? toMinorUnits(shopifyCartData.cost.subtotalAmount.amount)
      : 0;

    const designSubtotal = items
      .filter((i) => i.source === 'backend')
      .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const subtotal = shopifySubtotal + designSubtotal;
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      itemCount,
      subtotal,
      shipping: SHIPPING_COST,
      discount: DISCOUNT,
      total: Math.max(subtotal + SHIPPING_COST - DISCOUNT, 0),
    };
  }, [items, shopifyCartData]);

  /**
   * Adds an item, sending a signed-out visitor to login first and returning
   * them to where they were. Throws on failure so callers can show a message.
   *
   * Branches on `kind` + `variantId`: a catalog product with a variant goes
   * to Shopify's cart; anything else (a design) goes to baliye-node's, same
   * as before.
   */
  const add = async (body: AddToCartBody, redirectTo?: string) => {
    if (!isAuthenticated) {
      const target = redirectTo ?? window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return null;
    }

    if (body.kind === 'product' && body.variantId) {
      return addToShopifyCart({ variantId: body.variantId, quantity: body.quantity ?? 1 }).unwrap();
    }

    return addToCart(body).unwrap();
  };

  /** Shopify lines only — design quantity changes still go through
      useUpdateCartItemMutation directly (see CartItem.tsx). */
  const updateQuantity = async (item: MergedCartItem, quantity: number) => {
    if (item.source !== 'shopify') {
      throw new Error('updateQuantity only handles Shopify lines — use useUpdateCartItemMutation for designs.');
    }
    return updateShopifyLine({ lineId: item.id, quantity }).unwrap();
  };

  /** Shopify lines only — see updateQuantity. */
  const remove = async (item: MergedCartItem) => {
    if (item.source !== 'shopify') {
      throw new Error('remove only handles Shopify lines — use useRemoveCartItemMutation for designs.');
    }
    return removeShopifyLine({ lineId: item.id }).unwrap();
  };

  const refetch = () => {
    refetchBackend();
    refetchShopify();
  };

  const hasShopifyItems = items.some((i) => i.source === 'shopify');
  const hasDesignItems = items.some((i) => i.source === 'backend');

  return {
    items,
    totals,
    isLoading,
    isError,
    refetch,
    add,
    updateQuantity,
    remove,
    isAdding,
    isAuthenticated,
    /** Where a Shopify-items checkout should redirect to. Null until a
        Shopify cart exists (nothing added yet, or design-only cart). */
    checkoutUrl: shopifyCartData?.checkoutUrl ?? null,
    hasShopifyItems,
    hasDesignItems,
  };
}
