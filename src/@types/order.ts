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
  /** Sent by GET /orders/:id only — whether the customer may still cancel. */
  canCancel?: boolean;
  /** Sent by GET /orders/:id only — delivered and inside the 7-day window. */
  canRequestReplacement?: boolean;
  replacementWindowEndsAt?: string | null;
}

/* ---- Replacement / alteration requests (custom-design orders) ---- */

export type ReplacementType = 'alteration' | 'replacement';

export type ReplacementReason =
  | 'fit_issue'
  | 'wrong_item'
  | 'damaged'
  | 'defect'
  | 'not_as_designed'
  | 'other';

export type ReplacementStatus = 'requested' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export interface ReplacementRequest {
  _id: string;
  requestNumber: string;
  orderId: string;
  orderNumber: string;
  itemIndex: number;
  itemName: string;
  type: ReplacementType;
  reason: ReplacementReason;
  description: string;
  photos: string[];
  status: ReplacementStatus;
  adminNote?: string;
  replacementOrderId?: string;
  createdAt: string;
}

export interface CreateReplacementBody {
  itemIndex: number;
  type: ReplacementType;
  reason: ReplacementReason;
  description: string;
  /** Base64 or data: URLs, up to 4. */
  photos?: string[];
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
  /** gid://shopify/LineItem/… — sent back when requesting a return. */
  lineItemId: string;
  /** Shipped and not already in a return. */
  returnableQuantity: number;
  /** One unit after discounts, major units. */
  unitPrice: number;
  /** Shopify product handle — used to list sizes for an exchange. */
  productHandle?: string;
  variantId?: string;
  selectedOptions: { name: string; value: string }[];
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
  /** Nothing has shipped yet — cancelling refunds in full. */
  canCancel: boolean;
  /** Shipped/delivered and inside the return window. */
  canRequestReturn: boolean;
  returnWindowEndsAt?: string;
  /** Shopify return requests on this order: REQUESTED, OPEN, CLOSED, DECLINED … */
  returns: { name: string; status: string }[];
}

export type ShopifyReturnReason =
  | 'SIZE_TOO_SMALL'
  | 'SIZE_TOO_LARGE'
  | 'NOT_AS_DESCRIBED'
  | 'WRONG_ITEM'
  | 'DEFECTIVE'
  | 'STYLE'
  | 'COLOR'
  | 'UNWANTED'
  | 'OTHER';

export interface ShopifyReturnBody {
  resolution: 'replacement' | 'refund';
  reason: ShopifyReturnReason;
  note?: string;
  /** Exchange only, e.g. "Size: M". */
  exchangeFor?: string;
  items: { lineItemId: string; quantity: number }[];
}
