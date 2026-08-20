import Image from "next/image";
import { IoIosStar } from "react-icons/io";
interface ReviewCardProps {
  title: string;
  rating: number;
  user: string;
  date: string;
  review: string;
  images?: string[];
}

export default function ReviewCard({
  title,
  rating,
  user,
  date,
  review,
  images = [],
}: ReviewCardProps) {
  return (
    <div className="border-b border-[#E5E5E5] py-8">

      <h4 className="text-lg font-semibold">
        {title}
      </h4>

      <div className="mt-3 flex items-center gap-4">

        <div className="flex items-center gap-1 rounded bg-[#EEF7E7] px-2 py-1 text-sm font-medium text-[#4B7B36]">
          {rating}
          <IoIosStar size={14} fill="currentColor" />
        </div>

        <span className="text-sm text-[#666]">
          {user} | {date}
        </span>

      </div>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row">

        <p className="flex-1 text-[15px] leading-7 text-[#666]">
          {review}
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">

            {images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt=""
                width={120}
                height={120}
                className="rounded-md object-cover"
              />
            ))}

          </div>
        )}

      </div>

    </div>
  );
}