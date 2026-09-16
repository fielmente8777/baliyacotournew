'use client';

/**
 * Receives the session after a Shopify sign-in.
 *
 * The callback route sets two short-lived, readable cookies; this reads them
 * into the auth slice, clears them, and moves on. Cookies are the handoff
 * because the OAuth callback runs on the server and cannot write to
 * localStorage, which is where the rest of the app expects the session.
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setUser } from '@/store/features/authSlice';
import { authApi } from '@/store/api/authApi';

const read = (name: string) =>
  document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

const clear = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

export default function ShopifyHandoff() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const redirectTo = useSearchParams().get('redirect') ?? '/my-account';

  useEffect(() => {
    const accessToken = read('baliye_handoff_access');
    const refreshToken = read('baliye_handoff_refresh');

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=Sign-in%20could%20not%20be%20completed');
      return;
    }

    dispatch(
      setCredentials({
        tokens: {
          accessToken: decodeURIComponent(accessToken),
          refreshToken: decodeURIComponent(refreshToken),
        },
        /* Fetched immediately below — Shopify's token tells us who they are,
           but not their role or saved name. */
        user: null,
      }),
    );

    /* Short-lived anyway, but do not leave a readable token lying around. */
    clear('baliye_handoff_access');
    clear('baliye_handoff_refresh');

    /**
     * Load the profile before navigating.
     *
     * Without it `user` stays null for the session: the navbar still knows
     * they are signed in, but their name never appears and `isAdmin` reads
     * false, which would lock an admin out of the studio.
     */
    dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
      .unwrap()
      .then((profile) => dispatch(setUser(profile)))
      .catch(() => undefined)
      .finally(() => router.replace(redirectTo));
  }, [dispatch, router, redirectTo]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-[#6B6B6B]">Signing you in…</p>
    </main>
  );
}
