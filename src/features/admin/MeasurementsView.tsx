'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import type { AdminMeasurementTemplate } from '@/@types/admin';
import {
  adminErrorMessage,
  useCreateMeasurementTemplateMutation,
  useDeleteMeasurementTemplateMutation,
  useGetAppSettingsQuery,
  useGetCatalogQuery,
  useUpdateAppSettingsMutation,
  useUpdateMeasurementTemplateMutation,
} from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { videoSource } from '@/lib/videoEmbed';
import MeasureVideo from '@/components/MeasureVideo';
import { Badge, Button, Card, inputClass, NoticeBar, PageTitle, type Notice } from './ui';

/**
 * The "How to measure" video customers can open from the builder's
 * Measurements step. A link, not an upload: YouTube (unlisted is fine),
 * Vimeo, Google Drive (shared as "anyone with the link") or a direct .mp4.
 */
function MeasureVideoCard() {
  const { data: settings, isLoading } = useGetAppSettingsQuery();
  const [update, { isLoading: saving }] = useUpdateAppSettingsMutation();
  const [draft, setDraft] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const saved = settings?.measureVideoUrl ?? '';
  const value = draft ?? saved;
  const valid = value.trim() === '' || videoSource(value) !== null;

  const save = async (url: string) => {
    try {
      await update({ measureVideoUrl: url.trim() }).unwrap();
      setDraft(null);
      setNotice({ tone: 'ok', text: url.trim() ? 'Video saved — customers see it right away.' : 'Video removed.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save the video link') });
    }
  };

  return (
    <Card
      className="mb-5"
      title="“How to measure” video"
      actions={<Badge tone={saved ? 'ok' : 'off'}>{saved ? 'Live' : 'Not added'}</Badge>}
    >
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <p className="mb-3 text-sm text-[#555]">
        Customers open this from the <strong>How to measure</strong> button in Create Your Own Design. Paste a YouTube
        (unlisted is fine), Vimeo or Google Drive link, or a direct .mp4 link.
      </p>
      {isLoading ? (
        <p className="text-sm text-[#888]">Loading…</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={value}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://youtu.be/…"
              className={cn(inputClass, 'flex-1')}
            />
            <Button onClick={() => save(value)} loading={saving} disabled={!valid || value.trim() === saved}>
              Save
            </Button>
            {saved && (
              <Button variant="outline" onClick={() => save('')} disabled={saving}>
                Remove
              </Button>
            )}
          </div>
          {!valid && <p className="mt-1 text-xs text-[#9B2335]">That doesn&apos;t look like a link.</p>}
          {saved && (
            <div className="mt-4 max-w-md overflow-hidden rounded-lg border border-[#eee8de]">
              <MeasureVideo url={saved} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/**
 * The measurement fields customers fill in (Neck, Chest, Sleeve…). Which
 * garment asks for which is set per garment in the Design Builder.
 */
export default function MeasurementsView() {
  const { data: catalog, isLoading, error } = useGetCatalogQuery();
  const [create, { isLoading: creating, error: createError }] = useCreateMeasurementTemplateMutation();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const templates = [...(catalog?.measurementTemplates ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const add = async () => {
    try {
      await create({ name: name.trim(), unit, displayOrder: templates.length }).unwrap();
      setName('');
    } catch {
      /* Shown below. */
    }
  };

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="Measurement fields"
        description="The fields customers fill in when they save their measurements. Tick which ones each garment needs in the Design Builder."
      />

      <MeasureVideoCard />

      {isLoading && <p className="text-sm text-[#888]">Loading…</p>}
      {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load') }} />}

      {catalog && (
        <Card>
          <div className="hidden grid-cols-[1fr_80px_100px_1.4fr_70px_70px_auto] gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[#888] md:grid">
            <span>Name</span>
            <span>Unit</span>
            <span>Default</span>
            <span>Help text</span>
            <span>Order</span>
            <span>Shown</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {templates.map((t) => (
              <TemplateRow key={t._id} template={t} />
            ))}
            {templates.length === 0 && <p className="text-sm text-[#888]">No fields yet.</p>}
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-2 border-t border-[#eee8de] pt-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New field, e.g. Hip" className={cn(inputClass, 'max-w-xs')} />
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'in' | 'cm')} className={cn(inputClass, 'w-24')}>
              <option value="in">in</option>
              <option value="cm">cm</option>
            </select>
            <Button onClick={add} loading={creating} disabled={!name.trim()}>
              <Plus className="size-4" /> Add field
            </Button>
          </div>
          {createError && (
            <div className="mt-3">
              <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(createError) }} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function TemplateRow({ template }: { template: AdminMeasurementTemplate }) {
  const initial = {
    name: template.name,
    unit: template.unit,
    defaultValue: template.defaultValue === undefined || template.defaultValue === null ? '' : String(template.defaultValue),
    description: template.description ?? '',
    displayOrder: String(template.displayOrder ?? 0),
    isActive: template.isActive,
  };
  const [draft, setDraft] = useState(initial);
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading: saving }] = useUpdateMeasurementTemplateMutation();
  const [remove, { isLoading: removing }] = useDeleteMeasurementTemplateMutation();

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async () => {
    setNotice(null);
    try {
      await save({
        id: template._id,
        body: {
          name: draft.name.trim(),
          unit: draft.unit,
          description: draft.description,
          displayOrder: Number(draft.displayOrder) || 0,
          isActive: draft.isActive,
          ...(draft.defaultValue !== '' ? { defaultValue: Number(draft.defaultValue) } : {}),
        },
      }).unwrap();
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err) });
    }
  };

  const destroy = async () => {
    if (!window.confirm(`Delete the "${template.name}" field? Measurements customers already saved keep their values.`)) return;
    try {
      await remove(template._id).unwrap();
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[#eee8de] p-2 md:border-0 md:p-0">
      <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-[1fr_80px_100px_1.4fr_70px_70px_auto]">
        <input aria-label="Name" value={draft.name} onChange={(e) => set('name', e.target.value)} className={cn(inputClass, 'col-span-2 md:col-span-1')} />
        <select aria-label="Unit" value={draft.unit} onChange={(e) => set('unit', e.target.value as 'in' | 'cm')} className={inputClass}>
          <option value="in">in</option>
          <option value="cm">cm</option>
        </select>
        <input
          aria-label="Default value"
          type="number"
          value={draft.defaultValue}
          onChange={(e) => set('defaultValue', e.target.value)}
          className={inputClass}
        />
        <input
          aria-label="Help text"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          className={cn(inputClass, 'col-span-2 md:col-span-1')}
        />
        <input aria-label="Order" type="number" value={draft.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} className={inputClass} />
        <label className="flex items-center justify-center gap-1.5 text-sm">
          <input type="checkbox" className="accent-secondary" checked={draft.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          <span className="md:hidden">Shown</span>
        </label>
        <div className="col-span-2 flex justify-end gap-1 md:col-span-1">
          <Button onClick={submit} loading={saving} disabled={!dirty || !draft.name.trim()} className="h-9">
            Save
          </Button>
          <Button variant="ghost" onClick={destroy} loading={removing} className="h-9 px-2 text-red-700" aria-label="Delete field">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
