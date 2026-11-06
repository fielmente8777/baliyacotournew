'use client';

/**
 * Body-shape and fit styling advice for the design builder.
 *
 * The customer picks a body shape and any fit concerns ("heavy bust", "petite"…)
 * once; every option step then shows the relevant tips and a "Suits you" badge
 * on the options that flatter them.
 *
 * Advice is keyed by group code (neck, sleeve, length, lower, fabric…) and
 * option value — the same values the option illustrations use
 * (components/illustrations/optionIllustrations.tsx). An option is matched by
 * its `value`, or by its label turned into a slug. Edit the tables below to
 * change the advice; a new value simply gets no badge until it is listed here.
 */

import { useCallback, useSyncExternalStore } from 'react';

import type { DesignOption } from '@/@types/design';

/** Per group code: values that flatter, values to avoid, and a tip. */
type GroupAdvice = Partial<Record<string, { suits?: string[]; avoid?: string[]; tip?: string }>>;

export interface FitChoice {
  id: string;
  label: string;
  description: string;
  advice: GroupAdvice;
}

/* ---- Body shapes -------------------------------------------------------- */

export const BODY_SHAPES: (FitChoice & {
  /** Relative widths for the little silhouette: shoulder, bust, waist, hip. */
  widths: [number, number, number, number];
})[] = [
  {
    id: 'pear',
    label: 'Pear',
    description: 'Hips wider than shoulders and bust, defined waist.',
    widths: [24, 26, 18, 36],
    advice: {
      neck: {
        suits: ['boat-neck', 'square-neck', 'sweetheart-neck', 'collar-neck', 'keyhole-neck'],
        tip: 'Wide necklines like boat or square balance fuller hips by drawing the eye up.',
      },
      sleeve: {
        suits: ['puff-sleeve', 'bell-sleeve', 'flared-sleeve', 'three-quarter-sleeve'],
        tip: 'A little volume on the sleeves balances your shoulders with your hips.',
      },
      length: {
        suits: ['knee-length', 'calf-length', 'ankle-length'],
        tip: 'An A-line kurta that falls past the hips skims them gracefully.',
      },
      lower: {
        suits: ['palazzo', 'sharara', 'straight-pant', 'salwar'],
        avoid: ['patiala', 'dhoti'],
        tip: 'Straight or flowing bottoms work best; skip extra gathers at the hip.',
      },
      fabric: { suits: ['georgette', 'crepe', 'rayon', 'chiffon'], tip: 'Soft, flowing fabrics fall smoothly over the hips.' },
    },
  },
  {
    id: 'hourglass',
    label: 'Hourglass',
    description: 'Bust and hips balanced, with a clearly defined waist.',
    widths: [30, 32, 18, 32],
    advice: {
      neck: {
        suits: ['sweetheart-neck', 'v-neck', 'deep-v-neck', 'square-neck'],
        tip: 'Sweetheart and V necks follow your natural curves.',
      },
      sleeve: { suits: ['three-quarter-sleeve', 'full-sleeve', 'short-sleeve', 'half-sleeve'], tip: 'Fitted sleeves keep the silhouette clean.' },
      length: { suits: ['knee-length', 'calf-length'], tip: 'A fitted kurta that shows your waist is your best friend.' },
      lower: { suits: ['churidar', 'straight-pant', 'skirt', 'palazzo'], tip: 'Slim bottoms keep the focus on your balanced proportions.' },
      fabric: { suits: ['crepe', 'cotton-silk', 'premium-silk', 'georgette'], tip: 'Fabrics with some structure or drape show off your waist.' },
    },
  },
  {
    id: 'apple',
    label: 'Apple',
    description: 'Fuller midsection, with slimmer legs and arms.',
    widths: [30, 34, 34, 30],
    advice: {
      neck: {
        suits: ['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck'],
        avoid: ['high-neck'],
        tip: 'V-shaped necklines lengthen the torso and draw the eye up.',
      },
      sleeve: {
        suits: ['three-quarter-sleeve', 'full-sleeve', 'flared-sleeve'],
        avoid: ['puff-sleeve'],
        tip: 'Three-quarter sleeves show off slimmer forearms.',
      },
      length: {
        suits: ['calf-length', 'ankle-length', 'floor-length'],
        avoid: ['short'],
        tip: 'Long A-line or Anarkali cuts flow past the midsection.',
      },
      lower: { suits: ['straight-pant', 'churidar', 'palazzo'], avoid: ['patiala', 'dhoti'], tip: 'Slim bottoms show off your legs.' },
      fabric: { suits: ['georgette', 'crepe', 'chiffon', 'rayon'], avoid: ['velvet'], tip: 'Light, flowing fabrics avoid adding bulk at the middle.' },
    },
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    description: 'Shoulders, waist and hips about the same width.',
    widths: [28, 29, 27, 29],
    advice: {
      neck: {
        suits: ['boat-neck', 'square-neck', 'sweetheart-neck', 'round-neck'],
        tip: 'Wide and curved necklines add softness and shape.',
      },
      sleeve: { suits: ['puff-sleeve', 'bell-sleeve', 'flared-sleeve'], tip: 'Statement sleeves add curves to a straight frame.' },
      length: { suits: ['knee-length', 'calf-length'], tip: 'Angrakha, peplum or belted kurtas create a waistline.' },
      lower: {
        suits: ['patiala', 'sharara', 'gharara', 'dhoti', 'salwar'],
        tip: 'Volume below — sharara, patiala, dhoti — adds curves at the hips.',
      },
      fabric: { suits: ['chanderi', 'organza', 'cotton-silk', 'premium-silk'], tip: 'Crisp fabrics hold flares and gathers well.' },
    },
  },
  {
    id: 'inverted-triangle',
    label: 'Inverted triangle',
    description: 'Shoulders or bust wider than hips.',
    widths: [38, 34, 24, 24],
    advice: {
      neck: {
        suits: ['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck', 'round-neck'],
        avoid: ['boat-neck', 'square-neck'],
        tip: 'Deep, narrow necklines break up broad shoulders.',
      },
      sleeve: {
        suits: ['three-quarter-sleeve', 'full-sleeve', 'flared-sleeve', 'bell-sleeve'],
        avoid: ['puff-sleeve'],
        tip: 'Keep sleeves simple at the top; skip puffs.',
      },
      length: { suits: ['calf-length', 'ankle-length', 'floor-length'], tip: 'Flared Anarkalis add volume below the waist.' },
      lower: { suits: ['sharara', 'gharara', 'palazzo', 'patiala'], tip: 'Flared bottoms balance wider shoulders.' },
    },
  },
];

