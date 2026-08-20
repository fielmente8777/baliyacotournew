import { redirect } from 'next/navigation';

/** /my-account has no screen of its own — land on Personal Details. */
export default function MyAccountIndexPage() {
  redirect('/my-account/personal-details');
}
