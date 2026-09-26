'use client';

/**
 * Dialog used by every order action (cancel, return, exchange, alteration).
 * A bottom sheet on phones, a centred modal from sm up — the pattern Myntra
 * and Flipkart use, so the order page stays in view behind it.
 */

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "Step 2 of 3" — omitted on single-step and success views. */
  step?: { current: number; total: number };
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Sheet({ open, onClose, title, step, children, footer }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  /* Latest onClose without re-running the effect: callers pass an inline
     arrow, and re-running would pull focus out of a field on every keystroke. */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/40" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-2xl bg-white outline-none sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F0EBE3] px-5 py-4">
          <div>
            {step && (
              <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[#A52C45]">
                Step {step.current} of {step.total}
              </p>
            )}
            <h2 id={titleId} className="text-base font-semibold text-[#222]">
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 rounded-full p-1 text-[#6B6B6B] hover:bg-black/5">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {step && (
          <div className="h-0.5 bg-[#F4EFE8]">
            <div className="h-full bg-[#A52C45] transition-all duration-300" style={{ width: `${(step.current / step.total) * 100}%` }} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && <div className="flex gap-3 border-t border-[#F0EBE3] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
