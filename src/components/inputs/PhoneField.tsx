'use client';

/**
 * Country dial-code dropdown + national number, combined into a single
 * value like "+918820445101" — the shape every phone field in the app
 * (profile, saved addresses, checkout) already sends to the backend.
 *
 * Fully controlled off `value`: splitting the dial code back out of an
 * existing value on every render (rather than only once at mount) is what
 * lets the same field correctly reset when a parent form swaps which
 * address is being edited, or loads a fetched profile, without needing a
 * remount key.
 */

import { COUNTRIES, DEFAULT_COUNTRY, flagEmoji } from '@/lib/countries';

interface PhoneFieldProps {
  /** Full value, e.g. "+918820445101", or "" when nothing's entered yet. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/* Longest dial code first, so "+971" (UAE) is checked before any shorter
   code that happens to be a leading substring of it. */
const byDialLengthDesc = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

function splitPhone(value: string) {
  const match = byDialLengthDesc.find((c) => value.startsWith(c.dial));
  if (match) return { dial: match.dial, national: value.slice(match.dial.length) };
  return { dial: DEFAULT_COUNTRY.dial, national: value.replace(/^\+/, '') };
}

export default function PhoneField({
  value,
  onChange,
  placeholder = 'Mobile number',
  className,
}: PhoneFieldProps) {
  const { dial, national } = splitPhone(value);

  const emit = (nextDial: string, nextNational: string) => {
    onChange(nextNational ? `${nextDial}${nextNational}` : '');
  };

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <select
        value={dial}
        onChange={(e) => {
          emit(e.target.value, national);
        }}
        aria-label="Country code"
        className="h-12 w-[104px] shrink-0 rounded-md border border-[#EAE6DF] bg-white px-2 text-sm outline-none focus:border-[#A52C45]"
      >
        {COUNTRIES.map((country) => (
          <option key={country.iso} value={country.dial}>
            {flagEmoji(country.iso)} {country.dial}
          </option>
        ))}
      </select>

      <input
        inputMode="numeric"
        value={national}
        onChange={(e) => {
          /* Generous upper bound — E.164 national significant numbers run
             up to 14 digits after the dial code. */
          if (!/^\d{0,14}$/.test(e.target.value)) return;
          emit(dial, e.target.value);
        }}
        placeholder={placeholder}
        className="h-12 flex-1 rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
      />
    </div>
  );
}
