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
 * Exactly the fields updateProfileSchema accepts on the backend. `phone` is
 * deliberately absent — it is the login identity and can only change through
 * the OTP flow, so sending it here is silently discarded by zod.
 */
export interface UpdateProfileBody {
  name?: string;
  email?: string;
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
  city: string;
  state: string;
  pincode: string;
  type: AddressType;
  isDefault?: boolean;
}

export type SaveAddressArg = Omit<Address, '_id'> & { _id?: string };
