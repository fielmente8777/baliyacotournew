'use client';

/**
 * Design Tokens: balance, usage, offers, limits and history.
 *
 * Credits pay for AI designs of the customer's dress in Create Your Own Design. Buying online
 * is not wired yet — the pack buttons say so, and an admin adds credits from
 * the admin panel once the customer has paid.
 */

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, Coins, Gift, Infinity as InfinityIcon, Palette, RotateCcw, Timer } from 'lucide-react';

import { useGetWalletQuery, type TokenEntry, type TokenWallet } from '@/store/api/tokenApi';
import { useCreditsEnabled } from '@/store/api/settingsApi';
import { cn, formatINR } from '@/lib/format';
import Select from '@/components/inputs/Select';
import TokenExplainer from '@/features/tokens/TokenExplainer';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import { LIVE } from '@/lib/liveUpdates';

const REASON_LABEL: Record<TokenEntry['reason'], string> = {
  grant: 'Added',
  purchase: 'Purchased',
  spend: 'Used',
  refund: 'Refunded',
};

const HISTORY_FILTERS = [
  { value: 'all', label: 'All activity' },
  { value: 'in', label: 'Credits added' },
  { value: 'spend', label: 'Credits used' },
  { value: 'refund', label: 'Refunds' },
];

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const sectionTitle = 'mb-3 text-sm font-semibold text-[#222]';

export default function TokensPanel() {
  const creditsEnabled = useCreditsEnabled();
  const { data: wallet, isLoading, isError } = useGetWalletQuery(undefined, { skip: !creditsEnabled, ...LIVE });

  return (
    <AccountContent>
      <PageHeader
        title="Design Credits"
        action={
          <Link href="/create-your-own-design" className="text-sm font-medium text-[#A52C45] hover:underline">
            Start designing
          </Link>
        }
      />

      <div className="flex flex-col gap-10 p-5 md:p-6">
        {creditsEnabled === false && (
          <p className="text-sm text-[#6B6B6B]">Design credits aren&apos;t available right now.</p>
        )}
        {creditsEnabled && isLoading && <p className="text-sm text-[#6B6B6B]">Loading…</p>}
        {creditsEnabled && isError && <p className="text-sm text-red-700">We could not load your credits. Please try again.</p>}

        {creditsEnabled && wallet && (
          <>
            <Balance wallet={wallet} />

            <section>
              <h3 className={sectionTitle}>How credits work</h3>
              <TokenExplainer cost={wallet.costs.recolour} />
            </section>

            <Offers wallet={wallet} />
            <Limits wallet={wallet} />
            <History history={wallet.history} />
          </>
        )}
      </div>
    </AccountContent>
  );
}

/* ---- Balance and usage ------------------------------------------------ */

