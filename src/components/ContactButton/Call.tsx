"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IoCall } from "react-icons/io5";

function Call({ callNumber }: { callNumber: string }) {
  const pathName = usePathname();
  
    if (pathName === "/thank-you/") {
      return null;
    }
  return (
    <div
      className={`fixed bottom-10 lg:left-3  left-4 z-20 cursor-pointer`}
    >
      <Link
        href={`tel: ${callNumber ? callNumber : "+911234567890"} `}
        target="_blank"
        rel="noreferrer"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-700 hover:bg-primary text-white/95 hover:shadow-2xl transition-all"
      >
        <IoCall size={29} color="white" />
        <span className="sr-only">call</span>
      </Link>
    </div>
  );
}

export default Call;
