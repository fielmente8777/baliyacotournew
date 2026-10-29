import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function AccountContent({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-[#EAE6DF] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