function Balance({ wallet }: { wallet: TokenWallet }) {
  const { balance, usage, previewsLeft } = wallet;
  /* Share of everything received that is still left — the meter. */
  const total = Math.max(balance + usage.used, 1);
  const leftPercent = Math.round((balance / total) * 100);
  const low = previewsLeft <= 2;

  const stats = [
    { label: 'Used this month', value: usage.usedThisMonth },
    { label: 'AI designs created', value: usage.previewsGenerated },
    { label: 'Refunded', value: usage.refunded },
    { label: 'Received in total', value: usage.received },
  ];

  return (
    <section className="rounded-2xl border border-[#EAE6DF] bg-[#FAF7F2] p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A52C45] text-white">
            <Coins className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <p className="text-4xl font-semibold leading-none text-[#222]">{balance}</p>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              {balance === 1 ? 'credit' : 'credits'} left · enough for{' '}
              <strong className="text-[#222]">
                {previewsLeft} AI {previewsLeft === 1 ? 'design' : 'designs'}
              </strong>
            </p>
          </div>
        </div>
        <a
          href="#offers"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#A52C45] px-6 text-sm font-medium text-white hover:bg-[#8F243A]"
        >
          {balance === 0 ? 'Get credits' : 'Top up'}
        </a>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#EAE6DF]" role="presentation">
          <div
            className={cn('h-full rounded-full transition-all', low ? 'bg-amber-500' : 'bg-[#A52C45]')}
            style={{ width: `${leftPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-[#6B6B6B]">
          {usage.used} used of {usage.used + balance}
          {low && <span className="ml-2 font-medium text-amber-700">Running low — top up to keep previewing.</span>}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white px-4 py-3">
            <dt className="text-xs text-[#6B6B6B]">{s.label}</dt>
            <dd className="text-lg font-semibold text-[#222]">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Offers ------------------------------------------------------------ */

function Offers({ wallet }: { wallet: TokenWallet }) {
  const cost = wallet.costs.recolour;

  return (
    <section id="offers" className="scroll-mt-24">
      <h3 className={sectionTitle}>Top-up offers</h3>
      <p className="-mt-2 mb-4 text-xs text-[#6B6B6B]">Bigger packs come with bonus credits. Credits never expire.</p>

      <div className="grid gap-4 md:grid-cols-3">
        {wallet.packs.map((pack) => (
          <div
            key={pack.id}
            className={cn(
              'relative flex flex-col gap-4 rounded-2xl border p-5',
              pack.highlight ? 'border-[#A52C45] shadow-[0_8px_24px_rgba(165,44,69,0.12)]' : 'border-[#EAE6DF]'
            )}
          >
            {pack.highlight && (
              <span className="absolute -top-3 left-5 rounded-full bg-[#A52C45] px-3 py-1 text-[11px] font-medium text-white">
                {pack.highlight}
              </span>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#A52C45]">{pack.label}</p>
              <p className="mt-0.5 text-xs text-[#6B6B6B]">{pack.tagline}</p>
            </div>

            <div>
              <p className="text-3xl font-semibold text-[#222]">{formatINR(pack.price / 100)}</p>
              <p className="mt-1 text-sm text-[#222]">
                {pack.tokens} credits
                {pack.bonus > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Gift className="h-3 w-3" aria-hidden />+{pack.bonus} free
                  </span>
                )}
              </p>
            </div>

            <ul className="flex flex-col gap-1.5 text-xs text-[#4A4A4A]">
              <li className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-[#A52C45]" aria-hidden />
                {Math.floor(pack.total / cost)} AI dress designs
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-[#A52C45]" aria-hidden />
                {formatINR(pack.perToken / 100)} per credit
                {pack.savingsPercent > 0 && <strong className="text-green-700">· save {pack.savingsPercent}%</strong>}
              </li>
            </ul>

            {/* Online purchase is the next step; until then the studio adds credits. */}
            <PrimaryButton disabled title="Online purchase coming soon" className="mt-auto w-full">
              Buy — coming soon
            </PrimaryButton>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[#6B6B6B]">
        Need credits now? Contact us and we&apos;ll add them to your account straight away.
      </p>
    </section>
  );
}

/* ---- Limits ------------------------------------------------------------ */

function Limits({ wallet }: { wallet: TokenWallet }) {
  const { limits } = wallet;
  const rows = [
    {
      icon: Coins,
      label: 'Cost of a new AI design',
      value: `${limits.costPerNewPreview} ${limits.costPerNewPreview === 1 ? 'credit' : 'credits'}`,
    },
    { icon: Palette, label: 'Designs already created', value: limits.cachedPreviewsFree ? 'Free' : 'Charged' },
    { icon: RotateCcw, label: 'Design that fails', value: limits.failedPreviewsRefunded ? 'Refunded automatically' : '—' },
    {
      icon: Timer,
      label: 'Designs you can request',
      value: `Up to ${limits.previewsPerWindow} every ${limits.windowMinutes} minutes`,
    },
    { icon: InfinityIcon, label: 'Credit expiry', value: limits.tokensExpire ? 'Expire' : 'Never expire' },
  ];

  return (
    <section>
      <h3 className={sectionTitle}>Limits &amp; rules</h3>
      <dl className="divide-y divide-[#EAE6DF] rounded-xl border border-[#EAE6DF]">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <dt className="flex items-center gap-2.5 text-[#4A4A4A]">
              <Icon className="h-4 w-4 text-[#A52C45]" aria-hidden />
              {label}
            </dt>
            <dd className="text-right font-medium text-[#222]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- History ----------------------------------------------------------- */

function History({ history }: { history: TokenEntry[] }) {
  const [filter, setFilter] = useState('all');

  const shown = history.filter((e) =>
    filter === 'all' ? true : filter === 'in' ? e.reason === 'grant' || e.reason === 'purchase' : e.reason === filter
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-[#222]">History</h3>
        <Select
          value={filter}
          onChange={setFilter}
          options={HISTORY_FILTERS}
          aria-label="Filter history"
          wrapperClassName="w-44"
          className="h-9 rounded-md border border-[#EAE6DF] bg-white px-3 text-sm"
        />
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#EAE6DF] px-4 py-6 text-center text-sm text-[#6B6B6B]">
          {history.length === 0 ? 'No credit activity yet.' : 'Nothing here for this filter.'}
        </p>
      ) : (
        <ul className="scrollbar-brand max-h-[420px] divide-y divide-[#EAE6DF] overflow-y-auto rounded-xl border border-[#EAE6DF]">
          {shown.map((entry) => (
            <li key={entry._id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-[#222]">{entry.note ?? REASON_LABEL[entry.reason]}</p>
                <p className="text-xs text-[#6B6B6B]">
                  {REASON_LABEL[entry.reason]} · {dateFormat.format(new Date(entry.createdAt))}
                </p>
              </div>
              <span className={cn('font-semibold', entry.delta > 0 ? 'text-green-700' : 'text-[#222]')}>
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
