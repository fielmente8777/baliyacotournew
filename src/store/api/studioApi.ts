/**
 * AI motif transfer studio.
 *
 * Currently unauthenticated so it can be demoed without an admin login — the
 * backend guard in routes/ai.ts is commented out. Move these paths back under
 * /admin/ai when that is restored.
 */

import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export type JobStage = 'extract' | 'apply' | 'variant';

/** Which border a cropped extraction is looking at. */
export type MotifRegion = 'neckline' | 'sleeve' | 'hem' | 'placket' | 'motif';

export interface ImageJob {
  _id: string;
  stage: JobStage;
  region?: MotifRegion;
  runId: string;
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  prompt: string;
  resultUrls: string[];
  error?: string;
  createdAt: string;
}

export const studioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Stage 1 — isolate embroidery from a donor garment. */
    extractMotifs: builder.mutation<
      ImageJob,
      { donorImage: string; region?: MotifRegion; runId?: string }
    >({
      query: (body) => ({ url: '/ai/extract-motifs', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<ImageJob>) => unwrap(res),
      invalidatesTags: ['ImageJob'],
    }),

    /** Stage 2 — apply a motif sheet to a target garment. */
    applyMotifs: builder.mutation<
      ImageJob[],
      {
        targetImage: string;
        motifSheetImage: string;
        instruction?: string;
        variations?: number;
        sourceJobId?: string;
        runId?: string;
      }
    >({
      query: (body) => ({ url: '/ai/apply-motifs', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<ImageJob[]>) => unwrap(res),
      invalidatesTags: ['ImageJob'],
    }),

    /** Polls Magnific for every pending job in the run before returning. */
    getRun: builder.query<ImageJob[], string>({
      query: (runId) => `/ai/runs/${runId}`,
      transformResponse: (res: ApiEnvelope<ImageJob[]>) => unwrap(res),
      providesTags: ['ImageJob'],
    }),

    getRunHistory: builder.query<ImageJob[], void>({
      query: () => '/ai/runs',
      transformResponse: (res: ApiEnvelope<ImageJob[]>) => unwrap(res),
      providesTags: ['ImageJob'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useExtractMotifsMutation,
  useApplyMotifsMutation,
  useGetRunQuery,
  useGetRunHistoryQuery,
} = studioApi;
