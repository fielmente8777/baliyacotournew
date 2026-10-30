'use client';

import { useState } from 'react';
import { Store } from 'lucide-react';

import type { EmbroideryCollection } from '@/@types/embroidery';
import { adminErrorMessage, useCreateOptionMutation, useGetCatalogQuery, useUpdateOptionMutation } from '@/store/api/adminApi';
import { useLinkEmbroideryCollectionMutation } from '@/store/api/adminStudioApi';
import { cn } from '@/lib/format';
import { Badge, Card } from '../ui';

const NEW = '__new__';

/**
 * Which saved embroidery the customer sees in Create Your Own Design.
 *
 * Each embroidery is shown through an option in the Embroidery step: a new
 * one named after it, or an existing one. Once any is linked, that step lists
 * only the linked embroidery (plus "No Embroidery"), each with its extracted
 * picture, and the AI preview draws that exact embroidery. Unlinking all of
 * them brings the old options back.
 */
export default function DesignerLinks({ collections, onError }: { collections: EmbroideryCollection[]; onError: (text: string) => void }) {
  const { data: catalog, isLoading } = useGetCatalogQuery();
  const [link] = useLinkEmbroideryCollectionMutation();
  const [createOption] = useCreateOptionMutation();
  const [updateOption] = useUpdateOptionMutation();
  const [saving, setSaving] = useState<string | null>(null);

  const group = catalog?.groups.find((g) => g.code === 'embroidery');
  const options = (catalog?.options ?? []).filter((o) => o.groupId === group?._id && !o.value.startsWith('no-'));
  const linkedTo = (collectionId: string) => options.find((o) => o.assetCollectionId === collectionId);
  const linkedCount = collections.filter((c) => linkedTo(c._id)).length;

  const save = async (collection: EmbroideryCollection, choice: string) => {
    if (!group) return;
    setSaving(collection._id);
    try {
      const current = linkedTo(collection._id);
      if (current && current._id !== choice) await link({ optionId: current._id, collectionId: null }).unwrap();
      if (choice === NEW) {
        /* Named after the embroidery; an option with that name already there is reused. */
        const existing = options.find((o) => o.label.trim().toLowerCase() === collection.collectionName.trim().toLowerCase());
        const option = existing ?? (await createOption({ groupId: group._id, body: { label: collection.collectionName, isActive: true } }).unwrap());
        await link({ optionId: option._id, collectionId: collection._id }).unwrap();
      } else if (choice && choice !== current?._id) {
        await link({ optionId: choice, collectionId: collection._id }).unwrap();
        /* A hidden option would never reach customers. */
        if (options.find((o) => o._id === choice)?.isActive === false) {
          await updateOption({ id: choice, body: { isActive: true } }).unwrap();
        }
      }
    } catch (err) {
      onError(adminErrorMessage(err, 'Could not save where this embroidery shows'));
    } finally {
      setSaving(null);
    }
  };

  return (
    <Card
      className="mb-5"
      title={
        <span className="flex items-center gap-2">
          <Store className="size-4" aria-hidden /> Show in the designer
        </span>
      }
      actions={<Badge tone={linkedCount ? 'ok' : 'neutral'}>{linkedCount} shown</Badge>}
    >
      <p className="mb-4 text-sm text-[#666]">
        Choose which embroidery customers can pick in <b className="text-dark">Create Your Own Design</b>. Once one is shown,
        the Embroidery step lists only these (plus No Embroidery), each with its picture from here, and the AI preview
        stitches that exact embroidery onto the garment. Only approved pieces are used.
      </p>

      {isLoading ? (
        <p className="text-sm text-[#888]">Loading the Embroidery step…</p>
      ) : !group ? (
        <p className="text-sm text-red-700">The Design Builder has no Embroidery step, so there is nowhere to show these.</p>
      ) : (
        <ul className="divide-y divide-[#f1ece4]">
          {collections.map((c) => {
            const current = linkedTo(c._id);
            const ready = c.approvedCount > 0;
            return (
              <li key={c._id} className="flex flex-wrap items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- Shopify CDN thumbnail */}
                <img src={c.thumbnailUrl} alt="" className="size-12 shrink-0 rounded-md bg-[#f1ece4] object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-dark">{c.collectionName}</span>
                  <span className={cn('text-xs', ready ? 'text-[#888]' : 'text-amber-700')}>
                    {ready ? `${c.approvedCount} approved piece${c.approvedCount === 1 ? '' : 's'}` : 'Approve its pieces first'}
                  </span>
                </span>
                <select
                  value={current?._id ?? ''}
                  disabled={!ready || saving === c._id}
                  onChange={(e) => save(c, e.target.value)}
                  aria-label={`Show ${c.collectionName} in the designer as`}
                  className={cn(
                    'h-10 w-full rounded-md border bg-white px-3 text-sm text-dark focus:border-secondary focus:outline-none disabled:opacity-60 sm:w-72',
                    current ? 'border-emerald-300' : 'border-[#d8d2c8]'
                  )}
                >
                  <option value="">Not shown</option>
                  {!current && <option value={NEW}>Show as &ldquo;{c.collectionName}&rdquo; (new option)</option>}
                  {options.map((o) => (
                    <option key={o._id} value={o._id} disabled={Boolean(o.assetCollectionId && o.assetCollectionId !== c._id)}>
                      Show as &ldquo;{o.label}&rdquo;{o.assetCollectionId && o.assetCollectionId !== c._id ? ' (used by another)' : ''}
                      {!o.isActive ? ' (hidden, will be switched on)' : ''}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
