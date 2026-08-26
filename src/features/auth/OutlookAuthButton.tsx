'use client';

/**
 * Outlook / Microsoft sign-in.
 *
 * MSAL runs a popup, we ask for the Graph `User.Read` scope, and the resulting
 * **access token** goes to baliye-node's /auth/microsoft, which validates it by
 * calling Graph itself. Validating server-side matters: an ID token decoded on
 * the client proves nothing to the API, since anyone can post a forged one.
 */

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  PublicClientApplication,
  type AuthenticationResult,
  type IPublicClientApplication,
} from '@azure/msal-browser';

import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/features/authSlice';
import { useMicrosoftLoginMutation } from '@/store/api/authApi';

interface Props {
  redirectTo: string;
  onError: (message: string) => void;
}

/** Created lazily so the SDK never initialises during SSR. */
let msalInstance: IPublicClientApplication | null = null;

async function getMsal(): Promise<IPublicClientApplication | null> {
  const clientId = process.env.NEXT_PUBLIC_MS_CLIENT_ID;
  if (!clientId) return null;

  if (!msalInstance) {
    const instance = new PublicClientApplication({
      auth: {
        clientId,
        /* 'common' allows both work and personal Microsoft accounts. */
        authority: `https://login.microsoftonline.com/${
          process.env.NEXT_PUBLIC_MS_TENANT || 'common'
        }`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
      cache: { cacheLocation: 'sessionStorage' },
    });

    await instance.initialize();
    msalInstance = instance;
  }

  return msalInstance;
}

export default function OutlookAuthButton({ redirectTo, onError }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [microsoftLogin] = useMicrosoftLoginMutation();
  const [isBusy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);

    try {
      const msal = await getMsal();

      if (!msal) {
        onError('Outlook sign-in is not configured yet.');
        return;
      }

      const result: AuthenticationResult = await msal.loginPopup({
        scopes: ['User.Read', 'openid', 'email', 'profile'],
        prompt: 'select_account',
      });

      const login = await microsoftLogin({ accessToken: result.accessToken }).unwrap();

      dispatch(
        setCredentials({
          tokens: { accessToken: login.accessToken, refreshToken: login.refreshToken },
          user: login.user ?? null,
        })
      );

      router.replace(redirectTo);
    } catch (err) {
      /* User closing the popup is not an error worth shouting about. */
      const message = (err as { errorCode?: string }).errorCode;
      if (message !== 'user_cancelled' && message !== 'popup_window_error') {
        onError('Could not sign in with Outlook. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-md border border-[#E4E4E4] bg-white text-[15px] text-[#1B2B36] transition-colors hover:border-[#C9C9C9] disabled:opacity-60"
    >
      <Image src="/outlook.png" alt="" width={22} height={22} />
      {isBusy ? 'Signing in…' : 'Outlook'}
    </button>
  );
}
