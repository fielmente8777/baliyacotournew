'use client';

/**
 * Sign-in card — Shopify customer accounts, email only.
 *
 * There is no form here because there cannot be one. Shopify removed password
 * login from its API in version 2025-04, and the Customer Account API is OAuth
 * with a full-page redirect: the customer enters their email on Shopify's
 * page, receives a one-time code, and returns signed in.
 *
 * Signing up and signing in are the same action — an unrecognised email simply
 * creates the account — so the card does not offer two paths.
 */

import Link from 'next/link';
import { Mail } from 'lucide-react';

interface Props {
  redirectTo: string;
  /** Shown when the callback bounced the customer back with a reason. */
  error?: string | null;
}

export default function ShopifySignIn({ redirectTo, error }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1B2B36]">Sign in</h1>

      <p className="mt-2 text-sm leading-relaxed text-[#7A868E]">
        Enter your email and we&apos;ll send you a code. No password needed — and
        if you&apos;re new, your account is created automatically.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-[#FDF0F2] px-3 py-2.5 text-sm text-[#A52C45]">
          {error}
        </p>
      )}

      <Link
        href={`/api/auth/shopify/start?redirect=${encodeURIComponent(redirectTo)}`}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-md bg-[#A52C45] text-sm font-medium text-white transition-colors hover:bg-[#8e2439]"
      >
        <Mail size={17} />
        Continue with email
      </Link>

      <p className="mt-6 text-center text-xs leading-relaxed text-[#9AA3A9]">
        By continuing you agree to our{' '}
        <Link href="/terms-and-conditions" className="underline">
          Terms &amp; Conditions
        </Link>
        .
      </p>
    </div>
  );
}
