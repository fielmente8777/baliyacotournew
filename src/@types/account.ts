/** User profile + address types. Mirrors baliye-node models/user.ts. */

export type Gender = 'male' | 'female' | 'other';

/**
 * Shape returned by GET /profile. Every field is optional because an
 * OTP-created account starts with nothing but a phone number, and a
 * Google-created one starts with nothing but an email.
 */
export interface UserProfile {
  _id: string;
  name?: string;
  /** Stored whole, dial code included: "+918580547174". */
  phone?: string;
  email?: string;
  gender?: Gender;
  /** ISO date string from Mongo. */
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profileImage?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

/**
 * Exactly the fields updateProfileSchema accepts on the backend. Email is
 * deliberately absent from what actually gets applied — Shopify's Customer
 * Account API owns login identity, so the backend silently drops it even
 * though it's accepted here for the profile-fetch shape.
 */
export interface UpdateProfileBody {
  name?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type AddressType = 'home' | 'work' | 'other';

export interface Address {
  _id: string;
  fullName: string;
  street: string;
  /** Optional second line — the design shows two lines of street text. */
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  /** Delivery contact, not always the account holder's number. */
  phone?: string;
  type: AddressType;
  isDefault: boolean;
}

/** Body for POST /addresses and PUT /addresses/:id. */
export interface SaveAddressBody {
  fullName: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  phone?: string;
  type?: AddressType;
  isDefault?: boolean;
}

