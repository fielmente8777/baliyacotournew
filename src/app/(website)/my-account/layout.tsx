import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AccountLayout from './components/AccountLayout';
import RequireAuth from '@/features/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'My Account | Baliye Couture',
};

/**
 * The page title + sidebar shell lives here, so every account route
 * renders inside it automatically and no page re-wraps itself.
 */
export default function MyAccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AccountLayout>{children}</AccountLayout>
    </RequireAuth>
  );
}
