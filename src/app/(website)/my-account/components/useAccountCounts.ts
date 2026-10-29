"use client";

import { useGetNotificationsQuery } from "@/store/api/notificationApi";
import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from "@/store/api/orderApi";
import { useGetWishlistQuery } from "@/store/api/wishlistApi";

import type { AccountBadge } from "./accountMenu";

/**
 * The live numbers the sidebar badges and overview tiles show. Every query
 * here is already made elsewhere (bell, orders, wishlist), so RTK Query's
 * cache means no extra requests once the customer has been around the site.
 */
export function useAccountCounts(): Record<AccountBadge, number | undefined> & { totalOrders?: number } {
  const { data: orders } = useGetMyOrdersQuery();
  const { data: shopifyOrders } = useGetMyShopifyOrdersQuery();
  const { data: wishlist } = useGetWishlistQuery();
  /* Same args as the navbar bell, so both share one cached, polled feed. */
  const { data: feed } = useGetNotificationsQuery(undefined, { pollingInterval: 60000 });

  const ordersLoaded = orders !== undefined || shopifyOrders !== undefined;
  /* "Orders" badges count what's still on its way — the number a shopper cares about. */
  const activeOrders = ordersLoaded
    ? (orders ?? []).filter((o) => o.status !== "delivered" && o.status !== "cancelled").length +
      (shopifyOrders ?? []).filter((o) => o.status === "placed" || o.status === "shipped").length
    : undefined;

  return {
    orders: activeOrders,
    totalOrders: ordersLoaded ? (orders?.length ?? 0) + (shopifyOrders?.length ?? 0) : undefined,
    wishlist: wishlist?.count,
    notifications: feed?.unread,
  };
}
