'use client';

/**
 * "What do you want to design?" (§27). Shown only when the customer arrives
 * without a garment type or product — customizing a pre-designed product skips
 * this entirely.
 */

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useGetGarmentTypesQuery } from '@/store/api/productApi';
import { useGetDesignImagesQuery } from '@/store/api/designApi';
import { designImageKey } from '@/lib/designImages';
import { cn, formatINR } from '@/lib/format';
import { LIVE } from '@/lib/liveUpdates';

/* Two / three / five across (gap-5 = 1.25rem), in a centred wrapping row, so
   a leftover card sits in the middle rather than alone on the left. */
const CARD_WIDTH = 'w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-5rem)/5)]';

export default function GarmentTypePicker() {
  const router = useRouter();
  const { data: types = [], isLoading } = useGetGarmentTypesQuery(undefined, LIVE);
  const { data: images = {} } = useGetDesignImagesQuery(undefined, LIVE);

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2] px-4 py-16 md:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-3xl font-semibold text-dark md:text-4xl">
          What do you want to design?
        </h1>

        <p className="mt-3 text-[#6B6B6B]">
          Pick a garment and we&apos;ll walk you through the rest.
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-5">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn('h-48 animate-pulse rounded-xl bg-black/5', CARD_WIDTH)} />
          ))}

        {types.map((type) => {
          const image = images[designImageKey.garment(type.slug)] ?? type.image;
          return (
          <button
            key={type._id}
            type="button"
            onClick={() =>
              router.push(`/create-your-own-design?garmentType=${type._id}`)
            }
            className={cn('group overflow-hidden rounded-xl bg-white text-left transition-shadow hover:shadow-lg', CARD_WIDTH)}
          >
            <div className="relative aspect-[3/4] w-full bg-[#F1EDE6]">
              {image && (
                <Image
                  src={image}
                  alt={type.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 240px"
                  className="object-cover duration-500 group-hover:scale-105"
                />
              )}
            </div>

            <div className="p-4">
              <h2 className="font-medium text-dark">{type.name}</h2>
              <p className="mt-1 text-sm text-[#8B6E54]">
                From {formatINR(type.basePrice / 100)}
              </p>
            </div>
          </button>
          );
        })}
      </div>

      {!isLoading && types.length === 0 && (
        <p className="mt-16 text-center text-[#6B6B6B]">
          No garment types are available yet.
        </p>
      )}
    </main>
  );
}
