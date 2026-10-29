/**
 * Phone numbers for display. Stored whole with the dial code ("+918820445101");
 * shown as the dial code, a hyphen, then the number grouped the way that
 * country writes it:
 *
 *   +918820445101  → +91-88204 45101
 *   +14165550123   → +1-416 555 0123
 *   +447400123456  → +44-7400 123456
 *
 * libphonenumber-js knows where each country's code ends, so "+918…" is never
 * misread as a "+918" code.
 */

import { isPossiblePhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

import { COUNTRIES } from './countries';

/* Longest dial code first, so "+971" is tried before "+97" or "+9". */
const byDialLengthDesc = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export function formatPhone(value?: string | null): string {
  if (!value) return '';
  const phone = parsePhoneNumberFromString(value);
  if (phone) {
    const code = `+${phone.countryCallingCode}`;
    /* "+91 88204 45101" → "+91-88204 45101" */
    return phone.formatInternational().replace(`${code} `, `${code}-`);
  }

  /* Not a number libphonenumber recognises — split off a known code ourselves. */
  const country = byDialLengthDesc.find((c) => value.startsWith(c.dial) && value.length > c.dial.length);
  return country ? `${country.dial}-${value.slice(country.dial.length)}` : value;
}

/** A plausible length for its country. Lenient on purpose: new number ranges appear all the time. */
export const isPhonePossible = (value: string) => isPossiblePhoneNumber(value);
