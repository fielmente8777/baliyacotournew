'use client';

/**
 * One order, in full: progress, every item, delivery address and payment.
 *
 * Two kinds of order share this page:
 *  - custom-design orders from baliye-node, addressed by their Mongo id and
 *    fetched with their tracking history (so each step shows its real date);
 *  - ready-to-wear Shopify orders, addressed as "shopify-<number>" and read
 *    from the same list the order history page already loaded.
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Hash,
  MapPin,
  PackageX,
  Ruler,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';

import EmptyState from '@/components/EmptyState';
import { LostThreadIllustration } from '@/components/illustrations';
import { formatINR } from '@/lib/format';
import {
  useGetShopifyOrderQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
} from '@/store/api/orderApi';
import type { Order, ShopifyOrder } from '@/@types/order';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import { CustomOrderActions, ShopifyOrderActions } from './order-actions';
import OrderTimeline from '../../app/(website)/my-account/orders/components/OrderTimeline';
import {
  COPY,
  SHOPIFY_COPY,
  buildShopifyTimeline,
  buildTimeline,
  formatMoney,
  isShopifySlug,
  shortDate,
  type OrderStage,
  type TimelineItem,
} from '../../app/(website)/my-account/orders/orderView';

const PLACEHOLDER = '/Rectangle-23959.png';

/* ------------------------------------------------------------ small parts */

const STAGE_PILL: Record<OrderStage, string> = {
  active: 'bg-[#FBF1E1] text-[#8A5A12]',
  delivered: 'bg-[#E8F1E8] text-[#2F5E31]',
  cancelled: 'bg-[#FBE9E8] text-[#9B1C14]',
};

const toStage = (status: string): OrderStage =>
  status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : 'active';

