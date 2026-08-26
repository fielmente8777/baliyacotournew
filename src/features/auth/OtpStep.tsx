'use client';

/**
 * Step 2 — OTP entry (Verify_Account.pdf, Verify_Account-1.pdf).
 *
 * OTP_LENGTH is 6 because baliye-node issues six digits (generateOtp(6)) and
 * verifyOtpSchema requires code.length(6). The Figma draws four boxes — change
 * this constant AND the backend schema together if the client wants four.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setStep } from '@/store/features/authSlice';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { cn } from '@/lib/format';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpStep({ redirectTo }: { redirectTo: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { dialCode, phone } = useAppSelector((s) => s.auth);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`;
  const code = useMemo(() => digits.join(''), [digits]);
  const isComplete = code.length === OTP_LENGTH;

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const writeAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '');
    if (!value) return writeAt(index, '');

    setError(null);

    /* Pasting the whole code into any box fills the rest. */
    if (value.length > 1) {
      const chars = value.slice(0, OTP_LENGTH - index).split('');
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => (next[index + i] = c));
        return next;
      });
      inputsRef.current[Math.min(index + chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    writeAt(index, value);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      writeAt(index - 1, '');
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    if (e.key === 'Enter' && isComplete) handleVerify();
  };

  const handleVerify = async () => {
    if (!isComplete || isVerifying) return;
    setError(null);

    try {
      const result = await verifyOtp({ phone: fullPhone, code }).unwrap();

      dispatch(
        setCredentials({
          tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
          user: result.user ?? null,
        })
      );

      /* Cookie is written by saveAuth inside setCredentials, so middleware
         will already accept the destination by the time we navigate. */
      router.replace(redirectTo);
    } catch {
      setError('That code is incorrect or has expired.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);

    try {
      await sendOtp({ phone: fullPhone }).unwrap();
      setCooldown(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch {
      setError('Could not resend the code. Please try again shortly.');
    }
  };

  return (
    <div>
      <h2 className="text-center text-[26px] font-bold text-[#1B2B36] sm:text-[28px]">
        Verify Phone Number
      </h2>

      <p className="mt-1 text-center text-[15px] text-[#5C6B75]">
        Enter One Time Password sent to
      </p>
      <p className="mt-0.5 text-center text-[15px] font-semibold text-[#1B2B36]">{fullPhone}</p>

      <div className="mt-6 flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1}`}
            maxLength={OTP_LENGTH}
            className={cn(
              'h-[52px] w-[46px] rounded-lg border bg-white text-center text-[20px] font-semibold text-[#1B2B36] outline-none transition-colors sm:h-[56px] sm:w-[52px]',
              d ? 'border-[#1B2B36]' : 'border-[#E4E4E4]',
              error && 'border-[#A52C45]'
            )}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-center text-sm text-[#A52C45]">{error}</p>}

      <button
        type="button"
        onClick={handleVerify}
        disabled={!isComplete || isVerifying}
        className={cn(
          'mt-5 h-[50px] w-full rounded-md text-[15px] font-semibold transition-colors',
          isComplete && !isVerifying
            ? 'bg-[#8E2436] text-white hover:bg-[#7A1E2E]'
            : 'cursor-not-allowed bg-[#EDEDED] text-[#B4B4B4]'
        )}
      >
        {isVerifying ? 'Verifying…' : 'Verify Account'}
      </button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-[15px] font-semibold text-[#8E2436] disabled:text-[#B99AA1]"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => dispatch(setStep('phone'))}
          className="text-sm text-[#7A868E] hover:text-[#1B2B36]"
        >
          Change phone number
        </button>
      </div>
    </div>
  );
}
