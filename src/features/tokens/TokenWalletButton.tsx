'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Coins } from 'lucide-react';

import type { TokenWallet } from '@/store/api/tokenApi';
import { cn } from '@/lib/format';
import TokenExplainer from './TokenExplainer';

interface Props {
  wallet?: TokenWallet;
  isSignedIn: boolean;
  onSignIn: () => void;
  className?: string;
}

/**
 * The credit balance while designing, with a "how it works" popover and the
 * last few previews — so the customer always knows what a click will cost.
 */
export default function TokenWalletButton({ wallet, isSignedIn, onSignIn, className }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const cost = wallet?.costs.recolour ?? 1;
  const low = wallet !== undefined && wallet.previewsLeft <= 2;
  const recent = wallet?.history.filter((e) => e.reason === 'spend' || e.reason === 'refund').slice(0, 3) ?? [];

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition',
          low ? 'border-amber-300 text-amber-800' : 'border-[#EAE6DF] text-dark hover:border-[#A52C45]'
        )}
      >
        <Coins className="h-4 w-4 text-[#A52C45]" aria-hidden />
        {!isSignedIn ? 'Design credits' : wallet ? `${wallet.balance} credits` : '…'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(92vw,360px)] animate-fade-in rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-xl">
          {isSignedIn && wallet ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">Your balance</p>
                  <p className="text-3xl font-semibold text-[#222]">{wallet.balance}</p>
                </div>
                <p className="text-right text-xs text-[#6B6B6B]">
                  enough for
                  <span className="block text-base font-semibold text-[#222]">
                    {wallet.previewsLeft} AI {wallet.previewsLeft === 1 ? 'design' : 'designs'}
                  </span>
                </p>
              </div>
              {low && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Running low — top up so you can keep designing.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#4A4A4A]">
              Credits let our AI design your complete dress, so you can see it before you order.
            </p>
          )}

          <h3 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">How credits work</h3>
          <TokenExplainer cost={cost} compact />

          {recent.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">Recent</h3>
              <ul className="flex flex-col gap-1.5 text-xs">
                {recent.map((e) => (
                  <li key={e._id} className="flex justify-between gap-3">
                    <span className="truncate text-[#4A4A4A]">{e.note}</span>
                    <span className={e.delta > 0 ? 'text-green-700' : 'text-[#222]'}>
                      {e.delta > 0 ? `+${e.delta}` : e.delta}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-5 flex gap-2">
            {isSignedIn ? (
              <Link
                href="/my-account/credits"
                className="flex-1 rounded-md bg-[#A52C45] py-2.5 text-center text-sm font-medium text-white hover:bg-[#8F243A]"
              >
                Get more credits
              </Link>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="flex-1 rounded-md bg-[#A52C45] py-2.5 text-sm font-medium text-white hover:bg-[#8F243A]"
              >
                Sign in to use credits
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
