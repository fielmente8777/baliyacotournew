import Link from 'next/link';
import { ChevronRight, MapPin, Ruler, UserRound, type LucideIcon } from 'lucide-react';

import { Eyebrow } from '../../../app/(website)/Home/Components/ui';

const SHORTCUTS: { href: string; icon: LucideIcon; title: string; text: string }[] = [
  { href: '/my-account/personal-details', icon: UserRound, title: 'Personal details', text: 'Name, phone, email and birthday' },
  { href: '/my-account/saved-measurements', icon: Ruler, title: 'Saved measurements', text: 'Your fit, ready for every order' },
  { href: '/my-account/saved-addresses', icon: MapPin, title: 'Saved addresses', text: 'Where we deliver your pieces' },
];

/** Links to the profile sections, in the product page's assurance-list style. */
export default function ProfileShortcuts() {
  return (
    <section>
      <Eyebrow className="mb-3">Your profile</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {SHORTCUTS.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-md border border-[#E8DFD3] bg-white p-4 transition-colors hover:border-secondary/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-dark">{title}</p>
              <p className="truncate text-xs text-[#6B6B6B]">{text}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#C9BCAB] transition-transform group-hover:translate-x-0.5 group-hover:text-secondary" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
