/** Profile endpoints — GET /profile, PUT /profile. */

import type { UserProfile } from '@/@types/account';
import { mockProfile } from '@/mocks/account.mock';
import { USE_MOCKS, baseApi, mockDelay } from './baseApi';

let demoProfile: UserProfile = { ...mockProfile };

export type UpdateProfileArg = Partial<Omit<UserProfile, '_id'>>;

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await mockDelay();
              return { data: demoProfile };
            },
            providesTags: ['Profile'],
          }
        : { query: () => '/profile', providesTags: ['Profile'] }
    ),

    updateProfile: builder.mutation<UserProfile, UpdateProfileArg>(
      USE_MOCKS
        ? {
            queryFn: async (arg: UpdateProfileArg) => {
              await mockDelay();
              demoProfile = { ...demoProfile, ...arg };
              return { data: demoProfile };
            },
            invalidatesTags: ['Profile'],
          }
        : {
            query: (body) => ({ url: '/profile', method: 'PUT', body }),
            invalidatesTags: ['Profile'],
          }
    ),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
