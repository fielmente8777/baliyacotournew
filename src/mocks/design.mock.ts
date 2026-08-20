/**
 * Static fixtures for the Create Your Own Design flow.
 *
 * Consumed ONLY by the RTK Query mock layer (store/api/designApi.ts).
 * Components never import this file directly — they always go through
 * hooks, so flipping NEXT_PUBLIC_USE_MOCKS=false needs no component change.
 */

import type { DesignPricing, EmbroideryStyle, Fabric, FabricColour } from '@/@types/design';

/** Shared colourway set — most fabrics offer the same five. */
const defaultColours = (slug: string, swatch: string): FabricColour[] => [
  { _id: `${slug}-rose`, label: 'Rose', hex: '#D9A2A6', swatchImage: swatch, priceModifier: 0 },
  { _id: `${slug}-ochre`, label: 'Ochre', hex: '#D68B3C', priceModifier: 0 },
  { _id: `${slug}-sage`, label: 'Sage', hex: '#8FA98A', priceModifier: 0 },
  { _id: `${slug}-stone`, label: 'Stone', hex: '#9C9C94', priceModifier: 0 },
  { _id: `${slug}-fuchsia`, label: 'Fuchsia', hex: '#C94FC0', priceModifier: 0 },
];

const fabric = (
  slug: string,
  label: string,
  priceLabel: string,
  priceModifier: number
): Fabric => ({
  _id: `fab-${slug}`,
  category: 'fabric',
  label,
  value: slug,
  swatchImage: `/fabric/${slug}.png`,
  heroImage: `/fabric/${slug}.png`,
  priceLabel,
  priceModifier,
  isActive: true,
  colours: defaultColours(slug, `/fabric/${slug}.png`),
});

export const mockFabrics: Fabric[] = [
  fabric('cotton', 'Cotton', '$8 -$10 per meter', 0),
  fabric('silk', 'Silk', '$18 -$24 per meter', 0),
  fabric('wool', 'Wool', '$14 -$20 per meter', 0),
  fabric('cashmere', 'Cashmere', '$40 -$60 per meter', 0),
  fabric('satin', 'Satin', '$12 -$16 per meter', 0),
  fabric('kanjivaram', 'Kanjivaram Silk', '$45 -$70 per meter', 0),
  fabric('linen', 'Linen', '$10 -$14 per meter', 0),
  fabric('velvet', 'Velvet', '$22 -$30 per meter', 0),
  fabric('georgette', 'Georgette', '$9 -$13 per meter', 0),
  fabric('denim', 'Denim', '$8 -$10 per meter', 0),
  fabric('rayon', 'Rayon', '$7 -$9 per meter', 0),
  fabric('spandex', 'Spandex', '$6 -$9 per meter', 0),
];

export const mockEmbroidery: EmbroideryStyle[] = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    _id: `emb-${n}`,
    category: 'lining' as const,
    label: `Style ${i + 1}`,
    value: `style-${n}`,
    previewImage: `/embroidery/style-${n}.png`,
    swatchImage: `/embroidery/style-${n}.png`,
    priceModifier: 0,
    isActive: true,
  };
});

/** Base garment price before any option modifiers. */
export const MOCK_BASE_PRICE = 23170;

export const mockPricing: DesignPricing = {
  basePrice: MOCK_BASE_PRICE,
  fabricModifier: 0,
  colourModifier: 0,
  embroideryModifier: 0,
  totalPrice: MOCK_BASE_PRICE,
  currency: 'INR',
};

/** Preview art used by ProductStage. */
export const PREVIEW_IMAGES = {
  garment: '/customization/kurta-preview.png',
  mannequin: '/customization/mannequin.png',
} as const;
