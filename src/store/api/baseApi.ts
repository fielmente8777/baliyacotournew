/**
 * Single RTK Query API slice. Every endpoint in the app is injected into
 * this one slice (designApi.ts, measurementApi.ts, ...) so there is one
 * cache, one middleware entry and one set of tags.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';

/** Flip to 'false' in .env.local once baliye-node is reachable. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

/** Simulated network latency so loading states are visible in the demo. */
export const MOCK_DELAY_MS = 300;

export const mockDelay = () => new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Fabric', 'Embroidery', 'Measurement', 'Cart', 'Design', 'Profile', 'Address'],
  endpoints: () => ({}),
});
