import { NextResponse, type NextRequest } from 'next/server';

import {
  CLIENT_ID,
  REDIRECT_URI,
  challengeFor,
  createVerifier,
  discover,
  isConfigured,
} from '@/lib/shopifyAuth';

/**
 * Begins the Shopify sign-in.
 *
 * The verifier and the post-login destination are stored in httpOnly cookies
 * rather than the URL: the verifier is the PKCE secret and must never reach the
 * browser's JavaScript, and `state` is checked on the way back to reject a
 * callback the user did not initiate.
 */
export async function GET(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { message: 'Shopify sign-in is not configured' },
      { status: 500 },
    );
  }

  const redirectTo = request.nextUrl.searchParams.get('redirect') ?? '/my-account';

  const verifier = createVerifier();
  const state = createVerifier();
  const { authorization_endpoint } = await discover();

  const url = new URL(authorization_endpoint);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  /* customer-account-api:full grants the profile read we verify the token with. */
  url.searchParams.set('scope', 'openid email customer-account-api:full');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challengeFor(verifier));
  url.searchParams.set('code_challenge_method', 'S256');

  const response = NextResponse.redirect(url.toString());

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    /* Ten minutes: long enough to read an OTP, short enough to limit replay. */
    maxAge: 600,
  };

  response.cookies.set('shopify_verifier', verifier, options);
  response.cookies.set('shopify_state', state, options);
  response.cookies.set('shopify_redirect', redirectTo, options);

  return response;
}