function Panel({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#EFEAE2] p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#222]">
        <Icon size={16} className="text-[#A52C45]" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1 text-sm ${strong ? 'font-semibold text-[#222]' : 'text-[#555]'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

interface HeaderProps {
  orderNumber: string;
  placedAt: string;
  stage: OrderStage;
  statusTitle: string;
  statusDescription: string;
}

function DetailHeader({ orderNumber, placedAt, stage, statusTitle, statusDescription }: HeaderProps) {
  return (
    <div className="border-b border-[#E9E4DC] px-4 py-4 sm:px-6 sm:py-5">
      <Link
        href="/my-account/orders"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] transition-colors hover:text-[#A52C45]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All orders
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-lg font-semibold text-[#222]">
            <Hash size={18} className="text-[#A52C45]" aria-hidden="true" />
            Order {orderNumber.replace(/^#/, '')}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B6B6B]">
            <CalendarDays size={14} aria-hidden="true" />
            Placed on {shortDate(placedAt)}
          </p>
        </div>

        <div className="sm:text-right">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STAGE_PILL[stage]}`}>
            {statusTitle}
          </span>
          <p className="mt-1.5 text-[13px] text-[#6B6B6B]">{statusDescription}</p>
        </div>
      </div>
    </div>
  );
}

function Progress({ timeline }: { timeline: TimelineItem[] }) {
  if (timeline.length === 0) return null;
  return (
    <div className="border-b border-[#E9E4DC] px-4 py-6 sm:px-6">
      <OrderTimeline items={timeline} bare />
    </div>
  );
}

function CancelledBanner({ at, reason }: { at?: string; reason?: string }) {
  return (
    <div className="mx-4 mt-5 flex gap-3 rounded-lg bg-[#FBE9E8] p-4 text-sm text-[#7A1A13] sm:mx-6">
      <PackageX size={20} className="shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">This order was cancelled{at ? ` on ${shortDate(at)}` : ''}.</p>
        {reason && <p className="mt-0.5">Reason: {reason}</p>}
      </div>
    </div>
  );
}

function ItemRow({ image, name, meta, price, children }: {
  image?: string;
  name: string;
  meta?: string;
  price: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Image
        src={image || PLACEHOLDER}
        alt={name}
        width={88}
        height={110}
        className="h-[96px] w-[76px] shrink-0 object-cover sm:h-[110px] sm:w-[88px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
          <p className="break-words text-sm font-medium text-[#222] sm:text-[15px]">{name}</p>
          <p className="shrink-0 text-sm font-semibold text-[#222]">{price}</p>
        </div>
        {meta && <p className="mt-1 text-[13px] text-[#6B6B6B]">{meta}</p>}
        {children}
      </div>
    </li>
  );
}

function LoadingSkeleton() {
  return (
    <AccountContent>
      <div className="animate-pulse space-y-4 px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading order">
        <div className="h-4 w-24 rounded bg-black/5" />
        <div className="h-6 w-48 rounded bg-black/5" />
        <div className="h-20 rounded bg-black/5" />
        <div className="h-28 rounded bg-black/5" />
      </div>
    </AccountContent>
  );
}

function NotFound() {
  return (
    <AccountContent>
      <EmptyState
        illustration={<LostThreadIllustration />}
        title="We couldn't find that order"
        message="It may belong to a different account, or the link may be incomplete."
        action={{ label: 'Back to my orders', href: '/my-account/orders' }}
      />
    </AccountContent>
  );
}

/* ------------------------------------------------------ custom-design order */

function CustomOrderDetail({ order, tracking }: { order: Order; tracking: Parameters<typeof buildTimeline>[1] }) {

  const copy = COPY[order.status] ?? COPY.pending;
  const itemsTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <AccountContent>
      <DetailHeader
        orderNumber={order.orderNumber}
        placedAt={order.createdAt}
        stage={toStage(order.status)}
        statusTitle={copy.title}
        statusDescription={copy.description}
      />

      {order.status === 'cancelled' && <CancelledBanner at={order.cancelledAt} reason={order.cancelReason} />}
      <Progress timeline={buildTimeline(order, tracking)} />

      <div className="px-4 sm:px-6">
        <h3 className="flex items-center gap-2 pt-5 text-sm font-semibold text-[#222]">
          <ShoppingBag size={16} className="text-[#A52C45]" aria-hidden="true" />
          Items ({order.items.length})
        </h3>
        <ul className="divide-y divide-[#F2EEE8]">
          {order.items.map((item, index) => (
            <ItemRow
              key={index}
              image={item.itemSnapshot?.image}
              name={item.itemSnapshot?.name ?? 'Custom Design'}
              meta={`Qty ${item.quantity} · ${formatINR(item.unitPrice / 100)} each`}
              price={formatINR(item.subtotal / 100)}
            >
              {item.measurementSnapshot?.values?.length > 0 && (
                <details className="group mt-2 text-[13px]">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[#A52C45]">
                    <Ruler size={14} aria-hidden="true" />
                    Measurements: {item.measurementSnapshot.profileName}
                    <span className="transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <dl className="mt-2 grid animate-fade-in grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-[#FAF8F4] p-3 sm:grid-cols-3">
                    {item.measurementSnapshot.values.map((m) => (
                      <div key={m.name} className="flex justify-between gap-2">
                        <dt className="truncate text-[#6B6B6B]">{m.name}</dt>
                        <dd className="shrink-0 text-[#222]">
                          {m.value} {m.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </ItemRow>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 px-4 pb-6 pt-2 sm:px-6 md:grid-cols-2">
        <Panel icon={MapPin} title="Delivery address">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#555]">
            {order.shippingAddress || 'No address recorded for this order.'}
          </p>
        </Panel>

        <Panel icon={CreditCard} title="Payment summary">
          <SummaryRow label="Items" value={formatINR(itemsTotal / 100)} />
          <div className="my-2 border-t border-[#F2EEE8]" />
          <SummaryRow label="Total" value={formatINR(order.totalAmount / 100)} strong />
        </Panel>
      </div>

      <CustomOrderActions order={order} />
    </AccountContent>
  );
}

/* -------------------------------------------------------- Shopify order */

function ShopifyOrderDetail({ order }: { order: ShopifyOrder }) {
  const copy = SHOPIFY_COPY[order.status] ?? SHOPIFY_COPY.placed;
  const itemsTotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const money = (n: number) => formatMoney(n, order.currencyCode);
  const paymentLabel =
    order.paymentStatus === 'PAID'
      ? 'Paid'
      : order.paymentStatus === 'PENDING'
        ? 'Payment pending'
        : order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase().replace(/_/g, ' ');

  return (
    <AccountContent>
      <DetailHeader
        orderNumber={order.orderNumber}
        placedAt={order.createdAt}
        stage={toStage(order.status)}
        statusTitle={copy.title}
        statusDescription={copy.description}
      />

      {order.status === 'cancelled' && <CancelledBanner at={order.cancelledAt} />}
      <Progress timeline={buildShopifyTimeline(order)} />

      <div className="px-4 sm:px-6">
        <h3 className="flex items-center gap-2 pt-5 text-sm font-semibold text-[#222]">
          <ShoppingBag size={16} className="text-[#A52C45]" aria-hidden="true" />
          Items ({order.items.length})
        </h3>
        <ul className="divide-y divide-[#F2EEE8]">
          {order.items.map((item, index) => (
            <ItemRow
              key={index}
              image={item.image}
              name={item.title}
              meta={[
                item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : null,
                `Qty ${item.quantity}`,
              ]
                .filter(Boolean)
                .join(' · ')}
              price={money(item.lineTotal)}
            />
          ))}
        </ul>
      </div>

      <div className="grid gap-4 px-4 pb-6 pt-2 sm:px-6 md:grid-cols-2">
        <Panel icon={MapPin} title="Delivery address">
          <p className="text-sm leading-relaxed text-[#555]">
            Your delivery address is in the order confirmation email from Shopify.
          </p>
        </Panel>

        <Panel icon={CreditCard} title="Payment summary">
          <SummaryRow label="Items" value={money(itemsTotal)} />
          <SummaryRow label="Shipping" value={order.shippingTotal > 0 ? money(order.shippingTotal) : 'Free'} />
          <div className="my-2 border-t border-[#F2EEE8]" />
          <SummaryRow label="Total" value={money(order.total)} strong />
          <p className="mt-2 text-xs text-[#8A8A8A]">Taxes included · {paymentLabel}</p>
        </Panel>
      </div>

      <ShopifyOrderActions order={order} />
    </AccountContent>
  );
}

/* ------------------------------------------------------------------ page */

export default function OrderDetailView({ orderId }: { orderId: string }) {
  const shopify = isShopifySlug(orderId);

  const custom = useGetOrderByIdQuery(orderId, { skip: shopify });
  const tracking = useGetOrderTrackingQuery(orderId, { skip: shopify });
  /* "shopify-6412…" → 6412…, loaded on its own with the full return detail. */
  const shopifyOrder = useGetShopifyOrderQuery(orderId.replace(/^shopify-/, ''), { skip: !shopify });

  if (shopify) {
    if (shopifyOrder.isLoading) return <LoadingSkeleton />;
    return shopifyOrder.data ? <ShopifyOrderDetail order={shopifyOrder.data} /> : <NotFound />;
  }

  if (custom.isLoading) return <LoadingSkeleton />;
  if (!custom.data) return <NotFound />;
  return <CustomOrderDetail order={custom.data} tracking={tracking.data ?? []} />;
}
