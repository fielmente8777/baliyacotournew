'use client';

/**
 * Order History, live.
 *
 * One card per order line rather than per order, because the design shows a
 * product image, a price and a review action — all of which belong to a line,
 * not to an order that may contain three garments.
 */

import Link from 'next/link';
import { useMemo } from 'react';

import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from '@/store/api/orderApi';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import OrderCard from '../../app/(website)/my-account/orders/components/OrderCard';
import {
  toOrderLines,
  toShopifyOrderLines,
} from '../../app/(website)/my-account/orders/orderView';
import { useGetMyReviewsQuery } from '@/store/api/reviewApi';
import OrdersHeader from '../../app/(website)/my-account/orders/components/OrdersHeader';

export default function OrdersView() {
  /* Two sources: custom-design orders from baliye-node, and ready-to-wear
     orders placed through Shopify's checkout. Shown as one list, newest
     first. A Shopify failure doesn't hide the custom orders (or vice versa). */
  const {
    data: orders = [],
    isLoading: customLoading,
    isError: customError,
    refetch: refetchCustom,
  } = useGetMyOrdersQuery();
  const {
    data: shopifyOrders = [],
    isLoading: shopifyLoading,
    isError: shopifyError,
    refetch: refetchShopify,
  } = useGetMyShopifyOrdersQuery();
  /* Reviews are fetched once and matched client-side, rather than per card. */
  const { data: reviews = [] } = useGetMyReviewsQuery();

  const lines = useMemo(
    () =>
      [...toOrderLines(orders, reviews), ...toShopifyOrderLines(shopifyOrders)].sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      ),
    [orders, shopifyOrders, reviews]
  );

  const isLoading = customLoading || shopifyLoading;
  /* Full error state only when BOTH sources failed; one failing gets a note. */
  const isError = customError && shopifyError;
  const partialError = !isError && (customError || shopifyError);
  const refetch = () => {
    if (customError) refetchCustom();
    if (shopifyError) refetchShopify();
  };

  return (
    <AccountContent>
      <OrdersHeader />

      {isLoading && (
        <p className="px-5 py-8 text-sm text-[#8A8A8A] md:px-6">Loading your orders…</p>
      )}

      {isError && (
        <div className="px-5 py-8 md:px-6">
          <p className="text-sm text-[#A52C45]">We couldn&apos;t load your orders.</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && partialError && (
        <p className="px-5 pt-5 text-sm text-[#A52C45] md:px-6">
          Some of your orders couldn&apos;t be loaded.{' '}
          <button type="button" onClick={refetch} className="underline">
            Try again
          </button>
        </p>
      )}

      {!isLoading && !isError && !partialError && lines.length === 0 && (
        <div className="px-5 py-12 text-center md:px-6">
          <p className="text-sm text-[#8A8A8A]">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/collections"
            className="mt-3 inline-block text-sm font-medium text-[#A52C45]"
          >
            Browse the collection
          </Link>
        </div>
      )}

      <div className="divide-y divide-[#F2EEE8]">
        {lines.map((line) => (
          <OrderCard key={line.key} order={line} />
        ))}
      </div>
    </AccountContent>
  );
}
