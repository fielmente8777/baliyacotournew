import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

/** The white panel each My Account section sits in, bordered like the product page's cards. */
export default function AccountContent({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-[#E8DFD3] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
