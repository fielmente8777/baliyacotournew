import type { AuthTokens } from '@/@types/auth';

/**
 * The admin panel's session, kept apart from the customer's (authStorage.ts)
 * so signing in to one never signs you out of the other, and an admin token
 * is never sent by the storefront's API calls.
 */
const KEY = 'baliye.admin';

/** Fired when the session ends, so the panel can return to its login page. */
export const ADMIN_SIGNED_OUT_EVENT = 'baliye:admin-signed-out';

/* Used when localStorage is blocked: the session then lasts until reload. */
let memory: AuthTokens | null = null;

export const loadAdminTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : memory;
  } catch {
    return memory;
  }
};

export const saveAdminTokens = (tokens: AuthTokens) => {
  memory = tokens;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    /* Kept in memory only. */
  }
};

export const clearAdminTokens = () => {
  memory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Nothing stored. */
  }
  window.dispatchEvent(new Event(ADMIN_SIGNED_OUT_EVENT));
};
