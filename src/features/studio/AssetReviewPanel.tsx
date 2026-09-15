'use client';

/**
 * Review, name and approve extracted embroidery pieces.
 *
 * This screen is what makes the whole approach work. Extraction is generative
 * and varies between runs, so a human confirms each piece once — after which
 * it is reused unchanged on every future garment, and nothing is re-extracted.
 */

import Image from 'next/image';
import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';

import {
  useApproveAssetMutation,
  useDeleteAssetMutation,
  useGetAssetsQuery,
  useUpdateAssetMutation,
} from '@/store/api/embroideryApi';
import {
  REGION_LABELS,
  type EmbroideryAsset,
  type EmbroideryRegion,
} from '@/@types/embroidery';

interface Props {
  collectionId: string;
  /** Ink colour of the source garment, for the drift comparison. */
  sourceInkHex?: string;
}

/** Perceptual distance between two hex colours, 0-1. */
const hexDistance = (a: string, b: string) => {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) / (255 * Math.sqrt(3));
};

function AssetRow({
  asset,
  sourceInkHex,
}: {
  asset: EmbroideryAsset;
  sourceInkHex?: string;
}) {
  const [name, setName] = useState(asset.name);
  const [updateAsset] = useUpdateAssetMutation();
  const [approveAsset, { isLoading: isApproving }] = useApproveAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();

  /* An asset is reused forever, so a recoloured one is worth flagging loudly. */
  const drifted =
    sourceInkHex && asset.dominantHex
      ? hexDistance(asset.dominantHex, sourceInkHex) > 0.18
      : false;

  return (
    <div className="flex gap-4 rounded-xl bg-white p-3 ring-1 ring-[#EEE]">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#FBFAF8]">
        <Image
          src={asset.thumbnailUrl}
          alt={asset.name}
          fill
          unoptimized
          sizes="96px"
          className="object-contain p-1"
        />
      </div>

      <div className="min-w-0 flex-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== asset.name && updateAsset({ id: asset._id, body: { name } })}
          className="w-full rounded border border-[#EAE6DF] px-2 py-1.5 text-sm outline-none focus:border-secondary"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={asset.region}
            onChange={(e) =>
              updateAsset({
                id: asset._id,
                body: { region: e.target.value as EmbroideryRegion },
              })
            }
            className="rounded border border-[#EAE6DF] px-2 py-1 text-xs outline-none focus:border-secondary"
          >
            {Object.entries(REGION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {asset.dominantHex && (
            <span
              className="flex items-center gap-1.5 text-[11px] text-[#8A8A8A]"
              title={`Ink colour ${asset.dominantHex}`}
            >
              <span
                style={{ backgroundColor: asset.dominantHex }}
                className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
              />
              {asset.dominantHex}
            </span>
          )}

          {drifted && (
            <span className="rounded-full bg-[#FDF0F2] px-2 py-0.5 text-[11px] text-secondary">
              Colour differs from source
            </span>
          )}
        </div>

        <p className="mt-1.5 text-[11px] text-[#9A9A9A]">
          {asset.width}×{asset.height}px · scale{' '}
          {(asset.placement.scale.factor * 100).toFixed(0)}% of{' '}
          {asset.placement.scale.relativeTo === 'shoulderWidth'
            ? 'shoulder width'
            : asset.placement.scale.relativeTo === 'hemWidth'
              ? 'hem width'
              : 'garment width'}
          {asset.placement.mirror && ' · mirrored'}
          {asset.placement.tile && ' · tiled'}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <button
          type="button"
          onClick={() => deleteAsset(asset._id)}
          aria-label={`Delete ${asset.name}`}
          className="text-[#C9C9C9] transition-colors hover:text-secondary"
        >
          <Trash2 size={15} />
        </button>

        <button
          type="button"
          disabled={isApproving}
          onClick={() => approveAsset({ id: asset._id, isApproved: !asset.isApproved })}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            asset.isApproved
              ? 'bg-[#E7F3E5] text-[#3F6B3D]'
              : 'border border-secondary text-secondary'
          }`}
        >
          {asset.isApproved && <Check size={13} />}
          {asset.isApproved ? 'Approved' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

export default function AssetReviewPanel({ collectionId, sourceInkHex }: Props) {
  const { data: assets = [], isLoading } = useGetAssetsQuery({ collectionId });

  const approved = assets.filter((a) => a.isApproved).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-dark">
          Extracted pieces
          {assets.length > 0 && (
            <span className="ml-2 text-sm font-normal text-[#8A8A8A]">
              {approved} of {assets.length} approved
            </span>
          )}
        </h3>

        <p className="text-xs text-[#9A9A9A]">
          Only approved pieces can be applied to a garment.
        </p>
      </div>

      {isLoading && <p className="text-sm text-[#8A8A8A]">Loading pieces…</p>}

      {!isLoading && assets.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-[#8A8A8A]">
          No pieces yet. Run an extraction, then split it into assets.
        </p>
      )}

      <div className="space-y-3">
        {assets.map((asset) => (
          <AssetRow key={asset._id} asset={asset} sourceInkHex={sourceInkHex} />
        ))}
      </div>
    </div>
  );
}
