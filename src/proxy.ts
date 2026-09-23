import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route guard.
 *
 * Reads a non-sensitive `baliye_signed_in` flag cookie rather than the token —
 * the token lives in localStorage and the server cannot see it. This only
 * decides whether to render a page; every endpoint enforces auth itself, so a
 * forged cookie gains nothing but an empty page.
 */

const PROTECTED = ['/my-account', '/cart', '/shipping', '/order-success'];

const SIGNED_IN_COOKIE = 'baliye_signed_in';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isSignedIn = request.cookies.get(SIGNED_IN_COOKIE)?.value === '1';

  const needsAuth = PROTECTED.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (needsAuth && !isSignedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  /* A signed-in visitor has no reason to see the login page. */
  if (pathname === '/login' && isSignedIn) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.searchParams.get('redirect') ?? '/my-account';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/my-account/:path*',
    '/cart/:path*',
    '/shipping/:path*',
    '/order-success/:path*',
    /**
     * Exact match only. `/login/complete` must NOT be guarded — it is where
     * the Shopify callback lands to store the session, and redirecting a
     * signed-in user away from it would break the sign-in it is completing.
     */
    '/login',
  ],
};
