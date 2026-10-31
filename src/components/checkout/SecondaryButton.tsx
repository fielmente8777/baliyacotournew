import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

/** The outlined pill, as on the home page. */
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
        "inline-flex min-h-12 items-center justify-center rounded-full border border-dark bg-white px-7 text-[15px] font-medium text-dark transition-colors hover:bg-dark hover:text-white",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
