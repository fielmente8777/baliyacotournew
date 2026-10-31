import type { ReactNode } from "react";

/** Input classes shared by every My Account form. */
export const accountInputClass =
  "h-12 w-full rounded-md border border-[#E0D6C8] bg-white px-4 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-secondary focus:shadow-[0_0_0_3px_rgba(155,44,64,0.1)]";

/** A small uppercase label above a field, the way every My Account form lays them out. */
export default function FormField({
  label,
  optional,
  className = "",
  children,
}: {
  label: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#777]">
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal text-[#AFAFAF]">(optional)</span>}
      </p>
      {children}
    </div>
  );
}
