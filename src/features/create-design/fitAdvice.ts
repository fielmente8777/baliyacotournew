'use client';

/**
 * Body-shape and fit styling advice for the design builder.
 *
 * The customer picks a body shape and any fit concerns ("heavy bust",
 * "petite"…) once; every option step then shows the relevant tips and a
 * "Suits you" badge on the options that flatter them.
 *
 * The advice itself is data — lib/styleGuides.ts holds the defaults, and the
 * admin edits it in Admin → Size & fit guide. An option is matched by its
 * `value`, or by its label turned into a slug.
 */

import { useCallback, useSyncExternalStore } from 'react';

import type { DesignGroup, DesignOption } from '@/@types/design';
import { slugify, type FitChoice, type StyleGuides } from '@/lib/styleGuides';

type Guides = Pick<StyleGuides, 'bodyShapes' | 'fitConcerns'>;

/* ---- Profile + matching --------------------------------------------------- */

export interface FitProfile {
  shape: string | null;
  concerns: string[];
}

export const EMPTY_FIT: FitProfile = { shape: null, concerns: [] };

export const hasFit = (fit: FitProfile) => Boolean(fit.shape || fit.concerns.length);

/** "Pear · Heavy bust" */
export function fitSummary(fit: FitProfile, guides: Guides): string {
  const shape = guides.bodyShapes.find((s) => s.id === fit.shape)?.label;
  const concerns = guides.fitConcerns.filter((c) => fit.concerns.includes(c.id)).map((c) => c.label);
  return [shape, ...concerns].filter(Boolean).join(' · ');
}

export interface GroupFitAdvice {
  /** Each tip with the shape or concern it comes from ("Pear", "Heavy bust"). */
  tips: { from: string; text: string }[];
  /** True when the option flatters every chosen shape and concern. */
  suits: (option: DesignOption) => boolean;
  /** True when any chosen shape or concern says to avoid the option. */
  avoids: (option: DesignOption) => boolean;
  /**
   * True when two or more choices recommend options for this step but none
   * of their recommendations overlap — nothing suits all of them.
   */
  conflicting: boolean;
}

/**
 * Advice for one step, for everything the customer picked together.
 *
 * An option suits only when EVERY choice that recommends options for this
 * step recommends it, and NO choice says to avoid it. Pear + Heavy bust on
 * the neck step: Pear likes boat, square, sweetheart, collar, keyhole; Heavy
 * bust likes V, deep V, sweetheart, keyhole, square and avoids boat — so only
 * sweetheart, square and keyhole suit. V-neck (Heavy bust only) and boat neck
 * (avoided) get no badge.
 *
 * A choice with only a tip for this step (no options listed) doesn't narrow
 * the list.
 */
export function adviceFor(fit: FitProfile, groupCode: string, guides: Guides): GroupFitAdvice | null {
  const chosen: FitChoice[] = [
    ...guides.bodyShapes.filter((s) => s.id === fit.shape),
    ...guides.fitConcerns.filter((c) => fit.concerns.includes(c.id)),
  ];
  const entries = chosen.flatMap((c) => (c.advice[groupCode] ? [{ from: c.label, ...c.advice[groupCode] }] : []));
  if (!entries.length) return null;

  /* One set per choice that lists options: the option must be in all of them. */
  const recommenders = entries.filter((e) => e.suits.length).map((e) => new Set(e.suits));
  const avoid = new Set(entries.flatMap((e) => e.avoid));
  const tips = entries.flatMap((e) => (e.tip.trim() ? [{ from: e.from, text: e.tip.trim() }] : []));

  const keysOf = (option: DesignOption) => [slugify(option.value), slugify(option.label)];
  const avoided = (keys: string[]) => keys.some((k) => avoid.has(k));
  const suitsKeys = (keys: string[]) =>
    recommenders.length > 0 && recommenders.every((set) => keys.some((k) => set.has(k))) && !avoided(keys);

  /* Do the recommendations have anything in common (and not avoided)? */
  const common = recommenders.length
    ? [...recommenders[0]].filter((v) => recommenders.every((set) => set.has(v)) && !avoid.has(v))
    : [];

  return {
    tips,
    suits: (option) => suitsKeys(keysOf(option)),
    avoids: (option) => avoided(keysOf(option)),
    conflicting: recommenders.length > 1 && common.length === 0,
  };
}

/**
 * Adds body shapes ticked on an option itself (embroidery, in AI Studio) to
 * the guide's advice for that step, so they count like the admin's Size & fit
 * guide picks. Returns the guides unchanged when no option has any.
 */
export function withOptionShapes(guides: Guides, group: DesignGroup): Guides {
  const ticked = group.options.filter((o) => o.suitsShapes?.length);
  if (!ticked.length) return guides;
  return {
    ...guides,
    bodyShapes: guides.bodyShapes.map((shape) => {
      const values = ticked.filter((o) => o.suitsShapes!.includes(shape.id)).map((o) => slugify(o.value) || slugify(o.label));
      if (!values.length) return shape;
      const current = shape.advice[group.code] ?? { suits: [], avoid: [], tip: '' };
      return {
        ...shape,
        advice: { ...shape.advice, [group.code]: { ...current, suits: [...new Set([...current.suits, ...values])] } },
      };
    }),
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
