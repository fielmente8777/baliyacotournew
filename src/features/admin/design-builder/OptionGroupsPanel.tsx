'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import type { AdminCatalog, AdminOption, AdminOptionGroup, OptionInputType } from '@/@types/admin';
import {
  adminErrorMessage,
  useCreateGroupMutation,
  useCreateOptionMutation,
  useDeleteOptionMutation,
  useUpdateGroupMutation,
  useUpdateOptionMutation,
  useUploadCatalogImageMutation,
} from '@/store/api/adminApi';
import { cn, formatINR } from '@/lib/format';
import { Badge, Button, Card, Field, ImageSlot, inputClass, NoticeBar, PriceField, TextField, Toggle, type Notice } from '../ui';
import { byPosition, groupUsesImages, optionKey } from './catalogKeys';

const INPUT_TYPES: { value: OptionInputType; label: string }[] = [
  { value: 'single_select', label: 'Pick one (with pictures)' },
  { value: 'multi_select', label: 'Pick several (with pictures)' },
  { value: 'color_select', label: 'Colour swatches' },
  { value: 'size_select', label: 'Size buttons' },
];

/**
 * Steps (Fabric, Neck, Sleeve…) and the options inside each: names, prices,
 * pictures, colours, visibility, and which options in other steps each one
 * goes with (e.g. which necklines an embroidery suits).
 */
export default function OptionGroupsPanel({ catalog }: { catalog: AdminCatalog }) {
  const groups = [...catalog.groups].sort(byPosition);
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?._id ?? null);
  const selected = groups.find((g) => g._id === selectedId) ?? groups[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col overflow-hidden rounded-lg border border-[#e6e0d6] bg-white">
          {groups.map((g) => {
            const count = catalog.options.filter((o) => o.groupId === g._id).length;
            return (
              <button
                key={g._id}
                type="button"
                onClick={() => setSelectedId(g._id)}
                className={cn(
                  'flex items-center justify-between gap-2 border-b border-[#f0ebe3] px-4 py-2.5 text-left text-sm last:border-b-0 transition',
                  selected?._id === g._id ? 'bg-secondary text-white' : 'hover:bg-[#faf6f0]'
                )}
              >
                <span className="truncate">{g.label}</span>
                <span className={cn('text-xs', selected?._id === g._id ? 'text-white/80' : 'text-[#999]')}>{count}</span>
              </button>
            );
          })}
        </div>
        <NewGroupForm />
      </div>

      {selected ? <GroupEditor key={selected._id} group={selected} catalog={catalog} /> : <p className="text-sm text-[#888]">No steps yet.</p>}
    </div>
  );
}

function NewGroupForm() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [inputType, setInputType] = useState<OptionInputType>('single_select');
  const [create, { isLoading, error }] = useCreateGroupMutation();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New step
      </Button>
    );
  }

  const submit = async () => {
    try {
      await create({ label: label.trim(), inputType }).unwrap();
      setLabel('');
      setOpen(false);
    } catch {
      /* Shown below. */
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#e6e0d6] bg-white p-4">
      <TextField label="Step name" value={label} onChange={setLabel} placeholder="e.g. Back design" />
      <Field label="Shown as">
        {(id) => (
          <select id={id} value={inputType} onChange={(e) => setInputType(e.target.value as OptionInputType)} className={inputClass}>
            {INPUT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <p className="text-xs text-[#888]">Then add it to a garment under Garments → Steps in the builder.</p>
      {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error) }} />}
      <div className="flex gap-2">
        <Button onClick={submit} loading={isLoading} disabled={!label.trim()}>
          Create
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function GroupEditor({ group, catalog }: { group: AdminOptionGroup; catalog: AdminCatalog }) {
  const [label, setLabel] = useState(group.label);
  const [description, setDescription] = useState(group.description ?? '');
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading }] = useUpdateGroupMutation();

  const options = catalog.options.filter((o) => o.groupId === group._id).sort(byPosition);
  const dirty = label !== group.label || description !== (group.description ?? '');
  const isColour = group.inputType === 'color_select';

  const submit = async () => {
    try {
      await save({ id: group._id, body: { label: label.trim(), description } }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved to Shopify and the builder.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card
        title={
          <span className="flex items-center gap-2">
            Step <Badge>{group.code}</Badge>
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title shown to customers" value={label} onChange={setLabel} />
          <TextField label="Help text" value={description} onChange={setDescription} />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <NoticeBar notice={notice} onClose={() => setNotice(null)} />
          <div>
            <Button onClick={submit} loading={isLoading} disabled={!dirty || !label.trim()}>
              Save step
            </Button>
          </div>
        </div>
      </Card>

      <Card title={`Options (${options.length})`}>
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <OptionRow key={o._id} option={o} group={group} catalog={catalog} />
          ))}
          {options.length === 0 && <p className="text-sm text-[#888]">No options yet.</p>}
        </div>
        <NewOptionForm group={group} isColour={isColour} />
      </Card>
    </div>
  );
}

