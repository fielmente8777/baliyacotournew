'use client';

/**
 * Cancel an order — Amazon/Flipkart pattern: pick a reason, see exactly what
 * happens to the money, confirm. One screen, then a confirmation screen.
 */

import { useState } from 'react';

import { apiErrorMessage } from '@/store/api/orderApi';
import Sheet from './Sheet';
import { ChoiceCard, InfoNote, SectionLabel, SuccessView, btnDanger, btnPrimary, btnSecondary, textArea } from './ui';

const REASONS = [
  'Ordered by mistake',
  'Want to change the size, colour or design',
  'Delivery date is too late',
  'Found a better price elsewhere',
  'Want to change the delivery address',
  'Other',
];

interface Props {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  /** What happens to the money, in one sentence. */
  refundText: string;
  /** Extra line specific to the order type (e.g. made-to-measure cut-off). */
  policyText?: string;
  onConfirm: (reason: string) => Promise<unknown>;
}

export default function CancelSheet({ open, onClose, orderNumber, refundText, policyText, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState(false);

  const finalReason = reason === 'Other' ? other.trim() : reason;
  const valid = reason !== '' && (reason !== 'Other' || other.trim().length >= 3);

  const close = () => {
    onClose();
    /* Reset after the sheet has gone, so it doesn't visibly flash. */
    setTimeout(() => {
      setReason('');
      setOther('');
      setError(null);
      setDone(false);
    }, 200);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(finalReason);
      setDone(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Sheet open={open} onClose={close} title="Order cancelled" footer={<button type="button" onClick={close} className={btnPrimary}>Done</button>}>
        <SuccessView
          title={`Order ${orderNumber.replace(/^#/, '')} has been cancelled`}
          steps={['Cancellation confirmed', 'Confirmation email sent to you', refundText]}
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Cancel order"
      footer={
        <>
          <button type="button" onClick={close} className={btnSecondary}>
            Keep order
          </button>
          <button type="button" onClick={submit} disabled={!valid || busy} className={btnDanger}>
            {busy ? 'Cancelling…' : 'Cancel order'}
          </button>
        </>
      }
    >
      <SectionLabel>Why do you want to cancel?</SectionLabel>
      <div className="space-y-2">
        {REASONS.map((r) => (
          <ChoiceCard key={r} name="cancel-reason" checked={reason === r} onChange={() => setReason(r)} title={r} />
        ))}
      </div>

      {reason === 'Other' && (
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value)}
          maxLength={250}
          rows={3}
          autoFocus
          placeholder="Tell us briefly why"
          className={`${textArea} mt-3 animate-slide-down`}
        />
      )}

      <div className="mt-5 space-y-2.5">
        <InfoNote tone="good">{refundText}</InfoNote>
        {policyText && <InfoNote>{policyText}</InfoNote>}
      </div>

      {Boolean(error) && (
        <p role="alert" className="mt-4 text-sm text-[#9B1C14]">
          {apiErrorMessage(error, "We couldn't cancel this order. Please try again.")}
        </p>
      )}
    </Sheet>
  );
}
