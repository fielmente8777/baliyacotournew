/** Order endpoints. Never mocked — orders belong to the authenticated user. */

import type { Order, OrderTrackingEntry, PlaceOrderBody } from '@/@types/order';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation<Order, PlaceOrderBody>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Order>) => unwrap(res),
      /* Placing an order empties the cart server-side. */
      invalidatesTags: ['Order', 'Cart'],
    }),

    getMyOrders: builder.query<Order[], { page?: number; limit?: number } | void>({
      query: (arg) => ({
        url: '/orders',
        params: { page: arg?.page ?? 1, limit: arg?.limit ?? 10 },
      }),
      transformResponse: (res: ApiEnvelope<Order[]>) => unwrap(res),
      providesTags: ['Order'],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: ApiEnvelope<Order>) => unwrap(res),
      providesTags: ['Order'],
    }),

    getOrderTracking: builder.query<OrderTrackingEntry[], string>({
      query: (id) => `/orders/${id}/tracking`,
      transformResponse: (res: ApiEnvelope<OrderTrackingEntry[]>) => unwrap(res),
      providesTags: ['Order'],
    }),

    cancelOrder: builder.mutation<Order, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/cancel/${id}`,
        method: 'PUT',
        body: { reason },
      }),
      transformResponse: (res: ApiEnvelope<Order>) => unwrap(res),
      invalidatesTags: ['Order'],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useCancelOrderMutation,
} = orderApi;
