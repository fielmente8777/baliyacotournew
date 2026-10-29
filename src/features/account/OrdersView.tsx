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
import { Search, X } from 'lucide-react';

import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from '@/store/api/orderApi';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import OrderCard from '../../app/(website)/my-account/orders/components/OrderCard';
import {
  toOrderLines,
  toShopifyOrderLines,
} from '../../app/(website)/my-account/orders/orderView';
import { useGetReviewsQuery } from '@/store/api/reviewApi';
import OrdersHeader from '../../app/(website)/my-account/orders/components/OrdersHeader';
import OrdersFilterPanel, {
  DEFAULT_ORDER_FILTERS,
  STATUS_OPTIONS,
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
  const { data: reviews = [] } = useGetReviewsQuery();

  const lines = useMemo(
    () =>
      [...toOrderLines(orders), ...toShopifyOrderLines(shopifyOrders, reviews)].sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      ),
    [orders, shopifyOrders, reviews]
  );

  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const activeCount = countActiveFilters(filters);

  /* Type, time and search narrow the list first; the status tabs then show
     how many of those fall in each stage. */
  const narrowed = useMemo(() => {
    const since = timeFilterStart(filters.time);
    const q = query.trim().toLowerCase();
    return lines.filter(
      (line) =>
        (filters.type === 'all' || line.source === filters.type) &&
        (!since || new Date(line.placedAt) >= since) &&
        (!q ||
          line.productName.toLowerCase().includes(q) ||
          line.statusDescription.toLowerCase().includes(q) ||
          (line.orderNumber ?? '').toLowerCase().includes(q))
    );
  }, [lines, filters.type, filters.time, query]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: narrowed.length };
    narrowed.forEach((line) => {
      counts[line.stage] = (counts[line.stage] ?? 0) + 1;
    });
    return counts;
  }, [narrowed]);

  const visibleLines = useMemo(
    () => narrowed.filter((line) => filters.status === 'all' || line.stage === filters.status),
    [narrowed, filters.status]
  );

  const clearAll = () => {
    setFilters(DEFAULT_ORDER_FILTERS);
    setQuery('');
  };

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

      {!isError && lines.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-[#E9E4DC] px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div
            className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Order status"
          >
            <div className="flex w-max gap-1.5">
              {STATUS_OPTIONS.map((option) => {
                const selected = filters.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilters({ ...filters, status: option.value })}
                    className={`h-8 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors ${
                      selected ? 'bg-[#A52C45] text-white' : 'bg-[#FAF8F4] text-[#555] hover:bg-[#F5F1EA] hover:text-[#A52C45]'
                    }`}
                  >
                    {option.label}
                    <span className={`ml-1.5 text-[11px] ${selected ? 'text-white/80' : 'text-[#8A8A8A]'}`}>
                      {stageCounts[option.value] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="relative block md:w-64">
            <span className="sr-only">Search orders</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product or order no."
              className="h-9 w-full rounded-md border border-[#E4DED4] bg-white pl-9 pr-8 text-[13px] text-[#222] outline-none transition-colors placeholder:text-[#A9A9A9] focus:border-[#A52C45] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8A8A8A] hover:bg-[#F5F1EA] hover:text-[#222]"
              >
                <X size={13} />
              </button>
            )}
          </label>
        </div>
      )}

      {isLoading && (
        <div className="divide-y divide-[#F2EEE8]" aria-busy="true" aria-label="Loading your orders">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-4 px-4 py-6 sm:px-6">
              <div className="h-28 w-[88px] shrink-0 rounded bg-black/5 sm:h-[150px] sm:w-[120px]" />
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
          message={query ? `Nothing matches “${query.trim()}”. Try another search or status.` : 'Try a different status or time range.'}
          action={{ label: 'Clear filters', onClick: clearAll }}
        />
      )}

      {visibleLines.length > 0 && (
        <div className="space-y-4 bg-[#FCFBF8] p-3 sm:p-5">
          {visibleLines.map((line) => (
            <OrderCard key={line.key} order={line} />
          ))}
        </div>
      )}
    </AccountContent>
  );
}
