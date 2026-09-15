/**
 * Reviews. The backend verifies the customer bought the item and that it has
 * been delivered, so nothing here needs to guard that — but the UI still only
 * offers the action on delivered orders, to avoid a pointless round trip.
 */

import type { Review, SaveReviewBody } from '@/@types/review';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Every review I have written — Order History uses this to show which
     *  lines are already reviewed. */
    getMyReviews: builder.query<Review[], void>({
      query: () => '/reviews/mine',
      transformResponse: (res: ApiEnvelope<Review[]>) => unwrap(res),
      providesTags: ['Review'],
    }),

    getProductReviews: builder.query<Review[], string>({
      query: (productId) => `/reviews/product/${productId}`,
      transformResponse: (res: ApiEnvelope<Review[]>) => unwrap(res),
      providesTags: ['Review'],
    }),

    createReview: builder.mutation<Review, SaveReviewBody>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Review>) => unwrap(res),
      /* Product tags too: a new review moves ratingAverage. */
      invalidatesTags: ['Review', 'Product'],
    }),

    updateReview: builder.mutation<
      Review,
      { id: string; body: Partial<SaveReviewBody> }
    >({
      query: ({ id, body }) => ({ url: `/reviews/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<Review>) => unwrap(res),
      invalidatesTags: ['Review', 'Product'],
    }),

    deleteReview: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyReviewsQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
