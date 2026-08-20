import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function CheckoutCard({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded bg-white border border-[#EFE8DD] ${className}`}
    >
      {children}
    </div>
  );
}