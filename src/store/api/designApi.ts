/**
 * Fabric + embroidery endpoints.
 *
 * Each endpoint is defined ONCE, as either its real HTTP shape or its
 * mock shape. RTK Query's types treat `query` and `queryFn` as mutually
 * exclusive, so the switch has to happen at the whole-definition level —
 * not as a spread of an optional `queryFn` key.
 */

import type { EmbroideryStyle, Fabric } from '@/@types/design';
import { mockEmbroidery, mockFabrics } from '@/mocks/design.mock';
import { USE_MOCKS, baseApi, mockDelay } from './baseApi';

export const designApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFabrics: builder.query<Fabric[], void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await mockDelay();
              return { data: mockFabrics };
            },
            providesTags: ['Fabric'],
          }
        : {
            query: () => ({ url: '/design/options', params: { category: 'fabric' } }),
            providesTags: ['Fabric'],
          }
    ),

    getEmbroidery: builder.query<EmbroideryStyle[], void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await mockDelay();
              return { data: mockEmbroidery };
            },
            providesTags: ['Embroidery'],
          }
        : {
            query: () => ({ url: '/design/options', params: { category: 'lining' } }),
            providesTags: ['Embroidery'],
          }
    ),
  }),
  overrideExisting: false,
});

export const { useGetFabricsQuery, useGetEmbroideryQuery } = designApi;
