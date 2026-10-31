import type {
  ButtonHTMLAttributes,
} from "react";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/** The outlined pill, as on the home page. */
export default function OutlineButton({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`
        inline-flex
        h-11
        items-center
        justify-center
        rounded-full
        border
        border-dark
        bg-white
        px-7
        text-sm
        font-medium
        text-dark
        transition-colors
        hover:bg-dark
        hover:text-white
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}
