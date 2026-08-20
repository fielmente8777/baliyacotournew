'use client';

import Image from 'next/image';
import { useGetEmbroideryQuery } from '@/store/api/designApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectEmbroidery } from '@/store/features/createDesignSlice';
import { cn } from '@/lib/format';
import PanelSkeleton from './PanelSkeleton';

export default function EmbroideryPanel() {
  const dispatch = useAppDispatch();
  const { data: styles, isLoading } = useGetEmbroideryQuery();
  const selectedId = useAppSelector((s) => s.createDesign.selectedEmbroideryId);

  if (isLoading || !styles) return <PanelSkeleton title="Embroidery" />;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-dark md:mb-8 md:text-3xl lg:text-4xl">
        Embroidery
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8">
        {styles.map((s) => (
          <button
            key={s._id}
            type="button"
            onClick={() => dispatch(selectEmbroidery(s._id))}
            aria-pressed={selectedId === s._id}
            className={cn(
              'group overflow-hidden rounded-xl text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
              selectedId === s._id && 'ring-2 ring-secondary'
            )}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#BFD0EE]">
              <Image
                src={"/image1.png"}
                // src={s.previewImage || "/image1.png"}
                alt={s.label}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <p className="mt-2 text-sm font-medium text-dark md:text-base">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
