/** Demo profile + addresses, matching the Figma copy. */

import type { Address, UserProfile } from '@/@types/account';

export const mockProfile: UserProfile = {
  _id: 'usr-1',
  name: 'Jyotsana Gaur',
  countryCode: '+91',
  phone: '8580547174',
  email: 'jyotsanagaur909@gmail.com',
  gender: 'female',
  dob: null,
};

export const mockAddresses: Address[] = [
  {
    _id: 'addr-1',
    fullName: 'Abc Abc',
    street: 'Flat No. 102, Orchid Residency, MG Road',
    city: 'Green Park',
    state: 'Delhi',
    pincode: '123456',
    type: 'home',
    isDefault: true,
  },
  {
    _id: 'addr-2',
    fullName: 'Shanu Gaur',
    street: 'Flat No. 102, Orchid Residency, MG Road',
    city: 'Green Park',
    state: 'Delhi',
    pincode: '123456',
    type: 'work',
  },
];

/** Kept here so the address form's State dropdown has real options. */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
