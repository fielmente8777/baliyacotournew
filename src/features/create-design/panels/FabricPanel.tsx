'use client';

/**
 * Fabric step. Selecting a fabric lifts it into a hero card with its
 * colourways (Stensil-1); the remaining fabrics stay in the grid below.
 */

import Image from 'next/image';
import { useGetFabricsQuery } from '@/store/api/designApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectColour, selectFabric } from '@/store/features/createDesignSlice';
import ColourOptionRow from './ColourOptionRow';
import FabricCard from './FabricCard';
import PanelSkeleton from './PanelSkeleton';

export default function FabricPanel() {
  const dispatch = useAppDispatch();
  const { data: fabrics, isLoading } = useGetFabricsQuery();
  const { selectedFabricId, selectedColourId, subview } = useAppSelector((s) => s.createDesign);

  if (isLoading || !fabrics) return <PanelSkeleton title="Fabric Style" />;

  const expanded =
    subview.kind === 'fabricDetail'
      ? (fabrics.find((f) => f._id === subview.fabricId) ?? null)
      : null;

  const rest = expanded ? fabrics.filter((f) => f._id !== expanded._id) : fabrics;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-dark md:mb-8 md:text-3xl lg:text-4xl">
        Fabric Style
      </h2>

      {expanded && (
        <div className="mb-8 rounded-2xl bg-white p-3 md:p-4">
          <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl">
            <Image
              src={expanded.heroImage ?? expanded.swatchImage ?? ''}
              alt={expanded.label}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>

          <div className="mt-4">
            <ColourOptionRow
              colours={expanded.colours}
              selectedId={selectedColourId}
              onSelect={(id) => dispatch(selectColour(id))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8">
        {rest.map((f) => (
          <FabricCard
            key={f._id}
            fabric={f}
            selected={selectedFabricId === f._id}
            onSelect={() => dispatch(selectFabric(f._id))}
          />
        ))}
      </div>
    </div>
  );
}
