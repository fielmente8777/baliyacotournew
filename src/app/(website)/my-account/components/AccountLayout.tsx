import type { ReactNode } from "react";

import AccountSidebar from "./AccountSidebar";

interface Props {
  children: ReactNode;
}

export default function AccountLayout({
  children,
}: Props) {
  return (
    <main className="bg-[#FBF8F2]">
      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <h1 className="mb-7 text-3xl font-semibold text-[#1F1F1F] md:text-[40px]">
          My Account
        </h1>

        <div className="grid gap-6 lg:grid-cols-[205px_minmax(0,1fr)]">
          <AccountSidebar />

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}