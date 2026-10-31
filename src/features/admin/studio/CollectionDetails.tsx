'use client';

/**
 * What the admin says about a whole embroidery, beyond its pieces:
 *
 *   - Necklines: the Neck Type options it is made for. Once it is shown in
 *     the designer, customers only see it after picking one of these necks.
 *     None ticked = every neckline.
 *   - Notes: technique, colours, where it sits. Given to every AI step for
 *     this embroidery (extraction, naming, try-on, designer preview).
 *
 * `CollectionDetailsFields` is used in step 1 and in the edit dialog, which
 * also edits the name and is opened from a saved embroidery card.
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type { EmbroideryCollection, EmbroideryCollectionDetails } from '@/@types/embroidery';
import { adminErrorMessage, useGetCatalogQuery } from '@/store/api/adminApi';
import { useUpdateEmbroideryCollectionMutation } from '@/store/api/adminStudioApi';
import { cn } from '@/lib/format';
import { Button, NoticeBar, TextField } from '../ui';
import { byPosition } from '../design-builder/catalogKeys';

export const NOTES_PLACEHOLDER =
  'e.g. Hand gota patti in light gold with small pearls. Neckline border is about 3 cm wide. Paisley butis only on the sleeves. Hem border sits just above the kurta hem.';

/** The Neck Type options, in the designer's order. */
export function useNeckOptions() {
  const { data: catalog, isLoading } = useGetCatalogQuery();
  const group = catalog?.groups.find((g) => g.code === 'neck');
  const options = (catalog?.options ?? []).filter((o) => o.groupId === group?._id && o.isActive).sort(byPosition);
  return { options, isLoading };
}

/** Names of the ticked necklines, for a card or a heading. */
export function neckSummary(ids: string[], options: { _id: string; label: string }[]) {
  if (!ids.length) return 'All necklines';
  const names = options.filter((o) => ids.includes(o._id)).map((o) => o.label);
  return names.length ? names.join(', ') : 'All necklines';
}

export function CollectionDetailsFields({
  value,
  onChange,
}: {
  value: Required<EmbroideryCollectionDetails>;
  onChange: (next: Required<EmbroideryCollectionDetails>) => void;
}) {
  const { options, isLoading } = useNeckOptions();
  const toggle = (id: string) =>
    onChange({
      ...value,
      neckOptionIds: value.neckOptionIds.includes(id) ? value.neckOptionIds.filter((n) => n !== id) : [...value.neckOptionIds, id],
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-dark">Made for which necklines?</p>
        <p className="mb-2 text-xs text-[#777]">
          In the designer, this embroidery shows only after the customer picks one of these necks. Tick none for every neckline.
        </p>
        {isLoading ? (
          <p className="text-xs text-[#888]">Loading necklines…</p>
        ) : options.length === 0 ? (
          <p className="text-xs text-amber-700">The Design Builder has no Neck Type options yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {options.map((o) => {
              const on = value.neckOptionIds.includes(o._id);
              return (
                <button
                  key={o._id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(o._id)}
                  className={cn(
                    'min-h-9 rounded-full border px-3 text-xs transition',
                    on ? 'border-secondary bg-secondary text-white' : 'border-[#d8d2c8] bg-white text-[#444] hover:border-secondary'
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <TextField
        label="Details for the AI (from someone who knows the work)"
        value={value.notes}
        onChange={(notes) => onChange({ ...value, notes })}
        multiline
        rows={3}
        placeholder={NOTES_PLACEHOLDER}
        hint="Technique, colours, widths and where each part sits. Used every time the AI extracts, names or stitches this embroidery."
      />
    </div>
  );
}

/** Edit a saved embroidery: name, necklines and notes. */
export function CollectionEditor({
  collection,
  onClose,
  onSaved,
}: {
  collection: EmbroideryCollection;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  const [name, setName] = useState(collection.collectionName);
  const [details, setDetails] = useState({ neckOptionIds: collection.neckOptionIds ?? [], notes: collection.notes ?? '' });
  const [error, setError] = useState<string | null>(null);
  const [save, { isLoading }] = useUpdateEmbroideryCollectionMutation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    setError(null);
    try {
      await save({ collectionId: collection._id, collectionName: name.trim(), ...details }).unwrap();
      onSaved?.(name.trim());
      onClose();
    } catch (err) {
      setError(adminErrorMessage(err, 'Could not save this embroidery'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${collection.collectionName}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:max-w-xl sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-dark">Edit embroidery</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 items-center justify-center rounded-full hover:bg-[#f1ece4]">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <TextField label="Name" value={name} onChange={setName} />
          <CollectionDetailsFields value={details} onChange={setDetails} />
          {error && <NoticeBar notice={{ tone: 'error', text: error }} />}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} loading={isLoading} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
