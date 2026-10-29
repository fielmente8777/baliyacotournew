'use client';

/**
 * Address and city suggestions while typing.
 *
 * Backed by Photon (photon.komoot.io): OpenStreetMap data, free, no API key,
 * and — unlike Nominatim — it permits search-as-you-type. Results are biased
 * towards the chosen country and limited to countries we ship to. Picking a
 * suggestion fills street, city, state, postal code and country in one go.
 *
 * Point NEXT_PUBLIC_ADDRESS_LOOKUP_URL at a self-hosted Photon to keep
 * typed addresses off a third-party server. If the lookup is down, the field
 * is simply a plain text box.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

import { ADDRESS_COUNTRIES, getAddressCountry } from '@/lib/addressCountries';
import { cn } from '@/lib/format';

const LOOKUP_URL = process.env.NEXT_PUBLIC_ADDRESS_LOOKUP_URL ?? 'https://photon.komoot.io/api/';
const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

/** Rough centre of each country we ship to — biases results towards it. */
const CENTRES: Record<string, [number, number]> = {
  IN: [22.5, 79], CA: [56, -96], US: [39.5, -98.5], GB: [54, -2.5],
  AU: [-25, 134], NZ: [-41, 174], AE: [24.3, 54.3], SG: [1.35, 103.82],
};

const SHIPPABLE = new Set(ADDRESS_COUNTRIES.map((c) => c.code));

export interface PlaceSuggestion {
  /** "221B Baker Street" — empty for a city-only result. */
  street: string;
  city: string;
  state: string;
  postcode: string;
  /** ISO alpha-2, upper case. */
  country: string;
  /** One line for the list. */
  label: string;
}

interface PhotonFeature {
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    district?: string;
    locality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    countrycode?: string;
    country?: string;
    osm_key?: string;
    type?: string;
  };
}

function toSuggestion(f: PhotonFeature, mode: 'address' | 'city'): PlaceSuggestion | null {
  const p = f.properties;
  const country = (p.countrycode ?? '').toUpperCase();
  if (!SHIPPABLE.has(country)) return null;

  const isPlace = p.osm_key === 'place';
  const city = isPlace && mode === 'city' ? (p.name ?? '') : (p.city ?? p.town ?? p.village ?? p.county ?? '');
  const road = [p.housenumber, p.street].filter(Boolean).join(' ');
  /* A named building or shop: "Taj Mahal Palace, Apollo Bunder". */
  const street =
    mode === 'city' ? '' : p.name && p.name !== p.street && !isPlace ? [p.name, road].filter(Boolean).join(', ') : road || (p.name ?? '');

  if (mode === 'address' && !street) return null;
  if (mode === 'city' && !city) return null;

  const area = p.district ?? p.locality;
  const label = [street, area, city, p.state, p.postcode, p.country].filter(Boolean).join(', ');
  return { street, city, state: p.state ?? '', postcode: p.postcode ?? '', country, label };
}

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
  /** Bias results towards the form's country. */
  country: string;
  /** "address" fills everything; "city" looks up towns and cities only. */
  mode?: 'address' | 'city';
  placeholder?: string;
  className?: string;
}

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  country,
  mode = 'address',
  placeholder,
  className,
}: Props) {
  const id = useId();
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  /* Typed by the customer (not filled by picking) — only then search. */
  const [query, setQuery] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query === null || query.trim().length < MIN_CHARS) return;

    const timer = setTimeout(() => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;

      const [lat, lon] = CENTRES[getAddressCountry(country).code] ?? CENTRES.IN;
      const params = new URLSearchParams({ q: query, limit: '10', lang: 'en', lat: String(lat), lon: String(lon) });
      if (mode === 'city') {
        for (const tag of ['place:city', 'place:town', 'place:village', 'place:suburb']) params.append('osm_tag', tag);
      }

      setLoading(true);
      fetch(`${LOOKUP_URL}?${params}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { features: [] }))
        .then((data: { features?: PhotonFeature[] }) => {
          const seen = new Set<string>();
          const list = (data.features ?? [])
            .map((f) => toSuggestion(f, mode))
            .filter((s): s is PlaceSuggestion => {
              if (!s || seen.has(s.label)) return false;
              seen.add(s.label);
              return true;
            })
            /* The form's own country first. */
            .sort((a, b) => Number(b.country === country) - Number(a.country === country))
            .slice(0, 6);
          setResults(list);
          setActive(-1);
          setOpen(true);
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, country, mode]);

  const pick = (place: PlaceSuggestion) => {
    setOpen(false);
    setQuery(null);
    onSelect(place);
  };

  const showList = open && query !== null && query.trim().length >= MIN_CHARS;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setQuery(e.target.value);
        }}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!showList || results.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(results.length - 1, i + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(0, i - 1));
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoComplete={mode === 'city' ? 'address-level2' : 'street-address'}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
        className={className}
      />

      {showList && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="scrollbar-brand absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 animate-fade-in overflow-y-auto rounded-xl border border-[#EAE6DF] bg-white py-1.5 shadow-[0_12px_32px_rgba(27,43,54,0.14)]"
        >
          {loading && results.length === 0 && <li className="px-4 py-3 text-sm text-[#9A9A9A]">Searching…</li>}
          {!loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-[#9A9A9A]">No suggestions — keep typing, or enter it yourself.</li>
          )}
          {results.map((place, i) => (
            <li
              key={place.label}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(place)}
              className={cn(
                'mx-1.5 flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2 text-sm',
                i === active ? 'bg-[#F6EEF0] text-[#A52C45]' : 'text-[#222]'
              )}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A52C45]" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-medium">{mode === 'city' ? place.city : place.street}</span>
                <span className="block truncate text-xs text-[#6B6B6B]">
                  {(mode === 'city'
                    ? [place.state, getAddressCountry(place.country).name]
                    : [place.city, place.state, place.postcode, getAddressCountry(place.country).name]
                  )
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </span>
            </li>
          ))}
          <li className="px-4 pb-1 pt-2 text-right text-[10px] text-[#B0B0B0]">© OpenStreetMap</li>
        </ul>
      )}
    </div>
  );
}

/**
 * Turns a picked suggestion into form fields for `country`'s rules: the
 * state is matched to the country's own list (so the State dropdown shows
 * it), and unknown states are left blank rather than saved wrong.
 */
export function placeToAddress(place: PlaceSuggestion) {
  const c = getAddressCountry(place.country);
  const state = c.subdivisions
    ? (c.subdivisions.find((s) => s.name.toLowerCase() === place.state.toLowerCase())?.name ?? '')
    : place.state;
  return { country: c.code, city: place.city, state, pincode: place.postcode };
}
