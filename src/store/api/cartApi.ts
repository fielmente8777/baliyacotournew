/**
 * Cart endpoints — two separate carts, both exposed from this one file so
 * useCart.ts has a single place to import from.
 *
 *   baliye-node cart (getCart/addToCart/...) — CUSTOM DESIGNS ONLY now.
 *   Never mocked — a cart belongs to whoever the token identifies, and
 *   every cart route is authenticate + authorize(USER). Catalog products
 *   used to go through this too; that's what was breaking Add to Cart
 *   (Shopify GIDs hitting a schema built for Mongo ObjectIds) — they've
 *   moved to the Shopify endpoints below instead of patching this route
 *   to accept Shopify ids.
 *
 *   Shopify Storefront Cart API (getShopifyCart/addToShopifyCart/...) —
 *   CATALOG PRODUCTS ONLY. Talks to Shopify directly via
 *   lib/shopifyCart.ts, same as productApi.ts does for browsing. No auth
 *   header, no baliye-node involvement — the cart id lives in
 *   localStorage instead of being tied to the signed-in user.
 */

import type {
  AddToCartBody,
  Cart,
  UpdateCartItemBody,
} from '@/@types/cart';
import type { ShopifyCart } from '@/@types/shopifyCart';
import * as shopifyCart from '@/lib/shopifyCart';
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

    /* ---- Shopify cart — catalog products ---- */

    getShopifyCart: builder.query<ShopifyCart | null, void>({
      queryFn: async () => {
        try {
          return { data: await shopifyCart.getCart() };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['ShopifyCart'],
    }),

    addToShopifyCart: builder.mutation<ShopifyCart, { variantId: string; quantity?: number }>({
      queryFn: async ({ variantId, quantity }) => {
        try {
          return { data: await shopifyCart.addLine(variantId, quantity ?? 1) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['ShopifyCart'],
    }),

    updateShopifyCartLine: builder.mutation<ShopifyCart, { lineId: string; quantity: number }>({
      queryFn: async ({ lineId, quantity }) => {
        try {
          return { data: await shopifyCart.updateLineQuantity(lineId, quantity) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['ShopifyCart'],
    }),

    removeShopifyCartLine: builder.mutation<ShopifyCart, { lineId: string }>({
      queryFn: async ({ lineId }) => {
        try {
          return { data: await shopifyCart.removeLine(lineId) };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['ShopifyCart'],
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
  useGetShopifyCartQuery,
  useAddToShopifyCartMutation,
  useUpdateShopifyCartLineMutation,
  useRemoveShopifyCartLineMutation,
} = cartApi;
