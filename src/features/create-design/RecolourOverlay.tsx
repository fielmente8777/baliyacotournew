'use client';

import Link from 'next/link';
import { Coins, Sparkles } from 'lucide-react';

import type { useRecolouredPreview } from './useRecolouredPreview';

interface Props {
  recoloured: ReturnType<typeof useRecolouredPreview>;
  /** Design credits on. Off: the preview just generates, free. */
  tokensEnabled: boolean;
  isSignedIn: boolean;
  balance?: number;
  cost: number;
  onSignIn: () => void;
}

const pill = 'rounded-full bg-white/95 px-4 py-2 text-xs shadow';

/**
 * What sits over the dress photo while the AI designs it: progress, a
 * failure note, or — with credits on — the choice to spend on a new design.
 * Customer copy talks about "your design", never the mechanics behind it.
 */
export default function RecolourOverlay({
  recoloured,
  tokensEnabled,
  isSignedIn,
  balance,
  cost,
  onSignIn,
}: Props) {
  const { state, refusedWith } = recoloured;
  if (!state || state === 'ready' || state === 'checking') return null;

  let content: React.ReactNode;

  if (state === 'generating') {
    content = (
      <span className={`flex items-center gap-2 font-medium text-[#1B2B36] ${pill}`}>
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#9B2335] border-t-transparent" />
        Designing your outfit…
      </span>
    );
  } else if (state === 'failed') {
    content = (
      <span className={`text-[#6B6B6B] ${pill}`}>
        Design preview unavailable right now — your outfit will be made as chosen.
        {tokensEnabled && ' No credits were used.'}
      </span>
    );
  } else if (!isSignedIn || refusedWith === 401) {
    content = (
      <button type="button" onClick={onSignIn} className={`font-medium text-[#9B2335] ${pill}`}>
        Sign in to see your design
      </button>
    );
  } else if (refusedWith === 402 || (balance !== undefined && balance < cost)) {
    content = (
      <span className={`flex flex-col items-center gap-1 text-center text-[#1B2B36] ${pill}`}>
        You&apos;re out of design credits.
        <Link href="/my-account/credits" className="font-medium text-[#9B2335] underline">
          Get more credits
        </Link>
      </span>
    );
  } else {
    content = (
      <button
        type="button"
        onClick={recoloured.generate}
        className="flex items-center gap-2 rounded-full bg-[#9B2335] px-5 py-2.5 text-xs font-medium text-white shadow transition hover:bg-[#82202D]"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        See your design · {cost} {cost === 1 ? 'credit' : 'credits'}
      </button>
    );
  }

  return <div className="absolute inset-x-0 bottom-4 flex justify-center px-3">{content}</div>;
}

/** "12 credits left" chip under the preview; links to the wallet page. */
export function TokenBalanceChip({ balance, cost }: { balance?: number; cost: number }) {
  if (balance === undefined) return null;
  return (
    <Link
      href="/my-account/credits"
      className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border border-[#EAE6DF] px-3 py-1 text-xs text-[#4A4A4A] hover:border-[#9B2335] hover:text-[#9B2335]"
    >
      <Coins className="h-3.5 w-3.5" aria-hidden />
      {balance} {balance === 1 ? 'credit' : 'credits'} left · each AI design uses {cost}
    </Link>
  );
}
