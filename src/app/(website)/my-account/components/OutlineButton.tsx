import type {
  ButtonHTMLAttributes,
} from "react";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

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
        h-10
        items-center
        justify-center
        rounded-md
        border
        border-[#A52C45]
        bg-white
        px-7
        text-sm
        font-medium
        text-[#A52C45]
        transition
        hover:bg-[#A52C45]
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