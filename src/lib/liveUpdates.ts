/**
 * Admin edits reaching the open storefront without a reload.
 *
 * Four layers, from instant to eventual:
 *   1. Same browser: the admin panel announces every successful save on a
 *      BroadcastChannel; any storefront tab refetches its catalogue data and
 *      server-rendered content at once.
 *   2. Other visitors: catalogue queries refetch whenever the tab regains
 *      focus or a page mounts (refetchOnFocus / refetchOnMountOrArgChange).
 *   3. Every visitor, any browser: watchContentVersion polls a one-line
 *      "last saved" stamp every few seconds and refreshes on change, unless
 *      the customer is mid-task (isCustomerBusy) — then once they are done.
 *   4. Server-rendered pages (home, footer, terms, products): /api/revalidate expires
 *      their cache on save, so the next request renders the new content.
 */

import type { Middleware } from '@reduxjs/toolkit';

const CHANNEL = 'baliye-admin-updates';

export interface AdminUpdate {
  /** The admin endpoint that just succeeded, e.g. "updateOption". */
  endpoint: string;
  at: number;
}

const channel = () =>
  typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null;

/**
 * Redux middleware for the admin store: after any admin MUTATION succeeds,
 * tell the storefront tabs. Queries (reads) are ignored.
 */
export const announceAdminSaves: Middleware = () => (next) => (action) => {
  const result = next(action);
  const a = action as { type?: string; meta?: { arg?: { type?: string; endpointName?: string } } };

  if (
    a.type?.startsWith('adminApi/') &&
    a.type.endsWith('/fulfilled') &&
    a.meta?.arg?.type === 'mutation' &&
    a.meta.arg.endpointName !== 'adminLogin'
  ) {
    const ch = channel();
    ch?.postMessage({ endpoint: a.meta.arg.endpointName ?? '', at: Date.now() } satisfies AdminUpdate);
    ch?.close();
  }
  return result;
};

/** Storefront side: calls `onUpdate` for every admin save. Returns an unsubscribe. */
export function onAdminUpdate(onUpdate: (update: AdminUpdate) => void) {
  const ch = channel();
  if (!ch) return () => undefined;
  ch.onmessage = (e: MessageEvent<AdminUpdate>) => onUpdate(e.data);
  return () => ch.close();
}

/**
 * Pages where a refresh could disturb someone mid-task — the cart, the
 * address and checkout steps, sign-in, editing account details, and the
 * design builder. A pending refresh waits until they leave. (Payment itself
 * happens on Shopify's checkout, which this site never refreshes.)
 */
const BUSY_PATHS = [
  '/cart',
  '/shipping',
  '/login',
  '/my-account/personal-details',
  '/my-account/saved-addresses',
  '/my-account/saved-measurements',
  '/create-your-own-design',
];

/** True while a refresh would get in the customer's way. */
export function isCustomerBusy() {
  if (typeof window === 'undefined') return true;
  if (BUSY_PATHS.some((p) => window.location.pathname.startsWith(p))) return true;
  /* Typing in any field, anywhere — a search box, a review, a form. */
  const el = document.activeElement as HTMLElement | null;
  if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return true;
  /* A dialog or sheet is open (review form, confirm, image viewer…). */
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
}

const POLL_MS = 4000;

/**
 * Every visitor, any browser: ask the backend every few seconds whether any
 * admin-edited page changed (a one-line, cached answer), and call `onChange`
 * when it has. Only while the tab is visible. Returns a stop function.
 */
export function watchContentVersion(apiBase: string, onChange: () => void) {
  let last: string | null = null;
  let stopped = false;

  const check = async () => {
    if (stopped || document.visibilityState !== 'visible') return;
    try {
      const res = await fetch(`${apiBase}/content/version`, { cache: 'no-store' });
      const version = ((await res.json()) as { data?: { version?: string } }).data?.version;
      if (!version) return;
      /* A beat after spotting the change: the admin's save clears the
         website cache just after the backend records it, and refreshing in
         between would fetch the old content. */
      if (last !== null && version !== last) setTimeout(onChange, 1500);
      last = version;
    } catch {
      /* Offline or the server is waking up — try again next tick. */
    }
  };

  check();
  const timer = setInterval(check, POLL_MS);
  document.addEventListener('visibilitychange', check);
  return () => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', check);
  };
}

/**
 * Query options for data an admin can change: refetch when the customer
 * comes back to the tab, and whenever a page using it mounts.
 */
export const LIVE = { refetchOnFocus: true, refetchOnMountOrArgChange: true } as const;
