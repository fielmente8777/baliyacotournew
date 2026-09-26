/**
 * Wishlist endpoints. The catalogue lives in Shopify, so products are saved
 * as kind "shopify" with a small snapshot (title, image, price, handle) —
 * Shopify itself has no wishlist for a headless storefront.
 */

import type { AddShopifyWishlistBody, Wishlist, WishlistRefs } from '@/@types/wishlist';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<Wishlist, void>({
      query: () => '/wishlist',
      transformResponse: (res: ApiEnvelope<Wishlist>) => unwrap(res),
      providesTags: ['Wishlist'],
    }),

    /** Only ids — one call fills every heart on a listing page. */
    getWishlistRefs: builder.query<WishlistRefs, void>({
      query: () => '/wishlist/ids',
      transformResponse: (res: ApiEnvelope<WishlistRefs>) => unwrap(res),
      providesTags: ['Wishlist'],
    }),

    addShopifyToWishlist: builder.mutation<Wishlist, AddShopifyWishlistBody>({
      query: (body) => ({ url: '/wishlist', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Wishlist>) => unwrap(res),
      /* Fill the heart immediately; roll back if the request fails. */
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlistRefs', undefined, (draft) => {
            if (!draft.shopifyProductIds.includes(body.shopifyProductId)) {
              draft.shopifyProductIds.push(body.shopifyProductId);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlistByRef: builder.mutation<Wishlist, { kind: 'product' | 'design' | 'shopify'; ref: string }>({
      query: (body) => ({ url: '/wishlist/remove', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Wishlist>) => unwrap(res),
      async onQueryStarted({ kind, ref }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlistRefs', undefined, (draft) => {
            const key = kind === 'shopify' ? 'shopifyProductIds' : kind === 'design' ? 'designIds' : 'productIds';
            draft[key] = draft[key].filter((id) => id !== ref);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation<Wishlist, string>({
      query: (itemId) => ({ url: `/wishlist/${itemId}`, method: 'DELETE' }),
      transformResponse: (res: ApiEnvelope<Wishlist>) => unwrap(res),
      invalidatesTags: ['Wishlist'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWishlistQuery,
  useGetWishlistRefsQuery,
  useAddShopifyToWishlistMutation,
  useRemoveFromWishlistByRefMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
