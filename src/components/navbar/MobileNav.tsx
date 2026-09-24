"use client";

/**
 * Slide-over menu for the hamburger button (below the `xl` breakpoint,
 * where the inline nav links and account dropdown in NavBar are hidden).
 *
 * This used to be a stub with no links and no way to reach My Account —
 * on a phone, signing in and then tapping the menu had nowhere to go.
 */

import { useRef } from "react";
import Link from "next/link";
import { Bell, LogOut, Package, User } from "lucide-react";

import { navData } from "./navData";
import { useAuth } from "@/features/auth/useAuth";
import useClickOutside from "@/hooks/useClickOutside";

interface MobileNavProps {
  isOpenNavBar: boolean;
  setIsOpenNavBar: (open: boolean) => void;
}

const MobileNav = ({ isOpenNavBar, setIsOpenNavBar }: MobileNavProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isHydrated, signOut } = useAuth();
  const isSignedIn = isHydrated && isAuthenticated;

  const close = () => setIsOpenNavBar(false);

  useClickOutside(panelRef, () => {
    if (isOpenNavBar) close();
  });

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
        className={`absolute left-0 top-0 flex h-full w-[82%] max-w-[340px] flex-col overflow-y-auto bg-white pt-20 shadow-[0_0_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out ${
          isOpenNavBar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
                  href="/my-account/personal-details"
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
                    signOut();
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
    </div>
  );
};

export default MobileNav;
