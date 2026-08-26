'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/features/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

/** Convenience wrapper so components don't reach into the slice directly. */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken, refreshToken, user } = useAppSelector((s) => s.auth);
  const [logoutRequest] = useLogoutMutation();

  const signOut = async () => {
    /* Revoke server-side, but never block the client logout on it. */
    if (refreshToken) {
      try {
        await logoutRequest({ refreshToken }).unwrap();
      } catch {
        /* token may already be revoked or expired */
      }
    }
    dispatch(logOut());
    router.replace('/login');
  };

  return {
    user,
    isAuthenticated: Boolean(accessToken),
    isAdmin: user?.role === 'admin',
    /** Send the user to /login, remembering where they were. */
    openLogin: (redirectTo?: string) =>
      router.push(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'),
    signOut,
  };
}
