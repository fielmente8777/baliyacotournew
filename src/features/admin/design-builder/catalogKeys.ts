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
  /** Which part it belongs to — "Garment cards", "Dupatta", "Fabric"… */
  group: string;
  /** The item within that part — "Kurti", "Chiffon"… */
  name: string;
  /** Both together, for a flat list. */
  label: string;
}

/** Missing pictures grouped by part, in the order the builder shows them. */
export interface MissingGroup {
  id: string;
  title: string;
  /** What these pictures are used for, in a few words. */
  hint: string;
  items: MissingImage[];
}

/** Active garments and options the builder will show without a picture. */
export function findMissingImages(catalog: AdminCatalog): MissingImage[] {
  return groupMissingImages(catalog).flatMap((g) => g.items);
}

/**
 * The same missing pictures, grouped: the garment cards and previews first,
 * then one group per step (Fabric, Neck, Dupatta…) in step order. Empty
 * groups are left out.
 */
export function groupMissingImages(catalog: AdminCatalog): MissingGroup[] {
  const has = (key: string) => Boolean(catalog.images[key]);
  const item = (key: string, group: string, name: string): MissingImage => ({ key, group, name, label: `${group}: ${name}` });
  const garments = catalog.garments.filter((g) => g.isActive);

  const groups: MissingGroup[] = [
    {
      id: 'garment-cards',
      title: 'Garment cards',
      hint: 'The picture on each garment tile where customers start designing.',
      items: garments.filter((g) => !has(garmentKey(g))).map((g) => item(garmentKey(g), 'Garment cards', g.name)),
    },
    {
      id: 'garment-previews',
      title: 'Garment previews',
      hint: 'The large preview shown while a customer designs that garment.',
      items: garments.filter((g) => !has(previewKey(g))).map((g) => item(previewKey(g), 'Garment previews', g.name)),
    },
  ];

  for (const group of [...catalog.groups].sort(byPosition)) {
    if (!groupUsesImages(group)) continue;
    const items = catalog.options
      .filter((o) => o.groupId === group._id && o.isActive && !has(optionKey(group, o)))
      .sort(byPosition)
      .map((o) => item(optionKey(group, o), group.label, o.label));
    groups.push({ id: `step-${group._id}`, title: group.label, hint: `The ${group.label} choices customers pick from.`, items });
  }

  return groups.filter((g) => g.items.length > 0);
}

export const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
