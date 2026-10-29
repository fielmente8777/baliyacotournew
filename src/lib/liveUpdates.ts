/**
 * Admin edits reaching the open storefront without a reload.
 *
 * Three layers, from instant to eventual:
 *   1. Same browser: the admin panel announces every successful save on a
 *      BroadcastChannel; any storefront tab refetches its catalogue data and
 *      server-rendered content at once.
 *   2. Other visitors: catalogue queries refetch whenever the tab regains
 *      focus or a page mounts (refetchOnFocus / refetchOnMountOrArgChange).
 *   3. Server-rendered pages (home, footer, terms): /api/revalidate expires
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
 * Query options for data an admin can change: refetch when the customer
 * comes back to the tab, and whenever a page using it mounts.
 */
export const LIVE = { refetchOnFocus: true, refetchOnMountOrArgChange: true } as const;
