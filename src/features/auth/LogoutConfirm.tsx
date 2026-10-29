'use client';

/**
 * "Log out?" confirmation, the way Myntra and Flipkart ask before signing
 * out: a small centred dialog on desktop, a bottom sheet on phones. Cancel
 * is the focused (safe) default; Escape or tapping outside also cancels.
 *
 * Usage: const { askToLogOut, logoutDialog } = useLogoutConfirm();
 * call askToLogOut() from the "Log out" button and render {logoutDialog}.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

import { useAuth } from './useAuth';

function LogoutDialog({ onCancel, onConfirm, busy }: { onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  /* Latest onCancel without re-running the effect below. */
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

  /* Into <body>, so a transformed ancestor (page fade-ins, the mobile menu)
     can't trap the fixed overlay inside itself. */
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
        aria-labelledby="logout-title"
        aria-describedby="logout-text"
        className="relative w-full animate-slide-up rounded-t-2xl bg-white px-6 pb-6 pt-7 text-center shadow-2xl sm:max-w-sm sm:animate-pop-in sm:rounded-2xl"
      >
        {/* Grab handle — reads as a sheet on phones. */}
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E4DED4] sm:hidden" aria-hidden="true" />

        <span className="mx-auto flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-[#FBF6F7] text-[#A52C45]">
          <LogOut size={24} aria-hidden="true" />
        </span>

        <h2 id="logout-title" className="mt-4 text-lg font-semibold text-[#222]">
          Log out?
        </h2>
        <p id="logout-text" className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">
          Are you sure you want to log out? You&apos;ll need to sign in again to see your orders, bag and wishlist.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-md border border-[#E4DED4] bg-white text-sm font-medium text-dark transition hover:border-[#A52C45] hover:text-[#A52C45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A52C45] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#A52C45] text-sm font-medium text-white transition hover:bg-[#8F243A] active:scale-[0.99] disabled:opacity-80"
          >
            {busy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            )}
            {busy ? 'Logging out…' : 'Yes, log out'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useLogoutConfirm() {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return {
    askToLogOut: () => setOpen(true),
    logoutDialog: open ? <LogoutDialog busy={busy} onCancel={() => setOpen(false)} onConfirm={confirm} /> : null,
  };
}
