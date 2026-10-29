'use client';

/**
 * One store per browser session, created inside a ref so React Strict
 * Mode's double-render doesn't build two stores. A fresh store per
 * request also keeps server-rendered pages from leaking state between
 * users — the reason a module-level `store` singleton is wrong in the
 * App Router.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { makeStore, setupListeners, type AppStore } from './index';
import { hydrate } from './features/authSlice';
import { baseApi } from './api/baseApi';
import { onAdminUpdate } from '@/lib/liveUpdates';
import { useRouter } from 'next/navigation';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  const router = useRouter();

  useEffect(() => setupListeners(store.dispatch), [store]);

  /* An admin saved something in another tab: refetch the catalogue and
     re-render server content, so the change shows without a reload. */
  useEffect(
    () =>
      onAdminUpdate(() => {
        if (window.location.pathname.startsWith('/admin')) return;
        store.dispatch(baseApi.util.invalidateTags(['Design', 'GarmentType', 'Product', 'Settings', 'Tokens']));
        router.refresh();
      }),
    [store, router]
  );

  /* Read the persisted session only in the browser, after the first paint. */
  useEffect(() => {
    store.dispatch(hydrate());
  }, [store]);

  /**
   * GoogleOAuthProvider loads the GIS script once for the whole app. With an
   * empty client id it renders children untouched, so a missing env var
   * degrades to "Gmail button does nothing" rather than a crash.
   */
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
        {children}
      </GoogleOAuthProvider>
    </Provider>
  );
}
