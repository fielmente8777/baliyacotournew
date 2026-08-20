import Image from 'next/image';

interface Props {
  images: string[];
}

export default function OrderGallery({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {images.map((image, index) => (
        <Image
          key={`${image}-${index}`}
          src={image}
          alt=""
          width={102}
          height={130}
          className="h-[130px] w-[102px] object-cover"
        />
      ))}
    </div>
  );
}
