/**
 * Reviews live in Shopify (metaobjects), not in baliye-node.
 *
 * Reading goes straight to Shopify's Storefront API from the browser. Saving
 * goes through this app's /api/reviews route, which holds the Admin token and
 * checks the item was delivered to this customer.
 */

import type { Review, SaveReviewBody } from '@/@types/review';
import { fetchAllReviews } from '@/lib/shopifyReviews';
import type { RootState } from '@/store';
import { baseApi } from './baseApi';

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Every visible review — product pages and Order History filter client-side. */
    getReviews: builder.query<Review[], void>({
      queryFn: async () => {
        try {
          return { data: await fetchAllReviews() };
        } catch (err) {
          return { error: { status: 'CUSTOM_ERROR', error: (err as Error).message } };
        }
      },
      providesTags: ['Review'],
    }),

    createReview: builder.mutation<{ id: string }, SaveReviewBody>({
      queryFn: async (body, api) => {
        const token = (api.getState() as RootState).auth?.accessToken;
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
        const json = (await response.json().catch(() => ({}))) as { data?: { id: string }; message?: string };
        if (!response.ok) return { error: { status: response.status, data: json } };
        return { data: json.data! };
      },
      /* Shopify takes a moment to serve a new metaobject; refetching at once
         can return the old list, so wait briefly before invalidating. */
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          setTimeout(() => dispatch(reviewApi.util.invalidateTags(['Review'])), 2500);
        } catch {
          /* save failed — nothing to refresh */
        }
      },
      invalidatesTags: ['Review'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewApi;
