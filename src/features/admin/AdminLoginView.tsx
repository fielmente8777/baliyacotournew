'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { adminApi, adminErrorMessage, useAdminLoginMutation } from '@/store/api/adminApi';
import { saveAdminTokens } from '@/lib/adminAuthStorage';
import { useAppDispatch } from '@/store/hooks';
import { Button, NoticeBar, TextField } from './ui';

/** Only ever redirect inside the panel. */
const safeRedirect = (value: string | null) =>
  value && value.startsWith('/admin') && !value.startsWith('/admin/login') ? value : '/admin/design-builder';

/**
 * Email + password sign-in for the admin panel (baliye-node's admin login).
 * Admin accounts are created with `npm run seed:admin` in baliye-node.
 */
export default function AdminLoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useAdminLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const tokens = await login({ email: email.trim(), password }).unwrap();
      /* A previous admin's cached data must not show for this one. */
      dispatch(adminApi.util.resetApiState());
      saveAdminTokens(tokens);
      router.replace(safeRedirect(searchParams.get('redirect')));
    } catch {
      /* Shown from `error` below. */
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3ee] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-[#e6e0d6] bg-white p-7 shadow-sm">
        <h1 className="text-xl font-medium text-dark">
          Baliye <span className="text-secondary">Admin</span>
        </h1>
        <p className="mt-1 text-sm text-[#777]">Sign in to manage the website and the design builder.</p>

        <div className="mt-6 flex flex-col gap-4">
          <TextField label="Email" type="email" value={email} onChange={setEmail} />
          <TextField label="Password" type="password" value={password} onChange={setPassword} />
          {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not sign in') }} />}
          <Button type="submit" loading={isLoading} disabled={!email || !password} className="h-10">
            Sign in
          </Button>
        </div>
      </form>
    </main>
  );
}
