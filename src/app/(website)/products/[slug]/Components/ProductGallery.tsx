"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageItem {
  src: string;
  alt: string;
}

interface Props {
  images: ImageItem[];
}

export default function ProductGallery({ images }: Props) {
  const [active, setActive] = useState(0);

  const prev = () =>
    setActive((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  const next = () =>
    setActive((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );

  return (
    <div>

      <div className="relative overflow-hidden rounded-xl bg-[#F8F8F8]">

        <Image
          src={images[active].src}
          alt={images[active].alt}
          width={700}
          height={900}
          className="h-auto w-full object-cover"
          priority
        />

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
        >
          {/* <ChevronLeft size={20} /> */}
          {"<"}
        </button>

        <button
          onClick={next}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
        >
          {/* <ChevronRight size={20} /> */}
          {">"}
        </button>

      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto">

        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`overflow-hidden rounded-md border-2 transition ${
              active === index
                ? "border-[#8D2F46]"
                : "border-transparent"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={90}
              height={110}
              className="h-[90px] w-[75px] object-cover"
            />
          </button>
        ))}

      </div>

    </div>
  );
}