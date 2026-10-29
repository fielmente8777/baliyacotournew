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
 *
 * Helps while typing:
 *   - An empty field starts on the visitor's own country (lib/detectCountry),
 *     so someone in Canada sees 🇨🇦 +1 and someone in India 🇮🇳 +91.
 *   - Typing or pasting "+44…" / "0044…" switches the country to match, with
 *     a suggestion list while the code is still ambiguous ("+9" → India,
 *     Pakistan, Sri Lanka…).
 *   - A hint under the field shows the expected format and digits left.
 */

import { useState } from 'react';

import type { Country } from '@/@types/auth';
import Flag from '@/components/Flag';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { useDetectedCountry } from '@/lib/detectCountry';
import { cn } from '@/lib/format';
import { formatPhone, isPhonePossible } from '@/lib/phone';
import Select from './Select';

interface PhoneFieldProps {
  /** Full value, e.g. "+918820445101", or "" when nothing's entered yet. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** National number length and an example, for the countries most customers use. */
const FORMATS: Record<string, { digits: number; example: string }> = {
  IN: { digits: 10, example: '98765 43210' },
  US: { digits: 10, example: '(212) 555-0123' },
  CA: { digits: 10, example: '(416) 555-0123' },
  GB: { digits: 10, example: '7400 123456' },
  AU: { digits: 9, example: '412 345 678' },
  NZ: { digits: 9, example: '21 123 4567' },
  AE: { digits: 9, example: '50 123 4567' },
  SG: { digits: 8, example: '8123 4567' },
  PK: { digits: 10, example: '301 2345678' },
  BD: { digits: 10, example: '1812 345678' },
  LK: { digits: 9, example: '71 234 5678' },
  NP: { digits: 10, example: '984 1234567' },
  SA: { digits: 9, example: '51 234 5678' },
  QA: { digits: 8, example: '3312 3456' },
  MY: { digits: 9, example: '12 345 6789' },
};

/* Longest dial code first, so "+971" (UAE) is checked before any shorter
   code that happens to be a leading substring of it. */
const byDialLengthDesc = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

function splitPhone(value: string) {
  const match = byDialLengthDesc.find((c) => value.startsWith(c.dial));
  if (match) return { dial: match.dial, national: value.slice(match.dial.length) };
  return { dial: DEFAULT_COUNTRY.dial, national: value.replace(/^\+/, '') };
}

/** "+4479…" or "004479…" typed into the number box → the dial code it starts with. */
function typedDial(text: string) {
  const international = text.replace(/[\s().-]/g, '').replace(/^00/, '+');
  return international.startsWith('+') ? international : null;
}

export default function PhoneField({
  value,
  onChange,
  placeholder = 'Mobile number',
  className,
}: PhoneFieldProps) {
  const detected = useDetectedCountry();
  /* The country picked in the dropdown. Needed because the value is "" until
     a number is typed, and because +1 is both Canada and the US. */
  const [pickedIso, setPickedIso] = useState<string | null>(null);
  const [typing, setTyping] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const fallback =
    COUNTRIES.find((c) => c.iso === pickedIso) ?? COUNTRIES.find((c) => c.iso === detected) ?? DEFAULT_COUNTRY;

  const { dial, national } = value ? splitPhone(value) : { dial: fallback.dial, national: '' };
  /* Of the countries sharing this dial code, prefer the one picked, then the visitor's own. */
  const country: Country =
    [pickedIso, detected]
      .map((iso) => COUNTRIES.find((c) => c.iso === iso && c.dial === dial))
      .find(Boolean) ??
    COUNTRIES.find((c) => c.dial === dial) ??
    DEFAULT_COUNTRY;

  const emit = (nextDial: string, nextNational: string) => {
    onChange(nextNational ? `${nextDial}${nextNational}` : '');
  };

  const pickCountry = (next: Country, nextNational = national) => {
    setPickedIso(next.iso);
    setTyping(null);
    emit(next.dial, nextNational);
  };

  /* While "+…" is being typed: the countries it could still be. */
  const suggestions = typing
    ? COUNTRIES.filter((c) => c.dial.startsWith(typing) || typing.startsWith(c.dial)).slice(0, 6)
    : [];

  const onNumberChange = (text: string) => {
    const intl = typedDial(text);
    if (intl) {
      const digits = intl.slice(1).replace(/\D/g, '');
      const full = `+${digits}`;
      /* A complete code followed by digits — switch country, keep the rest. */
      const match = byDialLengthDesc.find((c) => full.startsWith(c.dial) && full.length > c.dial.length);
      if (match && full.length - match.dial.length >= 3) {
        pickCountry(match, full.slice(match.dial.length).slice(0, 14));
        return;
      }
      setTyping(full);
      return;
    }

    setTyping(null);
    const digits = text.replace(/[\s().-]/g, '');
    /* Generous upper bound — E.164 national significant numbers run up to
       14 digits after the dial code. */
    if (!/^\d{0,14}$/.test(digits)) return;
    emit(dial, digits);
  };

  const format = FORMATS[country.iso];
  const left = format ? format.digits - national.length : 0;
  /* Complete: show it the way it will appear on the account, e.g. "+91-98765 43210". */
  const complete = format ? left === 0 : national.length > 0 && isPhonePossible(value);
  const hint = complete
    ? `Looks right · ${formatPhone(value)}`
    : !format
      ? `${country.name} ${country.dial}`
      : national.length === 0
        ? `${country.name} · e.g. ${format.example}`
        : left > 0
          ? `${left} more ${left === 1 ? 'digit' : 'digits'}`
          : `${country.name} numbers have ${format.digits} digits`;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select
          value={country.iso}
          onChange={(iso) => {
            const next = COUNTRIES.find((c) => c.iso === iso);
            if (next) pickCountry(next);
          }}
          aria-label="Country code"
          options={COUNTRIES.map((c) => ({
            value: c.iso,
            label: `${c.name} ${c.dial}`,
            short: c.dial,
            prefix: <Flag iso={c.iso} />,
          }))}
          searchable
          wrapperClassName="w-28 shrink-0"
          menuClassName="w-72"
          className="h-12 rounded-md border border-[#EAE6DF] bg-white px-2 text-sm outline-none focus:border-[#A52C45]"
        />

        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={typing ?? national}
            onChange={(e) => onNumberChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTyping(null);
            }}
            placeholder={placeholder}
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          {suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Matching countries"
              className="absolute left-0 right-0 top-full z-40 mt-1.5 animate-fade-in overflow-hidden rounded-xl border border-[#EAE6DF] bg-white py-1.5 shadow-[0_12px_32px_rgba(27,43,54,0.14)]"
            >
              {suggestions.map((c) => (
                <li key={c.iso} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickCountry(c, typing!.slice(c.dial.length).replace(/\D/g, ''))}
                    className="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F6EEF0] hover:text-[#A52C45]"
                  >
                    <Flag iso={c.iso} />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-[#6B6B6B]">{c.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(focused || national) && (
        <p
          className={cn(
            'mt-1 pl-30 text-xs',
            format && left < 0 ? 'text-amber-700' : complete ? 'text-green-700' : 'text-[#8A8A8A]'
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
