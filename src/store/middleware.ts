import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/authStorage';

/**
 * Server-side route guard. Runs before a protected page renders, so a signed-out
 * user never sees a flash of account UI before being bounced.
 *
 * It reads only the `baliye_signed_in` flag cookie — no token is involved. This
 * is routing, not authorisation: the API enforces the real thing.
 */
const PROTECTED = ['/my-account', '/cart', '/shipping', '/order-success'];

/** Signed-in users have no reason to see the login screen. */
const AUTH_ROUTES = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isSignedIn = req.cookies.get(AUTH_COOKIE)?.value === '1';

  if (!isSignedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    /* Bring them back to exactly where they were headed, query string included. */
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isSignedIn && AUTH_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone();
    const target = req.nextUrl.searchParams.get('redirect');
    url.pathname = target?.startsWith('/') ? target.split('?')[0] : '/my-account/personal-details';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-account/:path*', '/cart/:path*', '/shipping/:path*', '/order-success/:path*', '/login'],
};
