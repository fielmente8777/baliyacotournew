/**
 * Product reviews, stored in Shopify as metaobjects (Content → Metaobjects →
 * "Product Review"). baliye-node keeps no copy.
 *
 * Reading uses the public Storefront token, straight from the browser — the
 * definition has Storefront access "PUBLIC_READ". Writing needs the Admin
 * API, so it goes through this app's own /api/reviews route.
 *
 * FIELD KEYS must match the definition in Shopify admin. Shopify derives a key
 * from the label (e.g. "Reviewer Name" -> reviewer_name); if any key differs,
 * change it here only.
 */

import { shopifyStorefrontFetch } from './shopifyStorefront';

/* Shopify prefixed the type when the definition was created in admin. */
export const REVIEW_TYPE = 'custom_product_review';

export const REVIEW_FIELDS = {
  rating: 'rating',
  reviewerName: 'reviewer_name',
  body: 'review_body',
  productId: 'product_id',
  createdAt: 'created_at',
  /* Optional fields — used only when they exist on the definition. */
  title: 'title',
  images: 'images',
  orderId: 'order_id',
  approved: 'approved',
} as const;

export interface ShopifyReview {
  id: string;
  rating: number;
  reviewerName: string;
  title?: string;
  body?: string;
  productId?: string;
  orderId?: string;
  images: string[];
  createdAt?: string;
}

interface MetaobjectField {
  key: string;
  value: string | null;
  references?: { nodes: ({ image?: { url: string } | null } | null)[] } | null;
}

interface MetaobjectNode {
  id: string;
  updatedAt: string;
  fields: MetaobjectField[];
}

const REVIEWS_QUERY = `
  query Reviews($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first, sortKey: "updated_at", reverse: true) {
      nodes {
        id
        updatedAt
        fields {
          key
          value
          references(first: 6) { nodes { ... on MediaImage { image { url } } } }
        }
      }
    }
  }
`;

function toReview(node: MetaobjectNode): ShopifyReview | null {
  const get = (key: string) => node.fields.find((f) => f.key === key);
  const value = (key: string) => get(key)?.value ?? undefined;

  /* A review hidden in Shopify admin (Approved = false) stays off the site. */
  if (value(REVIEW_FIELDS.approved) === 'false') return null;

  const rating = Number(value(REVIEW_FIELDS.rating));
  if (!Number.isFinite(rating) || rating <= 0) return null;

  const images = (get(REVIEW_FIELDS.images)?.references?.nodes ?? [])
    .map((n) => n?.image?.url)
    .filter((url): url is string => Boolean(url));

  return {
    id: node.id,
    rating: Math.min(5, rating),
    reviewerName: value(REVIEW_FIELDS.reviewerName) || 'Customer',
    title: value(REVIEW_FIELDS.title),
    body: value(REVIEW_FIELDS.body),
    productId: value(REVIEW_FIELDS.productId),
    orderId: value(REVIEW_FIELDS.orderId),
    images,
    createdAt: value(REVIEW_FIELDS.createdAt) ?? node.updatedAt,
  };
}

/**
 * Every visible review, newest first. A small store fits in one page; when
 * reviews pass a few hundred, move the filtering to a Shopify search query.
 */
export async function fetchAllReviews(): Promise<ShopifyReview[]> {
  const data = await shopifyStorefrontFetch<{ metaobjects: { nodes: MetaobjectNode[] } }>(REVIEWS_QUERY, {
    type: REVIEW_TYPE,
    first: 250,
  });
  return data.metaobjects.nodes.map(toReview).filter((r): r is ShopifyReview => r !== null);
}
