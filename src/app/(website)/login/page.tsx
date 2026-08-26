import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginView from '@/features/auth/LoginView';

export const metadata: Metadata = {
  title: 'Sign in | Baliye Couture',
  description: 'Sign in or join Baliye Couture with your phone number.',
};

/**
 * useSearchParams needs a Suspense boundary, otherwise the whole route opts
 * out of static rendering and the build warns.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#DDEBD6]" />}>
      <LoginView />
    </Suspense>
  );
}
