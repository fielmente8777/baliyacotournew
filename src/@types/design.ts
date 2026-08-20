/**
 * Domain types for the Create Your Own Design flow.
 * Mirrors baliye-node: models/designoption.ts + models/suit.ts
 */

/** Matches DESIGN_OPTION_CATEGORIES on the backend. */
export type DesignOptionCategory =
  | 'suitType'
  | 'color'
  | 'fabric'
  | 'lapel'
  | 'buttons'
  | 'pocketStyle'
  | 'collar'
  | 'sleeveStyle'
  | 'backStyle'
  | 'vent'
  | 'lining'
  | 'fit'
  | 'pantStyle'
  | 'pleats'
  | 'cuffs';

/** A single selectable swatch/option returned by GET /design/options. */
export interface DesignOption {
  _id: string;
  category: DesignOptionCategory;
  /** Display name, e.g. "Kanjivaram Silk" */
  label: string;
  /** Slug stored on the design, e.g. "kanjivaram-silk" */
  value: string;
  swatchImage?: string;
  /** Added to base price when selected. */
  priceModifier: number;
  isActive: boolean;
}

export interface FabricColour {
  _id: string;
  label: string;
  /** Hex used when no swatch image exists. */
  hex?: string;
  swatchImage?: string;
  priceModifier: number;
}

/** Fabric card in the grid — a DesignOption plus its colourways. */
export interface Fabric extends DesignOption {
  category: 'fabric';
  /** Badge shown on hover, e.g. "$8 -$10 per meter" */
  priceLabel?: string;
  /** Large image used in the expanded detail card. */
  heroImage?: string;
  colours: FabricColour[];
}

export interface EmbroideryStyle extends DesignOption {
  category: 'lining';
  previewImage: string;
}

/** The three entries on the styling rail. */
export type StylingStep = 'fabric' | 'embroidery' | 'option';

/**
 * Nested state inside a step. A discriminated union so the compiler
 * enforces that only one sub-screen can be open at a time.
 */
export type StepSubview =
  | { kind: 'list' }
  | { kind: 'fabricDetail'; fabricId: string }
  | { kind: 'newMeasurement' }
  | { kind: 'editMeasurement'; profileId: string };

/** Everything the user has chosen so far. */
export interface DesignSelection {
  fabricId: string | null;
  fabricColourId: string | null;
  embroideryId: string | null;
  measurementProfileId: string | null;
}

/** Price breakdown rendered by SummaryBar. */
export interface DesignPricing {
  basePrice: number;
  fabricModifier: number;
  colourModifier: number;
  embroideryModifier: number;
  totalPrice: number;
  currency: 'INR';
}

/** Payload for POST /design (create suit design). */
export interface CreateDesignPayload {
  name?: string;
  fabric?: string;
  color?: string;
  embroidery?: string;
  customNotes?: string;
}
