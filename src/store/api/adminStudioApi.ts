/**
 * AI Studio (Admin → AI Studio): embroidery extraction, pieces and try-on.
 *
 * Signed with the admin session — the backend serves these under /admin/ai,
 * behind the admin guard, because every generation spends OpenAI credit.
 *
 * Only extraction and the final try-on are paid generations. Splitting a
 * sheet, naming its pieces and the placement preview are free or near-free.
 */

import type {
  EmbroideryAsset,
  EmbroideryCollection,
  EmbroideryRegion,
  EmbroiderySide,
  Landmarks,
  PlannedPiece,
  Placement,
} from '@/@types/embroidery';
import { adminApi } from './adminApi';
import { unwrap } from './baseApi';

export interface ImageJob {
  _id: string;
  stage: 'extract' | 'apply' | 'variant' | 'render';
  runId: string;
  status: 'pending' | 'completed' | 'failed';
  resultUrls: string[];
  error?: string;
  createdAt: string;
}

export interface BuildResult {
  collectionId: string;
  assets: EmbroideryAsset[];
  colourWarning?: string;
}

export interface PhotoInput {
  /** Base64, no data: prefix. */
  image: string;
  label?: string;
}

const adminStudioApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    /** One paid generation: the photos → one sheet of embroidery on white. */
    extractEmbroidery: builder.mutation<ImageJob, { views: PhotoInput[]; runId?: string }>({
      query: (body) => ({ url: '/admin/ai/extract-motifs', method: 'POST', body }),
      transformResponse: unwrap<ImageJob>,
    }),

    getStudioRun: builder.query<ImageJob[], string>({
      query: (runId) => `/admin/ai/runs/${runId}`,
      transformResponse: unwrap<ImageJob[]>,
    }),

    /** Split a sheet into pieces and let the AI name them. No image generation. */
    buildPieces: builder.mutation<
      BuildResult,
      {
        jobId?: string;
        sheetImage?: string;
        collectionName: string;
        /** Add to this saved collection instead of starting a new one. */
        collectionId?: string;
        references?: PhotoInput[];
      }
    >({
      query: (body) => ({ url: '/admin/ai/assets/build', method: 'POST', body }),
      transformResponse: unwrap<BuildResult>,
      invalidatesTags: ['Embroidery'],
    }),

    /** Finished extractions, newest first, with what each was saved as. */
    getExtractions: builder.query<
      { _id: string; runId: string; sheetUrl: string; createdAt: string; savedAs: { collectionId: string; collectionName: string } | null }[],
      void
    >({
      query: () => '/admin/ai/extractions',
      transformResponse: unwrap<
        { _id: string; runId: string; sheetUrl: string; createdAt: string; savedAs: { collectionId: string; collectionName: string } | null }[]
      >,
      providesTags: ['Embroidery'],
    }),

    getEmbroideryCollections: builder.query<EmbroideryCollection[], void>({
      query: () => '/admin/ai/assets/collections',
      transformResponse: unwrap<EmbroideryCollection[]>,
      providesTags: ['Embroidery'],
    }),

    renameEmbroideryCollection: builder.mutation<unknown, { collectionId: string; collectionName: string }>({
      query: ({ collectionId, collectionName }) => ({
        url: `/admin/ai/assets/collections/${collectionId}`,
        method: 'PATCH',
        body: { collectionName },
      }),
      invalidatesTags: ['Embroidery'],
    }),

    deleteEmbroideryCollection: builder.mutation<unknown, string>({
      query: (collectionId) => ({ url: `/admin/ai/assets/collections/${collectionId}`, method: 'DELETE' }),
      /* Catalog too: an option showing it in the designer is unlinked. */
      invalidatesTags: ['Embroidery', 'Catalog'],
    }),

    getEmbroideryPieces: builder.query<EmbroideryAsset[], { collectionId: string; approvedOnly?: boolean }>({
      query: ({ collectionId, approvedOnly }) => ({
        url: '/admin/ai/assets',
        params: { collectionId, ...(approvedOnly ? { approvedOnly: true } : {}) },
      }),
      transformResponse: unwrap<EmbroideryAsset[]>,
      providesTags: ['Embroidery'],
    }),

    updateEmbroideryPiece: builder.mutation<
      EmbroideryAsset,
      {
        id: string;
        body: Partial<{
          name: string;
          region: EmbroideryRegion;
          side: EmbroiderySide;
          workType: string;
          description: string;
          placement: Placement;
        }>;
      }
    >({
      query: ({ id, body }) => ({ url: `/admin/ai/assets/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<EmbroideryAsset>,
      invalidatesTags: ['Embroidery'],
    }),

    approveEmbroideryPiece: builder.mutation<EmbroideryAsset, { id: string; isApproved: boolean }>({
      query: ({ id, isApproved }) => ({ url: `/admin/ai/assets/${id}/approve`, method: 'PATCH', body: { isApproved } }),
      transformResponse: unwrap<EmbroideryAsset>,
      invalidatesTags: ['Embroidery'],
    }),

    deleteEmbroideryPiece: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/ai/assets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Embroidery'],
    }),

    /** Which saved embroidery an Embroidery option renders with (null unlinks). */
    linkEmbroideryCollection: builder.mutation<unknown, { optionId: string; collectionId: string | null }>({
      query: ({ optionId, collectionId }) => ({
        url: `/admin/ai/embroidery-options/${optionId}/collection`,
        method: 'PUT',
        body: { collectionId },
      }),
      invalidatesTags: ['Catalog', 'Embroidery'],
    }),

    /** Free: can the blank garment be measured automatically? */
    detectGarmentPoints: builder.mutation<Landmarks, { image: string }>({
      query: (body) => ({ url: '/admin/ai/landmarks', method: 'POST', body }),
      transformResponse: unwrap<Landmarks>,
    }),

    /** Free: where every approved piece will land, as a flat image. */
    previewPlacement: builder.mutation<
      { preview: string; placedCount: number; plan?: PlannedPiece[] },
      { targetImage: string; assetIds: string[]; landmarks?: Landmarks; referenceImage?: string }
    >({
      query: (body) => ({ url: '/admin/ai/assets/preview', method: 'POST', body }),
      transformResponse: unwrap<{ preview: string; placedCount: number; plan?: PlannedPiece[] }>,
    }),

    /** One paid generation per variation: blend the placed pieces in. */
    tryOnEmbroidery: builder.mutation<
      { jobs: ImageJob[]; placedCount: number; plan?: PlannedPiece[] },
      {
        targetImage: string;
        assetIds: string[];
        instruction?: string;
        variations?: number;
        runId?: string;
        landmarks?: Landmarks;
        referenceImage?: string;
        plan?: PlannedPiece[];
      }
    >({
      query: (body) => ({ url: '/admin/ai/assets/apply', method: 'POST', body }),
      transformResponse: unwrap<{ jobs: ImageJob[]; placedCount: number; plan?: PlannedPiece[] }>,
    }),
  }),
});

export const {
  useExtractEmbroideryMutation,
  useGetStudioRunQuery,
  useBuildPiecesMutation,
  useGetEmbroideryCollectionsQuery,
  useGetExtractionsQuery,
  useRenameEmbroideryCollectionMutation,
  useDeleteEmbroideryCollectionMutation,
  useGetEmbroideryPiecesQuery,
  useUpdateEmbroideryPieceMutation,
  useApproveEmbroideryPieceMutation,
  useDeleteEmbroideryPieceMutation,
  useLinkEmbroideryCollectionMutation,
  useDetectGarmentPointsMutation,
  usePreviewPlacementMutation,
  useTryOnEmbroideryMutation,
} = adminStudioApi;
