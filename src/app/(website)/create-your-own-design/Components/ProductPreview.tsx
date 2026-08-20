import Image from "next/image";

interface Props {
  image: string;
}

export default function ProductPreview({
  image,
}: Props) {
  return (
    <div className="flex justify-center">

      <Image
        src={image || "/image-54.png"}
        alt=""
        width={500}
        height={800}
        priority
        className="h-auto w-auto max-h-[760px] object-contain"
      />

    </div>
  );
}