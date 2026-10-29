'use client';

import { useState } from 'react';

import type { AdminCustomer } from '@/@types/admin';
import {
  adminErrorMessage,
  useGetAiCreditQuery,
  useGetAppSettingsQuery,
  useGetCreditStatsQuery,
  useRecordAiCreditMutation,
  useGetTokenLedgerQuery,
  useGrantTokensMutation,
  useUpdateAppSettingsMutation,
  useSearchUsersQuery,
} from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { formatPhone } from '@/lib/phone';
import { Badge, Button, Card, inputClass, NoticeBar, PageTitle, Toggle, type Notice } from './ui';

/** Quick amounts matching the packs on the customer's Design Credits page. */
const QUICK = [10, 30, 100];

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Design tokens: find a customer, add the credits they paid for, see where
 * their credits went. Every change is written to their history.
 */
export default function TokensView() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  const { data: users = [], isFetching, error } = useSearchUsersQuery(query, { skip: query.length < 2 });
  const { data: stats } = useGetCreditStatsQuery();
  /* Latest copy of the picked customer, so the balance updates after a grant. */
  const current = selected
    ? (users.find((u) => u._id === selected._id) ?? stats?.users.find((u) => u._id === selected._id) ?? selected)
    : null;

  return (
    <div className="max-w-5xl">
      <PageTitle
        title="Design credits"
        description="Customers spend credits on AI designs of their dress in Create Your Own Design. Add the credits a customer has paid for here; corrections take a negative amount."
      />

      <AiCreditCard />

      <CreditsSwitch />

      <CreditsOverview selectedId={selected?._id} onSelect={setSelected} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card title="Find a customer">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email or phone"
              className={inputClass}
            />
            <Button type="submit" loading={isFetching}>
              Search
            </Button>
          </form>

          {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Search failed') }} />}

          <ul className="mt-4 flex flex-col divide-y divide-[#eee8de]">
            {users.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => setSelected(user)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-2 py-2.5 text-left text-sm hover:bg-[#f7f3ec]',
                    selected?._id === user._id && 'bg-[#f1ece4]'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-dark">{user.name || 'Unnamed'}</span>
                    <span className="block truncate text-xs text-[#888]">{user.email || formatPhone(user.phone)}</span>
                  </span>
                  <Badge tone={(user.tokenBalance ?? 0) > 0 ? 'ok' : 'off'}>{user.tokenBalance ?? 0} credits</Badge>
                </button>
              </li>
            ))}
            {query.length >= 2 && !isFetching && users.length === 0 && (
              <li className="py-3 text-sm text-[#888]">No customers match “{query}”.</li>
            )}
          </ul>
        </Card>

        {current ? (
          <CustomerTokens key={current._id} customer={current} />
        ) : (
          <Card title="Customer">
            <p className="text-sm text-[#888]">Search and pick a customer to add credits.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * The on/off switch. Off hides every credit screen on the website and makes
 * AI design previews free; the AI keeps working either way.
 */
function CreditsSwitch() {
  const { data: settings, isLoading } = useGetAppSettingsQuery();
  const [update, { isLoading: saving }] = useUpdateAppSettingsMutation();
  const [notice, setNotice] = useState<Notice>(null);
  const on = settings?.creditsEnabled ?? false;

  const flip = async (next: boolean) => {
    try {
      await update({ creditsEnabled: next }).unwrap();
      setNotice({
        tone: 'ok',
        text: next
          ? 'Credits are on — customers now see their balance and each new AI design uses a credit.'
          : 'Credits are off — the credit screens are hidden and AI designs are free.',
      });
    } catch (error) {
      setNotice({ tone: 'error', text: adminErrorMessage(error, 'Could not save the switch') });
    }
  };

  return (
    <Card className="mb-5" title="Credit system" actions={<Badge tone={on ? 'ok' : 'off'}>{on ? 'On' : 'Off'}</Badge>}>
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      {isLoading ? (
        <p className="text-sm text-[#888]">Loading…</p>
      ) : (
        <div className={cn(saving && 'pointer-events-none opacity-60')}>
          <Toggle
            checked={on}
            onChange={flip}
            label="Show design credits on the website"
            description="On: customers see their credits and each new AI design uses one. Off: all credit screens are hidden and AI designs stay free. Balances are kept either way."
          />
        </div>
      )}
    </Card>
  );
}

const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/* Per-design costs are cents — show enough digits to mean something. */
const usdSmall = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
const count = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n.toLocaleString('en-IN'));

const OPENAI_BILLING = 'https://platform.openai.com/settings/organization/billing/overview';

/** One big answer on the AI credit card. */
function CreditFigure({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'warn' }) {
  return (
    <div className="rounded-lg border border-[#eee8de] bg-[#faf7f2] px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#888]">{label}</p>
      <p className={cn('mt-1 text-3xl font-semibold', tone === 'warn' ? 'text-[#9B2335]' : 'text-dark')}>{value}</p>
      <p className="mt-0.5 text-xs text-[#888]">{hint}</p>
    </div>
  );
}

/**
 * The store's own AI credit: what is left of the prepaid OpenAI balance that
 * every AI design draws on, and what it means in design credits the admin
 * can hand out. OpenAI doesn't report the balance through the API, so the
 * admin copies it from OpenAI's billing page; spend since then is subtracted.
 */
function AiCreditCard() {
  const { data: credit, isLoading, error } = useGetAiCreditQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 60_000,
  });
  const [record, { isLoading: saving }] = useRecordAiCreditMutation();
  const [kind, setKind] = useState<'balance' | 'topup'>('balance');
  const [amount, setAmount] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  const parsed = Number(amount.replace(/[$,\s]/g, ''));
  const valid = amount.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && (kind === 'balance' || parsed > 0);
  const balance = credit?.balance;

  const submit = async (as: 'balance' | 'topup' = kind) => {
    try {
      await record({ kind: as, amountUsd: parsed }).unwrap();
      setNotice({ tone: 'ok', text: as === 'balance' ? 'Balance saved.' : `Top-up of ${usd(parsed)} recorded.` });
      setAmount('');
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save') });
    }
  };

  const amountInput = (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888]">$</span>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && valid && submit()}
        inputMode="decimal"
        placeholder="0.00"
        aria-label="Amount in US dollars"
        className={cn(inputClass, 'pl-7')}
      />
    </div>
  );

  return (
    <Card
      className="mb-5"
      title="Your AI credit (OpenAI)"
      actions={
        balance ? (
          <Badge tone={balance.low ? 'warn' : 'ok'}>{balance.low ? 'Low — top up' : 'Healthy'}</Badge>
        ) : (
          <Badge tone="warn">Not set up</Badge>
        )
      }
    >
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      {error ? (
        <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load AI credit') }} />
      ) : isLoading || !credit ? (
        <p className="text-sm text-[#888]">Loading…</p>
      ) : !balance ? (
        /* First time: the three steps to tell us the balance. */
        <div>
          <p className="text-sm text-[#555]">
            Every AI design a customer makes is paid from your OpenAI account. OpenAI doesn&apos;t share that balance
            with the website, so enter it once — after that it counts down by itself.
          </p>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            <li className="rounded-lg border border-[#eee8de] p-4">
              <StepNumber n={1} />
              <p className="mt-2 text-sm font-medium text-dark">Open OpenAI billing</p>
              <a href={OPENAI_BILLING} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-[#9B2C40] underline">
                platform.openai.com → Billing ↗
              </a>
            </li>
            <li className="rounded-lg border border-[#eee8de] p-4">
              <StepNumber n={2} />
              <p className="mt-2 text-sm font-medium text-dark">Copy the &ldquo;Credit balance&rdquo;</p>
              <p className="mt-1 text-xs text-[#888]">The dollar amount at the top of that page, e.g. $18.42.</p>
            </li>
            <li className="rounded-lg border border-[#9B2C40]/30 bg-[#fbf6f7] p-4">
              <StepNumber n={3} />
              <p className="mt-2 text-sm font-medium text-dark">Paste it here</p>
              <div className="mt-2 flex gap-2">
                {amountInput}
                <Button onClick={() => submit('balance')} loading={saving} disabled={!valid}>
                  Save
                </Button>
              </div>
            </li>
          </ol>
          {credit.costPerDesignUsd !== null && (
            <p className="mt-4 text-sm text-[#555]">
              For reference: one AI design costs about <strong>{usdSmall(credit.costPerDesignUsd)}</strong>, so every{' '}
              <strong>$1</strong> of OpenAI credit pays for about <strong>{count(credit.designsPerDollar)} designs</strong>.
              Spent in the last 30 days: <strong>{usd(credit.spentLast30DaysUsd)}</strong>.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <CreditFigure
              label="OpenAI credit left"
              value={usd(balance.leftUsd)}
              hint={balance.daysLeft === null ? 'estimated' : `estimated · lasts about ${balance.daysLeft} days`}
              tone={balance.low ? 'warn' : undefined}
            />
            <CreditFigure
              label="AI designs it can make"
              value={`≈ ${count(balance.designsLeft)}`}
              hint={
                credit.costPerDesignUsd === null
                  ? 'no designs made yet to measure'
                  : `about ${usdSmall(credit.costPerDesignUsd)} each`
              }
            />
            <CreditFigure
              label="Credits you can still give"
              value={count(balance.creditsToGive)}
              hint={`customers already hold ${count(credit.heldByCustomers)} unused`}
              tone={balance.creditsToGive === 0 ? 'warn' : undefined}
            />
          </div>

          <p className="mt-3 text-sm text-[#555]">
            {balance.creditsToGive === null
              ? 'Once a few AI designs have been made, this shows how many credits your balance supports.'
              : balance.creditsToGive === 0
                ? 'Customers already hold as many credits as your OpenAI balance can pay for. Top up on OpenAI before giving out more.'
                : `You can safely give customers up to ${count(balance.creditsToGive)} more design credits (1 AI design = ${credit.creditCost} credit${credit.creditCost === 1 ? '' : 's'}).`}
          </p>
          <p className="mt-1 text-xs text-[#888]">
            {usd(balance.checkedUsd)} on OpenAI at {dateFormat.format(new Date(balance.checkedAt))}
            {balance.toppedUpUsd > 0 && ` + ${usd(balance.toppedUpUsd)} topped up`} − {usd(balance.spentUsd)} spent on{' '}
            {balance.imagesSince} AI images since · this month {usd(credit.spentThisMonthUsd)}.
          </p>

          <div className="mt-5 rounded-lg border border-[#eee8de] p-4">
            <div className="mb-3 inline-flex rounded-md border border-[#eee8de] p-0.5 text-sm">
              {(['balance', 'topup'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn('rounded px-3 py-1.5', kind === k ? 'bg-[#9B2C40] text-white' : 'text-[#555] hover:text-dark')}
                >
                  {k === 'balance' ? 'Correct from OpenAI' : 'I topped up'}
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs text-[#888]">
              {kind === 'balance' ? (
                <>
                  Enter the credit balance shown on{' '}
                  <a href={OPENAI_BILLING} target="_blank" rel="noreferrer" className="underline">
                    OpenAI billing ↗
                  </a>{' '}
                  — the estimate resets to it.
                </>
              ) : (
                'Enter the dollars you just added on OpenAI.'
              )}
            </p>
            <div className="flex max-w-sm gap-2">
              {amountInput}
              <Button onClick={() => submit()} loading={saving} disabled={!valid}>
                {kind === 'balance' ? 'Save' : 'Add'}
              </Button>
            </div>
          </div>

          {credit.history.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-[#eee8de] text-sm">
              {credit.history.slice(0, 5).map((entry) => (
                <li key={entry._id} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-[#555]">
                    {entry.kind === 'balance' ? 'Balance from OpenAI' : 'Top-up'} ·{' '}
                    <span className="text-xs text-[#888]">{dateFormat.format(new Date(entry.createdAt))}</span>
                  </span>
                  <span className={cn('font-semibold', entry.kind === 'topup' ? 'text-emerald-700' : 'text-dark')}>
                    {entry.kind === 'topup' ? '+' : ''}
                    {usd(entry.amountUsd)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B2C40] text-xs font-semibold text-white">
      {n}
    </span>
  );
}

/**
 * Store-wide usage: how many customers there are, how many hold or spend
 * credits, and every customer with credit activity. Pick a row to manage it.
 */
function CreditsOverview({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (customer: AdminCustomer) => void;
}) {
  const { data: stats, isLoading, error } = useGetCreditStatsQuery(undefined, { refetchOnMountOrArgChange: true });

  if (error) {
    return <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load credit usage') }} />;
  }

  const tiles = stats
    ? [
        { label: 'Customers', value: stats.customers, hint: 'registered on the website' },
        { label: 'Using credits', value: stats.customersUsingCredits, hint: 'have made an AI design' },
        { label: 'Holding credits', value: stats.customersWithCredits, hint: 'balance above zero' },
        { label: 'Credits added', value: stats.issued, hint: 'paid + free, all time' },
        { label: 'Credits used', value: stats.used, hint: `${stats.usedThisMonth} this month` },
        { label: 'Unused balance', value: stats.inCirculation, hint: 'across all customers' },
      ]
    : [];

  return (
    <Card className="mb-5" title="Credit usage">
      {isLoading || !stats ? (
        <p className="text-sm text-[#888]">Loading…</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-lg border border-[#eee8de] bg-[#faf7f2] px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-[#888]">{t.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-dark">{t.value.toLocaleString('en-IN')}</dd>
                <dd className="text-xs text-[#888]">{t.hint}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-[#888]">
            Customers with credit activity · {stats.users.length}
          </h3>
          {stats.users.length === 0 ? (
            <p className="text-sm text-[#888]">No customer has received or used credits yet.</p>
          ) : (
            <div className="max-h-105 overflow-auto">
              <table className="w-full min-w-140 text-left text-sm">
                <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-[#888]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 text-right font-medium">Balance</th>
                    <th className="py-2 pr-3 text-right font-medium">Added</th>
                    <th className="py-2 pr-3 text-right font-medium">Used</th>
                    <th className="py-2 pr-3 text-right font-medium">Designs</th>
                    <th className="py-2 font-medium">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8de]">
                  {stats.users.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => onSelect(user)}
                      className={cn('cursor-pointer hover:bg-[#f7f3ec]', selectedId === user._id && 'bg-[#f1ece4]')}
                    >
                      <td className="max-w-55 py-2 pr-3">
                        <span className="block truncate font-medium text-dark">{user.name || 'Unnamed'}</span>
                        <span className="block truncate text-xs text-[#888]">{user.email || formatPhone(user.phone)}</span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <Badge tone={user.tokenBalance > 0 ? 'ok' : 'off'}>{user.tokenBalance}</Badge>
                      </td>
                      <td className="py-2 pr-3 text-right">{user.received}</td>
                      <td className="py-2 pr-3 text-right">{user.used}</td>
                      <td className="py-2 pr-3 text-right">{user.designsGenerated}</td>
                      <td className="py-2 text-xs text-[#888]">{dateFormat.format(new Date(user.lastActivity))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function CustomerTokens({ customer }: { customer: AdminCustomer }) {
  const { data: ledger = [], isLoading } = useGetTokenLedgerQuery(customer._id);
  const [grant, { isLoading: granting }] = useGrantTokensMutation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<'purchase' | 'grant'>('purchase');
  const [notice, setNotice] = useState<Notice>(null);

  const parsed = Number(amount);
  const valid = Number.isInteger(parsed) && parsed !== 0;

  const submit = async () => {
    try {
      const result = await grant({
        userId: customer._id,
        amount: parsed,
        note: note.trim() || undefined,
        reason: parsed > 0 ? reason : 'grant',
      }).unwrap();
      setNotice({ tone: 'ok', text: `Done — balance is now ${result.balance}.` });
      setAmount('');
      setNote('');
    } catch (error) {
      setNotice({ tone: 'error', text: adminErrorMessage(error, 'Could not update credits') });
    }
  };

  return (
    <Card
      title={customer.name || customer.email || customer.phone || 'Customer'}
      actions={<Badge tone="ok">{customer.tokenBalance ?? 0} credits</Badge>}
    >
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {QUICK.map((n) => (
            <Button key={n} variant="outline" onClick={() => setAmount(String(n))}>
              +{n}
            </Button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-[110px_140px_1fr]">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
            placeholder="Amount"
            className={inputClass}
          />
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as 'purchase' | 'grant')}
            className={inputClass}
            disabled={parsed < 0}
          >
            <option value="purchase">Paid pack</option>
            <option value="grant">Free / goodwill</option>
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note the customer sees, e.g. Popular pack — UPI ref 1234"
            className={inputClass}
          />
        </div>
        <div>
          <Button onClick={submit} loading={granting} disabled={!valid}>
            {parsed < 0 ? `Remove ${-parsed} credits` : `Add ${valid ? parsed : ''} credits`}
          </Button>
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-[#888]">History</h3>
      {isLoading ? (
        <p className="text-sm text-[#888]">Loading…</p>
      ) : ledger.length === 0 ? (
        <p className="text-sm text-[#888]">No credit activity yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#eee8de] text-sm">
          {ledger.map((entry) => (
            <li key={entry._id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-dark">{entry.note ?? entry.reason}</span>
                <span className="block text-xs text-[#888]">
                  {entry.reason} · {dateFormat.format(new Date(entry.createdAt))} · balance {entry.balanceAfter}
                </span>
              </span>
              <span className={cn('font-semibold', entry.delta > 0 ? 'text-emerald-700' : 'text-dark')}>
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
