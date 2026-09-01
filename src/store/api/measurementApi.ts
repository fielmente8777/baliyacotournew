/**
 * Measurement templates and profiles.
 *
 * Never mocked — a profile belongs to the authenticated user, and the template
 * list is what the form renders from.
 */

import type {
  MeasurementField,
  MeasurementProfile,
  MeasurementTemplate,
  SaveMeasurementProfileBody,
} from '@/@types/measurement';
import { uiMetaFor } from '@/mocks/measurement.mock';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const measurementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The configured fields, joined with local hotspot/illustration metadata. */
    getMeasurementFields: builder.query<MeasurementField[], void>({
      query: () => ({ url: '/measurements/template', params: { activeOnly: true } }),
      transformResponse: (res: ApiEnvelope<MeasurementTemplate[]>): MeasurementField[] =>
        unwrap(res)
          .filter((template) => template.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((template) => ({ ...template, ui: uiMetaFor(template.name) })),
      providesTags: ['Measurement'],
    }),

    getMeasurementProfiles: builder.query<MeasurementProfile[], void>({
      query: () => '/measurements',
      transformResponse: (res: ApiEnvelope<MeasurementProfile[]>) => unwrap(res),
      providesTags: ['Measurement'],
    }),

    createMeasurementProfile: builder.mutation<
      MeasurementProfile,
      SaveMeasurementProfileBody
    >({
      query: (body) => ({ url: '/measurements', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<MeasurementProfile>) => unwrap(res),
      invalidatesTags: ['Measurement'],
    }),

    updateMeasurementProfile: builder.mutation<
      MeasurementProfile,
      { id: string; body: SaveMeasurementProfileBody }
    >({
      query: ({ id, body }) => ({ url: `/measurements/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<MeasurementProfile>) => unwrap(res),
      invalidatesTags: ['Measurement'],
    }),

    deleteMeasurementProfile: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/measurements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Measurement'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeasurementFieldsQuery,
  useGetMeasurementProfilesQuery,
  useCreateMeasurementProfileMutation,
  useUpdateMeasurementProfileMutation,
  useDeleteMeasurementProfileMutation,
} = measurementApi;
