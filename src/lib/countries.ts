import type { Country } from '@/@types/auth';

/**
 * Dial codes for the country selector. India first because it is the default
 * and the client's primary market; the rest are alphabetical, which is the
 * order the Figma dropdown shows.
 */
export const COUNTRIES: Country[] = [
  { name: 'India', iso: 'IN', dial: '+91' },
  { name: 'Argentina', iso: 'AR', dial: '+54' },
  { name: 'Australia', iso: 'AU', dial: '+61' },
  { name: 'Bangladesh', iso: 'BD', dial: '+880' },
  { name: 'Belgium', iso: 'BE', dial: '+32' },
  { name: 'Brazil', iso: 'BR', dial: '+55' },
  { name: 'Canada', iso: 'CA', dial: '+1' },
  { name: 'China', iso: 'CN', dial: '+86' },
  { name: 'Denmark', iso: 'DK', dial: '+45' },
  { name: 'Estonia', iso: 'EE', dial: '+372' },
  { name: 'France', iso: 'FR', dial: '+33' },
  { name: 'Germany', iso: 'DE', dial: '+49' },
  { name: 'Indonesia', iso: 'ID', dial: '+62' },
  { name: 'Ireland', iso: 'IE', dial: '+353' },
  { name: 'Italy', iso: 'IT', dial: '+39' },
  { name: 'Japan', iso: 'JP', dial: '+81' },
  { name: 'Malaysia', iso: 'MY', dial: '+60' },
  { name: 'Nepal', iso: 'NP', dial: '+977' },
  { name: 'Netherlands', iso: 'NL', dial: '+31' },
  { name: 'New Caledonia', iso: 'NC', dial: '+687' },
  { name: 'New Zealand', iso: 'NZ', dial: '+64' },
  { name: 'Norway', iso: 'NO', dial: '+47' },
  { name: 'Pakistan', iso: 'PK', dial: '+92' },
  { name: 'Philippines', iso: 'PH', dial: '+63' },
  { name: 'Poland', iso: 'PL', dial: '+48' },
  { name: 'Qatar', iso: 'QA', dial: '+974' },
  { name: 'Saudi Arabia', iso: 'SA', dial: '+966' },
  { name: 'Singapore', iso: 'SG', dial: '+65' },
  { name: 'South Africa', iso: 'ZA', dial: '+27' },
  { name: 'Spain', iso: 'ES', dial: '+34' },
  { name: 'Sri Lanka', iso: 'LK', dial: '+94' },
  { name: 'Sweden', iso: 'SE', dial: '+46' },
  { name: 'Switzerland', iso: 'CH', dial: '+41' },
  { name: 'Thailand', iso: 'TH', dial: '+66' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '+971' },
  { name: 'United Kingdom', iso: 'GB', dial: '+44' },
  { name: 'United States', iso: 'US', dial: '+1' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

/**
 * Flag emoji from the ISO code — no image assets, no icon library, and it
 * renders on every modern OS. Falls back to nothing on platforms without
 * regional-indicator support (older Windows), where the dial code still shows.
 */
export const flagEmoji = (iso: string) =>
  iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export const searchCountries = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q)
  );
};
