'use client';

/**
 * "How to measure" — the admin's video (Admin → Measurements), general tips,
 * and the admin's note for each measurement field. A centred dialog on
 * desktop, a bottom sheet on phones. Until a video is added, the tips stand
 * on their own.
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PlayCircle, X } from 'lucide-react';

import type { MeasurementField } from '@/@types/measurement';
import MeasureVideo from '@/components/MeasureVideo';

const TIPS = [
  'Use a soft measuring tape, and ask someone to help if you can.',
  'Wear light, well-fitting clothes — not a jacket or a thick sweater.',
  'Stand straight and relaxed, feet together, arms by your sides.',
  'Keep the tape snug but not tight — you should fit one finger under it.',
  'Measure twice. If you are between two numbers, write the bigger one.',
];

export default function MeasureGuide({
  videoUrl,
  fields,
  onClose,
}: {
  videoUrl: string;
  fields: MeasurementField[];
  onClose: () => void;
}) {
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

  const described = fields.filter((f) => f.description?.trim());

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="measure-guide-title"
        className="relative flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:animate-pop-in sm:rounded-2xl"
      >
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E4DED4] sm:hidden" aria-hidden />

        <div className="flex items-center justify-between border-b border-[#EAE6DF] px-5 pb-3 pt-6 sm:pt-4">
          <h2 id="measure-guide-title" className="text-lg font-semibold text-dark">
            How to measure
          </h2>
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
          {videoUrl ? (
            <div className="overflow-hidden rounded-xl bg-black">
              <MeasureVideo url={videoUrl} autoPlay />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-[#FAF7F2] text-center">
              <PlayCircle size={40} className="text-secondary/60" aria-hidden />
              <p className="mt-2 text-sm font-medium text-dark">Video guide coming soon</p>
              <p className="mt-0.5 text-xs text-dark/60">Meanwhile, these tips will get you accurate numbers.</p>
            </div>
          )}

          <h3 className="mt-6 text-sm font-semibold text-dark">Before you start</h3>
          <ol className="mt-2 space-y-2">
            {TIPS.map((tip, i) => (
              <li key={tip} className="flex gap-3 text-sm text-dark/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-xs font-semibold text-secondary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{tip}</span>
              </li>
            ))}
          </ol>

          {described.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-dark">Each measurement</h3>
              <dl className="mt-2 divide-y divide-[#F2EEE8] rounded-xl border border-[#F2EEE8]">
                {described.map((f) => (
                  <div key={f._id} className="px-4 py-3">
                    <dt className="text-sm font-medium text-dark">
                      {f.name} <span className="text-xs font-normal text-dark/50">({f.unit === 'cm' ? 'cm' : 'inches'})</span>
                    </dt>
                    <dd className="mt-0.5 text-sm text-dark/70">{f.description}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
