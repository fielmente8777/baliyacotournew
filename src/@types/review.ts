/** Reviews. Stored in Shopify as "Product Review" metaobjects — see lib/shopifyReviews.ts. */

export type { ShopifyReview as Review } from '@/lib/shopifyReviews';

export interface SaveReviewBody {
  /** Shopify Order GID. */
  orderId: string;
  /** Shopify Product GID. */
  productId: string;
  rating: number;
  title?: string;
  body?: string;
  /** Base64 JPEGs (no data: prefix), at most two. */
  images?: string[];
}
