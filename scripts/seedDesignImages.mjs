/**
 * Creates one empty, Active "Design Image" metaobject per key the design
 * builder looks up (see src/lib/designImages.ts). Images are then uploaded in
 * Shopify admin → Content → Metaobjects → Design Image.
 *
 * Safe to re-run: keys that already exist are skipped.
 *
 *   node --env-file=.env scripts/seedDesignImages.mjs
 *
 * Keys mirror baliye-node's src/script/catalog.ts (garment slugs, group codes,
 * slugified option labels). Colour and Size are left out — those steps show
 * swatches and buttons, not images.
 */

const API_VERSION = '2026-01';
const TYPE = 'design_image';

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_APP_CLIENT_SECRET;

const GARMENTS = ['patiala-suit', 'kurti', 'anarkali-suit', 'sharara-set', 'indo-western-gown'];

const OPTIONS = {
  fabric: ['Cotton', 'Cotton Silk', 'Rayon', 'Chanderi', 'Georgette', 'Crepe', 'Chiffon', 'Organza', 'Net', 'Linen', 'Velvet', 'Premium Silk'],
  neck: ['Round Neck', 'V-Neck', 'Boat Neck', 'Square Neck', 'Sweetheart Neck', 'Keyhole Neck', 'Collar Neck', 'High Neck', 'Mandarin Neck', 'Deep V-Neck'],
  embroidery: ['No Embroidery', 'Thread Work', 'Zari Work', 'Sequin Work', 'Mirror Work', 'Aari Work', 'Machine Embroidery', 'Hand Embroidery', 'Heavy Embroidery'],
  sleeve: ['Sleeveless', 'Short Sleeve', 'Half Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Bell Sleeve', 'Puff Sleeve', 'Flared Sleeve'],
  sleeve_cuff: ['Plain Cuff', 'Buttoned Cuff', 'Embroidered Cuff'],
  lower: ['Patiala', 'Salwar', 'Churidar', 'Straight Pant', 'Palazzo', 'Sharara', 'Gharara', 'Dhoti', 'Skirt', 'Trousers'],
  dupatta: ['No Dupatta', 'Matching Dupatta', 'Contrast Dupatta', 'Printed Dupatta', 'Embroidered Dupatta'],
  length: ['Short', 'Knee Length', 'Calf Length', 'Ankle Length', 'Floor Length'],
};

/* Same as baliye-node's slugify, so option keys match option.value. */
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const KEYS = [
  ...GARMENTS.map((slug) => `garment/${slug}`),
  ...GARMENTS.map((slug) => `preview/${slug}`),
  ...Object.entries(OPTIONS).flatMap(([code, labels]) => labels.map((l) => `option/${code}/${slugify(l)}`)),
];

async function getToken() {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token request failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

async function gql(token, query, variables = {}) {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(JSON.stringify(body.errors ?? res.status));
  return body.data;
}

async function existingKeys(token) {
  const keys = new Set();
  let after = null;
  do {
    const data = await gql(
      token,
      `query($type: String!, $after: String) {
        metaobjects(type: $type, first: 250, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { field(key: "key") { value } }
        }
      }`,
      { type: TYPE, after },
    );
    for (const n of data.metaobjects.nodes) if (n.field?.value) keys.add(n.field.value.trim().toLowerCase());
    after = data.metaobjects.pageInfo.hasNextPage ? data.metaobjects.pageInfo.endCursor : null;
  } while (after);
  return keys;
}

const CREATE = `
  mutation($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

async function main() {
  if (!STORE_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, SHOPIFY_APP_CLIENT_ID and SHOPIFY_APP_CLIENT_SECRET');
  }

  const token = await getToken();
  const existing = await existingKeys(token);
  const todo = KEYS.filter((k) => !existing.has(k));
  console.log(`${KEYS.length} keys, ${existing.size} already in Shopify, creating ${todo.length}`);

  let created = 0;
  for (const key of todo) {
    const data = await gql(token, CREATE, {
      metaobject: {
        type: TYPE,
        fields: [{ key: 'key', value: key }],
        capabilities: { publishable: { status: 'ACTIVE' } },
      },
    });
    const errors = data.metaobjectCreate.userErrors;
    if (errors.length) console.error(`✗ ${key}: ${errors.map((e) => e.message).join('; ')}`);
    else created += 1;
  }

  console.log(`Done — created ${created}, failed ${todo.length - created}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
