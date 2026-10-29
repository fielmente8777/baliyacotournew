"use client";

/**
 * Slide-over menu for the hamburger button (below the `xl` breakpoint,
 * where the inline nav links and account dropdown in NavBar are hidden).
 *
 * This used to be a stub with no links and no way to reach My Account —
 * on a phone, signing in and then tapping the menu had nowhere to go.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Package, User, X } from "lucide-react";

import { navData } from "./navData";
import { useAuth } from "@/features/auth/useAuth";
import { useLogoutConfirm } from "@/features/auth/LogoutConfirm";
import useClickOutside from "@/hooks/useClickOutside";

interface MobileNavProps {
  isOpenNavBar: boolean;
  setIsOpenNavBar: (open: boolean) => void;
}

const MobileNav = ({ isOpenNavBar, setIsOpenNavBar }: MobileNavProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isHydrated } = useAuth();
  const { askToLogOut, logoutDialog } = useLogoutConfirm();
  const isSignedIn = isHydrated && isAuthenticated;

  const close = () => setIsOpenNavBar(false);

  useClickOutside(panelRef, () => {
    if (isOpenNavBar) close();
  });

  /* Escape closes it too. */
  useEffect(() => {
    if (!isOpenNavBar) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpenNavBar(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpenNavBar, setIsOpenNavBar]);

  return (
    <div
      aria-hidden={!isOpenNavBar}
      className={`fixed inset-0 z-9998 xl:hidden ${
        isOpenNavBar ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpenNavBar ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute left-0 top-0 flex h-full w-[82%] max-w-85 flex-col overflow-y-auto bg-white transition-[transform,box-shadow] duration-300 ease-in-out ${
          /* Shadow only while open — closed, it bled onto the left edge of every page. */
          isOpenNavBar ? "translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.15)]" : "-translate-x-full shadow-none"
        }`}
      >
        {/* Logo and a visible close button — tapping outside isn't obvious to everyone. */}
        <div className="flex items-center justify-between border-b border-[#EFEFEF] px-6 py-4">
          <Link href="/" onClick={close} className="relative aspect-[4/1.7] w-25" aria-label="Baliye Couture home">
            <Image src="/logo.png" alt="Baliye Couture" fill sizes="100px" className="object-contain" />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-[#5C6476] transition-colors hover:bg-[#FBF6F7] hover:text-secondary"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <ul className="flex flex-col gap-1 px-6 py-4">
          {navData.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                onClick={close}
                className="flex items-center gap-3 py-3 text-base text-[#333] transition-colors hover:text-secondary"
              >
                <item.icon size={18} aria-hidden="true" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[#EFEFEF] px-6 py-4">
          {isSignedIn ? (
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/my-account"
                  onClick={close}
                  className="flex items-center gap-3 py-3 text-base text-[#333] hover:text-secondary"
                >
                  <User size={18} />
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/my-account/notifications"
                  onClick={close}
                  className="flex items-center gap-3 py-3 text-base text-[#333] hover:text-secondary"
                >
                  <Bell size={18} />
                  Notifications
                </Link>
              </li>
              <li>
                <Link
                  href="/my-account/orders"
                  onClick={close}
                  className="flex items-center gap-3 py-3 text-base text-[#333] hover:text-secondary"
                >
                  <Package size={18} />
                  My Orders
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    askToLogOut();
                  }}
                  className="flex w-full items-center gap-3 py-3 text-left text-base text-[#A52C45]"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </li>
            </ul>
          ) : (
            <Link
              href="/login?redirect=%2Fmy-account%2Fpersonal-details"
              onClick={close}
              className="flex h-12 w-full items-center justify-center rounded-md bg-secondary text-sm font-medium text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Portalled to <body>, so it shows after this menu has closed. */}
      {logoutDialog}
    </div>
  );
};

export default MobileNav;
