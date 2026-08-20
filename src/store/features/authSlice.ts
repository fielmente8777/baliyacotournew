/**
 * Minimal auth slice — only what baseApi needs for the Bearer header.
 * Extend with the OTP flow when the real endpoints go in.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = { accessToken: null, refreshToken: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearCredentials: () => initialState,
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
