"use client";

/**
 * The /login screen.
 *
 * The peacock artwork is a page background rather than part of the card, which
 * is why the card is plain white and the illustration bleeds to the viewport
 * edges. On mobile the card goes full-width and the artwork sits behind it.
 *
 * Authentication is Shopify's: the card holds a single button that starts the
 * OAuth redirect. The phone-OTP flow that used to live here is retired — see
 * ShopifySignIn for why a form is not possible.
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useAppSelector } from "@/store/hooks";
import ShopifySignIn from "./ShopifySignIn";

/** Only ever redirect to a path on this site — never to an absolute URL. */
const safeRedirect = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/my-account/personal-details";

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const error = searchParams.get("error");

  /**
   * Middleware already bounces signed-in visitors, but it reads a cookie the
   * client sets after login — this covers the same-tab moment right after the
   * handoff completes, before any navigation happens.
   */
  useEffect(() => {
    if (accessToken) router.replace(redirectTo);
  }, [accessToken, redirectTo, router]);

  return (
    <main className=" min-h-[calc(100vh-96px)] overflow-hidden bg-[#FAF8F0]">
      <div className="relative w-full aspect-[4/1.7] sm:hidden block">
        <Image
          src="/bg-1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none select-none object-cover object-bottom"
        />
      </div>

      <div className="relative flex py-10 items-center justify-center px-4">
        <div className="w-full max-w-[462px] rounded-2xl bg-white px-6 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:px-10 sm:py-9">
          <ShopifySignIn redirectTo={redirectTo} error={error} />
        </div>
      </div>

      <div className="relative w-full aspect-[4/1.2] -mt-25 hidden sm:block">
        <Image
          src="/bg-2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none select-none object-cover object-bottom"
        />
      </div>
    </main>
  );
}
