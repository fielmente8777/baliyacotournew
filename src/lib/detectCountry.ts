/**
 * The visitor's likely country, from the browser alone — no IP lookup, no
 * third party, nothing sent anywhere.
 *
 * 1. Time zone ("America/Toronto" → CA) — set by the device's location
 *    settings, so it matches where the customer actually is.
 * 2. Browser language region ("en-CA" → CA) when the zone is unknown.
 *
 * Only a default: every field it pre-fills stays editable.
 */

import { useSyncExternalStore } from 'react';

const ZONES: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA', 'America/Montreal': 'CA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US',
  'Europe/London': 'GB', 'Europe/Belfast': 'GB',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU', 'Australia/Hobart': 'AU', 'Australia/Darwin': 'AU',
  'Pacific/Auckland': 'NZ', 'Asia/Dubai': 'AE', 'Asia/Singapore': 'SG',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Colombo': 'LK',
  'Asia/Qatar': 'QA', 'Asia/Riyadh': 'SA', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
  'Asia/Bangkok': 'TH', 'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Africa/Johannesburg': 'ZA',
  'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Dublin': 'IE',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Warsaw': 'PL', 'Europe/Tallinn': 'EE',
  'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR', 'Pacific/Noumea': 'NC',
};

let cached: string | null | undefined;

/** ISO 3166-1 alpha-2, or null when nothing points anywhere. Browser only. */
export function detectCountry(): string | null {
  if (cached !== undefined) return cached;
  if (typeof window === 'undefined') return null;

  let found: string | null = null;
  try {
    found = ZONES[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null;
  } catch {
    /* Very old browser — fall through to the language. */
  }

  if (!found) {
    for (const lang of navigator.languages ?? [navigator.language]) {
      const region = lang.split('-')[1];
      if (region && /^[A-Za-z]{2}$/.test(region)) {
        found = region.toUpperCase();
        break;
      }
    }
  }

  cached = found;
  return found;
}

const noSubscribe = () => () => undefined;

/**
 * The detected country in a component. null on the server and the first
 * client render (so the markup matches), then the real value.
 */
export function useDetectedCountry(): string | null {
  return useSyncExternalStore(noSubscribe, detectCountry, () => null);
}
