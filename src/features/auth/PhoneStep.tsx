'use client';

/**
 * Step 1 — phone entry (Login.pdf, Login-Focus.pdf, Login-Filled.pdf).
 * "Let's go!" stays disabled until the number is plausible, which is the
 * disabled/enabled contrast the Figma shows between Login and Login-Filled.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPhone, setDialCode, setStep } from '@/store/features/authSlice';
import { useSendOtpMutation } from '@/store/api/authApi';
import { cn } from '@/lib/format';
import CountrySelect from './CountrySelect';
import GoogleAuthButton from './GoogleAuthButton';
import OutlookAuthButton from './OutlookAuthButton';

/** Minimum digits before the CTA unlocks. Backend enforces 8–15 overall. */
const MIN_DIGITS = 8;

export default function PhoneStep({ redirectTo }: { redirectTo: string }) {
  const dispatch = useAppDispatch();
  const { dialCode, phone } = useAppSelector((s) => s.auth);
  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const canSubmit = digits.length >= MIN_DIGITS && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      await sendOtp({ phone: `${dialCode}${digits}` }).unwrap();
      dispatch(setStep('otp'));
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : 'Could not send the code. Please check the number and try again.'
      );
    }
  };

  return (
    <div>
      <h2 className="text-center text-[26px] font-bold text-[#1B2B36] sm:text-[28px]">
        Welcome to Baliye
      </h2>

      <p className="mt-1 text-center text-[15px] text-[#5C6B75]">Join / Sign In with</p>

      <div
        className={cn(
          'mt-6 flex h-[52px] items-center rounded-lg border bg-white px-4 transition-colors',
          'border-[#E4E4E4] focus-within:border-[#1B2B36]'
        )}
      >
        <CountrySelect value={dialCode} onChange={(d) => dispatch(setDialCode(d))} />

        <span className="mr-3 h-6 w-px bg-[#E4E4E4]" />

        <input
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => {
            /* digits and spaces only — matches the "858 054 7174" display */
            const next = e.target.value.replace(/[^\d\s]/g, '').slice(0, 17);
            dispatch(setPhone(next));
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="123 456 7890"
          className="w-full bg-transparent text-[15px] text-[#1B2B36] outline-none placeholder:text-[#9AA5AC]"
        />
      </div>

      {error && <p className="mt-2 text-sm text-[#A52C45]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          'mt-4 h-[50px] w-full rounded-md text-[15px] font-semibold transition-colors',
          canSubmit
            ? 'bg-[#8E2436] text-white hover:bg-[#7A1E2E]'
            : 'cursor-not-allowed bg-[#EDEDED] text-[#B4B4B4]'
        )}
      >
        {isLoading ? 'Sending…' : 'Let’s go!'}
      </button>

      <div className="mt-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DFDFDF]" />
        <span className="text-sm text-[#7A868E]">or</span>
        <span className="h-px flex-1 bg-[#DFDFDF]" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <GoogleAuthButton redirectTo={redirectTo} onError={setError} />
        <OutlookAuthButton redirectTo={redirectTo} onError={setError} />
      </div>
    </div>
  );
}
