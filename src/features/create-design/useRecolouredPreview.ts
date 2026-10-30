'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useLazyGetRecolourQuery,
  useLookupRecolourMutation,
  useRecolourPhotoMutation,
  type RecolourBody,
  type RecolourResult,
} from '@/store/api/designApi';

const POLL_MS = 3000;
/** A generation takes 30–90 s; give up showing a spinner after this. */
const GIVE_UP_MS = 4 * 60 * 1000;
/** How long a choice must stay selected before a new design starts (and spends a credit). */
const SETTLE_MS = 1000;

export type RecolourState =
  /** Asking the server whether this colour is already made (free). */
  | 'checking'
  /** Not made yet; tokens are on, so the customer must choose to spend. */
  | 'needs-confirm'
  | 'generating'
  | 'ready'
  | 'failed';

interface Tracked {
  for: string;
  state: RecolourState;
  url?: string;
  /** HTTP status of a refused start: 401 sign in, 402 out of tokens. */
  refusedWith?: number;
}

/**
 * The preview photo showing the chosen options (colour, fabric, embroidery,
 * sleeve…).
 *
 * Asks the backend to edit the real suit photo (AI, cached per photo +
 * choices) and polls until it is ready. Until then — and if it fails — the
 * original photo stays on screen, so the customer is never left with nothing.
 *
 * A design that already exists is shown at once. A new one starts by itself
 * once the customer has stayed on the choice for SETTLE_MS, so clicking
 * quickly through swatches only generates (and, with `credits` on, pays for)
 * the one they stop on. Without credits to spend (`canSpend` false: signed
 * out or balance too low) it waits for the customer instead.
 */
export function useRecolouredPreview(
  imageUrl?: string,
  /** Chosen options that differ from the photo. Empty: show the photo as is. */
  options?: RecolourBody['options'],
  {
    credits,
    canSpend,
  }: {
    /** The admin's credits switch. undefined while it loads — wait for it. */
    credits?: boolean;
    /** Signed in with enough credits. undefined while the balance loads. */
    canSpend?: boolean;
  } = {}
) {
  const [recolour] = useRecolourPhotoMutation();
  const [lookup] = useLookupRecolourMutation();
  const [fetchRecolour] = useLazyGetRecolourQuery();
  /* Tagged with the request it answers, so a late reply for an earlier
     colour is never shown. */
  const [tracked, setTracked] = useState<Tracked | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRequest = useRef<string | null>(null);

  /* A string, so a new array with the same choices is the same request. */
  const request = imageUrl && options?.length ? JSON.stringify([imageUrl, options]) : null;

  /** Shows a result, and keeps polling while it is still generating. */
  const follow = useCallback(
    (forRequest: string, first: RecolourResult, deadline: number) => {
      const step = (result: RecolourResult) => {
        if (activeRequest.current !== forRequest) return;

        if (result.status === 'generating' && Date.now() > deadline) {
          setTracked({ for: forRequest, state: 'failed' });
          return;
        }
        setTracked({ for: forRequest, state: result.status, url: result.url ?? undefined });
        if (result.status !== 'generating') return;

        timer.current = setTimeout(() => {
          fetchRecolour(result.key)
            .unwrap()
            .then(step)
            .catch(() => step(result));
        }, POLL_MS);
      };
      step(first);
    },
    [fetchRecolour]
  );

  const start = useCallback(
    (forRequest: string) => {
      const [imageUrl, options] = JSON.parse(forRequest) as [string, RecolourBody['options']];
      recolour({ imageUrl, options })
        .unwrap()
        .then((result) => follow(forRequest, result, Date.now() + GIVE_UP_MS))
        .catch((error: { status?: number }) => {
          if (activeRequest.current !== forRequest) return;
          const refused = error?.status === 401 || error?.status === 402;
          setTracked({
            for: forRequest,
            state: refused ? 'needs-confirm' : 'failed',
            refusedWith: refused ? error.status : undefined,
          });
        });
    },
    [recolour, follow]
  );

  useEffect(() => {
    activeRequest.current = request;
    clearTimeout(timer.current);
    if (!request || credits === undefined) return;

    if (!credits) {
      timer.current = setTimeout(() => start(request), SETTLE_MS);
    } else {
      /* Wait for the balance before deciding anything. */
      if (canSpend === undefined) return;

      const startOrWait = () => {
        if (activeRequest.current !== request) return;
        if (canSpend) timer.current = setTimeout(() => start(request), SETTLE_MS);
        else setTracked({ for: request, state: 'needs-confirm' });
      };

      const [imageUrl, options] = JSON.parse(request) as [string, RecolourBody['options']];
      lookup({ imageUrl, options })
        .unwrap()
        .then((existing) => {
          if (activeRequest.current !== request) return;
          if (existing && existing.status !== 'failed') follow(request, existing, Date.now() + GIVE_UP_MS);
          else startOrWait();
        })
        .catch(startOrWait);
    }

    return () => clearTimeout(timer.current);
  }, [request, credits, canSpend, start, lookup, follow]);

  const current = tracked?.for === request ? tracked : null;
  const state: RecolourState | null = request ? (current?.state ?? 'checking') : null;

  return {
    state,
    /** The re-dyed photo once ready; undefined otherwise. */
    url: current?.state === 'ready' ? current.url : undefined,
    /* "checking" is already the wait for a generation that will start by
       itself — show progress for it too. */
    isGenerating: state === 'generating' || (state === 'checking' && (!credits || canSpend !== false)),
    /** 401 = sign in first, 402 = not enough tokens. */
    refusedWith: current?.refusedWith,
    /** Starts a generation by hand — the retry after signing in or topping up. */
    generate: () => {
      if (!request) return;
      setTracked({ for: request, state: 'generating' });
      start(request);
    },
  };
}
