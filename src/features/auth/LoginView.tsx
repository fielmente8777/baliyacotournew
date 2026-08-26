'use client';

/**
 * The /login screen (Login.pdf). One card, two steps — phone then OTP.
 *
 * The peacock artwork is a page background rather than part of the card, which
 * is why the card is plain white and the illustration bleeds to the viewport
 * edges. On mobile the card goes full-width and the artwork sits behind it.
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetLoginFlow, setStep } from '@/store/features/authSlice';
import OtpStep from './OtpStep';
import PhoneStep from './PhoneStep';

/** Only ever redirect to a path on this site — never to an absolute URL. */
const safeRedirect = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/my-account/personal-details';

export default function LoginView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { step, accessToken } = useAppSelector((s) => s.auth);

  const redirectTo = safeRedirect(searchParams.get('redirect'));

  /* Never land on the OTP screen from a stale visit. */
  useEffect(() => {
    dispatch(resetLoginFlow());
  }, [dispatch]);

  /**
   * Middleware already bounces signed-in users, but it reads a cookie the
   * client sets after login — this covers the same-tab moment right after
   * verifyOtp succeeds, before any navigation happens.
   */
  useEffect(() => {
    if (accessToken) router.replace(redirectTo);
  }, [accessToken, redirectTo, router]);

  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[#DDEBD6]">
      <Image
        src="/auth/peacock-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none select-none object-cover object-bottom"
      />

      <div className="relative flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-[462px] rounded-2xl bg-white px-6 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:px-10 sm:py-9">
          {step === 'otp' && (
            <button
              type="button"
              onClick={() => dispatch(setStep('phone'))}
              className="mb-2 flex items-center gap-2 text-sm text-[#7A868E] transition-colors hover:text-[#1B2B36]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step === 'phone' ? (
            <PhoneStep redirectTo={redirectTo} />
          ) : (
            <OtpStep redirectTo={redirectTo} />
          )}
        </div>
      </div>
    </main>
  );
}
