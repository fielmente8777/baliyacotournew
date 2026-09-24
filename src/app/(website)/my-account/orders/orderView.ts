/**
 * Maps an API order onto the shape the existing cards render.
 *
 * The card components came from the Figma and are deliberately untouched, so
 * the translation lives here rather than in them: the API speaks of items,
 * statuses and snapshots, the cards speak of a product name, a price and a
 * five-step timeline.
 */

import type { Order, OrderItem, OrderStatus, OrderTrackingEntry, ShopifyOrder } from '@/@types/order';
import type { Review } from '@/@types/review';
import { formatINR } from '@/lib/format';

/** Which icon a timeline step shows (see OrderTimeline). */
export type StepIcon = 'placed' | 'stitching' | 'embroidery' | 'shipping' | 'delivered';

export interface TimelineItem {
  id: number;
  title: string;
  icon: StepIcon;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

export interface OrderLineView {
  key: string;
  /** ISO date the order was placed — used to sort both order sources together. */
  placedAt: string;
  orderId: string;
  /** Link to the order's own page: /my-account/orders/<id>. */
  detailHref: string;
  productId?: string;
  customDesignId?: string;
  productName: string;
  price: string;
  image: string;
  statusTitle: string;
  statusDescription: string;
  isDelivered: boolean;
  /** Where the order came from — drives the "Type" filter. */
  source: 'custom' | 'shopify';
  /** Coarse status for the "Status" filter. */
  stage: OrderStage;
  timeline: TimelineItem[];
  review?: Review;
}

export type OrderStage = 'active' | 'delivered' | 'cancelled';

const toStage = (status: string): OrderStage =>
  status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : 'active';

/** The five steps the design shows, in order. */
const STEPS: { status: OrderStatus; title: string; icon: StepIcon }[] = [
  { status: 'confirmed', title: 'Order Placed', icon: 'placed' },
  { status: 'stitching', title: 'Stitching', icon: 'stitching' },
  { status: 'embroidery', title: 'Embroidery', icon: 'embroidery' },
  { status: 'shipped', title: 'Shipping', icon: 'shipping' },
  { status: 'delivered', title: 'Delivered', icon: 'delivered' },
];

export const COPY: Record<OrderStatus, { title: string; description: string }> = {
  pending: { title: 'Order Placed', description: 'We have received your order.' },
  confirmed: { title: 'Order Confirmed', description: 'Your order is being prepared.' },
  stitching: { title: 'In Production', description: 'Your garment is being stitched.' },
  embroidery: { title: 'In Production', description: 'Embroidery work is under way.' },
  shipped: { title: 'On Its Way', description: 'Your order has left our workshop.' },
  delivered: { title: 'Delivered', description: 'Enjoy your new piece.' },
  cancelled: { title: 'Cancelled', description: 'This order was cancelled.' },
};

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * A cancelled order has no position on the production timeline, so it gets an
 * empty one rather than a misleading half-finished bar.
 */
export function buildTimeline(order: Order, tracking: OrderTrackingEntry[] = []): TimelineItem[] {
  if (order.status === 'cancelled') return [];

  /* When the tracking history is available (order detail page), each step
     gets the date it was actually reached. */
  const reachedAt = (status: OrderStatus) =>
    tracking.find((entry) => entry.status === status)?.createdAt;

  const reached = STEPS.findIndex((step) => step.status === order.status);
  /* 'pending' precedes every step but the first is still "placed". */
  const current = reached === -1 ? 0 : reached;

  return STEPS.map((step, index) => ({
    id: index + 1,
    title: step.title,
    icon: step.icon,
    /* Placement date is always known; later steps use the tracking entry
       when there is one, otherwise the order's last update. */
    date:
      index === 0
        ? shortDate(order.createdAt)
        : index <= current
          ? shortDate(reachedAt(step.status) ?? order.updatedAt)
          : '',
    status: index < current ? 'completed' : index === current ? 'current' : 'pending',
  }));
}

const PLACEHOLDER = '/Rectangle-23959.png';

export function toOrderLines(orders: Order[], reviews: Review[]): OrderLineView[] {
  return orders.flatMap((order) => {
    const timeline = buildTimeline(order);
    const copy = COPY[order.status] ?? COPY.pending;

    return order.items.map((item: OrderItem, index: number) => {
      const review = reviews.find(
        (r) =>
          r.orderId === order._id &&
          (item.productId ? r.productId === item.productId : r.customDesignId === item.customDesignId)
      );

      return {
        key: `${order._id}-${index}`,
        placedAt: order.createdAt,
        orderId: order._id,
        detailHref: `/my-account/orders/${order._id}`,
        productId: item.productId,
        customDesignId: item.customDesignId,
        productName: item.itemSnapshot?.name ?? 'Custom Design',
        price: formatINR(item.subtotal / 100),
        image: item.itemSnapshot?.image || PLACEHOLDER,
        statusTitle: copy.title,
        statusDescription: copy.description,
        isDelivered: order.status === 'delivered',
        source: 'custom' as const,
        stage: toStage(order.status),
        timeline,
        review,
      };
    });
  });
}

/* ---------------------------------------------------------------------------
 * Ready-to-wear orders from Shopify.
 *
 * Shopify has no stitching or embroidery stage — these garments ship as
 * they are — so they get a shorter three-step timeline. Reviews stay
 * limited to baliye-node products/designs (the review API validates
 * against those ids), so Shopify lines report isDelivered: false purely to
 * keep the card's review action hidden.
 * ------------------------------------------------------------------------- */

const SHOPIFY_STEPS: { key: 'placed' | 'shipped' | 'delivered'; title: string; icon: StepIcon }[] = [
  { key: 'placed', title: 'Order Placed', icon: 'placed' },
  { key: 'shipped', title: 'Shipping', icon: 'shipping' },
  { key: 'delivered', title: 'Delivered', icon: 'delivered' },
];

/**
 * Shopify order ids are GIDs ("gid://shopify/Order/6412…"), which don't
 * belong in a URL. The detail page uses "shopify-6412…" instead.
 */
export const shopifyOrderSlug = (gid: string) => `shopify-${gid.split('/').pop()}`;

export const isShopifySlug = (slug: string) => slug.startsWith('shopify-');

export const findShopifyOrder = (orders: ShopifyOrder[], slug: string) =>
  orders.find((o) => shopifyOrderSlug(o.id) === slug);

export const SHOPIFY_COPY: Record<ShopifyOrder['status'], { title: string; description: string }> = {
  placed: { title: 'Order Placed', description: 'We have received your order.' },
  shipped: { title: 'On Its Way', description: 'Your order has been shipped.' },
  delivered: { title: 'Delivered', description: 'Enjoy your new piece.' },
  cancelled: { title: 'Cancelled', description: 'This order was cancelled.' },
};

/** Formats in the order's own currency — Shopify orders may be INR, CAD, USD … */
export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amount);

