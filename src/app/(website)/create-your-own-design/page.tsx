import { Suspense } from 'react';
import type { Metadata } from 'next';

import CreateDesignEntry from '@/features/create-design/CreateDesignEntry';

export const metadata: Metadata = {
  title: 'Create Your Own Design | Baliye Couture',
  description:
    'Choose your garment, fabric, colour and embroidery — tailored to your measurements.',
};

export default function CreateYourOwnDesignPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#FAF7F2]" />}>
      <CreateDesignEntry />
    </Suspense>
  );
}
