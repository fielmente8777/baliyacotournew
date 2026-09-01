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

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => setupListeners(store.dispatch), [store]);

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