function NewOptionForm({ group, isColour }: { group: AdminOptionGroup; isColour: boolean }) {
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState(0);
  const [hex, setHex] = useState('#9b2c40');
  const [create, { isLoading, error }] = useCreateOptionMutation();

  const submit = async () => {
    try {
      await create({
        groupId: group._id,
        body: { label: label.trim(), priceModifier: price, ...(isColour ? { hex } : {}) },
      }).unwrap();
      setLabel('');
      setPrice(0);
    } catch {
      /* Shown below. */
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[#eee8de] pt-4">
      <p className="text-sm font-medium text-dark">Add an option</p>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_160px_auto_auto]">
        <TextField label="Name" value={label} onChange={setLabel} placeholder={`New ${group.label.toLowerCase()}`} />
        <PriceField label="Adds to price" paise={price} onChange={setPrice} />
        {isColour ? (
          <Field label="Colour">
            {(id) => <input id={id} type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-9.5 w-14 rounded border border-[#d8d2c8]" />}
          </Field>
        ) : (
          <span />
        )}
        <Button onClick={submit} loading={isLoading} disabled={!label.trim()} className="h-9.5">
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error) }} />}
    </div>
  );
}

function OptionRow({ option, group, catalog }: { option: AdminOption; group: AdminOptionGroup; catalog: AdminCatalog }) {
  const [open, setOpen] = useState(false);
  const [uploadImage] = useUploadCatalogImageMutation();
  const [update, { isLoading: toggling }] = useUpdateOptionMutation();
  const key = optionKey(group, option);
  const usesImages = groupUsesImages(group);

  return (
    <div className="rounded-md border border-[#e6e0d6]">
      <div className="flex items-center gap-3 p-2">
        {usesImages ? (
          <ImageSlot url={catalog.images[key]} onUpload={(file) => uploadImage({ key, file }).unwrap()} className="w-14 shrink-0" />
        ) : (
          <span className="size-10 shrink-0 rounded border border-[#e6e0d6]" style={{ background: option.hex || '#fff' }} />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', !option.isActive && 'text-[#999]')}>{option.label}</p>
          <p className="text-xs text-[#888]">
            {option.priceModifier ? `+ ${formatINR(option.priceModifier / 100)}` : 'No extra cost'}
            {option.pairsWith?.length ? ` · goes with ${option.pairsWith.length} option(s)` : ''}
          </p>
        </div>
        {!option.isActive && <Badge tone="off">Hidden</Badge>}
        <Button
          variant="ghost"
          loading={toggling}
          onClick={() => update({ id: option._id, body: { isActive: !option.isActive } })}
          className="hidden sm:inline-flex"
        >
          {option.isActive ? 'Hide' : 'Show'}
        </Button>
        <Button variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Edit'}
        </Button>
      </div>
      {open && <OptionEditor option={option} group={group} catalog={catalog} onDone={() => setOpen(false)} />}
    </div>
  );
}

function OptionEditor({
  option,
  group,
  catalog,
  onDone,
}: {
  option: AdminOption;
  group: AdminOptionGroup;
  catalog: AdminCatalog;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState({
    label: option.label,
    description: option.description ?? '',
    priceModifier: option.priceModifier ?? 0,
    hex: option.hex ?? '',
    position: option.position ?? 0,
    isActive: option.isActive,
    pairsWith: option.pairsWith ?? [],
  });
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading: saving }] = useUpdateOptionMutation();
  const [remove, { isLoading: removing }] = useDeleteOptionMutation();

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const isColour = group.inputType === 'color_select';

  /* "Goes with" lists choices from the other picture-based steps. */
  const otherGroups = catalog.groups.filter((g) => g._id !== group._id && groupUsesImages(g)).sort(byPosition);

  const submit = async () => {
    try {
      const { hex, ...rest } = draft;
      await save({ id: option._id, body: { ...rest, ...(isColour ? { hex } : {}) } }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved to Shopify and the builder.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err) });
    }
  };

  const destroy = async () => {
    if (!window.confirm(`Delete "${option.label}"? It is removed from every garment. Saved designs keep their copy.`)) return;
    try {
      await remove(option._id).unwrap();
      onDone();
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col gap-4 border-t border-[#eee8de] p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={draft.label} onChange={(v) => set('label', v)} />
        <PriceField label="Adds to price" paise={draft.priceModifier} onChange={(v) => set('priceModifier', v)} />
        <TextField label="Description" value={draft.description} onChange={(v) => set('description', v)} multiline rows={2} className="sm:col-span-2" />
        {isColour && (
          <Field label="Colour">
            {(id) => (
              <div className="flex items-center gap-2">
                <input
                  id={id}
                  type="color"
                  value={draft.hex || '#ffffff'}
                  onChange={(e) => set('hex', e.target.value)}
                  className="h-9.5 w-14 rounded border border-[#d8d2c8]"
                />
                <span className="text-sm text-[#666]">{draft.hex || 'none'}</span>
              </div>
            )}
          </Field>
        )}
        <TextField
          label="Display order"
          type="number"
          value={String(draft.position)}
          onChange={(v) => set('position', Number.parseInt(v || '0', 10) || 0)}
        />
        <div className="flex items-end sm:col-span-2">
          <Toggle checked={draft.isActive} onChange={(v) => set('isActive', v)} label="Visible to customers" />
        </div>
      </div>

      {otherGroups.length > 0 && (
        <Field
          label="Only offer with"
          hint="Nothing ticked = goes with everything. Example: an embroidery that only suits some necklines."
        >
          {() => (
            <div className="flex flex-col gap-2">
              {otherGroups.map((g) => {
                const choices = catalog.options.filter((o) => o.groupId === g._id && o.isActive).sort(byPosition);
                const picked = choices.filter((o) => draft.pairsWith.includes(o._id)).length;
                if (!choices.length) return null;
                return (
                  <details key={g._id} open={picked > 0} className="rounded border border-[#eee8de] px-3 py-2">
                    <summary className="cursor-pointer text-sm text-dark">
                      {g.label} {picked > 0 && <Badge tone="warn">{picked} ticked</Badge>}
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {choices.map((o) => {
                        const on = draft.pairsWith.includes(o._id);
                        return (
                          <button
                            key={o._id}
                            type="button"
                            onClick={() =>
                              set('pairsWith', on ? draft.pairsWith.filter((id) => id !== o._id) : [...draft.pairsWith, o._id])
                            }
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs transition',
                              on ? 'border-secondary bg-secondary text-white' : 'border-[#d8d2c8] bg-white text-[#444] hover:border-secondary'
                            )}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </Field>
      )}

      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="danger" onClick={destroy} loading={removing}>
          <Trash2 className="size-4" /> Delete
        </Button>
        <Button onClick={submit} loading={saving} disabled={!draft.label.trim()}>
          Save option
        </Button>
      </div>
    </div>
  );
}

