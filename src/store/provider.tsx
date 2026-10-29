'use client';

/**
 * One store per browser session, created inside a ref so React Strict
 * Mode's double-render doesn't build two stores. A fresh store per
 * request also keeps server-rendered pages from leaking state between
 * users — the reason a module-level `store` singleton is wrong in the
 * App Router.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { makeStore, setupListeners, type AppStore } from './index';
import { hydrate } from './features/authSlice';
import { baseApi } from './api/baseApi';
import { isCustomerBusy, onAdminUpdate, watchContentVersion } from '@/lib/liveUpdates';
import { useRouter } from 'next/navigation';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  const router = useRouter();

  useEffect(() => setupListeners(store.dispatch), [store]);

  /**
   * An admin saved something: refetch the catalogue and re-render server
   * content, so the change shows without a reload. router.refresh() swaps
   * the content in place — scroll position and anything typed are kept.
   *
   * Never while the customer is busy (cart, address, sign-in, builder, typing,
   * a dialog open): the refresh waits and runs once they're done.
   */
  const pending = useRef(false);
  useEffect(() => {
    const apply = () => {
      if (window.location.pathname.startsWith('/admin')) return;
      if (isCustomerBusy()) {
        pending.current = true;
        return;
      }
      pending.current = false;
      store.dispatch(baseApi.util.invalidateTags(['Design', 'GarmentType', 'Product', 'Settings', 'Tokens']));
      router.refresh();
    };

    /* Same browser: instant. Every other visitor: within ~4 seconds. */
    const stopChannel = onAdminUpdate(apply);
    const stopWatch = watchContentVersion(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1', apply);
    /* A refresh that had to wait goes through as soon as it's safe. */
    const retry = setInterval(() => pending.current && apply(), 2000);

    return () => {
      stopChannel();
      stopWatch();
      clearInterval(retry);
    };
  }, [store, router]);

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
