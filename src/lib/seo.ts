/**
 * Server-side SEO helpers: site constants, and the Shopify reads that
 * metadata, JSON-LD and the sitemap need.
 *
 * The product page itself still loads client-side through RTK Query. These
 * reads exist because crawlers and link previews (WhatsApp, Facebook, X)
 * only see the server-rendered HTML, so title, description, image and
 * price have to be in it. Results are cached for an hour, so a product
 * edited in Shopify shows up in search snippets within the hour.
 */

import { cache } from 'react';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = 'Baliye Couture';
export const DEFAULT_DESCRIPTION =
  'Handcrafted ethnic wear, ready to wear or made to your measurements. Design your own outfit with Baliye Couture.';

/**
 * Only the live domain should be indexed. Leave this unset on local, ngrok
 * and staging so Google never lists a test URL; set
 * NEXT_PUBLIC_ALLOW_INDEXING=true on production only.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

const API_VERSION = '2026-01';
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';
const REVALIDATE_SECONDS = 3600;

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!STORE_DOMAIN || !STOREFRONT_TOKEN) return null;
  try {
    const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    /* SEO extras must never take a page down; callers fall back to defaults. */
    return null;
  }
}

/* ---------------------------------------------------------------- products */

export interface SeoProduct {
  handle: string;
  title: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  vendor: string | null;
  productType: string | null;
  updatedAt: string;
  images: { url: string; altText: string | null; width: number | null; height: number | null }[];
  minPrice: { amount: string; currencyCode: string };
  maxPrice: { amount: string; currencyCode: string };
  availableForSale: boolean;
  variants: { sku: string | null; price: { amount: string; currencyCode: string }; availableForSale: boolean }[];
}

const PRODUCT_SEO_QUERY = `
  query ProductSeo($handle: String!) {
    product(handle: $handle) {
      handle
      title
      description
      vendor
      productType
      updatedAt
      availableForSale
      seo { title description }
      images(first: 6) { nodes { url altText width height } }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 50) { nodes { sku availableForSale price { amount currencyCode } } }
    }
  }
`;

interface ProductSeoPayload {
  product: {
    handle: string;
    title: string;
    description: string;
    vendor: string | null;
    productType: string | null;
    updatedAt: string;
    availableForSale: boolean;
    seo: { title: string | null; description: string | null };
    images: { nodes: SeoProduct['images'] };
    priceRange: { minVariantPrice: SeoProduct['minPrice']; maxVariantPrice: SeoProduct['maxPrice'] };
    variants: { nodes: SeoProduct['variants'] };
  } | null;
}

/**
 * `undefined` = Shopify couldn't be reached (keep the page, use defaults);
 * `null` = Shopify answered and the product doesn't exist (real 404).
 * Wrapped in React's cache() so generateMetadata and the page share one request.
 */
export const getSeoProduct = cache(async (handle: string): Promise<SeoProduct | null | undefined> => {
  const data = await storefront<ProductSeoPayload>(PRODUCT_SEO_QUERY, { handle });
  if (!data) return undefined;
  const p = data.product;
  if (!p) return null;
  return {
    handle: p.handle,
    title: p.title,
    description: p.description,
    seoTitle: p.seo.title,
    seoDescription: p.seo.description,
    vendor: p.vendor,
    productType: p.productType,
    updatedAt: p.updatedAt,
    images: p.images.nodes,
    minPrice: p.priceRange.minVariantPrice,
    maxPrice: p.priceRange.maxVariantPrice,
    availableForSale: p.availableForSale,
    variants: p.variants.nodes,
  };
});

/** Every published product handle, for the sitemap. Pages through the whole catalog. */
export async function getAllProductHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  const query = `
    query Handles($after: String) {
      products(first: 250, after: $after) {
        nodes { handle updatedAt }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
  type Page = {
    products: {
      nodes: { handle: string; updatedAt: string }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };

  const all: { handle: string; updatedAt: string }[] = [];
  let after: string | null = null;
  /* Hard stop at 20 pages (5,000 products) so a bad cursor can't loop forever. */
  for (let i = 0; i < 20; i++) {
    const data: Page | null = await storefront<Page>(query, { after });
    if (!data) break;
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return all;
}

/* ----------------------------------------------------------------- helpers */

/** Collapses whitespace and cuts to ~155 characters on a word boundary, for meta descriptions. */
export function toMetaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

/** Serialises JSON-LD safely for a <script> tag (escapes "<" so content can't close the tag). */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
