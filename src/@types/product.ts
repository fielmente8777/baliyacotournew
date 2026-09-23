/** Product types — now sourced from Shopify's Storefront API, not Mongo. */

export interface ProductImage {
  url: string;
  alt?: string;
  position: number;
}

/** One buyable variant — a specific Size/Fabric/Color combination. */
export interface ProductVariant {
  id: string;
  title: string;
  /** Minor units (paise), matching formatINR's existing (price / 100) callers. */
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  inventoryQuantity: number | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

/** A labeled spec line for the "Product Detail" bullet list — from metafields. */
export interface ProductSpec {
  key: string;
  label: string;
  value: string;
}

export interface Product {
  /** Shopify's product GID — kept as `_id` so existing React keys / cart calls don't need renaming. */
  _id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;

  tags: string[];
  sku?: string;

  /** Minor units. `salePrice`, when set, is what's actually charged; `basePrice` is the crossed-out reference price. */
  basePrice: number;
  salePrice?: number;
  currency: string;

  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  specs: ProductSpec[];

  /** No Shopify-native equivalent yet — reviews live in this app's own system, not wired in here. */
  ratingAverage: number;
  ratingCount: number;

  isBestseller: boolean;
  isEditorsPick: boolean;
  isMadeToOrder: boolean;
  /** Drives the "Customize" CTA — true when the product is tagged `custom` in Shopify. */
  canCustomize: boolean;

  productType: string | null;

  /* Inventory tracking is per-variant on Shopify; kept as a product-level
     summary (true if ANY variant is out of stock and trackable) so
     AddToCartButton's existing check doesn't need reshaping yet. */
  trackInventory: boolean;
  stock: number;
}

/** Query params accepted by GET products. */
export interface ProductListQuery {
  /** No longer filters anything — Collections/garment-type browsing needs
      its own decision (Shopify Collections vs. product type) before this
      does something again. Left in the type so CollectionsView still compiles. */
  garmentTypeId?: string;
  tag?: string;
  badge?: 'bestseller' | 'editors-pick';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** Still backend-owned (Mongo) — garment types aren't a Shopify concept. */
export interface GarmentType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  family: 'indian' | 'western' | 'indo-western';
  basePrice: number;
  isDesignable: boolean;
  position: number;
}

export const isCustomizable = (product: Product) => product.canCustomize;

export const primaryImage = (product: Product) =>
  [...product.images].sort((a, b) => a.position - b.position)[0]?.url ?? '/Rectangle-23959.png';
