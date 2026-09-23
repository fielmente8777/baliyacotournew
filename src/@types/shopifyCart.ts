/**
 * Types for Shopify's Storefront Cart API — the cart for catalog (Shopify)
 * products. Custom designs from the measurement/embroidery builder are NOT
 * Shopify products and never go through this; they stay on baliye-node's
 * own cart (see @types/cart.ts). useCart.ts merges both into one list for
 * the UI.
 */

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCartLine {
  /** Cart line id — NOT the variant id. Needed for update/remove calls. */
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney };
  merchandise: {
    /** Variant GID — what AddToCartButton sends as variantId. */
    id: string;
    title: string;
    availableForSale: boolean;
    price: ShopifyMoney;
    image: { url: string; altText: string | null } | null;
    product: { title: string; handle: string };
  };
}

export interface ShopifyCart {
  id: string;
  /** Where "Proceed to Buy" will eventually redirect — not wired up yet. */
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: ShopifyCartLine[];
}
