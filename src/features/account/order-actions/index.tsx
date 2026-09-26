'use client';

/**
 * The action strip under an order — what Myntra shows as "Cancel" /
 * "Return or Exchange" with the deadline beside it — plus the list of
 * requests already made. The backend decides eligibility; nothing here
 * renders unless it said yes.
 */

import { useState } from 'react';
import { ChevronRight, RefreshCcw, XCircle } from 'lucide-react';

import type { Order, ReplacementRequest, ShopifyOrder } from '@/@types/order';
import {
  useCancelOrderMutation,
  useCancelShopifyOrderMutation,
  useGetOrderReplacementsQuery,
} from '@/store/api/orderApi';
import { formatINR } from '@/lib/format';
import { formatMoney, shortDate } from '../../../app/(website)/my-account/orders/orderView';
import AlterationSheet from './AlterationSheet';
import CancelSheet from './CancelSheet';
import ReturnSheet from './ReturnSheet';

function ActionButton({
  icon: Icon,
  label,
  hint,
  onClick,
  tone = 'default',
}: {
  icon: typeof XCircle;
  label: string;
  hint?: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#E9E4DC] bg-white px-4 py-3 text-left transition hover:border-[#CFC6BA] sm:w-auto sm:min-w-[260px]"
    >
      <Icon size={20} className={tone === 'danger' ? 'text-[#9B1C14]' : 'text-[#A52C45]'} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#222]">{label}</span>
        {hint && <span className="block text-xs text-[#6B6B6B]">{hint}</span>}
      </span>
      <ChevronRight size={16} className="text-[#A9A9A9] transition group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

function StatusRow({ title, subtitle, status, tone }: { title: string; subtitle?: string; status: string; tone: 'active' | 'done' | 'bad' }) {
  const pill =
    tone === 'done' ? 'bg-[#E8F1E8] text-[#2F5E31]' : tone === 'bad' ? 'bg-[#FBE9E8] text-[#9B1C14]' : 'bg-[#FBF1E1] text-[#8A5A12]';
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl bg-[#FAF8F4] px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#222]">{title}</span>
        {subtitle && <span className="mt-0.5 block text-[13px] text-[#6B6B6B]">{subtitle}</span>}
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>{status}</span>
    </li>
  );
}

function Strip({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 border-t border-[#E9E4DC] px-4 py-5 sm:px-6">{children}</div>;
}

/* ------------------------------------------------------------- Shopify */

const SHOPIFY_RETURN: Record<string, { label: string; tone: 'active' | 'done' | 'bad' }> = {
  REQUESTED: { label: 'Under review', tone: 'active' },
  OPEN: { label: 'Approved — pickup soon', tone: 'active' },
  CLOSED: { label: 'Completed', tone: 'done' },
  DECLINED: { label: 'Not approved', tone: 'bad' },
  CANCELED: { label: 'Withdrawn', tone: 'bad' },
};

export function ShopifyOrderActions({ order }: { order: ShopifyOrder }) {
  const [sheet, setSheet] = useState<'cancel' | 'return' | null>(null);
  const [cancelOrder] = useCancelShopifyOrderMutation();

  const paid = order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIALLY_PAID';
  const refundText = paid
    ? `${formatMoney(order.total, order.currencyCode)} will be refunded to your original payment method, usually within 5–7 working days.`
    : 'No payment has been taken for this order, so there is nothing to refund.';

  if (!order.canCancel && !order.canRequestReturn && order.returns.length === 0) return null;

  return (
    <Strip>
      {order.returns.length > 0 && (
        <ul className="space-y-2">
          {order.returns.map((r) => {
            const s = SHOPIFY_RETURN[r.status] ?? { label: r.status, tone: 'active' as const };
            return <StatusRow key={r.name} title={`Return / exchange ${r.name}`} status={s.label} tone={s.tone} />;
          })}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {order.canCancel && (
          <ActionButton icon={XCircle} tone="danger" label="Cancel order" hint="Available until it ships" onClick={() => setSheet('cancel')} />
        )}
        {order.canRequestReturn && (
          <ActionButton
            icon={RefreshCcw}
            label="Return or exchange"
            hint={order.returnWindowEndsAt ? `Window closes on ${shortDate(order.returnWindowEndsAt)}` : undefined}
            onClick={() => setSheet('return')}
          />
        )}
      </div>

      <CancelSheet
        open={sheet === 'cancel'}
        onClose={() => setSheet(null)}
        orderNumber={order.orderNumber}
        refundText={refundText}
        onConfirm={(reason) => cancelOrder({ orderId: order.id, reason }).unwrap()}
      />
      {order.canRequestReturn && <ReturnSheet order={order} open={sheet === 'return'} onClose={() => setSheet(null)} />}
    </Strip>
  );
}

/* ------------------------------------------------------ custom designs */

const REQUEST_STATUS: Record<ReplacementRequest['status'], { label: string; tone: 'active' | 'done' | 'bad' }> = {
  requested: { label: 'Under review', tone: 'active' },
  approved: { label: 'Approved', tone: 'active' },
  in_progress: { label: 'In the workshop', tone: 'active' },
  completed: { label: 'Completed', tone: 'done' },
  rejected: { label: 'Not approved', tone: 'bad' },
};

export function CustomOrderActions({ order }: { order: Order }) {
  const [sheet, setSheet] = useState<'cancel' | 'alter' | null>(null);
  const [cancelOrder] = useCancelOrderMutation();
  const { data: requests = [] } = useGetOrderReplacementsQuery(order._id);

  /* The backend decides; the fallback covers an older API without canCancel. */
  const canCancel = order.canCancel ?? (order.status === 'pending' || order.status === 'confirmed');
  const canAlter = Boolean(order.canRequestReplacement);

  if (!canCancel && !canAlter && requests.length === 0) return null;

  return (
    <Strip>
      {requests.length > 0 && (
        <ul className="space-y-2">
          {requests.map((r) => {
            const s = REQUEST_STATUS[r.status];
            return (
              <StatusRow
                key={r._id}
                title={`${r.type === 'alteration' ? 'Alteration' : 'Remake'} · ${r.itemName}`}
                subtitle={r.adminNote}
                status={s.label}
                tone={s.tone}
              />
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {canCancel && (
          <ActionButton icon={XCircle} tone="danger" label="Cancel order" hint="Available until cutting starts" onClick={() => setSheet('cancel')} />
        )}
        {canAlter && (
          <ActionButton
            icon={RefreshCcw}
            label="Request alteration or remake"
            hint={order.replacementWindowEndsAt ? `Available until ${shortDate(order.replacementWindowEndsAt)}` : undefined}
            onClick={() => setSheet('alter')}
          />
        )}
      </div>

      <CancelSheet
        open={sheet === 'cancel'}
        onClose={() => setSheet(null)}
        orderNumber={order.orderNumber}
        refundText={`Any amount you've paid (${formatINR(order.totalAmount / 100)}) will be refunded to your original payment method within 5–7 working days.`}
        policyText="Made-to-measure pieces can be cancelled only until your fabric is cut."
        onConfirm={(reason) => cancelOrder({ id: order._id, reason }).unwrap()}
      />
      {canAlter && (
        <AlterationSheet
          open={sheet === 'alter'}
          onClose={() => setSheet(null)}
          orderId={order._id}
          items={order.items.map((item) => ({ name: item.itemSnapshot?.name ?? 'Custom Design' }))}
        />
      )}
    </Strip>
  );
}
