/** Cart types. Mirrors baliye-node models/cart.ts as returned by GET /cart. */

export interface CartDesign {
  _id: string;
  name?: string;
  totalPrice: number;
}

export interface CartItem {
  _id: string;
  /** Populated by the API — a bare id if population ever fails. */
  suitDesignId: CartDesign | string;
  quantity: number;
  /** Snapshot of the design price when the item was added, in rupees. */
  unitPrice: number;
  /** Whose measurements this line is tailored to; falls back to the default. */
  measurementProfileId?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export interface AddToCartBody {
  suitDesignId: string;
  quantity?: number;
  measurementProfileId?: string;
}

export interface UpdateCartItemBody {
  quantity?: number;
  measurementProfileId?: string;
}

/** Derived client-side — the API returns items, not a total. */
export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
