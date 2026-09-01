/** Product + garment type types. Mirrors baliye-node models/product.ts. */

export type ProductMode = 'predesigned' | 'customizable' | 'both';
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type ProductImageType =
  | 'front'
  | 'back'
  | 'side'
  | 'detail'
  | 'model'
  | 'fabric'
  | 'embroidery'
  | 'guide';

export interface ProductImage {
  url: string;
  alt?: string;
  type: ProductImageType;
  position: number;
  /** Shown only when this colour is selected. */
  colorOptionId?: string;
}

export interface OptionConfig {
  groupId: string;
  position: number;
  isRequired: boolean;
  allowedOptions: string[];
  defaultOption?: string;
  dependsOn?: { groupId: string; optionIds: string[] };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;

  garmentTypeId: string;
  mode: ProductMode;
  status: ProductStatus;

  brand?: string;
  tags: string[];
  sku?: string;

  /** Minor units — divide by 100 to display. */
  basePrice: number;
  salePrice?: number;
  currency: string;

  images: ProductImage[];
  videos: string[];

  customizableOptions: OptionConfig[];
  presetSelections: { groupId: string; optionId: string }[];

  trackInventory: boolean;
  stock: number;
  isMadeToOrder: boolean;
  leadTimeDays: number;

  isBestseller: boolean;
  isEditorsPick: boolean;

  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
}

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

/** Query params accepted by GET /products. */
export interface ProductListQuery {
  garmentTypeId?: string;
  tag?: string;
  badge?: 'bestseller' | 'editors-pick';
  mode?: ProductMode;
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

/**
 * A product is worth opening the design page for when the team has marked it
 * customizable AND configured at least one option group to change.
 */
export const isCustomizable = (product: Product) =>
  product.mode !== 'predesigned' && product.customizableOptions.length > 0;

/** Primary image, honouring the admin's ordering. */
export const primaryImage = (product: Product) =>
  [...product.images].sort((a, b) => a.position - b.position)[0]?.url ?? '/Rectangle-23959.png';
