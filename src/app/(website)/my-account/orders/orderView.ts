/**
 * Maps an API order onto the shape the existing cards render.
 *
 * The card components came from the Figma and are deliberately untouched, so
 * the translation lives here rather than in them: the API speaks of items,
 * statuses and snapshots, the cards speak of a product name, a price and a
 * five-step timeline.
 */

import type { Order, OrderItem, OrderStatus } from '@/@types/order';
import type { Review } from '@/@types/review';
import { formatINR } from '@/lib/format';

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

export interface OrderLineView {
  key: string;
  orderId: string;
  productId?: string;
  customDesignId?: string;
  productName: string;
  price: string;
  image: string;
  statusTitle: string;
  statusDescription: string;
  isDelivered: boolean;
  timeline: TimelineItem[];
  review?: Review;
}

/** The five steps the design shows, in order. */
const STEPS: { status: OrderStatus; title: string }[] = [
  { status: 'confirmed', title: 'Order Placed' },
  { status: 'stitching', title: 'Stitching' },
  { status: 'embroidery', title: 'Embroidery' },
  { status: 'shipped', title: 'Shipping' },
  { status: 'delivered', title: 'Delivered' },
];

const COPY: Record<OrderStatus, { title: string; description: string }> = {
  pending: { title: 'Order Placed', description: 'We have received your order.' },
  confirmed: { title: 'Order Confirmed', description: 'Your order is being prepared.' },
  stitching: { title: 'In Production', description: 'Your garment is being stitched.' },
  embroidery: { title: 'In Production', description: 'Embroidery work is under way.' },
  shipped: { title: 'On Its Way', description: 'Your order has left our workshop.' },
  delivered: { title: 'Delivered', description: 'Enjoy your new piece.' },
  cancelled: { title: 'Cancelled', description: 'This order was cancelled.' },
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * A cancelled order has no position on the production timeline, so it gets an
 * empty one rather than a misleading half-finished bar.
 */
function buildTimeline(order: Order): TimelineItem[] {
  if (order.status === 'cancelled') return [];

  const reached = STEPS.findIndex((step) => step.status === order.status);
  /* 'pending' precedes every step but the first is still "placed". */
  const current = reached === -1 ? 0 : reached;

  return STEPS.map((step, index) => ({
    id: index + 1,
    title: step.title,
    /* Only the placement date is known; later steps get one when the admin
       moves the order, which the tracking endpoint will supply later. */
    date: index === 0 ? shortDate(order.createdAt) : index <= current ? shortDate(order.updatedAt) : '',
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
        orderId: order._id,
        productId: item.productId,
        customDesignId: item.customDesignId,
        productName: item.itemSnapshot?.name ?? 'Custom Design',
        price: formatINR(item.subtotal / 100),
        image: item.itemSnapshot?.image || PLACEHOLDER,
        statusTitle: copy.title,
        statusDescription: copy.description,
        isDelivered: order.status === 'delivered',
        timeline,
        review,
      };
    });
  });
}
