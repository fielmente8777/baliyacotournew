'use client';

/**
 * What the admin says about a whole embroidery, beyond its pieces:
 *
 *   - What it goes with: the neck, sleeve and length or lower it is made for
 *     (required), and the dupatta and colours (optional; none ticked = any).
 *     Once it is shown in the designer, colour and neck (picked before
 *     Embroidery) decide whether it is offered, and picking it narrows the
 *     later steps (sleeve, length, lower, dupatta) to its choices. The backend
 *     turns these into the Embroidery option's `pairsWith`.
 *   - Notes: technique, colours, where it sits. Given to every AI step for
 *     this embroidery (extraction, naming, try-on, designer preview).
 *
 * `CollectionDetailsFields` is used in step 1 and in the edit dialog, which
 * also edits the name and is opened from a saved embroidery card.
 */

import { forwardRef, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import type { AdminOption } from '@/@types/admin';
import type { EmbroideryCollection, EmbroideryCollectionDetails, PairingField } from '@/@types/embroidery';
import { adminErrorMessage, useGetCatalogQuery } from '@/store/api/adminApi';
import { useUpdateEmbroideryCollectionMutation } from '@/store/api/adminStudioApi';
import { cn } from '@/lib/format';
import { Button, NoticeBar, TextField } from '../ui';
import { byPosition } from '../design-builder/catalogKeys';

export const NOTES_PLACEHOLDER =
  'e.g. Hand gota patti in light gold with small pearls. Neckline border is about 3 cm wide. Paisley butis only on the sleeves. Hem border sits just above the kurta hem.';

export type CollectionDetailsValue = Required<EmbroideryCollectionDetails>;

/**
 * The designer steps, by option-group code, in the order the customer meets
 * them. `need`: required, one of length / lower (each garment has only one
 * of the two), or optional. Mirrors baliye-node `PAIRING_FIELDS`.
 */
const PAIRING_STEPS: {
  field: PairingField;
  code: string;
  title: string;
  hint: string;
  need: 'required' | 'lengthOrLower' | 'optional';
}[] = [
  {
    field: 'colourOptionIds',
    code: 'color',
    title: 'Colour',
    need: 'optional',
    hint: 'Shown only after the customer picks one of these colours. Tick none for every colour.',
  },
  {
    field: 'neckOptionIds',
    code: 'neck',
    title: 'Neck type',
    need: 'required',
    hint: 'Shown only after the customer picks one of these necks.',
  },
  {
    field: 'sleeveOptionIds',
    code: 'sleeve',
    title: 'Sleeve type',
    need: 'required',
    hint: 'Once this embroidery is picked, the Sleeve step offers only these.',
  },
  {
    field: 'lengthOptionIds',
    code: 'length',
    title: 'Length',
    need: 'lengthOrLower',
    hint: 'Kurti and anarkali. Once picked, the Length step offers only these.',
  },
  {
    field: 'lowerOptionIds',
    code: 'lower',
    title: 'Lower',
    need: 'lengthOrLower',
    hint: 'Patiala and sharara: the salwar, pajama or sharara that goes with it, e.g. the one carrying its embroidered border.',
  },
  {
    field: 'dupattaOptionIds',
    code: 'dupatta',
    title: 'Dupatta',
    need: 'optional',
    hint: 'Tick none for any dupatta.',
  },
];

export const emptyDetails = (): CollectionDetailsValue => ({
  neckOptionIds: [],
  sleeveOptionIds: [],
  lengthOptionIds: [],
  lowerOptionIds: [],
  dupattaOptionIds: [],
  colourOptionIds: [],
  notes: '',
});

export const detailsFrom = (c: EmbroideryCollection): CollectionDetailsValue => ({
  neckOptionIds: c.neckOptionIds ?? [],
  sleeveOptionIds: c.sleeveOptionIds ?? [],
  lengthOptionIds: c.lengthOptionIds ?? [],
  lowerOptionIds: c.lowerOptionIds ?? [],
  dupattaOptionIds: c.dupattaOptionIds ?? [],
  colourOptionIds: c.colourOptionIds ?? [],
  notes: c.notes ?? '',
});

/** Same rule as the backend's `pairingProblem`; null when the details can be saved. */
export function detailsProblem(d: EmbroideryCollectionDetails) {
  if (!d.neckOptionIds?.length) return 'Choose the neck type this embroidery is made for.';
  if (!d.sleeveOptionIds?.length) return 'Choose the sleeve type this embroidery is made for.';
  if (!d.lengthOptionIds?.length && !d.lowerOptionIds?.length) {
    return 'Choose the length or the lower this embroidery is made for.';
  }
  return null;
}

/** Each step's active options, in the designer's order, by group code. */
export function usePairingOptions() {
  const { data: catalog, isLoading } = useGetCatalogQuery();
  const byCode = useMemo(() => {
    const map = new Map<string, AdminOption[]>();
    for (const { code } of PAIRING_STEPS) {
      const group = catalog?.groups.find((g) => g.code === code);
      map.set(code, (catalog?.options ?? []).filter((o) => o.groupId === group?._id && o.isActive).sort(byPosition));
    }
    return map;
  }, [catalog]);
  return { byCode, isLoading };
}

/**
 * One line for a card or a heading: "V-Neck · Full Sleeve · Salwar · Red".
 * Older embroidery saved before sleeve and lower existed says what's missing.
 */
export function detailsSummary(d: EmbroideryCollectionDetails, byCode: Map<string, AdminOption[]>) {
  const names = (field: PairingField, code: string) => {
    const ids = d[field] ?? [];
    return (byCode.get(code) ?? []).filter((o) => ids.includes(o._id)).map((o) => o.label);
  };
  const parts = PAIRING_STEPS.map(({ field, code }) => names(field, code).join(', ')).filter(Boolean);
  const missing = detailsProblem(d);
  if (missing) return parts.length ? `${parts.join(' · ')} · details missing` : 'Goes with everything · details missing';
  return parts.join(' · ');
}

export const CollectionDetailsFields = forwardRef<
  HTMLDivElement,
  {
    value: CollectionDetailsValue;
    onChange: (next: CollectionDetailsValue) => void;
    /** Shown above the pickers, e.g. after an extract was refused for missing details. */
    error?: string | null;
  }
>(function CollectionDetailsFields({ value, onChange, error }, ref) {
  const { byCode, isLoading } = usePairingOptions();
  const toggle = (field: PairingField, id: string) =>
    onChange({
      ...value,
      [field]: value[field].includes(id) ? value[field].filter((n) => n !== id) : [...value[field], id],
    });

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-dark">What does this embroidery go with?</p>
        <p className="text-xs text-[#777]">
          Neck and sleeve are required, plus a length or a lower. Colour and dupatta are optional. In the designer it only
          shows with these choices, so nothing clashes.
        </p>
        {error && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      </div>

      {isLoading ? (
        <p className="text-xs text-[#888]">Loading the designer&apos;s options…</p>
      ) : (
        PAIRING_STEPS.map(({ field, code, title, hint, need }) => {
          const options = byCode.get(code) ?? [];
          if (!options.length) return null;
          const badge = need === 'required' ? 'Required' : need === 'lengthOrLower' ? 'Length or lower' : 'Optional';
          return (
            <fieldset key={field}>
              <legend className="flex flex-wrap items-baseline gap-2 text-sm font-medium text-dark">
                {title}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    need === 'optional' ? 'bg-[#f1ece4] text-[#7a6d5c]' : 'bg-secondary/10 text-secondary'
                  )}
                >
                  {badge}
                </span>
              </legend>
              <p className="mb-2 text-xs text-[#777]">{hint}</p>
              <div className="flex flex-wrap gap-1.5">
                {options.map((o) => {
                  const on = value[field].includes(o._id);
                  return (
                    <button
                      key={o._id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(field, o._id)}
                      className={cn(
                        'flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs transition',
                        on ? 'border-secondary bg-secondary text-white' : 'border-[#d8d2c8] bg-white text-[#444] hover:border-secondary'
                      )}
                    >
                      {o.hex && (
                        <span className="size-3.5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: o.hex }} aria-hidden />
                      )}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })
      )}

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
});

/** Edit a saved embroidery: name, what it goes with, and notes. */
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
  const [details, setDetails] = useState(() => detailsFrom(collection));
  const [error, setError] = useState<string | null>(null);
  const [save, { isLoading }] = useUpdateEmbroideryCollectionMutation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    const problem = detailsProblem(details);
    if (problem) return setError(problem);
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
