import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function SecondaryButton({
  className,
  fullWidth = false,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "h-11 rounded-md border border-[#972E47] bg-white px-6 text-[#972E47] text-sm font-medium hover:bg-[#972E47] hover:text-white transition",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}