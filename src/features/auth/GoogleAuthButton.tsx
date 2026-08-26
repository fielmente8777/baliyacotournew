'use client';

/**
 * Gmail sign-in.
 *
 * baliye-node's /auth/google calls `verifyIdToken`, so it needs a Google **ID
 * token** (a JWT), not an OAuth access token. Only Google's own rendered button
 * and One Tap hand back an ID token — `useGoogleLogin` returns an access token,
 * which that endpoint would reject.
 *
 * The Figma needs a custom-styled button, so Google's real button is rendered
 * at zero opacity directly on top of ours: the user sees the Baliye button and
 * clicks Google's iframe. This is the standard workaround for GIS, which does
 * not support restyling its button beyond a handful of presets.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/features/authSlice';
import { useGoogleLoginMutation } from '@/store/api/authApi';

interface Props {
  redirectTo: string;
  onError: (message: string) => void;
}

export default function GoogleAuthButton({ redirectTo, onError }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(200);

  /* Google's button needs an explicit pixel width — track our own. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => setWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCredential = async (credential?: string) => {
    if (!credential) return onError('Google did not return a credential.');

    try {
      const result = await googleLogin({ idToken: credential }).unwrap();

      dispatch(
        setCredentials({
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
          user: result.user ?? null,
        })
      );

      router.replace(redirectTo);
    } catch {
      onError('Could not sign in with Gmail. Please try again.');
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={isLoading}
        aria-hidden
        tabIndex={-1}
        className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-md border border-[#E4E4E4] bg-white text-[15px] text-[#1B2B36] transition-colors hover:border-[#C9C9C9] disabled:opacity-60"
      >
        <Image src="/gmail.png" alt="" width={22} height={22} />
        {isLoading ? 'Signing in…' : 'Gmail'}
      </button>

      {/* Real Google button, invisible, sitting on top and taking the click. */}
      <div className="absolute inset-0 overflow-hidden opacity-0 [color-scheme:light]">
        <GoogleLogin
          width={width}
          onSuccess={(res) => handleCredential(res.credential)}
          onError={() => onError('Google sign-in was cancelled.')}
        />
      </div>
    </div>
  );
}
