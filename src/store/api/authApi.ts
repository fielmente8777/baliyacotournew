/**
 * Auth endpoints. Never mocked — the OTP flow has to hit baliye-node even in
 * demo mode, otherwise nothing downstream has a real token.
 */

import type { AuthTokens, AuthUser } from '@/@types/auth';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

interface VerifyOtpArg {
  phone: string;
  code: string;
}

interface LoginResult extends AuthTokens {
  user?: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<{ message: string }, { phone: string }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => unwrap(res),
    }),

    verifyOtp: builder.mutation<LoginResult, VerifyOtpArg>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<LoginResult>) => unwrap(res),
      invalidatesTags: ['Auth', 'Profile', 'Cart', 'Order', 'Measurement'],
    }),

    googleLogin: builder.mutation<LoginResult, { idToken: string }>({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<LoginResult>) => unwrap(res),
      invalidatesTags: ['Auth', 'Profile', 'Cart', 'Order', 'Measurement'],
    }),

    /** Sends a Microsoft Graph access token; the backend validates it via Graph. */
    microsoftLogin: builder.mutation<LoginResult, { accessToken: string }>({
      query: (body) => ({ url: '/auth/microsoft', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<LoginResult>) => unwrap(res),
      invalidatesTags: ['Auth', 'Profile', 'Cart', 'Order', 'Measurement'],
    }),

    adminLogin: builder.mutation<LoginResult, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<LoginResult>) => unwrap(res),
      invalidatesTags: ['Auth'],
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => '/auth/me',
      transformResponse: (res: ApiEnvelope<AuthUser>) => unwrap(res),
      providesTags: ['Auth'],
    }),

    logout: builder.mutation<unknown, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGoogleLoginMutation,
  useMicrosoftLoginMutation,
  useAdminLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApi;
