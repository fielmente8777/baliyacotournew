/**
 * Auth state: who is signed in, plus the in-progress login.
 *
 * `dialCode` and `phone` live here rather than in component state because the
 * OTP screen needs the number the phone screen collected, and a refresh
 * between the two steps should not lose it.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthStep, AuthTokens, AuthUser } from '@/@types/auth';
import { clearAuth, loadAuth, saveAuth } from '@/lib/authStorage';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  step: AuthStep;
  /** Dial code + national number, kept between the two login steps. */
  dialCode: string;
  phone: string;
}

const persisted = loadAuth();

const initialState: AuthState = {
  accessToken: persisted.tokens?.accessToken ?? null,
  refreshToken: persisted.tokens?.refreshToken ?? null,
  user: persisted.user ?? null,

  step: 'phone',
  dialCode: '+91',
  phone: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called when the login page mounts, so a stale OTP step never shows. */
    resetLoginFlow(state) {
      state.step = 'phone';
      state.phone = '';
    },

    setStep(state, action: PayloadAction<AuthStep>) {
      state.step = action.payload;
    },

    setDialCode(state, action: PayloadAction<string>) {
      state.dialCode = action.payload;
    },

    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },

    setCredentials(
      state,
      action: PayloadAction<{ tokens: AuthTokens; user: AuthUser | null }>
    ) {
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.user = action.payload.user;
      state.step = 'phone';
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
      state.step = 'phone';
      state.phone = '';
      clearAuth();
    },
  },
});

export const {
  resetLoginFlow,
  setStep,
  setDialCode,
  setPhone,
  setCredentials,
  setUser,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;
