/** Wishlist types. Mirrors baliye-node services/wishlist.ts. */

export type WishlistKind = 'product' | 'design' | 'shopify';

export interface WishlistItem {
  _id: string;
  kind: WishlistKind;
  addedAt: string;
  available: boolean;
  title: string;
  image?: string;
  /** Shopify items: MAJOR units as stored in the snapshot. */
  price?: number;
  currency?: string;
  /** Shopify product handle — links to /products/<handle>. */
  handle?: string;
  shopifyProductId?: string;
  productId?: string;
  customDesignId?: string;
}

export interface Wishlist {
  count: number;
  items: WishlistItem[];
}

export interface WishlistRefs {
  productIds: string[];
  designIds: string[];
  shopifyProductIds: string[];
}

export interface AddShopifyWishlistBody {
  kind: 'shopify';
  shopifyProductId: string;
  snapshot: {
    title: string;
    image?: string;
    price?: number;
    currency?: string;
    handle?: string;
  };
}
