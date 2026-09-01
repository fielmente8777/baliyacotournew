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
  suitDesignId: string | { _id: string; name?: string };
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
  createdAt: string;
}

export interface PlaceOrderBody {
  shippingAddressId?: string;
  shippingAddress?: string;
  measurementProfileId?: string;
}