export function buildShopifyTimeline(order: ShopifyOrder): TimelineItem[] {
  if (order.status === 'cancelled') return [];

  const current = SHOPIFY_STEPS.findIndex((step) => step.key === order.status);
  const dates: Record<string, string | undefined> = {
    placed: order.createdAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
  };

  return SHOPIFY_STEPS.map((step, index) => ({
    id: index + 1,
    title: step.title,
    icon: step.icon,
    date: index <= current && dates[step.key] ? shortDate(dates[step.key]!) : '',
    status: index < current ? 'completed' : index === current ? 'current' : 'pending',
  }));
}

export function toShopifyOrderLines(orders: ShopifyOrder[]): OrderLineView[] {
  return orders.flatMap((order) => {
    const timeline = buildShopifyTimeline(order);
    const copy = SHOPIFY_COPY[order.status] ?? SHOPIFY_COPY.placed;
    /* Cash on delivery shows as PENDING until the courier collects. */
    const paymentNote =
      order.status !== 'cancelled' && order.paymentStatus === 'PENDING'
        ? ' Payment due on delivery.'
        : '';

    /* A single-line order's card shows the full amount payable, so it matches
       Shopify's order total. A multi-line order keeps each card's own line
       price (the cards are per line) and states the order total in the
       description instead, so the total isn't repeated on every card. */
    const singleLine = order.items.length === 1;
    const shipping = order.shippingTotal ?? 0;
    const shippingNote = shipping > 0
      ? ` incl. ${formatMoney(shipping, order.currencyCode)} shipping`
      : '';
    const totalNote = singleLine
      ? (shippingNote ? `Total${shippingNote} · ` : '')
      : `Order total ${formatMoney(order.total, order.currencyCode)}${shippingNote} · `;

    return order.items.map((item, index) => ({
      key: `${order.id}-${index}`,
      placedAt: order.createdAt,
      orderId: order.id,
      detailHref: `/my-account/orders/${shopifyOrderSlug(order.id)}`,
      productName: [
        item.title,
        item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : null,
      ]
        .filter(Boolean)
        .join(' · ') + (item.quantity > 1 ? ` × ${item.quantity}` : ''),
      price: formatMoney(singleLine ? order.total : item.lineTotal, order.currencyCode),
      image: item.image || PLACEHOLDER,
      statusTitle: copy.title,
      statusDescription: `Order ${order.orderNumber} · ${totalNote}${copy.description}${paymentNote}`,
      isDelivered: false,
      source: 'shopify' as const,
      stage: toStage(order.status),
      timeline,
    }));
  });
}
