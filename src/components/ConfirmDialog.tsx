'use client';

/**
 * "Delete this address?" — the same dialog as the log-out confirmation
 * (features/auth/LogoutConfirm): a centred card on desktop, a bottom sheet on
 * phones. Cancel is focused first; Escape or tapping outside also cancels.
 *
 * Usage: const { confirm, dialog } = useConfirm();
 *   confirm({ title, text, confirmLabel, onConfirm }) — and render {dialog}.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

interface Request {
  title: string;
  text: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<unknown> | void;
}

function Dialog({ request, busy, onCancel, onConfirm }: { request: Request; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cancelFn = useRef(onCancel);
  useEffect(() => {
    cancelFn.current = onCancel;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancelFn.current();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 animate-fade-in bg-black/45"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full animate-slide-up rounded-t-2xl bg-white px-6 pb-6 pt-7 text-center shadow-2xl sm:max-w-sm sm:animate-pop-in sm:rounded-2xl"
      >
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E4DED4] sm:hidden" aria-hidden="true" />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FBF6F7] text-[#A52C45]">
          <Trash2 size={22} aria-hidden="true" />
        </span>
        <h2 id="confirm-title" className="mt-4 text-lg font-semibold text-[#222]">
          {request.title}
        </h2>
        <div className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">{request.text}</div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-md border border-[#E4DED4] bg-white text-sm font-medium text-dark transition hover:border-[#A52C45] hover:text-[#A52C45] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#A52C45] text-sm font-medium text-white transition hover:bg-[#8F243A] disabled:opacity-80"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useConfirm() {
  const [request, setRequest] = useState<Request | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!request) return;
    setBusy(true);
    try {
      await request.onConfirm();
    } finally {
      setBusy(false);
      setRequest(null);
    }
  };

  return {
    confirm: (next: Request) => setRequest(next),
    dialog: request ? <Dialog request={request} busy={busy} onCancel={() => setRequest(null)} onConfirm={run} /> : null,
  };
}
