import type { ReactNode } from "react";

import { cn } from "@/lib/format";

interface Props {
  children: ReactNode;
  className?: string;
  /** Optional header: a title and a line under it. */
  title?: string;
  subtitle?: ReactNode;
}

/** The white panel every checkout block sits in. */
export default function CheckoutCard({ children, className, title, subtitle }: Props) {
  return (
    <div className={cn("rounded-md border border-[#E8DFD3] bg-white", className)}>
      {title && (
        <div className="border-b border-[#F1EBE2] px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="text-[17px] font-semibold text-dark md:text-lg">{title}</h2>
          {subtitle && <div className="mt-0.5 text-[13px] text-[#6B6B6B]">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
