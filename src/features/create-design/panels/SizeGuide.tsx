'use client';

/**
 * Size chart — standard Indian women's ethnic-wear sizes (body measurements).
 * A centred dialog on desktop, a bottom sheet on phones, same as MeasureGuide.
 *
 * Numbers are body measurements in inches; cm is worked out from them. The
 * admin edits the chart in Admin → Size & fit guide (defaults in
 * lib/styleGuides.ts).
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/lib/format';
import { useStyleGuides } from '@/store/api/designApi';

type Unit = 'in' | 'cm';

const show = (inches: number, unit: Unit) =>
  unit === 'in' ? String(inches) : String(Math.round(inches * 2.54));

export default function SizeGuide({
  onClose,
  highlight,
}: {
  onClose: () => void;
  /** A size label to highlight, e.g. the one already picked ("M"). */
  highlight?: string;
}) {
  const [unit, setUnit] = useState<Unit>('in');
  const { sizeChart, measureTips } = useStyleGuides();
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeFn = useRef(onClose);
  useEffect(() => {
    closeFn.current = onClose;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeFn.current();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const active = highlight?.trim().toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="relative flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:animate-pop-in sm:rounded-2xl"
      >
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E4DED4] sm:hidden" aria-hidden />

        <div className="flex items-center justify-between border-b border-[#EAE6DF] px-5 pb-3 pt-6 sm:pt-4">
          <div>
            <h2 id="size-guide-title" className="text-lg font-semibold text-dark">
              Size guide
            </h2>
            <p className="text-xs text-dark/60">Standard Indian sizes · body measurements</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#F6EEF0] hover:text-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 pt-4">
          <div className="mb-3 flex justify-end">
            <div role="radiogroup" aria-label="Unit" className="inline-flex rounded-full bg-[#F4EFE8] p-1 text-xs font-medium">
              {(['in', 'cm'] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 transition-colors',
                    unit === u ? 'bg-secondary text-white' : 'text-dark/70 hover:text-dark'
                  )}
                >
                  {u === 'in' ? 'Inches' : 'cm'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#F2EEE8]">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-[#FAF7F2] text-left text-[11px] uppercase tracking-wider text-dark/60">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Size</th>
                  {sizeChart.columns.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 text-right font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EEE8]">
                {sizeChart.rows.map((row, r) => {
                  const isActive = active === row.size.trim().toUpperCase();
                  return (
                    <tr key={`${row.size}-${r}`} className={cn(isActive && 'bg-[#FBF6F7]')}>
                      <th scope="row" className={cn('px-4 py-3 text-left font-semibold', isActive ? 'text-secondary' : 'text-dark')}>
                        {row.size}
                      </th>
                      {sizeChart.columns.map((c, i) => (
                        <td key={c} className="px-4 py-3 text-right tabular-nums text-dark/80">
                          {row.values[i] ? show(row.values[i], unit) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-dark/50">
            All measurements in {unit === 'in' ? 'inches' : 'centimetres'}. {sizeChart.note}
          </p>

          {measureTips.length > 0 && <h3 className="mt-6 text-sm font-semibold text-dark">How to measure</h3>}
          {measureTips.length > 0 && <dl className="mt-2 divide-y divide-[#F2EEE8] rounded-xl border border-[#F2EEE8]">
            {measureTips.map((m) => (
              <div key={m.name} className="px-4 py-3">
                <dt className="text-sm font-medium text-dark">{m.name}</dt>
                <dd className="mt-0.5 text-sm text-dark/70">{m.tip}</dd>
              </div>
            ))}
          </dl>}
        </div>
      </div>
    </div>,
    document.body
  );
}
