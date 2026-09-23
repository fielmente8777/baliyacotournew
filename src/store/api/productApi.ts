/**
 * Public catalog endpoints.
 *
 * Products, variants and specs now come straight from Shopify's Storefront
 * API (see lib/shopifyStorefront.ts) — this app's own backend is not in the
 * request path for browsing at all, so it keeps working even if
 * baliye-node is down. Garment types are a different story: Shopify has no
 * such concept, so those two endpoints at the bottom are untouched and
 * still hit this app's own backend.
 */

import type {
  GarmentType,
  Paginated,
  Product,
  ProductListQuery,
  ProductOption,
  ProductSpec,
  ProductVariant,
} from '@/@types/product';
import {
  SPEC_METAFIELD_IDENTIFIERS,
  shopifyStorefrontFetch,
} from '@/lib/shopifyStorefront';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

/* ---- Shopify Storefront plumbing ---- */

const PRODUCT_FIELDS = `
  id
  handle
  title
  descriptionHtml
  tags
  productType
  featuredImage { url altText }
  images(first: 10) { edges { node { url altText } } }
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
  }
  options { name values }
  variants(first: 50) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        availableForSale
        quantityAvailable
        selectedOptions { name value }
      }
    }
  }
  metafields(identifiers: $specs) { key namespace value }
`;

const LIST_PRODUCTS = `
  query ListProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $specs: [HasMetafieldsIdentifier!]!) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

const PRODUCT_BY_HANDLE = `
  query ProductByHandle($handle: String!, $specs: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: { name: string; value: string }[];
}

interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string | null;
  tags: string[];
  productType: string | null;
  featuredImage: { url: string; altText: string | null } | null;
  images: { edges: { node: { url: string; altText: string | null } }[] };
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney } | null;
  options: { name: string; values: string[] }[];
  variants: { edges: { node: ShopifyVariantNode }[] };
  /* Storefront's metafields(identifiers:) returns a plain array aligned to
     the identifiers list, not a connection — entries are null when that
     metafield hasn't been filled in for this product. */
  metafields: ({ key: string; namespace: string; value: string } | null)[];
}

const toMinorUnits = (amount: string) => Math.round(parseFloat(amount) * 100);

const humanizeKey = (key: string) => key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function mapStorefrontProduct(node: ShopifyProductNode): Product {
  const tags = node.tags.map((t) => t.toLowerCase());

  const images =
    node.images.edges.length > 0
      ? node.images.edges.map(({ node: img }, i) => ({ url: img.url, alt: img.altText ?? undefined, position: i }))
      : node.featuredImage
        ? [{ url: node.featuredImage.url, alt: node.featuredImage.altText ?? undefined, position: 0 }]
        : [];

  const price = toMinorUnits(node.priceRange.minVariantPrice.amount);
  const compareAt = node.compareAtPriceRange?.minVariantPrice
    ? toMinorUnits(node.compareAtPriceRange.minVariantPrice.amount)
    : undefined;
  /* Shopify's compareAtPrice is the crossed-out ORIGINAL price (higher than
     what's charged) — opposite direction from this app's old basePrice/
     salePrice pair, so the mapping inverts on purpose. */
  const basePrice = compareAt && compareAt > price ? compareAt : price;
  const salePrice = compareAt && compareAt > price ? price : undefined;

  const variants: ProductVariant[] = node.variants.edges.map(({ node: v }) => ({
    id: v.id,
    title: v.title,
    price: toMinorUnits(v.price.amount),
    compareAtPrice: v.compareAtPrice ? toMinorUnits(v.compareAtPrice.amount) : undefined,
    availableForSale: v.availableForSale,
    inventoryQuantity: v.quantityAvailable,
    selectedOptions: v.selectedOptions.filter((o) => o.name !== 'Title'),
  }));

  const options: ProductOption[] = node.options.filter((o) => o.name !== 'Title');

  const specs: ProductSpec[] = node.metafields
    .filter((m): m is { key: string; namespace: string; value: string } => m !== null)
    .map((m) => ({ key: m.key, label: humanizeKey(m.key), value: m.value }));

  const trackedVariants = variants.filter((v) => v.inventoryQuantity !== null);

  return {
    _id: node.id,
    slug: node.handle,
    name: node.title,
    description: node.descriptionHtml ?? undefined,
    shortDescription: (node.descriptionHtml ?? '').replace(/<[^>]+>/g, '').slice(0, 200),
    tags,
    sku: undefined,
    basePrice,
    salePrice,
    currency: node.priceRange.minVariantPrice.currencyCode,
    images,
    options,
    variants,
    specs,
    ratingAverage: 0,
    ratingCount: 0,
    isBestseller: tags.includes('bestseller'),
    isEditorsPick: tags.includes('editors-pick'),
    isMadeToOrder: tags.includes('made-to-order'),
    canCustomize: tags.includes('custom'),
    productType: node.productType || null,
    trackInventory: trackedVariants.length > 0,
    stock: trackedVariants.reduce((sum, v) => sum + (v.inventoryQuantity ?? 0), 0),
  };
}

