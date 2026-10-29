'use client';

/**
 * A form built from the content's own shape, so any section in pagedata.tsx
 * or footerData.tsx gets an editor without writing one by hand:
 *
 *   text           → input, or textarea when long
 *   image path/url → picture with upload (to Shopify Files)
 *   list           → items with add / remove / reorder
 *   object         → its fields, grouped
 */

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Button, ImageSlot, inputClass, TextField, Toggle } from '../ui';
import AiWriter from './AiWriter';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov)(\?|$)/i;
const IMAGE_KEYS = new Set(['image', 'src', 'poster', 'logo']);

const LABELS: Record<string, string> = {
  cta: 'Button',
  button: 'Button',
  link: 'Link',
  href: 'Link',
  src: 'Image',
  alt: 'Image description (for screen readers)',
  video: 'Background video',
  poster: 'Picture shown while the video loads',
  items: 'Cards',
  types: 'Tags',
  lists: 'Columns',
  links: 'Links',
};

export const humanize = (key: string) =>
  LABELS[key] ??
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

const isImageField = (key: string, value: string, parentKey?: string) => {
  if (parentKey === 'video' && key === 'src') return false;
  if (VIDEO_EXT.test(value)) return false;
  return IMAGE_EXT.test(value) || value.includes('cdn.shopify.com') || (value === '' && IMAGE_KEYS.has(key));
};

const isImageList = (key: string, list: Json[]) =>
  list.every((v) => typeof v === 'string') &&
  (/images?$/i.test(key) || (list.length > 0 && list.every((v) => isImageField('image', v as string))));

/** Same shape, empty values — what "Add" appends to a list. */
const blankLike = (value: Json): Json => {
  if (typeof value === 'string') return '';
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankLike(v)]));
  return null;
};

export function ContentField({
  name,
  value,
  onChange,
  parentKey,
  template,
}: {
  name: string;
  value: Json;
  onChange: (value: Json) => void;
  parentKey?: string;
  /** Default value for this field — shapes new list items when the list is empty. */
  template?: Json;
}) {
  const label = humanize(name);

  if (typeof value === 'string') {
    if (isImageField(name, value, parentKey)) return <ImageField label={label} value={value} onChange={onChange} />;
    const long = value.length > 90 || name === 'description';
    /* Words customers read get the AI helper; links and addresses don't. */
    const isWords = !['link', 'href', 'src', 'video'].includes(name) && !/^(https?:|\/|mailto:|tel:)/.test(value);
    const field = (
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        multiline={long}
        rows={long ? 4 : undefined}
        hint={
          value.includes('<br') ? 'Write <br/> where the line should break.' : name === 'link' || name === 'href' ? 'A page on this site (/products) or a full address.' : undefined
        }
      />
    );
    if (!isWords) return field;
    return (
      <div className="relative">
        {/* Sits on the label row, at the right. */}
        <AiWriter
          className="absolute -top-1 right-0 z-10"
          value={value}
          onApply={onChange}
          field={[parentKey && humanize(parentKey), label].filter(Boolean).join(' › ')}
        />
        {field}
      </div>
    );
  }

  if (typeof value === 'number') {
    return <TextField label={label} type="number" value={String(value)} onChange={(v) => onChange(Number(v) || 0)} />;
  }

  if (typeof value === 'boolean') return <Toggle label={label} checked={value} onChange={onChange} />;

  if (Array.isArray(value)) {
    const itemTemplate = (Array.isArray(template) ? template[0] : undefined) ?? value[0];
    return (
      <ListField name={name} list={value} onChange={onChange} itemTemplate={itemTemplate ?? ''} />
    );
  }

  if (value && typeof value === 'object') {
    const templateObj = template && typeof template === 'object' && !Array.isArray(template) ? template : undefined;
    return (
      <fieldset className="flex flex-col gap-4 rounded-md border border-[#eee8de] p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[#666]">{label}</legend>
        <ObjectFields value={value} onChange={onChange} parentKey={name} template={templateObj} />
      </fieldset>
    );
  }

  return null;
}

