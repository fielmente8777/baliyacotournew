/**
 * Website content edited in the admin panel (/admin/content/...), read on
 * the server.
 *
 * The code keeps shipping the defaults (Home/pagedata.tsx, footerData.tsx,
 * terms pageData.ts). Saved content overrides them SECTION BY SECTION, so the
 * site renders exactly as before when nothing has been saved, when the
 * backend is down, and when a new section is added in code later.
 *
 * Cached by tag; the admin panel calls /api/revalidate after saving, so an
 * edit shows on the next page load.
 */

export type ContentPage = 'home' | 'footer' | 'terms';

export const contentTag = (page: ContentPage) => `content:${page}`;

/**
 * Fallback refresh in case a revalidate call is missed — or the backend was
 * unreachable at build time and the defaults got baked into the page.
 */
const REVALIDATE_SECONDS = 300;

/**
 * NEXT_PUBLIC_API_URL can be relative (/api/backend, via the rewrite in
 * next.config.ts) — which a server-side fetch can't use.
 */
export function serverApiBase() {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl?.startsWith('http')) return publicUrl.replace(/\/$/, '');
  return `${process.env.BACKEND_ORIGIN ?? 'http://localhost:5000'}/api/v1`;
}

async function fetchSiteContent(page: ContentPage): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${serverApiBase()}/content/${page}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [contentTag(page)] },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: { data: Record<string, unknown> } | null };
    return body.data?.data ?? null;
  } catch {
    return null;
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Defaults with the saved content laid over them, two levels deep: a section
 * (hero, categories…) and its fields. A field added to a section in code
 * later still gets its default instead of coming through undefined.
 */
export function mergeContent<T extends object>(defaults: T, saved: Record<string, unknown> | null): T {
  if (!saved) return defaults;

  const merged = { ...defaults } as Record<string, unknown>;
  for (const [key, fallback] of Object.entries(defaults)) {
    const value = saved[key];
    if (value === undefined || value === null) continue;
    merged[key] = isPlainObject(fallback) && isPlainObject(value) ? { ...fallback, ...value } : value;
  }
  return merged as T;
}

export async function getSiteContent<T extends object>(page: ContentPage, defaults: T): Promise<T> {
  return mergeContent(defaults, await fetchSiteContent(page));
}
