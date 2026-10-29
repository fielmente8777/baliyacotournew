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
import { fetchDesignImages, type DesignImageMap } from '@/lib/designImages';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export interface RecolourResult {
  key: string;
  status: 'generating' | 'ready' | 'failed';
  url: string | null;
  error: string | null;
}

const designApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Garment, preview and option images — straight from Shopify. */
    getDesignImages: builder.query<DesignImageMap, void>({
      queryFn: async () => {
        try {
          return { data: await fetchDesignImages() };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Design'],
    }),

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

    /**
     * The preview photo re-dyed to a colour option by AI. Cached server-side
     * per photo + colour; while `generating`, poll getRecolour with the key.
     */
    recolourPhoto: builder.mutation<RecolourResult, { imageUrl: string; colourOptionId: string }>({
      query: (body) => ({ url: '/designs/recolour', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<RecolourResult>) => unwrap(res),
      /* A new generation may have spent tokens. A 401/402 refusal can mean
         the admin just turned credits on — re-read the switch too. */
      invalidatesTags: (_result, error) =>
        error?.status === 401 || error?.status === 402 ? ['Tokens', 'Settings'] : ['Tokens'],
    }),

    /** Free: the cached recolour for this photo + colour, or null. Starts nothing. */
    lookupRecolour: builder.mutation<RecolourResult | null, { imageUrl: string; colourOptionId: string }>({
      query: (body) => ({ url: '/designs/recolour/lookup', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<RecolourResult | null>) => unwrap(res),
    }),

    getRecolour: builder.query<RecolourResult, string>({
      query: (key) => `/designs/recolour/${key}`,
      transformResponse: (res: ApiEnvelope<RecolourResult>) => unwrap(res),
      keepUnusedDataFor: 0,
    }),

    createDesign: builder.mutation<SavedDesign, CreateDesignBody>({
      query: (body) => ({ url: '/designs', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<SavedDesign>) => unwrap(res),
      invalidatesTags: ['Design'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDesignImagesQuery,
  useGetDesignConfigQuery,
  useQuotePriceMutation,
  useRecolourPhotoMutation,
  useLookupRecolourMutation,
  useLazyGetRecolourQuery,
  useCreateDesignMutation,
} = designApi;

/** Re-exported so the picker doesn't need to import from two API slices. */
export type { GarmentType };
