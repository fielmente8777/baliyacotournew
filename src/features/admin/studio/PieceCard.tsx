'use client';

/**
 * One embroidery piece to check before it can be used: its picture, the name
 * and position the AI gave it, the side, the work type and a short
 * description. Every field can be corrected; changing the position or side
 * moves the piece's placement with it. Only approved pieces are ever placed.
 */

import { useState } from 'react';
import { Check, Sparkles, Trash2 } from 'lucide-react';

import {
  EMBROIDERY_REGIONS,
  REGION_HINTS,
  REGION_LABELS,
  SIDED_REGIONS,
  SIDE_LABELS,
  type EmbroideryAsset,
  type EmbroideryRegion,
  type EmbroiderySide,
} from '@/@types/embroidery';
import {
  useApproveEmbroideryPieceMutation,
  useDeleteEmbroideryPieceMutation,
  useUpdateEmbroideryPieceMutation,
} from '@/store/api/adminStudioApi';
import { adminErrorMessage } from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Badge, Button, inputClass } from '../ui';

const SIDES: EmbroiderySide[] = ['pair', 'left', 'right', 'center'];

/** Checkerboard, so white thread shows on the transparent piece. */
const CHECKER =
  'bg-[length:16px_16px] bg-[linear-gradient(45deg,#f1ece4_25%,transparent_25%),linear-gradient(-45deg,#f1ece4_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1ece4_75%),linear-gradient(-45deg,transparent_75%,#f1ece4_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0]';

export default function PieceCard({
  piece,
  onFocus,
  onError,
}: {
  piece: EmbroideryAsset;
  /** Hovered or focused — highlights its position on the map. */
  onFocus: (piece: EmbroideryAsset | null) => void;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(piece.name);
  const [workType, setWorkType] = useState(piece.workType ?? '');
  const [description, setDescription] = useState(piece.description ?? '');

  const [update, { isLoading: saving }] = useUpdateEmbroideryPieceMutation();
  const [approve, { isLoading: approving }] = useApproveEmbroideryPieceMutation();
  const [remove, { isLoading: removing }] = useDeleteEmbroideryPieceMutation();

  const save = async (body: Parameters<typeof update>[0]['body']) => {
    try {
      await update({ id: piece._id, body }).unwrap();
    } catch (err) {
      onError(adminErrorMessage(err, 'Could not save that piece'));
    }
  };

  /* Text fields save when you leave them, and only if they changed. */
  const saveText = (field: 'name' | 'workType' | 'description', value: string) => {
    const trimmed = value.trim();
    if (trimmed === (piece[field] ?? '')) return;
    if (field === 'name' && !trimmed) return setName(piece.name);
    save({ [field]: trimmed });
  };

  const sided = SIDED_REGIONS.includes(piece.region);

  return (
    <article
      onMouseEnter={() => onFocus(piece)}
      onMouseLeave={() => onFocus(null)}
      onFocusCapture={() => onFocus(piece)}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-white transition',
        piece.isApproved ? 'border-emerald-300' : 'border-[#e6e0d6]'
      )}
    >
      <div className={cn('relative flex aspect-4/3 items-center justify-center p-3', CHECKER)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Shopify CDN thumbnail */}
        <img src={piece.thumbnailUrl} alt={piece.name} className="max-h-full max-w-full object-contain" />
        <div className="absolute left-2 top-2 flex gap-1">
          {piece.isApproved ? <Badge tone="ok">Approved</Badge> : <Badge tone="warn">Needs check</Badge>}
          {piece.aiLabelled && (
            <span className="inline-flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-secondary">
              <Sparkles className="size-3" aria-hidden /> AI named
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <input
          aria-label="Piece name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => saveText('name', name)}
          className={cn(inputClass, 'font-medium')}
        />

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#666]">Position</label>
          <select
            value={piece.region}
            disabled={saving}
            onChange={(e) => save({ region: e.target.value as EmbroideryRegion })}
            className={inputClass}
          >
            {EMBROIDERY_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] leading-snug text-[#888]">{REGION_HINTS[piece.region]}</p>
        </div>

        {sided && (
          <div>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#666]">Side (as in the photo)</span>
            <div className="grid grid-cols-2 gap-1">
              {SIDES.filter((s) => s !== 'center' || piece.region === 'chest').map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={saving}
                  onClick={() => s !== piece.side && save({ side: s })}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-xs transition',
                    piece.side === s
                      ? 'border-secondary bg-secondary/5 font-medium text-secondary'
                      : 'border-[#e6e0d6] text-[#555] hover:border-secondary/40'
                  )}
                >
                  {SIDE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          aria-label="Work type"
          value={workType}
          placeholder="Work type — Zari, Resham, Mirror…"
          onChange={(e) => setWorkType(e.target.value)}
          onBlur={() => saveText('workType', workType)}
          className={inputClass}
        />
        <textarea
          aria-label="Description"
          value={description}
          rows={2}
          placeholder="What it looks like — helps the AI render the right material"
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => saveText('description', description)}
          className={cn(inputClass, 'resize-y text-xs leading-relaxed')}
        />

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            variant={piece.isApproved ? 'outline' : 'primary'}
            loading={approving}
            onClick={() =>
              approve({ id: piece._id, isApproved: !piece.isApproved })
                .unwrap()
                .catch((err) => onError(adminErrorMessage(err, 'Could not update approval')))
            }
            className="flex-1"
          >
            {!piece.isApproved && <Check className="size-4" aria-hidden />}
            {piece.isApproved ? 'Unapprove' : 'Approve'}
          </Button>
          <Button
            variant="ghost"
            loading={removing}
            aria-label="Delete piece"
            className="px-2 text-red-700"
            onClick={() => {
              if (!window.confirm(`Delete "${piece.name}"? It can't be brought back.`)) return;
              remove(piece._id)
                .unwrap()
                .catch((err) => onError(adminErrorMessage(err, 'Could not delete that piece')));
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
