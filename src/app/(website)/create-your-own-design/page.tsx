import type { Metadata } from 'next';
import CreateDesignShell from '@/features/create-design/CreateDesignShell';

export const metadata: Metadata = {
  title: 'Create Your Own Design | Baliye Couture',
  description:
    'Choose your fabric, colour, embroidery and measurements to tailor a piece made only for you.',
};

export default function CreateYourOwnDesignPage() {
  return <CreateDesignShell />;
}
