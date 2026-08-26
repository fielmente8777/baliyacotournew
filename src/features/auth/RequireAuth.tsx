'use client';

/**
 * Client-side fallback guard.
 *
 * middleware.ts already redirects signed-out users before the page renders;
 * this catches the case where the session is cleared inside an open tab (a
 * failed refresh calls logOut), where no navigation would otherwise happen.
 */

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, pathname, router]);

  if (!accessToken) {
    return <div className="min-h-[40vh]" aria-hidden />;
  }

  return <>{children}</>;
}