const SORT_KEYS: Record<string, { sortKey: string; reverse: boolean }> = {
  newest: { sortKey: 'CREATED_AT', reverse: true },
  'price-asc': { sortKey: 'PRICE', reverse: false },
  'price-desc': { sortKey: 'PRICE', reverse: true },
  popular: { sortKey: 'BEST_SELLING', reverse: false },
  /* No native rating field on Shopify — reviews live in this app's own
     system, not joined in here yet. */
  rating: { sortKey: 'CREATED_AT', reverse: true },
};

function buildSearchQuery(query: ProductListQuery, excludeHandle?: string) {
  const clauses = ['status:active'];
  if (query.tag) clauses.push(`tag:'${query.tag}'`);
  if (query.badge) clauses.push(`tag:'${query.badge}'`);
  if (query.search) clauses.push(`title:*${query.search}*`);
  if (excludeHandle) clauses.push(`-handle:'${excludeHandle}'`);
  return clauses.join(' AND ');
}

async function fetchProducts(query: ProductListQuery, excludeHandle?: string, productType?: string) {
  const { sortKey, reverse } = SORT_KEYS[query.sort ?? 'newest'] ?? SORT_KEYS.newest;
  const searchQuery = productType
    ? `${buildSearchQuery(query, excludeHandle)} AND product_type:'${productType}'`
    : buildSearchQuery(query, excludeHandle);

  const data = await shopifyStorefrontFetch<{ products: { edges: { node: ShopifyProductNode }[] } }>(
    LIST_PRODUCTS,
    { first: 250, query: searchQuery, sortKey, reverse, specs: SPEC_METAFIELD_IDENTIFIERS },
  );

  let items = data.products.edges.map(({ node }) => mapStorefrontProduct(node));

  if (query.minPrice !== undefined) items = items.filter((p) => p.basePrice >= query.minPrice!);
  if (query.maxPrice !== undefined) items = items.filter((p) => p.basePrice <= query.maxPrice!);

  return items;
}

/* ---- RTK Query slice ---- */

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<Product>, ProductListQuery | void>({
      queryFn: async (query) => {
        try {
          const q = query ?? {};
          const page = q.page ?? 1;
          const limit = q.limit ?? 20;
          const items = await fetchProducts(q);
          const skip = (page - 1) * limit;

          return {
            data: {
              items: items.slice(skip, skip + limit),
              meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
            },
          };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query<Product, string>({
      queryFn: async (slug) => {
        try {
          const data = await shopifyStorefrontFetch<{ product: ShopifyProductNode | null }>(PRODUCT_BY_HANDLE, {
            handle: slug,
            specs: SPEC_METAFIELD_IDENTIFIERS,
          });

          if (!data.product) {
            return { error: { status: 404, data: { message: 'Product not found' } } };
          }

          return { data: mapStorefrontProduct(data.product) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Product'],
    }),

    getRelatedProducts: builder.query<Product[], string>({
      queryFn: async (slug, api, extraOptions, baseQuery) => {
        try {
          const data = await shopifyStorefrontFetch<{ product: ShopifyProductNode | null }>(PRODUCT_BY_HANDLE, {
            handle: slug,
            specs: SPEC_METAFIELD_IDENTIFIERS,
          });

          const productType = data.product?.productType;
          if (!productType) return { data: [] };

          const items = await fetchProducts({}, slug, productType);
          return { data: items.slice(0, 4) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Product'],
    }),

    /* ---- Garment types — still this app's own backend, unchanged ---- */

    getGarmentTypes: builder.query<GarmentType[], { family?: string } | void>({
      query: (arg) => ({
        url: '/garment-types',
        params: Object.fromEntries(Object.entries(arg ?? {}).filter(([, v]) => v !== undefined && v !== '')),
      }),
      transformResponse: (res: ApiEnvelope<GarmentType[]>) => unwrap(res),
      providesTags: ['GarmentType'],
    }),

    getGarmentTypeBySlug: builder.query<GarmentType, string>({
      query: (slug) => `/garment-types/${slug}`,
      transformResponse: (res: ApiEnvelope<GarmentType>) => unwrap(res),
      providesTags: ['GarmentType'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetGarmentTypesQuery,
  useGetGarmentTypeBySlugQuery,
} = productApi;
