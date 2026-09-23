/**
 * Shopify Storefront API — called directly from the browser.
 *
 * Unlike the Admin API, the Storefront token is meant to be public: it can
 * only read published, public storefront data, nothing sensitive. That's
 * what makes it safe to ship in NEXT_PUBLIC_ env vars and call straight from
 * the frontend, with zero dependency on this app's own backend for
 * something as basic as "what products do you sell" — if baliye-node is
 * down, browsing still works.
 */

const API_VERSION = '2026-01';

const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';

export const isStorefrontConfigured = () => Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function shopifyStorefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!isStorefrontConfigured()) {
    throw new Error(
      'Shopify Storefront API is not configured — set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN',
    );
  }

  const response = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (!response.ok) {
    throw new Error(`Shopify Storefront: ${response.statusText}`);
  }

  /* GraphQL allows a response to carry both `data` and `errors` at once —
     e.g. a field-level ACCESS_DENIED on one requested field while every
     other field resolved fine. Only treat this as fatal when there's no
     usable data at all; otherwise log and let the caller work with what
     did come back. */
  if (payload.errors?.length) {
    console.warn('Shopify Storefront returned partial errors:', payload.errors);
  }

  if (!payload.data) {
    const detail = payload.errors?.map((e) => e.message).join('; ') ?? 'No data returned';
    throw new Error(`Shopify Storefront: ${detail}`);
  }

  return payload.data;
}

/**
 * The spec fields the "Product Detail" bullet list reads. These are
 * self-defined metafields (Settings → Custom data → Products → Add
 * definition in Shopify Admin), namespace `custom` — deliberately NOT
 * Shopify's auto-suggested category metafields (namespace `shopify`),
 * because their exact key slugs aren't reliably guessable ahead of time
 * and getting one wrong just silently shows a blank spec rather than an
 * error. Add a row here (and the matching definition in Shopify Admin) for
 * every spec you want to show.
 */
export const SPEC_METAFIELD_IDENTIFIERS = [
  { namespace: 'custom', key: 'color' },
  { namespace: 'custom', key: 'material' },
  { namespace: 'custom', key: 'neckline' },
  { namespace: 'custom', key: 'sleeve_length' },
  { namespace: 'custom', key: 'embroidery_style' },
  { namespace: 'custom', key: 'care_instructions' },
] as const;
