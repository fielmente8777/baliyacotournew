/**
 * Auth state: who is signed in.
 *
 * There is no in-progress login state any more. Sign-in happens on Shopify's
 * hosted page and returns a token, so there are no intermediate steps for this
 * slice to remember.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens, AuthUser } from '@/@types/auth';
import { clearAuth, loadAuth, saveAuth } from '@/lib/authStorage';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  /**
   * False until the persisted session has been read from localStorage.
   *
   * The store is built during SSR too, where localStorage does not exist. If
   * initialState read it directly, the server would render signed-out and the
   * first client render signed-in — a hydration mismatch. So the slice starts
   * empty everywhere, and ReduxProvider dispatches `hydrate` after mount.
   * Components that branch on auth must wait for this flag.
   */
  isHydrated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,

  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Client-only: replays the persisted session into the store after mount. */
    hydrate(state) {
      const persisted = loadAuth();
      state.accessToken = persisted.tokens?.accessToken ?? null;
      state.refreshToken = persisted.tokens?.refreshToken ?? null;
      state.user = persisted.user ?? null;
      state.isHydrated = true;
    },

    setCredentials(
      state,
      action: PayloadAction<{ tokens: AuthTokens; user: AuthUser | null }>
    ) {
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.user = action.payload.user;
      saveAuth({ tokens: action.payload.tokens, user: action.payload.user });
    },

    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      if (state.accessToken && state.refreshToken) {
        saveAuth({
          tokens: { accessToken: state.accessToken, refreshToken: state.refreshToken },
          user: action.payload,
        });
      }
    },

    /** Also called by the 401 handler in baseApi when a refresh fails. */
    logOut(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isHydrated = true;
      clearAuth();
    },
  },
});

export const {
  hydrate,
  setCredentials,
  setUser,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;
