/** In-app notification feed for the navbar bell. */

import type { AppNotification, NotificationFeed } from '@/@types/notification';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Returns items and the unread count together, so the badge is one call.
        The bell asks for the default (latest 10); the notifications page asks
        for up to 100, the most the API returns in one page. */
    getNotifications: builder.query<NotificationFeed, { limit?: number } | void>({
      query: (arg) => ({
        url: '/notifications',
        params: arg?.limit ? { limit: arg.limit } : undefined,
      }),
      transformResponse: (res: ApiEnvelope<NotificationFeed>) => unwrap(res),
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<AppNotification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      transformResponse: (res: ApiEnvelope<AppNotification>) => unwrap(res),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<unknown, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
