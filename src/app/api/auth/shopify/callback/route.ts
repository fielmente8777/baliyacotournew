import { NextResponse, type NextRequest } from 'next/server';

import { CLIENT_ID, REDIRECT_URI, SITE_URL, discover } from '@/lib/shopifyAuth';

const API_URL =
  process.env.BACKEND_ORIGIN
    ? `${process.env.BACKEND_ORIGIN}/api/v1`
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Completes the Shopify sign-in.
 *
 * Exchanges the code for a Shopify customer access token, hands that to our
 * backend, and gets our own JWT back. The Shopify token is not kept: it only
 * ever proves who the customer is, and everything afterwards runs on our token
 * so measurements, designs and orders stay keyed to our user id.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const verifier = request.cookies.get('shopify_verifier')?.value;
  const expectedState = request.cookies.get('shopify_state')?.value;
  const redirectTo = request.cookies.get('shopify_redirect')?.value ?? '/my-account';

  const fail = (reason: string) =>
    NextResponse.redirect(`${SITE_URL}/login?error=${encodeURIComponent(reason)}`);

  /* A missing or mismatched state means this callback was not started by us
     — usually the sign-in was completed in a different browser context than
     it started in (e.g. a magic link opened in a mail app's browser instead
     of the tab that clicked "Continue with email"), or the cookies expired
     (10 minutes) or were cleared. Logged with specifics because the
     customer-facing message can't say which without leaking internals. */
  if (!code || !state || !verifier || state !== expectedState) {
    console.warn('[shopify-callback] PKCE check failed', {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasVerifierCookie: Boolean(verifier),
      hasExpectedStateCookie: Boolean(expectedState),
      stateMatches: Boolean(state && expectedState && state === expectedState),
    });
    return fail('Sign-in could not be completed. Please try again.');
  }

  try {
    const { token_endpoint } = await discover();

    const tokenResponse = await fetch(token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
        code_verifier: verifier,
      }),
    });

    if (!tokenResponse.ok) return fail('Shopify rejected the sign-in.');

    const { access_token } = (await tokenResponse.json()) as { access_token: string };

    /* Our backend verifies the token against Shopify and issues our JWT. */
    const sessionResponse = await fetch(`${API_URL}/auth/shopify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: access_token }),
    });

    if (!sessionResponse.ok) return fail('We could not open your account.');

    const payload = (await sessionResponse.json()) as {
      data: { accessToken: string; refreshToken: string };
    };

    /**
     * Tokens are handed to the client through a one-time page rather than a
     * cookie, because the rest of the app reads them from localStorage via the
     * auth slice. The page below stores them and navigates on.
     */
    const response = NextResponse.redirect(
      `${SITE_URL}/login/complete?redirect=${encodeURIComponent(redirectTo)}`,
    );

    const short = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60,
    };

    response.cookies.set('baliye_handoff_access', payload.data.accessToken, short);
    response.cookies.set('baliye_handoff_refresh', payload.data.refreshToken, short);

    /* The PKCE cookies have done their job. */
    for (const name of ['shopify_verifier', 'shopify_state', 'shopify_redirect']) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 });
    }

    return response;
  } catch {
    return fail('Sign-in failed. Please try again.');
  }
}