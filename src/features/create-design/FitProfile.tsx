'use client';

/**
 * "Styled for your body" — the entry card above the options, and the sheet
 * where the customer picks a body shape and fit concerns. Choices flow into
 * OptionStep as tips and "Suits you" badges (see fitAdvice.ts).
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Sparkles, X } from 'lucide-react';

import { cn } from '@/lib/format';
import { BODY_SHAPES, FIT_CONCERNS, fitSummary, hasFit, type FitProfile } from './fitAdvice';

/** A simple front silhouette from shoulder, bust, waist and hip widths. */
function Silhouette({ widths, className }: { widths: [number, number, number, number]; className?: string }) {
  const [s, b, w, h] = widths;
  const c = 40;
  const d = [
    `M${c - s / 2} 14`,
    `L${c + s / 2} 14`,
    `Q${c + b / 2 + 2} 22 ${c + b / 2} 32`,
    `Q${c + w / 2 - 1} 46 ${c + w / 2} 54`,
    `Q${c + h / 2 + 2} 66 ${c + h / 2} 78`,
    `L${c + h / 2 - 3} 96`,
    `L${c - h / 2 + 3} 96`,
    `L${c - h / 2} 78`,
    `Q${c - h / 2 - 2} 66 ${c - w / 2} 54`,
    `Q${c - w / 2 + 1} 46 ${c - b / 2} 32`,
    `Q${c - b / 2 - 2} 22 ${c - s / 2} 14`,
    'Z',
  ].join(' ');
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden>
      <circle cx={c} cy="6" r="5" fill="currentColor" opacity="0.35" />
      <path d={d} fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FitSheet({ value, onSave, onClose }: { value: FitProfile; onSave: (fit: FitProfile) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<FitProfile>(value);
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

  const toggleConcern = (id: string) =>
    setDraft((d) => ({
      ...d,
      concerns: d.concerns.includes(id) ? d.concerns.filter((c) => c !== id) : [...d.concerns, id],
    }));

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fit-sheet-title"
        className="relative flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:animate-pop-in sm:rounded-2xl"
      >
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E4DED4] sm:hidden" aria-hidden />

        <div className="flex items-center justify-between border-b border-[#EAE6DF] px-5 pb-3 pt-6 sm:pt-4">
          <div>
            <h2 id="fit-sheet-title" className="text-lg font-semibold text-dark">
              Find what suits you
            </h2>
            <p className="text-xs text-dark/60">We&apos;ll mark the necks, sleeves and cuts that flatter you.</p>
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

        <div className="overflow-y-auto px-5 pb-4 pt-4">
          <h3 className="text-sm font-semibold text-dark">Your body shape</h3>
          <div role="radiogroup" aria-label="Body shape" className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {BODY_SHAPES.map((shape) => {
              const active = draft.shape === shape.id;
              return (
                <button
                  key={shape.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraft((d) => ({ ...d, shape: active ? null : shape.id }))}
                  className={cn(
                    'relative flex flex-col items-center rounded-xl border-2 bg-[#FAF7F2] px-2 pb-3 pt-2 text-center transition-all',
                    active ? 'border-secondary bg-[#FBF6F7]' : 'border-transparent hover:border-secondary/30'
                  )}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 animate-pop-in items-center justify-center rounded-full bg-secondary text-white">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                  )}
                  <Silhouette widths={shape.widths} className={cn('h-20 w-16', active ? 'text-secondary' : 'text-dark/60')} />
                  <span className={cn('mt-1 text-sm font-medium', active ? 'text-secondary' : 'text-dark')}>{shape.label}</span>
                  <span className="mt-0.5 text-[11px] leading-snug text-dark/55">{shape.description}</span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-dark">
            Fit concerns <span className="font-normal text-dark/50">(pick any)</span>
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {FIT_CONCERNS.map((concern) => {
              const active = draft.concerns.includes(concern.id);
              return (
                <button
                  key={concern.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleConcern(concern.id)}
                  title={concern.description}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors',
                    active
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-[#E4DED4] bg-white text-dark hover:border-secondary/40'
                  )}
                >
                  {active && <Check size={14} strokeWidth={3} aria-hidden />}
                  {concern.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EAE6DF] px-5 py-3">
          <button
            type="button"
            onClick={() => setDraft({ shape: null, concerns: [] })}
            className="text-sm text-dark/60 underline-offset-4 hover:text-dark hover:underline"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="h-11 rounded-md bg-secondary px-6 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
          >
            Show my suggestions
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** The card above the options: an invitation, or what the advice is for. */
export default function FitProfileBar({ fit, onChange }: { fit: FitProfile; onChange: (fit: FitProfile) => void }) {
  const [open, setOpen] = useState(false);
  const set = hasFit(fit);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[#EFE8DE] bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-secondary">
            <Sparkles size={17} aria-hidden />
          </span>
          <div className="min-w-0">
            {set ? (
              <>
                <p className="text-[11px] font-medium uppercase tracking-wider text-dark/50">Styled for</p>
                <p className="truncate text-sm font-medium text-dark">{fitSummary(fit)}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-dark">Not sure what suits you?</p>
                <p className="text-xs text-dark/60">Tell us your body shape — we&apos;ll mark what flatters you.</p>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-9 shrink-0 rounded-md border border-secondary px-3.5 text-sm font-medium text-secondary transition-colors hover:bg-[#FBF6F7]"
        >
          {set ? 'Edit' : 'Find my fit'}
        </button>
      </div>

      {open && <FitSheet value={fit} onSave={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}
