/**
 * Shopify Storefront Cart API.
 *
 * A Shopify cart is its own resource, separate from the product catalog
 * queries in productApi.ts — created once, then added to / updated /
 * removed from by its id. That id is meaningless without something to
 * remember it between visits, so it's kept in localStorage (guest-cart
 * pattern, same as most Shopify storefronts) rather than requiring
 * sign-in. AddToCartButton currently gates on sign-in before calling any
 * of this anyway, via useCart's existing redirect — that's an app-level
 * choice this file doesn't make.
 */

import type { ShopifyCart } from '@/@types/shopifyCart';
import { shopifyStorefrontFetch } from './shopifyStorefront';

const CART_ID_KEY = 'baliye_shopify_cart_id';

export const getStoredCartId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(CART_ID_KEY);

export const setStoredCartId = (id: string) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(CART_ID_KEY, id);
};

export const clearStoredCartId = () => {
  if (typeof window !== 'undefined') window.localStorage.removeItem(CART_ID_KEY);
};

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            price { amount currencyCode }
            image { url altText }
            product { title handle }
          }
        }
      }
    }
  }
`;

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query CartGet($id: ID!) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`;

interface CartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: ShopifyCart['cost'];
  lines: { edges: { node: Omit<ShopifyCart['lines'][number], never> }[] };
}

const mapCart = (node: CartNode): ShopifyCart => ({
  id: node.id,
  checkoutUrl: node.checkoutUrl,
  totalQuantity: node.totalQuantity,
  cost: node.cost,
  lines: node.lines.edges.map((e) => e.node),
});

interface UserError {
  field: string[] | null;
  message: string;
}

const assertNoUserErrors = (errors: UserError[], op: string) => {
  if (errors.length > 0) {
    throw new Error(`Shopify Cart (${op}): ${errors.map((e) => e.message).join('; ')}`);
  }
};

/** Fetches the stored cart. Returns null if there's no stored id, or the
    cart has expired (Shopify carts expire ~10 days after last activity) —
    callers should treat null as "start a new cart", not an error. */
export async function getCart(): Promise<ShopifyCart | null> {
  const id = getStoredCartId();
  if (!id) return null;

  const data = await shopifyStorefrontFetch<{ cart: CartNode | null }>(CART_QUERY, { id });

  if (!data.cart) {
    clearStoredCartId();
    return null;
  }

  return mapCart(data.cart);
}

/** Creates a cart with a single line, or adds to the existing one — the
    one cart-mutating entry point AddToCartButton needs. */
export async function addLine(variantId: string, quantity: number): Promise<ShopifyCart> {
  const existingId = getStoredCartId();
  const lines = [{ merchandiseId: variantId, quantity }];

  if (!existingId) {
    const data = await shopifyStorefrontFetch<{
      cartCreate: { cart: CartNode | null; userErrors: UserError[] };
    }>(CART_CREATE, { lines });

    assertNoUserErrors(data.cartCreate.userErrors, 'create');
    if (!data.cartCreate.cart) throw new Error('Shopify Cart: cartCreate returned no cart');

    setStoredCartId(data.cartCreate.cart.id);
    return mapCart(data.cartCreate.cart);
  }

  const data = await shopifyStorefrontFetch<{
    cartLinesAdd: { cart: CartNode | null; userErrors: UserError[] };
  }>(CART_LINES_ADD, { cartId: existingId, lines });

  /* A cart can 404 server-side (expired) even though the id is still in
     localStorage — fall back to creating a fresh one rather than failing
     the add. */
  if (!data.cartLinesAdd.cart) {
    clearStoredCartId();
    return addLine(variantId, quantity);
  }

  assertNoUserErrors(data.cartLinesAdd.userErrors, 'add');
  setStoredCartId(data.cartLinesAdd.cart.id);
  return mapCart(data.cartLinesAdd.cart);
}

export async function updateLineQuantity(lineId: string, quantity: number): Promise<ShopifyCart> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error('Shopify Cart: no cart to update');

  const data = await shopifyStorefrontFetch<{
    cartLinesUpdate: { cart: CartNode | null; userErrors: UserError[] };
  }>(CART_LINES_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });

  assertNoUserErrors(data.cartLinesUpdate.userErrors, 'update');
  if (!data.cartLinesUpdate.cart) throw new Error('Shopify Cart: update returned no cart');

  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeLine(lineId: string): Promise<ShopifyCart> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error('Shopify Cart: no cart to remove from');

  const data = await shopifyStorefrontFetch<{
    cartLinesRemove: { cart: CartNode | null; userErrors: UserError[] };
  }>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });

  assertNoUserErrors(data.cartLinesRemove.userErrors, 'remove');
  if (!data.cartLinesRemove.cart) throw new Error('Shopify Cart: remove returned no cart');

  return mapCart(data.cartLinesRemove.cart);
}
