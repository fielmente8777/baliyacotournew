/** Cart types. Mirrors baliye-node models/cart.ts as returned by GET /cart. */

import type { Product } from './product';

/**
 * What a line points at.
 *   product — bought as-is, no customization
 *   design  — a saved CustomDesign, from the builder or a customized product
 */
export type CartItemKind = 'product' | 'design';

export interface CartDesign {
  _id: string;
  name?: string;
  garmentTypeId: string;
  selections: {
    groupLabel: string;
    optionLabel: string;
    priceModifier: number;
  }[];
  pricing: {
    basePrice: number;
    adjustments: { label: string; amount: number }[];
    total: number;
  };
  instructions?: string;
}

export interface CartItem {
  _id: string;
  kind: CartItemKind;
  /** Populated by the API; a bare id if population ever fails. */
  productId?: Product | string;
  customDesignId?: CartDesign | string;
  quantity: number;
  /** Minor units, recomputed server-side at add time. */
  unitPrice: number;
  measurementProfileId?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export interface AddToCartBody {
  kind: CartItemKind;
  productId?: string;
  /** Shopify variant GID (e.g. size S/M/L). When present with kind:'product',
      useCart.ts routes the whole add() call to Shopify's Cart API instead
      of this backend — see store/api/cartApi.ts. Kept on this type only so
      AddToCartButton has one body shape to build regardless of destination;
      baliye-node's /cart never sees it. */
  variantId?: string;
  customDesignId?: string;
  quantity?: number;
  measurementProfileId?: string;
}

export interface UpdateCartItemBody {
  quantity?: number;
  measurementProfileId?: string;
}

/** Derived client-side — the API returns items, not a total. */
export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

/** Narrows a populated reference, falling back when population failed. */
export const cartProduct = (item: CartItem): Product | null =>
  item.kind === 'product' && item.productId && typeof item.productId !== 'string'
    ? item.productId
    : null;

export const cartDesign = (item: CartItem): CartDesign | null =>
  item.kind === 'design' && item.customDesignId && typeof item.customDesignId !== 'string'
    ? item.customDesignId
    : null;
