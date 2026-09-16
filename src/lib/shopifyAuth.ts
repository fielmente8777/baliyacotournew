/**
 * Shopify Customer Account OAuth, PKCE helpers.
 *
 * Runs server-side in route handlers. PKCE exists so the authorization code is
 * useless to anyone who intercepts it: only the party holding the original
 * verifier can redeem it, and that never leaves our server.
 */

import { createHash, randomBytes } from 'crypto';

export const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? '';
export const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_CLIENT_ID ?? '';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const REDIRECT_URI = `${SITE_URL}/api/auth/shopify/callback`;

/** Base64url — the OAuth spec's encoding, not standard base64. */
const base64url = (input: Buffer) =>
  input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const createVerifier = () => base64url(randomBytes(32));

export const challengeFor = (verifier: string) =>
  base64url(createHash('sha256').update(verifier).digest());

/**
 * Endpoints come from Shopify's published configuration rather than being
 * hardcoded, because these paths have moved before.
 */
export async function discover() {
  const response = await fetch(
    `https://shopify.com/authentication/${SHOP_ID}/.well-known/openid-configuration`,
  );

  if (!response.ok) {
    throw new Error("Could not read Shopify's OAuth configuration");
  }

  return (await response.json()) as {
    authorization_endpoint: string;
    token_endpoint: string;
  };
}

export const isConfigured = () => Boolean(SHOP_ID && CLIENT_ID);
