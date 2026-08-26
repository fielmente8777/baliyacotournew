"use client";
import Link from "next/link";
import { navData } from "./navData";
import Image from "next/image";
import MenuButton from "./MenuButton";
import { useState } from "react";
import { useAuth } from "@/features/auth/useAuth";

const Navbar = () => {
  const [isOpenNavBar, setIsOpenNavBar] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="max_screen_width py-6 bg-white">
      <nav className="max_width flex items-center justify-between">
        <div className="xl:hidden block">
          <MenuButton
            color="dark"
            isOpenNavBar={isOpenNavBar}
            setIsOpenNavBar={setIsOpenNavBar}
          />
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

        <ul className="flex items-center gap-6">
          <li>
            {/* Signed out, this goes to /login and comes back here after. */}
            <Link
              href={
                isAuthenticated
                  ? "/my-account/personal-details"
                  : "/login?redirect=%2Fmy-account%2Fpersonal-details"
              }
              aria-label={isAuthenticated ? "My account" : "Sign in"}
              className="text-[#5C6476] hover:text-secondary transition-all duration-300 ease-in-out"
            >
              <ProfileIcon />
            </Link>
          </li>
          <li>
            <Link
              href={isAuthenticated ? "/cart" : "/login?redirect=%2Fcart"}
              aria-label="Cart"
              className="text-[#5C6476] hover:text-secondary transition-all duration-300 ease-in-out"
            >
              <CartIcon />
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
        stroke="#0D1829"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 16.875C4.01328 14.2602 6.76172 12.5 10 12.5C13.2383 12.5 15.9867 14.2602 17.5 16.875"
        stroke="#0D1829"
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
        stroke="#0D1829"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.1875 17.5C8.05044 17.5 8.75 16.8004 8.75 15.9375C8.75 15.0746 8.05044 14.375 7.1875 14.375C6.32456 14.375 5.625 15.0746 5.625 15.9375C5.625 16.8004 6.32456 17.5 7.1875 17.5Z"
        stroke="#0D1829"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6875 17.5C15.5504 17.5 16.25 16.8004 16.25 15.9375C16.25 15.0746 15.5504 14.375 14.6875 14.375C13.8246 14.375 13.125 15.0746 13.125 15.9375C13.125 16.8004 13.8246 17.5 14.6875 17.5Z"
        stroke="#0D1829"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.51172 11.25H15.3203C15.613 11.25 15.8965 11.1472 16.1212 10.9596C16.3459 10.772 16.4977 10.5115 16.55 10.2234L17.5 5H4.375"
        stroke="#0D1829"
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
