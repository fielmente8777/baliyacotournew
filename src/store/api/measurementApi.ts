/**
 * Measurement profile endpoints.
 *
 * The mock branch keeps an in-memory array so "Save Measurement" adds a
 * real row to the list during the client demo.
 */

import type { MeasurementProfile } from '@/@types/measurement';
import { mockProfiles } from '@/mocks/measurement.mock';
import { USE_MOCKS, baseApi, mockDelay } from './baseApi';

/** Mutable copy — demo-only, resets on reload. */
let demoProfiles: MeasurementProfile[] = [...mockProfiles];

export type SaveProfileArg = Omit<MeasurementProfile, '_id'> & { _id?: string };

export const measurementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeasurementProfiles: builder.query<MeasurementProfile[], void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await mockDelay();
              return { data: demoProfiles };
            },
            providesTags: ['Measurement'],
          }
        : {
            query: () => '/measurements',
            providesTags: ['Measurement'],
          }
    ),

    saveMeasurementProfile: builder.mutation<MeasurementProfile, SaveProfileArg>(
      USE_MOCKS
        ? {
            queryFn: async (arg: SaveProfileArg) => {
              await mockDelay();
              const saved: MeasurementProfile = {
                ...arg,
                _id: arg._id ?? `mp-${Date.now()}`,
              };
              demoProfiles = arg._id
                ? demoProfiles.map((p) => (p._id === arg._id ? saved : p))
                : [...demoProfiles, saved];
              return { data: saved };
            },
            invalidatesTags: ['Measurement'],
          }
        : {
            query: (body) => ({ url: '/measurements', method: 'POST', body }),
            invalidatesTags: ['Measurement'],
          }
    ),
  }),
  overrideExisting: false,
});

export const { useGetMeasurementProfilesQuery, useSaveMeasurementProfileMutation } =
  measurementApi;
