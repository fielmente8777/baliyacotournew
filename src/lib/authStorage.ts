import type { AuthTokens, AuthUser } from '@/@types/auth';

/**
 * Token persistence.
 *
 * Two stores, deliberately:
 *   localStorage — the tokens themselves, read by the RTK Query baseQuery.
 *   a cookie     — a bare "signed in" flag with no token in it, so Next
 *                  middleware can redirect on the server before a protected
 *                  page renders. Middleware cannot read localStorage.
 *
 * The cookie carries no credential, so it is useless if stolen; the flag only
 * decides routing, and every protected endpoint is still enforced by
 * `authenticate` on the backend.
 *
 * Note for later: the safer end state is an httpOnly refresh cookie set by
 * baliye-node with the access token kept in memory. That needs a backend
 * change (cookie + CORS credentials), so this is the step until then.
 */
const KEY = 'baliye.auth';
export const AUTH_COOKIE = 'baliye_signed_in';

/** Matches the refresh-token lifetime on the backend. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

interface StoredAuth {
  tokens: AuthTokens | null;
  user: AuthUser | null;
}

const setCookie = (value: '1' | '') => {
  if (typeof document === 'undefined') return;
  document.cookie = value
    ? `${AUTH_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
    : `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

export const loadAuth = (): StoredAuth => {
  if (typeof window === 'undefined') return { tokens: null, user: null };

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { tokens: null, user: null };
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return { tokens: null, user: null };
  }
};

export const saveAuth = (value: StoredAuth) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
    setCookie('1');
  } catch {
    /* quota or private mode — session simply won't survive a reload */
  }
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  setCookie('');
};
