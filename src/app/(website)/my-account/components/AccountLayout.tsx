import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import AccountSidebar from "./AccountSidebar";

interface Props {
  children: ReactNode;
}

export default function AccountLayout({
  children,
}: Props) {
  return (
    <main className="bg-[#FBF8F2]">
      <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-[#8A8A8A]">
          <Link href="/" className="transition-colors hover:text-[#A52C45]">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href="/my-account" className="transition-colors hover:text-[#A52C45]">My Account</Link>
        </nav>

        <h1 className="mb-5 text-2xl font-semibold text-[#1F1F1F] md:mb-7 md:text-[36px]">
          My Account
        </h1>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
          <AccountSidebar />

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
