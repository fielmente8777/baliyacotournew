import type { Metadata } from 'next';
import MotifStudioView from '@/features/studio/MotifStudioView';

export const metadata: Metadata = {
  title: 'Embroidery Transfer Studio | Baliye Couture',
  /* Internal tool — keep it out of search results. */
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <MotifStudioView />;
}
