'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import type { AdminCatalog, AdminGarment, GarmentFamily } from '@/@types/admin';
import {
  adminErrorMessage,
  useDeleteGarmentMutation,
  useUpdateGarmentMutation,
  useUploadCatalogImageMutation,
} from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Button, Card, Field, ImageSlot, inputClass, NoticeBar, PriceField, TextField, Toggle, type Notice } from '../ui';
import StepsEditor from './StepsEditor';
import { garmentKey, previewKey } from './catalogKeys';

type Draft = Omit<AdminGarment, '_id' | 'slug' | 'image'>;

const toDraft = (g: AdminGarment): Draft => ({
  name: g.name,
  description: g.description ?? '',
  family: g.family,
  basePrice: g.basePrice,
  measurementTemplates: g.measurementTemplates ?? [],
  /* Mongo can hand back nulls the backend's validation won't take back. */
  optionConfigs: (g.optionConfigs ?? []).map((c) => ({
    groupId: c.groupId,
    position: c.position ?? 0,
    isRequired: Boolean(c.isRequired),
    allowedOptions: c.allowedOptions ?? [],
    defaultOption: c.defaultOption ?? undefined,
    dependsOn: c.dependsOn?.groupId ? c.dependsOn : undefined,
  })),
  isDesignable: g.isDesignable,
  position: g.position ?? 0,
  isActive: g.isActive,
});

const FAMILIES: { value: GarmentFamily; label: string }[] = [
  { value: 'indian', label: 'Indian' },
  { value: 'western', label: 'Western' },
  { value: 'indo-western', label: 'Indo-western' },
];

/** Mount with key={garment._id} so switching garments starts a fresh draft. */
export default function GarmentEditor({ garment, catalog }: { garment: AdminGarment; catalog: AdminCatalog }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(garment));
  const [notice, setNotice] = useState<Notice>(null);

  const [save, { isLoading: saving }] = useUpdateGarmentMutation();
  const [remove, { isLoading: removing }] = useDeleteGarmentMutation();
  const [uploadImage] = useUploadCatalogImageMutation();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(garment));

  const submit = async () => {
    setNotice(null);
    const broken = draft.optionConfigs.find((c) => c.dependsOn && c.dependsOn.optionIds.length === 0);
    if (broken) {
      const label = catalog.groups.find((g) => g._id === broken.groupId)?.label;
      return setNotice({ tone: 'error', text: `Step "${label}": tick which choices show it, or set it to “Always show”.` });
    }
    try {
      await save({ id: garment._id, body: draft }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved. Name, price, description and visibility were also updated in Shopify.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save') });
    }
  };

  const destroy = async () => {
    if (!window.confirm(`Delete "${garment.name}"? It disappears from the design builder. Saved designs keep their copy.`)) return;
    try {
      await remove(garment._id).unwrap();
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not delete') });
    }
  };

  const upload = (key: string) => (file: File) => uploadImage({ key, file }).unwrap();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={draft.name} onChange={(v) => set('name', v)} />
            <PriceField label="Starting price" paise={draft.basePrice} onChange={(v) => set('basePrice', v)} hint="Options add to this." />
            <TextField
              label="Description"
              multiline
              value={draft.description ?? ''}
              onChange={(v) => set('description', v)}
              className="sm:col-span-2"
            />
            <Field label="Collection">
              {(id) => (
                <select
                  id={id}
                  value={draft.family}
                  onChange={(e) => set('family', e.target.value as GarmentFamily)}
                  className={inputClass}
                >
                  {FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <TextField
              label="Display order"
              type="number"
              value={String(draft.position)}
              onChange={(v) => set('position', Number.parseInt(v || '0', 10) || 0)}
              hint="Lower numbers show first."
            />
            <div className="flex flex-col gap-3 sm:col-span-2">
              <Toggle
                checked={draft.isActive}
                onChange={(v) => set('isActive', v)}
                label="Visible on the website"
                description="Hidden garments stay saved but customers can't pick them."
              />
              <Toggle
                checked={draft.isDesignable}
                onChange={(v) => set('isDesignable', v)}
                label="Offered in “Create your own design”"
              />
            </div>
          </div>
        </Card>

        <Card title="Pictures" className="h-fit">
          <div className="grid grid-cols-2 gap-4">
            <ImageSlot
              label="Card"
              url={catalog.images[garmentKey(garment)]}
              onUpload={upload(garmentKey(garment))}
              aspect="aspect-[3/4]"
            />
            <ImageSlot
              label="Builder preview"
              url={catalog.images[previewKey(garment)]}
              onUpload={upload(previewKey(garment))}
              aspect="aspect-[3/4]"
            />
          </div>
          <p className="mt-3 text-xs text-[#888]">Uploaded straight to Shopify. Pictures save immediately.</p>
        </Card>
      </div>

      <Card title="Steps in the builder">
        <StepsEditor catalog={catalog} configs={draft.optionConfigs} onChange={(v) => set('optionConfigs', v)} />
      </Card>

      <Card title="Measurements asked for">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {catalog.measurementTemplates.map((t) => (
            <label key={t._id} className={cn('flex items-center gap-2 text-sm', !t.isActive && 'opacity-50')}>
              <input
                type="checkbox"
                className="accent-secondary"
                checked={draft.measurementTemplates.includes(t._id)}
                onChange={(e) =>
                  set(
                    'measurementTemplates',
                    e.target.checked
                      ? [...draft.measurementTemplates, t._id]
                      : draft.measurementTemplates.filter((id) => id !== t._id)
                  )
                }
              />
              {t.name} ({t.unit})
            </label>
          ))}
          {catalog.measurementTemplates.length === 0 && (
            <p className="text-sm text-[#888]">No measurement fields yet — add them under Measurement fields.</p>
          )}
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 rounded-lg border border-[#e6e0d6] bg-white/95 p-3 backdrop-blur">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="danger" onClick={destroy} loading={removing}>
            <Trash2 className="size-4" /> Delete garment
          </Button>
          <div className="flex items-center gap-2">
            {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
            <Button variant="outline" disabled={!dirty} onClick={() => setDraft(toDraft(garment))}>
              Discard
            </Button>
            <Button onClick={submit} loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
