/** User profile + address types. Mirrors baliye-node models/user.ts. */

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  _id: string;
  name: string;
  /** Dial code kept separate so the flag selector can bind to it. */
  countryCode: string;
  phone: string;
  email: string;
  gender: Gender | null;
  /** ISO date string, or null when the user hasn't added one. */
  dob: string | null;
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