/* ---- Fit concerns --------------------------------------------------------- */

export const FIT_CONCERNS: FitChoice[] = [
  {
    id: 'heavy-bust',
    label: 'Heavy bust',
    description: 'Fuller chest',
    advice: {
      neck: {
        suits: ['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck', 'square-neck'],
        avoid: ['high-neck', 'boat-neck', 'mandarin-neck'],
        tip: 'Heavy bust? V, sweetheart and square necks open up the chest. High and boat necks make it look bigger.',
      },
      sleeve: { suits: ['three-quarter-sleeve', 'full-sleeve'], avoid: ['puff-sleeve'], tip: 'Skip puff sleeves — they add width at bust level.' },
      embroidery: { tip: 'Keep heavy work at the hem and borders rather than the yoke, so the eye goes down.' },
    },
  },
  {
    id: 'broad-shoulders',
    label: 'Broad shoulders',
    description: 'Wider shoulder line',
    advice: {
      neck: {
        suits: ['v-neck', 'deep-v-neck', 'round-neck', 'keyhole-neck'],
        avoid: ['boat-neck', 'square-neck'],
        tip: 'Broad shoulders: V and round necks narrow the shoulder line; boat necks widen it.',
      },
      sleeve: {
        suits: ['three-quarter-sleeve', 'full-sleeve', 'bell-sleeve', 'flared-sleeve'],
        avoid: ['puff-sleeve', 'sleeveless'],
        tip: 'Longer sleeves with flare at the wrist balance the shoulders.',
      },
    },
  },
  {
    id: 'narrow-shoulders',
    label: 'Narrow shoulders',
    description: 'Slim, sloping shoulders',
    advice: {
      neck: { suits: ['boat-neck', 'square-neck', 'collar-neck'], tip: 'Boat and square necks broaden narrow shoulders.' },
      sleeve: { suits: ['puff-sleeve', 'short-sleeve', 'half-sleeve'], tip: 'Puff or cap sleeves add width at the shoulder.' },
    },
  },
  {
    id: 'heavy-hips',
    label: 'Heavy hips / thighs',
    description: 'Fuller lower body',
    advice: {
      length: { suits: ['knee-length', 'calf-length', 'ankle-length'], avoid: ['short'], tip: 'Choose a kurta long enough to cover the hips.' },
      lower: {
        suits: ['palazzo', 'sharara', 'straight-pant'],
        avoid: ['patiala', 'dhoti'],
        tip: 'Heavy hips: palazzo and straight pants fall cleanly; patiala and dhoti add bulk.',
      },
    },
  },
  {
    id: 'tummy',
    label: 'Tummy',
    description: 'Fuller belly area',
    advice: {
      neck: { suits: ['v-neck', 'deep-v-neck'], tip: 'A V neck pulls the eye up and away from the middle.' },
      length: {
        suits: ['calf-length', 'ankle-length', 'floor-length'],
        avoid: ['short'],
        tip: 'A-line and Anarkali cuts flow over the tummy; avoid a cinched waist.',
      },
      fabric: { suits: ['georgette', 'crepe', 'chiffon', 'rayon'], avoid: ['velvet'], tip: 'Flowing fabrics skim rather than cling.' },
    },
  },
  {
    id: 'petite',
    label: 'Petite / short',
    description: 'Under about 5′2″',
    advice: {
      neck: { suits: ['v-neck', 'deep-v-neck'], tip: 'V necks make you look taller.' },
      length: {
        suits: ['short', 'knee-length'],
        avoid: ['floor-length'],
        tip: 'Petite: knee-length kurtas keep proportions; floor-length can swamp you (unless you wear heels).',
      },
      lower: {
        suits: ['churidar', 'straight-pant', 'palazzo'],
        avoid: ['patiala', 'dhoti', 'gharara'],
        tip: 'Slim, full-length bottoms lengthen the legs.',
      },
      fabric: { suits: ['georgette', 'chiffon', 'crepe', 'rayon'], avoid: ['velvet'], tip: 'Light fabrics avoid overwhelming a small frame.' },
    },
  },
  {
    id: 'tall',
    label: 'Tall',
    description: 'Over about 5′7″',
    advice: {
      neck: { suits: ['boat-neck', 'high-neck', 'mandarin-neck', 'collar-neck'], tip: 'High and wide necklines suit a long frame.' },
      length: { suits: ['ankle-length', 'floor-length', 'calf-length'], tip: 'Long kurtas and Anarkalis are made for your height.' },
      lower: { suits: ['patiala', 'sharara', 'gharara', 'palazzo', 'dhoti'], tip: 'You can carry volume — sharara and patiala look great.' },
    },
  },
];

