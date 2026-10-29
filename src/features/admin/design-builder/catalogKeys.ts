import type { AdminCatalog, AdminGarment, AdminOption, AdminOptionGroup } from '@/@types/admin';

/**
 * Shopify "Design Option" keys, the same ones lib/designImages.ts reads and
 * baliye-node's designCatalogSync matches on. The panel builds them so the
 * admin never has to type one.
 */
export const garmentKey = (g: Pick<AdminGarment, 'slug'>) => `garment/${g.slug}`;
export const previewKey = (g: Pick<AdminGarment, 'slug'>) => `preview/${g.slug}`;
export const optionKey = (group: Pick<AdminOptionGroup, 'code'>, o: Pick<AdminOption, 'value'>) =>
  `option/${group.code}/${o.value}`;

/** Colour shows swatches and Size shows buttons — no pictures (see scripts/seedDesignImages.mjs). */
export const groupUsesImages = (group: AdminOptionGroup) =>
  group.inputType !== 'color_select' && group.inputType !== 'size_select';

export interface MissingImage {
  key: string;
  label: string;
}

/** Active garments and options the builder will show without a picture. */
export function findMissingImages(catalog: AdminCatalog): MissingImage[] {
  const missing: MissingImage[] = [];
  const has = (key: string) => Boolean(catalog.images[key]);

  for (const g of catalog.garments) {
    if (!g.isActive) continue;
    if (!has(garmentKey(g))) missing.push({ key: garmentKey(g), label: `${g.name} — card` });
    if (!has(previewKey(g))) missing.push({ key: previewKey(g), label: `${g.name} — preview` });
  }

  const groupById = new Map(catalog.groups.map((g) => [g._id, g]));
  for (const o of catalog.options) {
    const group = groupById.get(o.groupId);
    if (!group || !o.isActive || !groupUsesImages(group)) continue;
    if (!has(optionKey(group, o))) missing.push({ key: optionKey(group, o), label: `${group.label} — ${o.label}` });
  }

  return missing;
}

export const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
