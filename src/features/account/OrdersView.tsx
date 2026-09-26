'use client';

/**
 * Order History, live.
 *
 * One card per order line rather than per order, because the design shows a
 * product image, a price and a review action — all of which belong to a line,
 * not to an order that may contain three garments.
 */

import EmptyState from '@/components/EmptyState';
import { EmptyOrdersIllustration, NoProductsIllustration } from '@/components/illustrations';
import { useMemo, useState } from 'react';

import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from '@/store/api/orderApi';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import OrderCard from '../../app/(website)/my-account/orders/components/OrderCard';
import {
  toOrderLines,
  toShopifyOrderLines,
} from '../../app/(website)/my-account/orders/orderView';
import { useGetMyReviewsQuery } from '@/store/api/reviewApi';
import OrdersHeader from '../../app/(website)/my-account/orders/components/OrdersHeader';
import OrdersFilterPanel, {
  DEFAULT_ORDER_FILTERS,
  countActiveFilters,
  timeFilterStart,
  type OrderFilters,
} from '../../app/(website)/my-account/orders/components/OrdersFilterPanel';

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

  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const visibleLines = useMemo(() => {
    const since = timeFilterStart(filters.time);
    return lines.filter(
      (line) =>
        (filters.status === 'all' || line.stage === filters.status) &&
        (filters.type === 'all' || line.source === filters.type) &&
        (!since || new Date(line.placedAt) >= since)
    );
  }, [lines, filters]);

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
      <OrdersHeader
        onFilterClick={() => setFilterOpen((open) => !open)}
        isFilterOpen={isFilterOpen}
        activeCount={activeCount}
        resultCount={isLoading || isError ? undefined : visibleLines.length}
      />

      {isFilterOpen && <OrdersFilterPanel filters={filters} onChange={setFilters} />}

      {isLoading && (
        <div className="divide-y divide-[#F2EEE8]" aria-busy="true" aria-label="Loading your orders">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-4 px-4 py-6 sm:px-6">
              <div className="h-32 w-24 shrink-0 bg-black/5 sm:h-40 sm:w-[149px]" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-4 w-2/3 rounded bg-black/5" />
                <div className="h-4 w-1/4 rounded bg-black/5" />
                <div className="h-3 w-1/2 rounded bg-black/5" />
              </div>
            </div>
          ))}
        </div>
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
          {shopifyError
            ? 'Your ready-to-wear orders couldn\u2019t be loaded right now.'
            : 'Your custom-design orders couldn\u2019t be loaded right now.'}{' '}
          <button type="button" onClick={refetch} className="underline">
            Try again
          </button>
        </p>
      )}

      {!isLoading && !isError && !partialError && lines.length === 0 && (
        <EmptyState
          illustration={<EmptyOrdersIllustration />}
          title="No orders yet"
          message="When you place an order, you can follow every step of it here, from stitching to your doorstep."
          action={{ label: 'Start shopping', href: '/products' }}
        />
      )}

      {!isLoading && lines.length > 0 && visibleLines.length === 0 && (
        <EmptyState
          illustration={<NoProductsIllustration className="w-32" />}
          title="No orders match these filters"
          message="Try a different status or time range."
          action={{ label: 'Clear filters', onClick: () => setFilters(DEFAULT_ORDER_FILTERS) }}
        />
      )}

      <div className="divide-y divide-[#F2EEE8]">
        {visibleLines.map((line) => (
          <OrderCard key={line.key} order={line} />
        ))}
      </div>
    </AccountContent>
  );
}
