import type {
  ButtonHTMLAttributes,
} from "react";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/** The burgundy pill, as on the home and product pages. */
export default function PrimaryButton({
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
        bg-secondary
        px-7
        text-sm
        font-semibold
        text-white
        transition
        hover:opacity-90
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}
