/**
 * Countries the address form offers, with everything the form needs to
 * adapt per country: phone dial code, what the "state" and "postal code"
 * fields are called, whether they're required, how to validate the postal
 * code, and — where Shopify expects one — the list of states/provinces.
 *
 * Keep this list in step with the countries enabled under Shopify Admin →
 * Settings → Markets (and with a shipping zone each). Offering a country
 * here that Shopify doesn't ship to means the customer saves an address and
 * then hits "no shipping available" at checkout.
 *
 * `state` is saved as the subdivision NAME ("West Bengal", "Ontario") so the
 * saved-address cards and existing Indian addresses read the same as before;
 * provinceCodeFor() turns it into Shopify's code at checkout time.
 */

export interface Subdivision {
  /** Shopify province code. */
  code: string;
  name: string;
}

export interface AddressCountry {
  /** ISO 3166-1 alpha-2 — what gets saved as address.country. */
  code: string;
  name: string;
  /** Without the "+". */
  dialCode: string;
  /** Label for the state field. */
  subdivisionLabel: string;
  /** When present, the state field is a dropdown of these; otherwise free text. */
  subdivisions?: Subdivision[];
  subdivisionRequired: boolean;
  /** Label for the postal-code field. */
  postalLabel: string;
  /** Some countries (UAE, Qatar) have no postal codes. */
  postalRequired: boolean;
  postalPattern?: RegExp;
  postalPlaceholder?: string;
}

const IN_STATES: Subdivision[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'DN', name: 'Dadra and Nagar Haveli' },
  { code: 'DD', name: 'Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu and Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OR', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
];

const CA_PROVINCES: Subdivision[] = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const US_STATES: Subdivision[] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
  ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
  ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
  ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([code, name]) => ({ code, name }));

const AU_STATES: Subdivision[] = [
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NSW', name: 'New South Wales' },
  { code: 'NT', name: 'Northern Territory' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'WA', name: 'Western Australia' },
];

const AE_EMIRATES: Subdivision[] = [
  { code: 'AZ', name: 'Abu Dhabi' },
  { code: 'AJ', name: 'Ajman' },
  { code: 'DU', name: 'Dubai' },
  { code: 'FU', name: 'Fujairah' },
  { code: 'RK', name: 'Ras al-Khaimah' },
  { code: 'SH', name: 'Sharjah' },
  { code: 'UQ', name: 'Umm al-Quwain' },
];

export const ADDRESS_COUNTRIES: AddressCountry[] = [
  {
    code: 'IN', name: 'India', dialCode: '91',
    subdivisionLabel: 'State', subdivisions: IN_STATES, subdivisionRequired: true,
    postalLabel: 'Pincode', postalRequired: true,
    postalPattern: /^\d{6}$/, postalPlaceholder: '711101',
  },
  {
    code: 'CA', name: 'Canada', dialCode: '1',
    subdivisionLabel: 'Province', subdivisions: CA_PROVINCES, subdivisionRequired: true,
    postalLabel: 'Postal code', postalRequired: true,
    postalPattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, postalPlaceholder: 'M5V 2T6',
  },
  {
    code: 'US', name: 'United States', dialCode: '1',
    subdivisionLabel: 'State', subdivisions: US_STATES, subdivisionRequired: true,
    postalLabel: 'ZIP code', postalRequired: true,
    postalPattern: /^\d{5}(-\d{4})?$/, postalPlaceholder: '10001',
  },
  {
    code: 'GB', name: 'United Kingdom', dialCode: '44',
    subdivisionLabel: 'County', subdivisionRequired: false,
    postalLabel: 'Postcode', postalRequired: true,
    postalPattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/, postalPlaceholder: 'SW1A 1AA',
  },
  {
    code: 'AU', name: 'Australia', dialCode: '61',
    subdivisionLabel: 'State', subdivisions: AU_STATES, subdivisionRequired: true,
    postalLabel: 'Postcode', postalRequired: true,
    postalPattern: /^\d{4}$/, postalPlaceholder: '2000',
  },
  {
    code: 'NZ', name: 'New Zealand', dialCode: '64',
    subdivisionLabel: 'Region', subdivisionRequired: false,
    postalLabel: 'Postcode', postalRequired: true,
    postalPattern: /^\d{4}$/, postalPlaceholder: '1010',
  },
  {
    code: 'AE', name: 'United Arab Emirates', dialCode: '971',
    subdivisionLabel: 'Emirate', subdivisions: AE_EMIRATES, subdivisionRequired: true,
    postalLabel: 'Postal code', postalRequired: false,
  },
  {
    code: 'SG', name: 'Singapore', dialCode: '65',
    subdivisionLabel: 'State', subdivisionRequired: false,
    postalLabel: 'Postal code', postalRequired: true,
    postalPattern: /^\d{6}$/, postalPlaceholder: '018956',
  },
];

export const DEFAULT_COUNTRY_CODE = 'IN';

/** Looks up a country, falling back to India for older addresses with no country. */
export const getAddressCountry = (code?: string): AddressCountry =>
  ADDRESS_COUNTRIES.find((c) => c.code === code?.toUpperCase()) ??
  ADDRESS_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE)!;

/** Postal-code check for the form. Returns an error message, or null if OK. */
export const validatePostal = (countryCode: string, value: string): string | null => {
  const country = getAddressCountry(countryCode);
  const trimmed = value.trim();
  if (!trimmed) return country.postalRequired ? `${country.postalLabel} is required` : null;
  if (country.postalPattern && !country.postalPattern.test(trimmed)) {
    return `Enter a valid ${country.postalLabel.toLowerCase()}`;
  }
  return null;
};

/** Saved state name (or code) → Shopify province code, or undefined if unknown. */
export const provinceCodeFor = (countryCode: string, state: string): string | undefined => {
  const trimmed = state.trim();
  if (!trimmed) return undefined;
  const list = getAddressCountry(countryCode).subdivisions;
  const key = trimmed.toLowerCase();
  const match = list?.find((s) => s.name.toLowerCase() === key || s.code.toLowerCase() === key);
  if (match) return match.code;
  const code = trimmed.toUpperCase().replace(/^[A-Z]{2}-/, '');
  return /^[A-Z0-9]{1,3}$/.test(code) ? code : undefined;
};