/* ---- Profile + matching --------------------------------------------------- */

export interface FitProfile {
  shape: string | null;
  concerns: string[];
}

export const EMPTY_FIT: FitProfile = { shape: null, concerns: [] };

export const hasFit = (fit: FitProfile) => Boolean(fit.shape || fit.concerns.length);

/** "Pear · Heavy bust" */
export function fitSummary(fit: FitProfile): string {
  const shape = BODY_SHAPES.find((s) => s.id === fit.shape)?.label;
  const concerns = FIT_CONCERNS.filter((c) => fit.concerns.includes(c.id)).map((c) => c.label);
  return [shape, ...concerns].filter(Boolean).join(' · ');
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface GroupFitAdvice {
  tips: string[];
  /** True when the option flatters the customer's shape and concerns. */
  suits: (option: DesignOption) => boolean;
}

/**
 * Advice for one step. An option suits when something recommends it and
 * nothing chosen warns against it — so "Pear" + "Heavy bust" never badges a
 * boat neck, which pear likes but a heavy bust should avoid.
 */
export function adviceFor(fit: FitProfile, groupCode: string): GroupFitAdvice | null {
  const chosen: FitChoice[] = [
    ...BODY_SHAPES.filter((s) => s.id === fit.shape),
    ...FIT_CONCERNS.filter((c) => fit.concerns.includes(c.id)),
  ];
  const entries = chosen.map((c) => c.advice[groupCode]).filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (!entries.length) return null;

  const suits = new Set(entries.flatMap((e) => e.suits ?? []));
  const avoid = new Set(entries.flatMap((e) => e.avoid ?? []));
  const tips = entries.map((e) => e.tip).filter((t): t is string => Boolean(t));

  return {
    tips,
    suits: (option) => {
      const keys = [slug(option.value), slug(option.label)];
      return keys.some((k) => suits.has(k)) && !keys.some((k) => avoid.has(k));
    },
  };
}

/* ---- Remembered per browser ---------------------------------------------- */

const STORAGE_KEY = 'baliye.fitProfile';

const listeners = new Set<() => void>();
/* Cached so the snapshot keeps the same reference between reads. */
let cachedRaw: string | null | undefined;
let cachedFit: FitProfile = EMPTY_FIT;

function readFit(): FitProfile {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* Storage blocked — keep whatever was set during this visit. */
    return cachedFit;
  }
  if (raw === cachedRaw) return cachedFit;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<FitProfile>) : null;
    cachedFit = parsed
      ? {
          shape: typeof parsed.shape === 'string' ? parsed.shape : null,
          concerns: Array.isArray(parsed.concerns) ? parsed.concerns.filter((c) => typeof c === 'string') : [],
        }
      : EMPTY_FIT;
  } catch {
    cachedFit = EMPTY_FIT;
  }
  return cachedFit;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The customer's fit profile, remembered in this browser for next time. */
export function useFitProfile() {
  const fit = useSyncExternalStore(subscribe, readFit, () => EMPTY_FIT);

  const setFit = useCallback((next: FitProfile) => {
    const raw = JSON.stringify(next);
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* Not remembered — keep it for this visit only. */
    }
    cachedRaw = raw;
    cachedFit = next;
    listeners.forEach((l) => l());
  }, []);

  return [fit, setFit] as const;
}
