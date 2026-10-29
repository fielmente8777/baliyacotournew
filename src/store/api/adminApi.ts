/**
 * The admin panel's API slice.
 *
 * Separate from baseApi on purpose: it signs requests with the ADMIN session
 * (lib/adminAuthStorage.ts), never the customer's, and its cache is cleared
 * on its own when the admin signs out.
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
import type {
  AdminCatalog,
  AdminGarment,
  AdminMeasurementTemplate,
  AdminOption,
  AdminOptionGroup,
  AdminAiCredit,
  AdminCreditStats,
  AdminCustomer,
  AdminProfile,
  AdminTokenEntry,
  CatalogImportReport,
  CatalogSyncSummary,
  ContentPage,
} from '@/@types/admin';
import { clearAdminTokens, loadAdminTokens, saveAdminTokens } from '@/lib/adminAuthStorage';
import { unwrap, type ApiEnvelope } from './baseApi';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  prepareHeaders: (headers) => {
    const token = loadAdminTokens()?.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

/* Same single-flight refresh as baseApi — the backend revokes a refresh token once used. */
const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  if (mutex.isLocked()) {
    await mutex.waitForUnlock();
    return rawBaseQuery(args, api, extraOptions);
  }

  const release = await mutex.acquire();
  try {
    const refreshToken = loadAdminTokens()?.refreshToken;
    if (!refreshToken) {
      clearAdminTokens();
      return result;
    }

    const refresh = await rawBaseQuery(
      { url: '/auth/refresh-token', method: 'POST', body: { refreshToken } },
      api,
      extraOptions
    );
    const tokens = (refresh.data as ApiEnvelope<AuthTokens> | undefined)?.data;

    if (!tokens?.accessToken) {
      clearAdminTokens();
      return result;
    }

    saveAdminTokens(tokens);
    result = await rawBaseQuery(args, api, extraOptions);
  } finally {
    release();
  }
  return result;
};

/** The backend's message, or a fallback, for showing in the panel. */
export const adminErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  const data = (error as { data?: { message?: string; errors?: { field: string; message: string }[] } })?.data;
  if (data?.errors?.length) return data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
  return data?.message ?? fallback;
};

type GarmentBody = Partial<Omit<AdminGarment, '_id' | 'slug' | 'image'>>;
type GroupBody = Partial<Pick<AdminOptionGroup, 'label' | 'description' | 'inputType' | 'position' | 'isActive'>>;
type OptionBody = Partial<
  Pick<AdminOption, 'label' | 'description' | 'hex' | 'priceModifier' | 'position' | 'isActive' | 'pairsWith'>
>;
type TemplateBody = Partial<Omit<AdminMeasurementTemplate, '_id'>>;

const imageForm = (file: File, key?: string) => {
  const form = new FormData();
  if (key) form.append('key', key);
  form.append('file', file);
  return form;
};

