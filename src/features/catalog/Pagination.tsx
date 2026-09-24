'use client';

/**
 * Page links under the product grid. Uses the `page` query param the product
 * query already understands, so every page is linkable and the back button
 * works. Shows at most five numbers (with … gaps) so it fits a phone.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
}

function pageList(page: number, total: number): (number | 'gap')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete('page');
    else params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const base = 'inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition-colors';
  const idle = 'border-[#E4DED4] bg-white text-[#444] hover:border-secondary hover:text-secondary';
  const disabled = 'pointer-events-none border-[#EEE] bg-white text-[#C8C8C8]';

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
      <Link
        href={hrefFor(page - 1)}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        className={`${base} ${page <= 1 ? disabled : idle}`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-[#999]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${p === page ? 'border-secondary bg-secondary text-white' : idle}`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={hrefFor(page + 1)}
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        className={`${base} ${page >= totalPages ? disabled : idle}`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
