import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function PrimaryButton({
  className,
  fullWidth = true,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "h-11 rounded-md bg-[#972E47] text-white text-sm font-medium transition hover:bg-[#84263d]",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}