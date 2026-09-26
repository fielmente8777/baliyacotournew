/** Order endpoints. Never mocked — orders belong to the authenticated user. */

import type {
  CreateReplacementBody,
  Order,
  OrderStatus,
  OrderTrackingEntry,
  PlaceOrderBody,
  ReplacementRequest,
  ShopifyOrder,
  ShopifyReturnBody,
} from '@/@types/order';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

/**
 * baliye-node sends workshop statuses ("Pending", "Measurement Verified",
 * "Cutting", "Quality Check" …); the order pages speak the five steps from
 * the design. Without this mapping `status === 'pending'` never matched, so
 * the timeline stayed on step one and the Cancel button never appeared.
 */
const STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  'measurement verified': 'confirmed',
  cutting: 'stitching',
  stitching: 'stitching',
  embroidery: 'embroidery',
  'quality check': 'embroidery',
  ready: 'embroidery',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const normaliseStatus = (status: string): OrderStatus =>
  STATUS_MAP[String(status).toLowerCase()] ?? 'pending';

const normaliseOrder = (order: Order): Order => ({ ...order, status: normaliseStatus(order.status) });

/** Shopify GID → the numeric id the backend routes take. */
const shopifyNumericId = (gid: string) => gid.split('/').pop() ?? gid;

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
      transformResponse: (res: ApiEnvelope<Order[]>) => unwrap(res).map(normaliseOrder),
      providesTags: ['Order'],
    }),

    /** Ready-to-wear orders placed through Shopify's checkout. */
    getMyShopifyOrders: builder.query<ShopifyOrder[], void>({
      query: () => '/orders/shopify',
      transformResponse: (res: ApiEnvelope<ShopifyOrder[]>) => unwrap(res),
      providesTags: ['Order'],
    }),

    /**
     * One Shopify order with return statuses and exact returnable quantities
     * — too costly to fetch for every order in the list. Takes the GID or
     * the numeric id.
     */
    getShopifyOrder: builder.query<ShopifyOrder, string>({
      query: (id) => `/orders/shopify/${shopifyNumericId(id)}`,
      transformResponse: (res: ApiEnvelope<ShopifyOrder>) => unwrap(res),
      providesTags: ['Order'],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: ApiEnvelope<Order>) => normaliseOrder(unwrap(res)),
      providesTags: ['Order'],
    }),

    getOrderTracking: builder.query<OrderTrackingEntry[], string>({
      query: (id) => `/orders/${id}/tracking`,
      transformResponse: (res: ApiEnvelope<OrderTrackingEntry[]>) =>
        unwrap(res).map((entry) => ({ ...entry, status: normaliseStatus(entry.status) })),
      providesTags: ['Order'],
    }),

    cancelOrder: builder.mutation<Order, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/cancel/${id}`,
        method: 'PUT',
        body: { reason },
      }),
      transformResponse: (res: ApiEnvelope<Order>) => normaliseOrder(unwrap(res)),
      invalidatesTags: ['Order'],
    }),

    /* ---- Replacement / alteration (custom-design orders) ---- */

    requestReplacement: builder.mutation<ReplacementRequest, { orderId: string; body: CreateReplacementBody }>({
      query: ({ orderId, body }) => ({ url: `/orders/${orderId}/replacements`, method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<ReplacementRequest>) => unwrap(res),
      invalidatesTags: ['Order'],
    }),

    getOrderReplacements: builder.query<ReplacementRequest[], string>({
      query: (orderId) => `/orders/${orderId}/replacements`,
      transformResponse: (res: ApiEnvelope<ReplacementRequest[]>) => unwrap(res),
      providesTags: ['Order'],
    }),

    /* ---- Shopify (ready-to-wear) orders ---- */

    /** Before dispatch only. Refunds in full; Shopify emails the customer. */
    cancelShopifyOrder: builder.mutation<{ orderNumber: string }, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: `/orders/shopify/${shopifyNumericId(orderId)}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (res: ApiEnvelope<{ orderNumber: string }>) => unwrap(res),
      /* Shopify finishes the cancellation as a background job — refetch
         once more a few seconds later so the list shows "Cancelled". */
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          setTimeout(() => dispatch(orderApi.util.invalidateTags(['Order'])), 4000);
        } catch {
          /* error surfaces in the component */
        }
      },
      invalidatesTags: ['Order'],
    }),

    requestShopifyReturn: builder.mutation<{ name: string; status: string }, { orderId: string; body: ShopifyReturnBody }>({
      query: ({ orderId, body }) => ({
        url: `/orders/shopify/${shopifyNumericId(orderId)}/returns`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiEnvelope<{ name: string; status: string }>) => unwrap(res),
      invalidatesTags: ['Order'],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetMyShopifyOrdersQuery,
  useGetShopifyOrderQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useCancelOrderMutation,
  useRequestReplacementMutation,
  useGetOrderReplacementsQuery,
  useCancelShopifyOrderMutation,
  useRequestShopifyReturnMutation,
} = orderApi;

/** The server's own message ("already shipped…"), else a fallback. */
export const apiErrorMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string } } | undefined)?.data;
  return data?.message || fallback;
};
