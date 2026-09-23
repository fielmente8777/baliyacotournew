'use client';

/**
 * The country-dependent parts of an address form: Country, State/Province,
 * and Postal code. Used by both the checkout add-address page and the
 * account Saved Addresses panel, so the two forms can't drift apart.
 *
 * Exported as three separate fields (not one block) so each form keeps its
 * own layout — e.g. State beside City, Postal code on its own row.
 *
 * All labels, dropdown options and validation come from
 * lib/addressCountries.ts; add a country there and it appears here.
 */

import {
  ADDRESS_COUNTRIES,
  getAddressCountry,
  validatePostal,
} from '@/lib/addressCountries';

interface CountrySelectProps {
  value: string;
  /** Called with the new country code. The parent should also clear state
      and postal code — see regionResetFor(). */
  onChange: (countryCode: string) => void;
  className: string;
}

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  return (
    <select
      value={getAddressCountry(value).code}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Country"
      className={`${className} bg-white`}
    >
      {ADDRESS_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

interface StateFieldProps {
  country: string;
  value: string;
  onChange: (state: string) => void;
  className: string;
}

/** A dropdown where the country has a known list, a text box otherwise. */
export function StateField({ country, value, onChange, className }: StateFieldProps) {
  const c = getAddressCountry(country);
  const label = `${c.subdivisionLabel}${c.subdivisionRequired ? '*' : ''}`;

  if (c.subdivisions) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={c.subdivisionLabel}
        className={`${className} bg-white`}
      >
        <option value="">{label}</option>
        {c.subdivisions.map((s) => (
          <option key={s.code} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={c.subdivisionRequired ? label : `${c.subdivisionLabel} (optional)`}
      className={className}
    />
  );
}

interface PostalFieldProps {
  country: string;
  value: string;
  onChange: (postal: string) => void;
  className: string;
}

export function PostalField({ country, value, onChange, className }: PostalFieldProps) {
  const c = getAddressCountry(country);
  /* Numeric keyboard only where postal codes are all digits. */
  const numericOnly = ['IN', 'US', 'AU', 'NZ', 'SG'].includes(c.code);

  return (
    <input
      inputMode={numericOnly ? 'numeric' : 'text'}
      autoCapitalize="characters"
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        if (next.length > 12) return;
        if (c.code === 'IN' && !/^\d{0,6}$/.test(next)) return;
        onChange(next);
      }}
      placeholder={
        c.postalRequired
          ? `${c.postalLabel}*${c.postalPlaceholder ? ` (e.g. ${c.postalPlaceholder})` : ''}`
          : `${c.postalLabel} (optional)`
      }
      className={className}
    />
  );
}

/** Fields to clear when the country changes — an Indian state or PIN is
    meaningless once the country is Canada. */
export const regionResetFor = (country: string) => ({ country, state: '', pincode: '' });

/** Form-level check for the three region fields. Returns a message or null. */
export function validateRegion(country: string, state: string, pincode: string): string | null {
  const c = getAddressCountry(country);
  if (c.subdivisionRequired && !state.trim()) {
    return `Please select a ${c.subdivisionLabel.toLowerCase()}.`;
  }
  return validatePostal(c.code, pincode);
}
