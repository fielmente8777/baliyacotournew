import { Suspense } from 'react';
import type { Metadata } from 'next';

import ShopifyHandoff from '@/features/auth/ShopifyHandoff';

export const metadata: Metadata = {
  title: 'Signing you in | Baliye Couture',
  robots: { index: false, follow: false },
};

export default function LoginCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ShopifyHandoff />
    </Suspense>
  );
}