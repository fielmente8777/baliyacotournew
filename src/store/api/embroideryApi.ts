/**
 * Embroidery assets — the extract-once-approve-reuse workflow.
 *
 * Building assets and compositing them cost nothing; only the final blend is a
 * paid generation. That is what keeps placement deterministic without raising
 * the per-garment cost.
 */

import type {
  EmbroideryAsset,
  EmbroideryCollection,
  Landmarks,
  Placement,
} from '@/@types/embroidery';
import type { ImageJob } from './studioApi';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

interface BuildResult {
  collectionId: string;
  assets: EmbroideryAsset[];
  /** Present when the extracted ink diverges from the source garment. */
  colourWarning?: string;
}

export const embroideryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Splits a finished extraction into named assets. No AI cost. */
    buildAssets: builder.mutation<
      BuildResult,
      { jobId: string; collectionName: string; sourceInkHex?: string }
    >({
      query: (body) => ({ url: '/ai/assets/build', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<BuildResult>) => unwrap(res),
      invalidatesTags: ['Embroidery'],
    }),

    getCollections: builder.query<EmbroideryCollection[], void>({
      query: () => '/ai/assets/collections',
      transformResponse: (res: ApiEnvelope<EmbroideryCollection[]>) => unwrap(res),
      providesTags: ['Embroidery'],
    }),

    getAssets: builder.query<
      EmbroideryAsset[],
      { collectionId?: string; approvedOnly?: boolean } | void
    >({
      query: (arg) => ({
        url: '/ai/assets',
        params: {
          ...(arg?.collectionId ? { collectionId: arg.collectionId } : {}),
          ...(arg?.approvedOnly ? { approvedOnly: true } : {}),
        },
      }),
      transformResponse: (res: ApiEnvelope<EmbroideryAsset[]>) => unwrap(res),
      providesTags: ['Embroidery'],
    }),

    updateAsset: builder.mutation<
      EmbroideryAsset,
      { id: string; body: { name?: string; region?: string; placement?: Placement } }
    >({
      query: ({ id, body }) => ({ url: `/ai/assets/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<EmbroideryAsset>) => unwrap(res),
      invalidatesTags: ['Embroidery'],
    }),

    approveAsset: builder.mutation<EmbroideryAsset, { id: string; isApproved: boolean }>({
      query: ({ id, isApproved }) => ({
        url: `/ai/assets/${id}/approve`,
        method: 'PATCH',
        body: { isApproved },
      }),
      transformResponse: (res: ApiEnvelope<EmbroideryAsset>) => unwrap(res),
      invalidatesTags: ['Embroidery'],
    }),

    deleteAsset: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/ai/assets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Embroidery'],
    }),

    /** Confidence tells the UI whether the operator must mark landmarks. */
    detectLandmarks: builder.mutation<Landmarks, { image: string }>({
      query: (body) => ({ url: '/ai/landmarks', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Landmarks>) => unwrap(res),
    }),

    /** Free composite render, so placement can be checked before generating. */
    previewPlacement: builder.mutation<
      { preview: string; placedCount: number; landmarks: Landmarks },
      { targetImage: string; assetIds: string[]; landmarks?: Landmarks }
    >({
      query: (body) => ({ url: '/ai/assets/preview', method: 'POST', body }),
      transformResponse: (
        res: ApiEnvelope<{ preview: string; placedCount: number; landmarks: Landmarks }>,
      ) => unwrap(res),
    }),

    applyAssets: builder.mutation<
      { jobs: ImageJob[]; placedCount: number; landmarks: Landmarks },
      {
        targetImage: string;
        assetIds: string[];
        instruction?: string;
        variations?: number;
        runId?: string;
        landmarks?: Landmarks;
      }
    >({
      query: (body) => ({ url: '/ai/assets/apply', method: 'POST', body }),
      transformResponse: (
        res: ApiEnvelope<{ jobs: ImageJob[]; placedCount: number; landmarks: Landmarks }>,
      ) => unwrap(res),
      invalidatesTags: ['ImageJob'],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePreviewPlacementMutation,
  useBuildAssetsMutation,
  useGetCollectionsQuery,
  useGetAssetsQuery,
  useUpdateAssetMutation,
  useApproveAssetMutation,
  useDeleteAssetMutation,
  useDetectLandmarksMutation,
  useApplyAssetsMutation,
} = embroideryApi;
