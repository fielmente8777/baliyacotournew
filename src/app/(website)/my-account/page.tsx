import type { Metadata } from 'next';
import AccountOverview from '@/features/account/AccountOverview';

export const metadata: Metadata = {
  title: 'My Account | Baliye Couture',
  robots: { index: false, follow: false },
};

export default function MyAccountIndexPage() {
  return <AccountOverview />;
}
