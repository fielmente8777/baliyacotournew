/**
 * Carries the address picked on /shipping over to Shopify's hosted checkout.
 *
 * baliye-node stays the source of truth for saved addresses — this only
 * copies the chosen one onto the Shopify cart (Storefront Cart API,
 * cartDeliveryAddressesReplace) so checkout opens with it prefilled instead
 * of asking the customer to type it again.
 *
 * Multi-country: each saved address carries an ISO 3166-1 alpha-2 `country`
 * ("IN", "CA", "US", "GB" …). Addresses saved before that field existed have
 * none and are treated as India. The same country is also set on the cart's
 * buyer identity, which moves the cart into that country's Shopify Market —
 * so checkout shows that market's currency, prices and shipping rates.
 *
 * Prefill is a convenience, never a gate: if Shopify rejects the address
 * for any reason, we log it and still hand back the checkout URL, where the
 * customer can enter it by hand.
 */

import { shopifyStorefrontFetch } from './shopifyStorefront';
import { getStoredCartId } from './shopifyCart';
import { DEFAULT_COUNTRY_CODE, provinceCodeFor } from './addressCountries';

/** The fields of a saved baliye-node address this file reads. Structural on
    purpose, so it accepts whatever addressApi returns without importing it. */
export interface SavedAddressLike {
  fullName: string;
  street: string;
  landmark?: string;
  city: string;
  /** State / province — a full name ("West Bengal", "Ontario") or a code ("WB", "ON"). */
  state: string;
  /** Postal code in any country's format — PIN, ZIP, postcode. */
  pincode: string;
  phone?: string;
  /** ISO 3166-1 alpha-2. Missing on older addresses → India. */
  country?: string;
}

/**
 * Shopify wants E.164. A number that already starts with "+" is trusted as
 * international. Otherwise only India's local formats are recognised (the
 * old addresses); any other local-format number is dropped rather than sent
 * malformed, since a bad phone fails the whole mutation. The address form
 * should save non-Indian phones with their "+<country code>".
 */
const toE164 = (phone: string | undefined, country: string): string | undefined => {
  if (!phone) return undefined;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : undefined;
  }

  if (country === 'IN') {
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  }

  /* Canada/US share +1 and a 10-digit local format. */
  if (country === 'CA' || country === 'US') {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  }

  return undefined;
};

/** Shopify checkout requires a last name but not a first name, so a
    single-word name goes into lastName. */
const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: undefined, lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

const countryOf = (a: SavedAddressLike) =>
  (a.country?.trim().toUpperCase() || DEFAULT_COUNTRY_CODE).slice(0, 2);

const toDeliveryAddress = (a: SavedAddressLike) => {
  const country = countryOf(a);
  const { firstName, lastName } = splitName(a.fullName);
  return {
    firstName,
    lastName,
    address1: a.street,
    address2: a.landmark || undefined,
    city: a.city,
    provinceCode: provinceCodeFor(country, a.state),
    zip: a.pincode.trim(),
    countryCode: country,
    phone: toE164(a.phone, country),
  };
};

const CART_DELIVERY_ADDRESSES_REPLACE = `
  mutation CartDeliveryAddressesReplace($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {
    cartDeliveryAddressesReplace(cartId: $cartId, addresses: $addresses) {
      cart { id checkoutUrl }
      userErrors { field message code }
      warnings { message code }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = `
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id checkoutUrl }
      userErrors { field message code }
    }
  }
`;

interface MutationResult {
  cart: { id: string; checkoutUrl: string } | null;
  userErrors: { field: string[] | null; message: string; code?: string }[];
}

/**
 * Sets the buyer's country and email on the cart, then puts
 * `address` on it as the selected delivery address — replacing any earlier
 * one, so switching addresses and retrying doesn't pile them up.
 *
 * Buyer identity (email + country) goes first: it's what moves the cart into the right
 * Market, and the delivery address is then validated against that market.
 *
 * Returns the checkout URL to redirect to — the one from the latest mutation
 * when available, else `fallbackCheckoutUrl`. Throws only when there's no
 * cart at all, which means there's nothing to check out.
 */
export async function prepareShopifyCheckout(
  address: SavedAddressLike,
  fallbackCheckoutUrl: string | null,
  options: { email?: string } = {},
): Promise<string> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error('Shopify Cart: no cart to check out');

  const country = countryOf(address);
  if (!options.email) {
    console.warn('Shopify checkout: no email to prefill — the Contact field will be empty.');
  }
  let checkoutUrl = fallbackCheckoutUrl;

  try {
    const data = await shopifyStorefrontFetch<{ cartBuyerIdentityUpdate: MutationResult }>(
      CART_BUYER_IDENTITY_UPDATE,
      {
        cartId,
        /* Email + country only. The phone already travels on the delivery
           address below; putting it here too meant one phone Shopify
           didn't like (e.g. a landline) rejected the WHOLE update — and
           took the email down with it. */
        buyerIdentity: { email: options.email, countryCode: country },
      },
    );

    const result = data.cartBuyerIdentityUpdate;
    if (result.userErrors.length) {
      console.warn('Shopify buyer identity rejected:', result.userErrors);
    }
    checkoutUrl = result.cart?.checkoutUrl ?? checkoutUrl;
  } catch (error) {
    console.warn('Shopify buyer identity update failed:', error);
  }

  try {
    const data = await shopifyStorefrontFetch<{ cartDeliveryAddressesReplace: MutationResult }>(
      CART_DELIVERY_ADDRESSES_REPLACE,
      {
        cartId,
        addresses: [
          {
            selected: true,
            /* baliye-node already stores this address; don't also save a
               copy into the customer's Shopify address book on every order. */
            oneTimeUse: true,
            address: { deliveryAddress: toDeliveryAddress(address) },
          },
        ],
      },
    );

    const result = data.cartDeliveryAddressesReplace;
    if (result.userErrors.length) {
      console.warn('Shopify address prefill rejected:', result.userErrors);
    }
    checkoutUrl = result.cart?.checkoutUrl ?? checkoutUrl;
  } catch (error) {
    console.warn('Shopify address prefill failed:', error);
  }

  if (!checkoutUrl) throw new Error('Shopify Cart: no checkout URL');
  return withSilentSso(checkoutUrl);
}

/**
 * Logs the customer into checkout automatically.
 *
 * Signing in on our site goes through Shopify's Customer Accounts login
 * (api/auth/shopify/start), which leaves a session cookie on Shopify's
 * account domain. `sso=silent` tells checkout to check for that session and,
 * if it's still alive, open as the signed-in customer — no "Sign in" click.
 * If it has expired (or they never signed in), checkout just opens as a
 * guest, exactly as before, with the email and address still prefilled.
 */
const withSilentSso = (checkoutUrl: string): string => {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('sso', 'silent');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
};