/** Site switches the admin edits (GET /settings, PUT /admin/settings). */
export type AppSettingsAdmin = { creditsEnabled: boolean; measureVideoUrl: string };

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Catalog', 'Content', 'Tokens', 'Settings', 'AiCredit', 'Embroidery'],
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AuthTokens, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: unwrap<AuthTokens>,
    }),

    getAdminMe: builder.query<AdminProfile, void>({
      query: () => '/admin/me',
      transformResponse: unwrap<AdminProfile>,
      providesTags: ['Me'],
    }),

    /* ---- Design Builder ---- */

    getCatalog: builder.query<AdminCatalog, void>({
      query: () => '/admin/catalog',
      transformResponse: unwrap<AdminCatalog>,
      providesTags: ['Catalog'],
    }),

    syncCatalog: builder.mutation<CatalogSyncSummary, void>({
      query: () => ({ url: '/admin/design-catalog/sync', method: 'POST' }),
      transformResponse: unwrap<CatalogSyncSummary>,
      invalidatesTags: ['Catalog'],
    }),

    createGarment: builder.mutation<AdminGarment, GarmentBody & { name: string; basePrice: number }>({
      query: (body) => ({ url: '/admin/catalog/garments', method: 'POST', body }),
      transformResponse: unwrap<AdminGarment>,
      invalidatesTags: ['Catalog'],
    }),

    updateGarment: builder.mutation<AdminGarment, { id: string; body: GarmentBody }>({
      query: ({ id, body }) => ({ url: `/admin/catalog/garments/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<AdminGarment>,
      invalidatesTags: ['Catalog'],
    }),

    deleteGarment: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/catalog/garments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Catalog'],
    }),

    createGroup: builder.mutation<AdminOptionGroup, GroupBody & { label: string; code?: string }>({
      query: (body) => ({ url: '/admin/catalog/groups', method: 'POST', body }),
      transformResponse: unwrap<AdminOptionGroup>,
      invalidatesTags: ['Catalog'],
    }),

    updateGroup: builder.mutation<AdminOptionGroup, { id: string; body: GroupBody }>({
      query: ({ id, body }) => ({ url: `/admin/catalog/groups/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<AdminOptionGroup>,
      invalidatesTags: ['Catalog'],
    }),

    createOption: builder.mutation<AdminOption, { groupId: string; body: OptionBody & { label: string } }>({
      query: ({ groupId, body }) => ({ url: `/admin/catalog/groups/${groupId}/options`, method: 'POST', body }),
      transformResponse: unwrap<AdminOption>,
      invalidatesTags: ['Catalog'],
    }),

    updateOption: builder.mutation<AdminOption, { id: string; body: OptionBody }>({
      query: ({ id, body }) => ({ url: `/admin/catalog/options/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<AdminOption>,
      invalidatesTags: ['Catalog'],
    }),

    deleteOption: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/catalog/options/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Catalog'],
    }),

    uploadCatalogImage: builder.mutation<{ key: string; url: string }, { key: string; file: File }>({
      query: ({ key, file }) => ({ url: '/admin/catalog/images', method: 'POST', body: imageForm(file, key) }),
      transformResponse: unwrap<{ key: string; url: string }>,
      invalidatesTags: ['Catalog'],
    }),

    /* ---- Bulk import from the Design Builder sheet ---- */

    /** An object URL for the .xlsx, ready for a download link. Revoke it after use. */
    downloadCatalogSheet: builder.mutation<string, { filled: boolean }>({
      query: ({ filled }) => ({
        url: `/admin/catalog/sheet${filled ? '?filled=true' : ''}`,
        responseHandler: async (response) =>
          response.ok ? URL.createObjectURL(await response.blob()) : response.json(),
      }),
    }),

    /** Previews unless `apply`; applying saves only when the sheet has no errors. */
    importCatalogSheet: builder.mutation<CatalogImportReport, { files: File[]; apply: boolean }>({
      query: ({ files, apply }) => {
        const form = new FormData();
        files.forEach((file) => form.append('files', file));
        return { url: `/admin/catalog/import${apply ? '?apply=true' : ''}`, method: 'POST', body: form };
      },
      transformResponse: unwrap<CatalogImportReport>,
      invalidatesTags: (result) => (result?.applied ? ['Catalog'] : []),
    }),

    /* ---- Measurement fields (existing backend endpoints) ---- */

    createMeasurementTemplate: builder.mutation<AdminMeasurementTemplate, TemplateBody & { name: string }>({
      query: (body) => ({ url: '/measurements/template', method: 'POST', body }),
      transformResponse: unwrap<AdminMeasurementTemplate>,
      invalidatesTags: ['Catalog'],
    }),

    updateMeasurementTemplate: builder.mutation<AdminMeasurementTemplate, { id: string; body: TemplateBody }>({
      query: ({ id, body }) => ({ url: `/measurements/template/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<AdminMeasurementTemplate>,
      invalidatesTags: ['Catalog'],
    }),

    deleteMeasurementTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: `/measurements/template/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Catalog'],
    }),

    /* ---- Website content ---- */

    getContent: builder.query<{ data: Record<string, unknown>; updatedAt: string } | null, ContentPage>({
      query: (page) => `/content/${page}`,
      transformResponse: unwrap<{ data: Record<string, unknown>; updatedAt: string } | null>,
      providesTags: (_r, _e, page) => [{ type: 'Content', id: page }],
    }),

    /** Saves, then asks the website to drop its cached copy of the page. */
    saveContent: builder.mutation<{ updatedAt: string }, { page: ContentPage; data: Record<string, unknown> }>({
      queryFn: async ({ page, data }, api, extraOptions) => {
        const saved = await baseQueryWithReauth(
          { url: `/admin/content/${page}`, method: 'PUT', body: { data } },
          api,
          extraOptions
        );
        if (saved.error) return { error: saved.error };

        const token = loadAdminTokens()?.accessToken;
        const revalidated = await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
          body: JSON.stringify({ page }),
        }).catch(() => null);

        if (!revalidated?.ok) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Saved, but the website cache could not be refreshed — the change shows within an hour',
              data: { message: 'Saved, but the website cache could not be refreshed — the change shows within an hour' },
            } as FetchBaseQueryError,
          };
        }
        return { data: unwrap(saved.data as ApiEnvelope<{ updatedAt: string }>) };
      },
      invalidatesTags: (_r, _e, { page }) => [{ type: 'Content', id: page }],
    }),

    uploadImage: builder.mutation<{ url: string }, File>({
      query: (file) => ({ url: '/admin/uploads', method: 'POST', body: imageForm(file) }),
      transformResponse: unwrap<{ url: string }>,
    }),

    /** "Write with AI": a suggestion for one content field. Nothing is saved. */
    writeContent: builder.mutation<
      { text: string },
      {
        action: 'write' | 'improve' | 'shorter' | 'longer' | 'fix' | 'custom';
        text?: string;
        instruction?: string;
        field?: string;
        format: 'html' | 'plain';
      }
    >({
      query: (body) => ({ url: '/admin/content/write', method: 'POST', body }),
      transformResponse: unwrap<{ text: string }>,
    }),

    /* ---- Design credits ---- */

    getAppSettings: builder.query<AppSettingsAdmin, void>({
      query: () => '/settings',
      transformResponse: unwrap<AppSettingsAdmin>,
      providesTags: ['Settings'],
    }),

    updateAppSettings: builder.mutation<AppSettingsAdmin, Partial<AppSettingsAdmin>>({
      query: (body) => ({ url: '/admin/settings', method: 'PUT', body }),
      transformResponse: unwrap<AppSettingsAdmin>,
      invalidatesTags: ['Settings'],
    }),

    searchUsers: builder.query<AdminCustomer[], string>({
      query: (search) => ({ url: '/admin/users', params: { search, limit: 20 } }),
      transformResponse: unwrap<AdminCustomer[]>,
      providesTags: ['Tokens'],
    }),

    getCreditStats: builder.query<AdminCreditStats, void>({
      query: () => '/admin/tokens/stats',
      transformResponse: unwrap<AdminCreditStats>,
      providesTags: ['Tokens', 'Settings'],
    }),

    getAiCredit: builder.query<AdminAiCredit, void>({
      query: () => '/admin/ai-credit',
      transformResponse: unwrap<AdminAiCredit>,
      providesTags: ['AiCredit'],
    }),

    recordAiCredit: builder.mutation<AdminAiCredit, { kind: 'balance' | 'topup'; amountUsd: number; note?: string }>({
      query: (body) => ({ url: '/admin/ai-credit', method: 'POST', body }),
      transformResponse: unwrap<AdminAiCredit>,
      invalidatesTags: ['AiCredit'],
    }),

    getTokenLedger: builder.query<AdminTokenEntry[], string>({
      query: (userId) => `/admin/tokens/${userId}`,
      transformResponse: unwrap<AdminTokenEntry[]>,
      providesTags: ['Tokens'],
    }),

    grantTokens: builder.mutation<
      { userId: string; balance: number },
      { userId: string; amount: number; note?: string; reason?: 'grant' | 'purchase' }
    >({
      query: (body) => ({ url: '/admin/tokens/grant', method: 'POST', body }),
      transformResponse: unwrap<{ userId: string; balance: number }>,
      invalidatesTags: ['Tokens'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useGetAdminMeQuery,
  useGetCatalogQuery,
  useDownloadCatalogSheetMutation,
  useImportCatalogSheetMutation,
  useSyncCatalogMutation,
  useCreateGarmentMutation,
  useUpdateGarmentMutation,
  useDeleteGarmentMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useCreateOptionMutation,
  useUpdateOptionMutation,
  useDeleteOptionMutation,
  useUploadCatalogImageMutation,
  useCreateMeasurementTemplateMutation,
  useUpdateMeasurementTemplateMutation,
  useDeleteMeasurementTemplateMutation,
  useGetContentQuery,
  useSaveContentMutation,
  useUploadImageMutation,
  useWriteContentMutation,
  useGetAppSettingsQuery,
  useUpdateAppSettingsMutation,
  useSearchUsersQuery,
  useGetCreditStatsQuery,
  useGetAiCreditQuery,
  useRecordAiCreditMutation,
  useGetTokenLedgerQuery,
  useGrantTokensMutation,
} = adminApi;
