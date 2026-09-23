"use client";
import Link from "next/link";
import { navData } from "./navData";
import Image from "next/image";
import MenuButton from "./MenuButton";
import MobileNav from "./MobileNav";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { useCart } from "@/hooks/useCart";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [isOpenNavBar, setIsOpenNavBar] = useState(false);
  const { isAuthenticated, isHydrated, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  /* Skips its own fetch when signed out, so this costs nothing for guests. */
  const { totals } = useCart();
  const isSignedIn = isHydrated && isAuthenticated;

  return (
    <header className="max_screen_width py-6 bg-white">
      <nav className="max_width flex items-center justify-between">
        <div className="xl:hidden block">
          <MenuButton
            color="dark"
            isOpenNavBar={isOpenNavBar}
            setIsOpenNavBar={setIsOpenNavBar}
          />
          <MobileNav isOpenNavBar={isOpenNavBar} setIsOpenNavBar={setIsOpenNavBar} />
        </div>
        <ul className="xl:flex hidden items-center gap-6">
          {navData.map((item, index) => (
            <li className="" key={index}>
              <Link
                href={item.href}
                className="text-[#5C6476] hover:text-secondary transition-all duration-300 ease-in-out"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="lg:w-[152.47px] w-[100px] mr-26 relative aspect-[4/1.7] self-center"
        >
          <Image src="/logo.png" alt="logo" fill className="object-cover" />
        </Link>

        <ul className="flex items-center gap-4">
          <li>
            {isAuthenticated ? (
              <AccountMenu onSignOut={signOut} open={open} setOpen={setOpen} />
            ) : (
              <Link
                href="/login?redirect=%2Fmy-account%2Fpersonal-details"
                aria-label="Sign in"
                className="text-[#5C6476] w-7 flex items-center justify-center aspect-square hover:text-secondary transition-all duration-300 ease-in-out cursor-pointer"
              >
                <ProfileIcon />
              </Link>
            )}
          </li>
          {isSignedIn && (
            <li>
              <NotificationBell />
            </li>
          )}

          <li>
            <Link
              href={isSignedIn ? "/cart" : "/login?redirect=%2Fcart"}
              aria-label={
                totals.itemCount > 0
                  ? `Cart, ${totals.itemCount} item${totals.itemCount > 1 ? "s" : ""}`
                  : "Cart"
              }
              className="text-[#5C6476] w-7 flex items-center justify-center aspect-square hover:text-secondary transition-all duration-300 ease-in-out cursor-pointer relative"
            >
              <CartIcon />

              {/* Rendered only once hydrated, or the server and client markup
                  would differ and React would discard the subtree. */}
              {isSignedIn && totals.itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-medium leading-none text-white">
                  {totals.itemCount > 9 ? "9+" : totals.itemCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

export const ProfileIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_17_1779)">
      <path
        d="M10 12.5C12.7614 12.5 15 10.2614 15 7.5C15 4.73858 12.7614 2.5 10 2.5C7.23858 2.5 5 4.73858 5 7.5C5 10.2614 7.23858 12.5 10 12.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 16.875C4.01328 14.2602 6.76172 12.5 10 12.5C13.2383 12.5 15.9867 14.2602 17.5 16.875"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_17_1779">
        <rect width={20} height={20} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const CartIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_17_1783)">
      <path
        d="M14.6875 14.375H7.12266C6.82992 14.375 6.54649 14.2722 6.32177 14.0846C6.09705 13.897 5.94529 13.6365 5.89297 13.3484L3.80703 1.875H1.875"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.1875 17.5C8.05044 17.5 8.75 16.8004 8.75 15.9375C8.75 15.0746 8.05044 14.375 7.1875 14.375C6.32456 14.375 5.625 15.0746 5.625 15.9375C5.625 16.8004 6.32456 17.5 7.1875 17.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6875 17.5C15.5504 17.5 16.25 16.8004 16.25 15.9375C16.25 15.0746 15.5504 14.375 14.6875 14.375C13.8246 14.375 13.125 15.0746 13.125 15.9375C13.125 16.8004 13.8246 17.5 14.6875 17.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.51172 11.25H15.3203C15.613 11.25 15.8965 11.1472 16.1212 10.9596C16.3459 10.772 16.4977 10.5115 16.55 10.2234L17.5 5H4.375"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_17_1783">
        <rect width={20} height={20} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

/**
 * Profile dropdown for signed-in users. Closes on outside click and Escape.
 */
const AccountMenu = ({
  onSignOut,
  open,
  setOpen,
}: {
  onSignOut: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div ref={ref} className={`relative`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="text-[#5C6476] hover:text-secondary transition-all duration-300 ease-in-out"
      >
        <ProfileIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-9999 w-52 overflow-hidden rounded-lg bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          <Link
            href="/my-account/personal-details"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#333] hover:bg-[#F7F7F7]"
          >
            My Account
          </Link>
          <Link
            href="/my-account/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#333] hover:bg-[#F7F7F7]"
          >
            My Orders
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="block w-full border-t border-[#EFEFEF] px-4 py-2.5 text-left text-sm text-[#A52C45] hover:bg-[#FBF6F7]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};
