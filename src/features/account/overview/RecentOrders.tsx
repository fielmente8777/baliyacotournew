'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from '@/store/api/orderApi';

import StatusPill from '../../../app/(website)/my-account/orders/components/StatusPill';
import { shortDate, toOrderLines, toShopifyOrderLines } from '../../../app/(website)/my-account/orders/orderView';
import { OverviewEmpty } from './OverviewSection';

/** The three latest orders, custom and ready-to-wear together, newest first. */
export default function RecentOrders() {
  const { data: orders = [], isLoading: a } = useGetMyOrdersQuery();
  const { data: shopifyOrders = [], isLoading: b } = useGetMyShopifyOrdersQuery();

  const lines = useMemo(
    () =>
      [...toOrderLines(orders), ...toShopifyOrderLines(shopifyOrders)]
        .sort((x, y) => new Date(y.placedAt).getTime() - new Date(x.placedAt).getTime())
        .slice(0, 3),
    [orders, shopifyOrders]
  );

  if (a || b) {
    return (
      <div className="animate-pulse divide-y divide-[#F1EBE2]" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-4 sm:px-5">
            <div className="h-20 w-15 rounded-sm bg-black/5" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-20 rounded bg-black/5" />
              <div className="h-4 w-1/2 rounded bg-black/5" />
              <div className="h-3 w-1/4 rounded bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (lines.length === 0) {
    return <OverviewEmpty text="You haven't placed any orders yet." href="/products" label="Start shopping" />;
  }

  return (
    <ul className="divide-y divide-[#F1EBE2]">
      {lines.map((line) => (
        <li key={line.key}>
          <Link href={line.detailHref} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[#FAF7F2] sm:px-5">
            <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-sm bg-[#F1EDE6]">
              <Image src={line.image} alt="" fill sizes="60px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6E54]">Placed {shortDate(line.placedAt)}</p>
              <p className="mt-0.5 truncate text-[15px] font-medium text-dark group-hover:text-secondary">{line.productName}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-sm font-semibold text-dark">{line.price}</span>
                <StatusPill stage={line.stage} label={line.statusTitle} />
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#C9BCAB] transition-transform group-hover:translate-x-0.5 group-hover:text-secondary" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
