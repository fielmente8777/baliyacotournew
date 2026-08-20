import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AccountLayout from './components/AccountLayout';

export const metadata: Metadata = {
  title: 'My Account | Baliye Couture',
};

/**
 * The page title + sidebar shell lives here, so every account route
 * renders inside it automatically and no page re-wraps itself.
 */
export default function MyAccountLayout({ children }: { children: ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
