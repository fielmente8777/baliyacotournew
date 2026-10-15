/**
 * Shopify Admin API — SERVER ONLY (route handlers).
 *
 * The Admin token can write to the store, so it never reaches the browser:
 * the credentials have no NEXT_PUBLIC_ prefix, and only app/api routes import
 * this file. Same scheme as baliye-node's config/shopify.ts — the Dev
 * Dashboard app's client credentials are exchanged for a token that lasts 24
 * hours, cached here and renewed five minutes early.
 */

const API_VERSION = '2026-01';

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.SHOPIFY_APP_CLIENT_SECRET ?? '';

export const isAdminConfigured = () => Boolean(STORE_DOMAIN && CLIENT_ID && CLIENT_SECRET);

const RENEW_EARLY_MS = 5 * 60 * 1000;
let cached: { value: string; expiresAt: number } | null = null;
let inFlight: Promise<string> | null = null;

async function requestToken(): Promise<string> {
  const response = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!response.ok) throw new Error(`Shopify token request failed (${response.status})`);

  const body = (await response.json()) as { access_token: string; expires_in?: number };
  cached = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 86399) * 1000 };
  return body.access_token;
}

async function getToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - RENEW_EARLY_MS) return cached.value;
  inFlight ??= requestToken().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Turns whatever shape Shopify sent `errors` in into one readable string. */
function describeErrors(errors: unknown): string {
  if (typeof errors === 'string') return errors;
  if (Array.isArray(errors)) {
    return errors.map((e) => (e as { message?: string })?.message ?? JSON.stringify(e)).join('; ');
  }
  return JSON.stringify(errors);
}

export async function adminGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!isAdminConfigured()) {
    throw new Error('Shopify Admin is not configured — set SHOPIFY_APP_CLIENT_ID and SHOPIFY_APP_CLIENT_SECRET');
  }

  const send = async () =>
    fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': await getToken(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

  let response = await send();
  /* Token revoked or expired early — fetch a new one and retry once. */
  if (response.status === 401) {
    cached = null;
    response = await send();
  }

  const payload = (await response.json()) as { data?: T; errors?: unknown };
  if (!response.ok || payload.errors) {
    throw new Error(`Shopify Admin error: ${payload.errors ? describeErrors(payload.errors) : response.status}`);
  }
  return payload.data as T;
}
