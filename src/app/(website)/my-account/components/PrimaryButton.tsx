import type {
  ButtonHTMLAttributes,
} from "react";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

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
        h-10
        items-center
        justify-center
        rounded-md
        bg-[#A52C45]
        px-7
        text-sm
        font-medium
        text-white
        transition
        hover:bg-[#8F243A]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}