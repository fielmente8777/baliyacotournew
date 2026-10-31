import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Eyebrow } from '../../../app/(website)/Home/Components/ui';

interface Props {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}

/** A panel on the overview: small heading, title and a "View all" link, then its content. */
export default function OverviewSection({ eyebrow, title, href, linkLabel, children }: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-[#E8DFD3] bg-white">
      <div className="flex items-end justify-between gap-3 border-b border-[#F1EBE2] px-4 py-4 sm:px-5">
        <div>
          <Eyebrow className="text-[10px] md:text-[11px]">{eyebrow}</Eyebrow>
          <h2 className="mt-1 text-lg font-medium text-dark md:text-xl">{title}</h2>
        </div>
        <Link href={href} className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[13px] font-semibold text-secondary">
          {linkLabel}
          <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      {children}
    </section>
  );
}

/** What a panel shows when it has nothing yet: one line and a link onward. */
export function OverviewEmpty({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center sm:px-5">
      <p className="max-w-xs text-sm text-[#6B6B6B]">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center rounded-full border border-dark px-6 text-sm font-medium text-dark transition-colors hover:bg-dark hover:text-white"
      >
        {label}
      </Link>
    </div>
  );
}
