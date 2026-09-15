'use client';

/**
 * Change the phone number, in two steps.
 *
 * The code goes to the NEW number rather than the old one — that is what
 * proves the customer controls it. Verifying the old number would let a stolen
 * session move the login identity to an attacker's handset.
 */

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import {
  useConfirmPhoneChangeMutation,
  useRequestPhoneChangeMutation,
} from '@/store/api/profileApi';
import { COUNTRIES, flagEmoji } from '@/lib/countries';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

interface Props {
  open: boolean;
  onClose: () => void;
  currentPhone?: string;
}

export default function PhoneChangeModal(props: Props) {
  if (!props.open) return null;

  return <PhoneChangeModalContent key="open" {...props} />;
}

function PhoneChangeModalContent({ open, onClose, currentPhone }: Props) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [dialCode, setDialCode] = useState('+91');
  const [national, setNational] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const [requestChange, { isLoading: isSending }] = useRequestPhoneChangeMutation();
  const [confirmChange, { isLoading: isConfirming }] = useConfirmPhoneChangeMutation();

  const fullPhone = `${dialCode}${national}`;

  /* Resend timer, so nobody hammers the SMS gateway. */
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    if (national.length < 6) return setError('Enter a valid mobile number.');
    setError(null);

    try {
      await requestChange({ phone: fullPhone }).unwrap();
      setStep('code');
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'We could not send the code. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (code.length !== OTP_LENGTH) return setError(`Enter the ${OTP_LENGTH}-digit code.`);
    setError(null);

    try {
      await confirmChange({ phone: fullPhone, code }).unwrap();
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'That code was not accepted.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Change mobile number"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F2EEE8] px-5 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-[#222]">Change mobile number</h2>
            {currentPhone && (
              <p className="mt-0.5 text-[13px] text-[#8A8A8A]">
                Currently {currentPhone}
              </p>
            )}
          </div>

          <button type="button" onClick={onClose} aria-label="Close" className="text-[#8A8A8A]">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 md:px-6">
          {step === 'phone' ? (
            <>
              <label className="text-[13px] font-medium text-[#222]">
                New mobile number
              </label>

              <div className="mt-2 flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label="Country code"
                  className="h-11 w-28 shrink-0 rounded-md border border-[#EAE6DF] bg-white px-2 text-sm outline-none focus:border-[#A52C45]"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.iso} value={country.dial}>
                      {flagEmoji(country.iso)} {country.dial} {country.name}
                    </option>
                  ))}
                </select>

                <input
                  inputMode="numeric"
                  value={national}
                  onChange={(e) =>
                    /^\d{0,14}$/.test(e.target.value) && setNational(e.target.value)
                  }
                  placeholder="Mobile number"
                  className="h-11 flex-1 rounded-md border border-[#EAE6DF] px-3 text-sm outline-none focus:border-[#A52C45]"
                />
              </div>

              <p className="mt-2 text-xs text-[#9A9A9A]">
                We&apos;ll send a {OTP_LENGTH}-digit code to this number to confirm it&apos;s yours.
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#222]">
                Enter the code sent to <strong>{fullPhone}</strong>
              </p>

              <input
                ref={codeRef}
                inputMode="numeric"
                value={code}
                onChange={(e) =>
                  new RegExp(`^\\d{0,${OTP_LENGTH}}$`).test(e.target.value) &&
                  setCode(e.target.value)
                }
                placeholder="000000"
                className="mt-3 h-12 w-full rounded-md border border-[#EAE6DF] px-3 text-center text-lg tracking-[0.5em] outline-none focus:border-[#A52C45]"
              />

              <div className="mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[#8A8A8A] underline"
                >
                  Change number
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || isSending}
                  onClick={handleSend}
                  className="text-[#A52C45] disabled:text-[#B4B4B4]"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}

          {error && <p className="mt-3 text-sm text-[#A52C45]">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#F2EEE8] px-5 py-4 sm:flex-row sm:justify-end md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-[#EAE6DF] px-6 text-sm text-[#555]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={step === 'phone' ? handleSend : handleConfirm}
            disabled={isSending || isConfirming}
            className="h-10 rounded-md bg-[#A52C45] px-8 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSending || isConfirming
              ? 'Please wait…'
              : step === 'phone'
                ? 'Send code'
                : 'Verify and update'}
          </button>
        </div>
      </div>
    </div>
  );
}
