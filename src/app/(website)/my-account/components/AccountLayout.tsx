import type { ReactNode } from "react";

import { wrap } from "../../Home/Components/ui";
import AccountHeader from "./AccountHeader";
import AccountSidebar from "./AccountSidebar";

interface Props {
  children: ReactNode;
}

export default function AccountLayout({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className={`${wrap} pb-16 md:pb-24`}>
        <AccountHeader />

        <div className="mt-6 grid gap-5 md:mt-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8">
          <AccountSidebar />

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
