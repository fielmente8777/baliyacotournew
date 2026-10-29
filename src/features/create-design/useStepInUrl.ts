'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import type { BuilderStep } from '@/@types/design';
import { useAppDispatch } from '@/store/hooks';
import { setStepIndex } from '@/store/features/createDesignSlice';

/** "fabric", "neck", "measurements", "notes", "review" — readable in the address bar. */
const stepSlug = (step: BuilderStep) => {
  if (step.kind === 'option') {
    return step.group.code || step.group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (step.kind === 'measurement') return 'measurements';
  if (step.kind === 'instructions') return 'notes';
  return 'review';
};

/**
 * Keeps the builder's current step in the URL (?step=fabric), both ways:
 *
 *   - Opening or refreshing a link with ?step= lands on that step, if the
 *     earlier required steps allow it (otherwise the first open one).
 *   - Moving between steps updates the URL, as a new history entry, so the
 *     browser's Back button goes to the previous step.
 *   - Back / Forward change ?step=, and the builder follows.
 *
 * The other query params (?garmentType=, ?product=) are left as they are.
 */
export function useStepInUrl(
  steps: BuilderStep[],
  stepIndex: number,
  isReachable: (index: number) => boolean
) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get('step');
  /* Until the URL's step has been applied once, don't write the URL —
     it would overwrite the deep link with step 1. */
  const synced = useRef(false);
  /* A step the URL asked for that the store hasn't reached yet. Both effects
     run in the same commit, so without this the second would see the old
     step and write it back over the URL. */
  const pending = useRef<number | null>(null);

  /* URL → builder (first load and Back / Forward). */
  useEffect(() => {
    if (!steps.length) return;
    const index = urlSlug ? steps.findIndex((s) => stepSlug(s) === urlSlug) : -1;
    if (index !== -1 && index !== stepIndex && isReachable(index)) {
      pending.current = index;
      dispatch(setStepIndex(index));
    }
    synced.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a URL change should move the builder
  }, [urlSlug, steps.length]);

  /* Builder → URL. */
  useEffect(() => {
    if (!synced.current || !steps.length) return;
    if (pending.current !== null) {
      if (pending.current !== stepIndex) return;
      pending.current = null;
    }
    const slug = stepSlug(steps[Math.min(stepIndex, steps.length - 1)]);
    if (slug === urlSlug) return;

    const params = new URLSearchParams(window.location.search);
    params.set('step', slug);
    const url = `${window.location.pathname}?${params}`;
    /* First write replaces (no extra Back entry for "landed on step 1"). */
    if (urlSlug) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- written when the step changes
  }, [stepIndex, steps.length]);
}