export function ObjectFields({
  value,
  onChange,
  parentKey,
  template,
}: {
  value: { [key: string]: Json };
  onChange: (value: Json) => void;
  parentKey?: string;
  template?: { [key: string]: Json };
}) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(value).map(([key, child]) => (
        <ContentField
          key={key}
          name={key}
          value={child}
          parentKey={parentKey}
          template={template?.[key]}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [upload] = useUploadImageMutation();
  return (
    <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-start">
      <ImageSlot
        label={label}
        url={value || undefined}
        aspect="aspect-[4/3]"
        onUpload={async (file) => onChange((await upload(file).unwrap()).url)}
      />
      <div className="flex flex-col gap-1.5 sm:pt-6">
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, 'text-xs')} aria-label={`${label} address`} />
        <p className="text-xs text-[#888]">Click the picture to upload a new one, or paste an image address.</p>
      </div>
    </div>
  );
}

function ListField({
  name,
  list,
  onChange,
  itemTemplate,
}: {
  name: string;
  list: Json[];
  onChange: (value: Json) => void;
  itemTemplate: Json;
}) {
  const [upload] = useUploadImageMutation();
  const label = humanize(name);

  const move = (index: number, by: -1 | 1) => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  const removeAt = (index: number) => onChange(list.filter((_, i) => i !== index));
  const setAt = (index: number, item: Json) => onChange(list.map((v, i) => (i === index ? item : v)));

  /* A plain list of pictures: a grid of tiles. */
  if (isImageList(name, list.length ? list : [itemTemplate])) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">{label}</span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {list.map((src, i) => (
            <div key={i} className="flex flex-col gap-1">
              <ImageSlot url={(src as string) || undefined} onUpload={async (file) => setAt(i, (await upload(file).unwrap()).url)} />
              <div className="flex justify-center gap-0.5">
                <IconButton label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="size-3.5 -rotate-90" />
                </IconButton>
                <IconButton label="Move right" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="size-3.5 -rotate-90" />
                </IconButton>
                <IconButton label="Remove" onClick={() => removeAt(i)} danger>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
          <ImageSlot onUpload={async (file) => onChange([...list, (await upload(file).unwrap()).url])} />
        </div>
      </div>
    );
  }

  /* A plain list of words (tags). */
  if (typeof itemTemplate === 'string') {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">{label}</span>
        {list.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item as string} onChange={(e) => setAt(i, e.target.value)} className={inputClass} aria-label={`${label} ${i + 1}`} />
            <IconButton label="Remove" onClick={() => removeAt(i)} danger>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
        <div>
          <Button variant="outline" onClick={() => onChange([...list, ''])}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </div>
    );
  }

  /* A list of cards, links, or rows of pictures. */
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">{label}</span>
      {list.map((item, i) => (
        <div key={i} className="rounded-md border border-[#eee8de] bg-[#fcfbf8]">
          <div className="flex items-center justify-between border-b border-[#eee8de] px-3 py-1.5">
            <span className="text-xs font-medium text-[#666]">
              {Array.isArray(item) ? 'Row' : 'Item'} {i + 1}
            </span>
            <div className="flex gap-0.5">
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton label="Remove" onClick={() => removeAt(i)} danger>
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          </div>
          <div className="p-3">
            {Array.isArray(item) ? (
              <ListField name={name} list={item} onChange={(next) => setAt(i, next)} itemTemplate={item[0] ?? ''} />
            ) : item && typeof item === 'object' ? (
              <ObjectFields
                value={item}
                onChange={(next) => setAt(i, next)}
                parentKey={name}
                template={itemTemplate && typeof itemTemplate === 'object' && !Array.isArray(itemTemplate) ? itemTemplate : undefined}
              />
            ) : (
              <ContentField name={name} value={item} onChange={(next) => setAt(i, next)} />
            )}
          </div>
        </div>
      ))}
      <div>
        <Button variant="outline" onClick={() => onChange([...list, blankLike(itemTemplate)])}>
          <Plus className="size-4" /> Add {Array.isArray(itemTemplate) ? 'row' : 'item'}
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded p-1 text-[#777] transition hover:bg-[#f1ece4] disabled:opacity-30',
        danger && 'hover:bg-red-50 hover:text-red-700'
      )}
    >
      {children}
    </button>
  );
}

export type { Json };
