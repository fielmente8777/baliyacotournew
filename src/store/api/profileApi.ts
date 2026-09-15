/**
 * Profile endpoints — GET /profile, PUT /profile, POST /profile/image.
 *
 * Never mocked: the profile is whoever the access token belongs to, so there
 * is nothing meaningful to fake. If the API is down this should fail visibly
 * rather than show invented data that disappears on reload.
 */

import type { UpdateProfileBody, UserProfile } from '@/@types/account';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      transformResponse: (res: ApiEnvelope<UserProfile>) => unwrap(res),
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateProfileBody>({
      query: (body) => ({ url: '/profile', method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<UserProfile>) => unwrap(res),
      invalidatesTags: ['Profile', 'Auth'],
    }),

    /** Step 1: send a code to the new number. */
    requestPhoneChange: builder.mutation<{ phone: string }, { phone: string }>({
      query: (body) => ({ url: '/profile/phone/request', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<{ phone: string }>) => unwrap(res),
    }),

    /** Step 2: confirm the code; the number moves onto the account. */
    confirmPhoneChange: builder.mutation<
      UserProfile,
      { phone: string; code: string }
    >({
      query: (body) => ({ url: '/profile/phone/confirm', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<UserProfile>) => unwrap(res),
      invalidatesTags: ['Profile', 'Auth'],
    }),

    uploadProfileImage: builder.mutation<UserProfile, File>({
      query: (file) => {
        /* multipart — do NOT set Content-Type; the browser adds the boundary. */
        const formData = new FormData();
        formData.append('profileImage', file);
        return { url: '/profile/image', method: 'POST', body: formData };
      },
      transformResponse: (res: ApiEnvelope<UserProfile>) => unwrap(res),
      invalidatesTags: ['Profile', 'Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRequestPhoneChangeMutation,
  useConfirmPhoneChangeMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
} = profileApi;