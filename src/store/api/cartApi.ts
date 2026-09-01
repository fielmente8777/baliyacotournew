/**
 * Cart endpoints. Never mocked — a cart belongs to whoever the token
 * identifies, and every cart route is authenticate + authorize(USER).
 */

import type {
  AddToCartBody,
  Cart,
  UpdateCartItemBody,
} from '@/@types/cart';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      transformResponse: (res: ApiEnvelope<Cart>) => unwrap(res),
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<Cart, AddToCartBody>({
      query: (body) => ({ url: '/cart', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Cart>) => unwrap(res),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<Cart, { id: string; body: UpdateCartItemBody }>({
      query: ({ id, body }) => ({ url: `/cart/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<Cart>) => unwrap(res),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<Cart, string>({
      query: (id) => ({ url: `/cart/${id}`, method: 'DELETE' }),
      transformResponse: (res: ApiEnvelope<Cart>) => unwrap(res),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<Cart, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      transformResponse: (res: ApiEnvelope<Cart>) => unwrap(res),
      invalidatesTags: ['Cart'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
