'use client';

/**
 * One store per browser session, created inside a ref so React Strict
 * Mode's double-render doesn't build two stores. A fresh store per
 * request also keeps server-rendered pages from leaking state between
 * users — the reason a module-level `store` singleton is wrong in the
 * App Router.
 */

import { useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, setupListeners, type AppStore } from './index';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
