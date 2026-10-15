import { NextResponse, type NextRequest } from 'next/server';

import { adminGraphQL, isAdminConfigured } from '@/lib/shopifyAdmin';
import { REVIEW_FIELDS, REVIEW_TYPE } from '@/lib/shopifyReviews';

/**
 * Saves a product review to Shopify as a "Product Review" metaobject.
 *
 * Only a customer who received the item can review it: the signed-in
 * customer's order is read back from our API (which checks the order is
 * theirs), and must be delivered and contain the product. The review itself
 * lives only in Shopify — nothing is stored in baliye-node.
 */

const API_URL = process.env.BACKEND_ORIGIN
  ? `${process.env.BACKEND_ORIGIN}/api/v1`
  : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const MAX_IMAGES = 2;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface Body {
  orderId?: string;
  productId?: string;
  rating?: number;
  title?: string;
  body?: string;
  /** Base64 JPEGs (no data: prefix), at most two. */
  images?: string[];
}

const fail = (status: number, message: string) => NextResponse.json({ success: false, message }, { status });

/** Our API's envelope -> data, or null when the call failed. */
async function api<T>(path: string, auth: string): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, { headers: { authorization: auth }, cache: 'no-store' });
  if (!response.ok) return null;
  return ((await response.json()) as { data: T }).data;
}

/* ---- Shopify helpers ---- */

async function alreadyReviewed(orderId: string, productId: string): Promise<boolean> {
  const data = await adminGraphQL<{ metaobjects: { nodes: { fields: { key: string; value: string | null }[] }[] } }>(
    `query($type: String!) { metaobjects(type: $type, first: 250, reverse: true) { nodes { fields { key value } } } }`,
    { type: REVIEW_TYPE },
  );
  return data.metaobjects.nodes.some((n) => {
    const get = (k: string) => n.fields.find((f) => f.key === k)?.value;
    return get(REVIEW_FIELDS.orderId) === orderId && get(REVIEW_FIELDS.productId) === productId;
  });
}

/** Uploads one photo to Shopify Files and returns its MediaImage id. */
async function uploadImage(base64: string, index: number): Promise<string> {
  const bytes = Buffer.from(base64, 'base64');
  const filename = `review-${Date.now()}-${index}.jpg`;

  const staged = await adminGraphQL<{
    stagedUploadsCreate: {
      stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[];
      userErrors: { message: string }[];
    };
  }>(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { message }
      }
    }`,
    {
      input: [{ resource: 'IMAGE', filename, mimeType: 'image/jpeg', httpMethod: 'POST', fileSize: String(bytes.length) }],
    },
  );
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new Error(staged.stagedUploadsCreate.userErrors.map((e) => e.message).join('; ') || 'Upload refused');

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }), filename);
  const uploaded = await fetch(target.url, { method: 'POST', body: form });
  if (!uploaded.ok) throw new Error(`Photo upload failed (${uploaded.status})`);

  const created = await adminGraphQL<{
    fileCreate: { files: { id: string }[]; userErrors: { message: string }[] };
  }>(
    `mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { message } } }`,
    { files: [{ originalSource: target.resourceUrl, contentType: 'IMAGE', alt: 'Customer review photo' }] },
  );
  const file = created.fileCreate.files[0];
  if (!file) throw new Error(created.fileCreate.userErrors.map((e) => e.message).join('; ') || 'Photo not saved');
  return file.id;
}

/* ---- Route ---- */

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return fail(401, 'Please sign in to write a review.');
  if (!isAdminConfigured()) return fail(500, 'Reviews are not configured on the server.');

  let input: Body;
  try {
    input = (await request.json()) as Body;
  } catch {
    return fail(400, 'Invalid request.');
  }

  const rating = Math.round(Number(input.rating));
  const title = (input.title ?? '').trim().slice(0, 120);
  const text = (input.body ?? '').trim().slice(0, 2000);
  const images = (input.images ?? []).slice(0, MAX_IMAGES);

  if (!input.orderId?.startsWith('gid://shopify/Order/') || !input.productId?.startsWith('gid://shopify/Product/')) {
    return fail(400, 'This item cannot be reviewed.');
  }
  if (!(rating >= 1 && rating <= 5)) return fail(400, 'Please choose a rating.');
  if (!text) return fail(400, 'Please write a few words about the product.');
  if (images.some((img) => typeof img !== 'string' || Buffer.byteLength(img, 'base64') > MAX_IMAGE_BYTES)) {
    return fail(400, 'Each photo must be under 5 MB.');
  }

  /* 1. The order is this customer's, delivered, and contains the product. */
  const numericId = input.orderId.split('/').pop();
  const order = await api<{ status: string; items: { productId?: string }[] }>(`/orders/shopify/${numericId}`, auth);
  if (!order) return fail(403, 'We could not find this order on your account.');
  if (order.status !== 'delivered') return fail(400, 'You can review this item once it has been delivered.');
  if (!order.items.some((item) => item.productId === input.productId)) {
    return fail(400, 'This product is not part of that order.');
  }

  /* GET /auth/me -> { role, profile: { name } } */
  const me = await api<{ profile?: { name?: string } }>('/auth/me', auth);
  const reviewerName = (me?.profile?.name ?? '').trim() || 'Verified buyer';

  try {
    /* 2. One review per item per order. */
    if (await alreadyReviewed(input.orderId, input.productId)) {
      return fail(409, 'You have already reviewed this item.');
    }

    /* 3. Save. Every key in REVIEW_FIELDS exists on the Shopify definition;
       empty values are left out. */
    const fields: { key: string; value: string }[] = [];
    const put = (key: string, value: string | undefined) => {
      if (value !== undefined && value !== '') fields.push({ key, value });
    };

    put(REVIEW_FIELDS.rating, rating.toFixed(1));
    put(REVIEW_FIELDS.reviewerName, reviewerName);
    put(REVIEW_FIELDS.body, text);
    put(REVIEW_FIELDS.productId, input.productId);
    put(REVIEW_FIELDS.createdAt, new Date().toISOString());
    put(REVIEW_FIELDS.title, title);
    put(REVIEW_FIELDS.orderId, input.orderId);
    put(REVIEW_FIELDS.approved, 'true');
    if (images.length > 0) {
      const fileIds = await Promise.all(images.map(uploadImage));
      put(REVIEW_FIELDS.images, JSON.stringify(fileIds));
    }

    const created = await adminGraphQL<{
      metaobjectCreate: { metaobject: { id: string } | null; userErrors: { field?: string[]; message: string }[] };
    }>(
      `mutation($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) { metaobject { id } userErrors { field message } }
      }`,
      { metaobject: { type: REVIEW_TYPE, fields } },
    );

    const { metaobject, userErrors } = created.metaobjectCreate;
    if (!metaobject) {
      console.error('[reviews] metaobjectCreate failed', userErrors);
      return fail(400, userErrors[0]?.message ?? 'We could not save your review.');
    }

    return NextResponse.json({ success: true, message: 'Review saved', data: { id: metaobject.id } }, { status: 201 });
  } catch (err) {
    console.error('[reviews] save failed', err);
    /* The app is missing a scope — an admin fix, not something to retry. */
    if (/access denied|required access/i.test((err as Error).message)) {
      return fail(503, 'Reviews are not available yet. Please try again later.');
    }
    return fail(502, 'We could not save your review. Please try again.');
  }
}
