/**
 * Create-your-own-design images, stored in Shopify as metaobjects (Content →
 * Metaobjects → "Design Image"). Read with the public Storefront token, same
 * as lib/shopifyReviews.ts — the definition needs Storefront access
 * "PUBLIC_READ".
 *
 * Only the pictures live in Shopify. Names, prices, steps and pairing rules
 * still come from baliye-node; an image here is matched to them by `key`:
 *
 *   garment/<garment slug>             card on "What do you want to design?"
 *   preview/<garment slug>             big preview in the builder
 *   option/<group code>/<option value> option card, e.g. option/fabric/cotton
 *
 * FIELD KEYS and the TYPE must match the definition in Shopify admin; if
 * Shopify derived different ones, change them here only.
 */

import { shopifyStorefrontFetch } from './shopifyStorefront';

const DESIGN_IMAGE_TYPE = 'design_image';

const FIELDS = { key: 'key', image: 'image' } as const;

const DESIGN_IMAGES_QUERY = `
  query DesignImages($type: String!, $after: String) {
    metaobjects(type: $type, first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image { url(transform: { maxWidth: 1000, preferredContentType: WEBP }) }
            }
          }
        }
      }
    }
  }
`;

interface DesignImagesResponse {
  metaobjects: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      fields: {
        key: string;
        value: string | null;
        reference: { image?: { url: string } | null } | null;
      }[];
    }[];
  };
}

/** key → image url */
export type DesignImageMap = Record<string, string>;

export async function fetchDesignImages(): Promise<DesignImageMap> {
  const map: DesignImageMap = {};
  let after: string | null = null;

  do {
    const data: DesignImagesResponse = await shopifyStorefrontFetch<DesignImagesResponse>(
      DESIGN_IMAGES_QUERY,
      { type: DESIGN_IMAGE_TYPE, after },
    );

    for (const node of data.metaobjects.nodes) {
      const key = node.fields.find((f) => f.key === FIELDS.key)?.value?.trim().toLowerCase();
      const url = node.fields.find((f) => f.key === FIELDS.image)?.reference?.image?.url;
      if (key && url) map[key] = url;
    }

    after = data.metaobjects.pageInfo.hasNextPage ? data.metaobjects.pageInfo.endCursor : null;
  } while (after);

  return map;
}

export const designImageKey = {
  garment: (slug: string) => `garment/${slug}`.toLowerCase(),
  preview: (slug: string) => `preview/${slug}`.toLowerCase(),
  option: (groupCode: string, value: string) => `option/${groupCode}/${value}`.toLowerCase(),
};
