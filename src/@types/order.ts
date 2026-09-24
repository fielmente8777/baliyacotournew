/** Order types. Mirrors baliye-node models/order.ts. */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'stitching'
  | 'embroidery'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderMeasurementSnapshot {
  profileName: string;
  values: { name: string; value: number; unit: string }[];
}

export interface OrderItem {
  kind: 'product' | 'design';
  productId?: string;
  customDesignId?: string;
  /** Frozen at placement — renaming a product can't rewrite past orders. */
  itemSnapshot: {
    name: string;
    image?: string;
    unitPrice: number;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  measurementProfileId: string;
  measurementSnapshot: OrderMeasurementSnapshot;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddressId?: string;
  /** Flattened at placement — safe to render for historical orders. */
  shippingAddress?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTrackingEntry {
  _id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  /** What baliye-node actually sends (models/tracking.ts). */
  remarks?: string;
  createdAt: string;
}

export interface PlaceOrderBody {
  shippingAddressId?: string;
  shippingAddress?: string;
  measurementProfileId?: string;
}

/* ---- Ready-to-wear orders from Shopify (GET /orders/shopify) ---- */

export type ShopifyOrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled';

export interface ShopifyOrderItem {
  title: string;
  variantTitle?: string;
  quantity: number;
  image?: string;
  /** Major units (e.g. 4999.00), in the order's currency. Excludes shipping. */
  lineTotal: number;
}

export interface ShopifyOrder {
  id: string;
  /** "#1001" */
  orderNumber: string;
  createdAt: string;
  status: ShopifyOrderStatus;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  /** PAID, PENDING (e.g. cash on delivery), REFUNDED … */
  paymentStatus: string;
  currencyCode: string;
  /** Major units. Grand total incl. shipping — what the customer pays. */
  total: number;
  /** Major units. 0 when shipping was free. */
  shippingTotal: number;
  items: ShopifyOrderItem[];
}
