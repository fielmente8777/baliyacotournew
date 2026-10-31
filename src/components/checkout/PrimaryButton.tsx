import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

/** The burgundy pill, as on the home and product pages. */
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
        "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-secondary px-7 text-[15px] font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
