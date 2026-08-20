"use client";

import Image from "next/image";

interface Props {
  title: string;
  image: string;
  selected?: boolean;
  price?: string;
  onClick?: () => void;
}

export default function FabricCard({
  title,
  image,
  selected,
  price,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
      group
      relative
      overflow-hidden
      rounded-xl
      border
      bg-white
      transition-all

      ${
        selected
          ? "border-[#972E47] ring-2 ring-[#972E47]"
          : "border-[#ECECEC]"
      }
    `}
    >
      {price && (
        <span
          className="
          absolute
          left-3
          top-3
          rounded-full
          bg-black
          px-3
          py-1
          text-xs
          text-white
        "
        >
          {price}
        </span>
      )}

      <Image
        src={image}
        alt={title}
        width={220}
        height={240}
        className="
        h-[210px]
        w-full
        object-cover
        transition
        group-hover:scale-105
      "
      />

      <div className="p-4">

        <h3 className="font-medium">
          {title}
        </h3>

      </div>

    </button>
  );
}