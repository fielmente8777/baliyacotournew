/**
 * Single RTK Query API slice. Every endpoint in the app is injected into this
 * one slice (authApi, designApi, ...) so there is one cache, one middleware
 * entry and one set of tags.
 */

import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import type { AuthTokens } from '@/@types/auth';
import { logOut, setCredentials } from '@/store/features/authSlice';
import type { RootState } from '@/store';

/** Demo mode for catalog data only — auth always talks to the real API. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

export const MOCK_DELAY_MS = 300;
export const mockDelay = () => new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

/** The backend wraps every payload as { success, message, data }. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

/** Endpoints return `data` directly; components never see the envelope. */
export const unwrap = <T,>(res: ApiEnvelope<T>): T => res.data;

const rawBaseQuery = fetchBaseQuery({
  // baseUrl: process.env.NEXT_PUBLIC_API_URL,
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Serialises refresh attempts. Without it, five queries failing 401 at once
 * would fire five refresh calls, and four of them would be rejected because
 * the backend revokes the old refresh token on use.
 */
const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  if (mutex.isLocked()) {
    // Another call is already refreshing — wait, then retry with the new token.
    await mutex.waitForUnlock();
    return rawBaseQuery(args, api, extraOptions);
  }

  const release = await mutex.acquire();

  try {
    const refreshToken = (api.getState() as RootState).auth?.refreshToken;

    if (!refreshToken) {
      api.dispatch(logOut());
      return result;
    }

    const refresh = await rawBaseQuery(
      { url: '/auth/refresh-token', method: 'POST', body: { refreshToken } },
      api,
      extraOptions
    );

    const tokens = (refresh.data as ApiEnvelope<AuthTokens> | undefined)?.data;

    if (!tokens?.accessToken) {
      api.dispatch(logOut());
      return result;
    }

    const user = (api.getState() as RootState).auth?.user ?? null;
    api.dispatch(setCredentials({ tokens, user }));

    result = await rawBaseQuery(args, api, extraOptions);
  } finally {
    release();
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Fabric',
    'Embroidery',
    'Measurement',
    'Cart',
    'Design',
    'Profile',
    'Address',
    'Order',
    'Review',
    'Notification',
    'Auth',
    'ImageJob',
    'Product',
    'GarmentType',
    'ShopifyCart',
    'Wishlist',
  ],
  endpoints: () => ({}),
});
