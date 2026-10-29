'use client';

import Link from 'next/link';
import { ChevronRight, Coins } from 'lucide-react';

import { useGetWalletQuery } from '@/store/api/tokenApi';
import { useCreditsEnabled } from '@/store/api/settingsApi';
import { LIVE } from '@/lib/liveUpdates';

/** Balance at a glance on the profile, linking to the full Design Credits page. */
export default function TokenSummaryCard() {
  const creditsEnabled = useCreditsEnabled();
  const { data: wallet } = useGetWalletQuery(undefined, { skip: !creditsEnabled, ...LIVE });
  if (!creditsEnabled || !wallet) return null;

  return (
    <Link
      href="/my-account/credits"
      className="mx-5 mt-5 flex items-center gap-4 rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-4 py-3 transition hover:border-[#A52C45] md:mx-6"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A52C45] text-white">
        <Coins className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#222]">
          {wallet.balance} design {wallet.balance === 1 ? 'credit' : 'credits'}
        </span>
        <span className="block text-xs text-[#6B6B6B]">
          {wallet.balance === 0
            ? 'Get credits to see your dress designed by AI'
            : `Enough for ${wallet.previewsLeft} AI ${wallet.previewsLeft === 1 ? 'design' : 'designs'} · see offers`}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-[#6B6B6B]" aria-hidden />
    </Link>
  );
}
