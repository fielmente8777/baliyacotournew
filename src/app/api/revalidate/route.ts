import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { contentTag, serverApiBase, type ContentPage } from '@/lib/siteContent';

const PAGES: ContentPage[] = ['home', 'footer', 'terms', 'products'];

/**
 * Called by the admin panel right after it saves a page, so the edit shows
 * on the next visit instead of after the cache's hourly refresh.
 *
 * The caller's token is checked against the backend's admin-only /admin/me,
 * so only a signed-in admin can clear the cache.
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return NextResponse.json({ message: 'Sign in required' }, { status: 401 });

  const me = await fetch(`${serverApiBase()}/admin/me`, {
    headers: { authorization },
    cache: 'no-store',
  }).catch(() => null);
  if (!me?.ok) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });

  const { page } = (await request.json().catch(() => ({}))) as { page?: string };
  if (!PAGES.includes(page as ContentPage)) {
    return NextResponse.json({ message: 'Unknown page' }, { status: 400 });
  }

  /* Expire at once: the admin expects to see the change on the next load. */
  revalidateTag(contentTag(page as ContentPage), { expire: 0 });
  return NextResponse.json({ revalidated: page });
}
