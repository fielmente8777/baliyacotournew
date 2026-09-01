/**
 * Custom design engine. All three endpoints are driven by configuration, so
 * nothing here names a specific option group.
 */

import type {
  CreateDesignBody,
  DesignConfig,
  PriceBreakdown,
  SavedDesign,
  SelectionInput,
} from '@/@types/design';
import type { GarmentType } from '@/@types/product';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const designApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * The steps for a garment type, or for a customizable product. Passing
     * `productId` returns the product's garment type and preset selections, so
     * the customer skips the "what do you want to design?" step entirely.
     *
     * Selections are sent along because they decide which dependent groups are
     * visible — the server resolves `dependsOn` rather than the client.
     */
    getDesignConfig: builder.query<
      DesignConfig,
      { garmentTypeId?: string; productId?: string }
    >({
      query: (params) => ({ url: '/designs/config', params }),
      transformResponse: (res: ApiEnvelope<DesignConfig>) => unwrap(res),
      providesTags: ['Design'],
    }),

    /** Live price. A mutation, not a query — it posts selections. */
    quotePrice: builder.mutation<
      PriceBreakdown,
      { garmentTypeId?: string; productId?: string; selections: SelectionInput[] }
    >({
      query: (body) => ({ url: '/designs/quote', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<PriceBreakdown>) => unwrap(res),
    }),

    createDesign: builder.mutation<SavedDesign, CreateDesignBody>({
      query: (body) => ({ url: '/designs', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<SavedDesign>) => unwrap(res),
      invalidatesTags: ['Design'],
    }),

    getMyDesigns: builder.query<SavedDesign[], void>({
      query: () => '/designs',
      transformResponse: (res: ApiEnvelope<SavedDesign[]>) => unwrap(res),
      providesTags: ['Design'],
    }),

    deleteDesign: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/designs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Design'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDesignConfigQuery,
  useQuotePriceMutation,
  useCreateDesignMutation,
  useGetMyDesignsQuery,
  useDeleteDesignMutation,
} = designApi;

/** Re-exported so the picker doesn't need to import from two API slices. */
export type { GarmentType };
