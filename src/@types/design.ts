/**
 * Custom design types. Mirrors baliye-node's configuration-driven engine —
 * services/customization.ts and services/design.v2.ts.
 */

export type OptionInputType =
  | 'single_select'
  | 'multi_select'
  | 'color_select'
  | 'size_select'
  | 'measurement'
  | 'number'
  | 'text'
  | 'image_upload';

export interface DesignOption {
  _id: string;
  label: string;
  value: string;
  image?: string;
  hex?: string;
  /** Minor units, added to the base price when chosen. */
  priceModifier: number;
}

/**
 * One step in the builder. Which steps exist, their order and whether they are
 * required all come from the garment type's configuration — the frontend
 * renders whatever the product team set up, and knows nothing about "fabric"
 * or "neck" specifically.
 */
export interface DesignGroup {
  _id: string;
  code: string;
  label: string;
  inputType: OptionInputType;
  isRequired: boolean;
  /** False while its dependency is unmet — hidden until then. */
  isVisible: boolean;
  position: number;
  defaultOption: string | null;
  dependsOn: { groupId: string; optionIds: string[] } | null;
  options: DesignOption[];
}

export interface DesignConfig {
  garmentType: {
    _id: string;
    name: string;
    slug: string;
    measurementTemplates: string[];
  };
  /** Set when customizing a pre-designed product. */
  product: {
    _id: string;
    name: string;
    slug: string;
    images: { url: string; alt?: string; position: number }[];
  } | null;
  basePrice: number;
  presetSelections: { groupId: string; optionId: string }[];
  groups: DesignGroup[];
}

export interface PriceBreakdown {
  basePrice: number;
  adjustments: { label: string; amount: number }[];
  discount: number;
  total: number;
  currency: string;
}

export interface SelectionInput {
  groupId: string;
  optionId: string;
}

export interface CreateDesignBody {
  garmentTypeId?: string;
  productId?: string;
  name?: string;
  selections: SelectionInput[];
  measurementProfileId?: string;
  sizeOptionId?: string;
  instructions?: string;
}

export interface SavedDesign {
  _id: string;
  name?: string;
  garmentTypeId: string;
  sourceProductId?: string;
  selections: {
    groupId: string;
    groupLabel: string;
    optionId: string;
    optionLabel: string;
    priceModifier: number;
  }[];
  pricing: PriceBreakdown;
  instructions?: string;
  createdAt: string;
}

/**
 * The builder's own steps, appended after the configured option groups.
 * Measurements and instructions aren't option groups on the backend, but they
 * are steps in the customer's journey (§28).
 */
export type BuilderStep =
  | { kind: 'option'; group: DesignGroup }
  | { kind: 'measurement' }
  | { kind: 'instructions' }
  | { kind: 'review' };
