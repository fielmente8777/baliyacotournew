'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, ImagePlus, Loader2 } from 'lucide-react';

import { useUploadCatalogImageMutation } from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Button, IMAGE_ACCEPT, imageFileProblem, uploadErrorMessage } from '../ui';
import type { MissingImage } from './catalogKeys';

type Status = 'waiting' | 'uploading' | 'done' | 'error' | 'unmatched';

interface Row {
  id: number;
  file: File;
  key: string | null;
  status: Status;
  message?: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Every name a file for this picture might have: the key itself
 * ("option-neck-round-neck"), the key without "option" ("neck-round-neck",
 * the names in docs/client-kit/option-image-prompts.md), the step and option
 * names ("neck-type-round-neck"), or just the option ("round-neck").
 */
function namesFor(item: MissingImage) {
  const parts = item.key.split('/');
  return [
    slug(item.key),
    slug(parts.slice(1).join('-')),
    slug(`${item.group} ${item.name}`),
    slug(parts[parts.length - 1]),
    slug(item.name),
  ];
}

/** File name → key. Names that would fit more than one picture are dropped, so a file never lands on the wrong tile. */
function buildMatcher(items: MissingImage[]) {
  const owners = new Map<string, Set<string>>();
  for (const item of items) {
    for (const name of namesFor(item)) {
      if (!name) continue;
      if (!owners.has(name)) owners.set(name, new Set());
      owners.get(name)!.add(item.key);
    }
  }
  const find = (name: string) => {
    const keys = owners.get(name);
    return keys && keys.size === 1 ? [...keys][0] : null;
  };
  /* "neck-round-neck (1).jpg" and "…-1.jpg" from a download still match. */
  return (fileName: string) => {
    const name = slug(fileName);
    return find(name) ?? find(name.replace(/-\d+$/, ''));
  };
}

/**
 * Drop a whole folder's worth of pictures (or choose several) and each goes
 * to the tile its file name matches. Files that match nothing wait for a
 * choice from the list. Uploads run one at a time, so Shopify isn't flooded.
 */
export default function BulkPictureDrop({ items }: { items: MissingImage[] }) {
  const [uploadImage] = useUploadCatalogImageMutation();
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const queue = useRef(Promise.resolve());
  const [rows, setRows] = useState<Row[]>([]);
  const [over, setOver] = useState(false);

  const labels = new Map(items.map((i) => [i.key, i.label]));
  const [knownLabels, setKnownLabels] = useState(new Map<string, string>());
  const labelOf = (key: string) => labels.get(key) ?? knownLabels.get(key) ?? key;

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const upload = (row: Row) => {
    queue.current = queue.current.then(async () => {
      update(row.id, { status: 'uploading' });
      try {
        await uploadImage({ key: row.key!, file: row.file }).unwrap();
        update(row.id, { status: 'done' });
      } catch (err) {
        update(row.id, { status: 'error', message: uploadErrorMessage(err) });
      }
    });
  };

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const match = buildMatcher(items);
    /* Keys already queued or uploaded, so two files never fill one tile. */
    const taken = new Set(rows.filter((r) => r.key && r.status !== 'error').map((r) => r.key));
    setKnownLabels((m) => new Map([...m, ...labels]));

    const added: Row[] = [...files].map((file) => {
      const id = nextId.current++;
      const problem = imageFileProblem(file);
      if (problem) return { id, file, key: null, status: 'error', message: problem };
      const key = match(file.name);
      if (!key || taken.has(key)) {
        return { id, file, key: null, status: 'unmatched', message: key ? 'Another file already went to this picture' : undefined };
      }
      taken.add(key);
      return { id, file, key, status: 'waiting' };
    });

    setRows((rs) => [...added, ...rs]);
    added.filter((r) => r.status === 'waiting').forEach(upload);
  };

  const assign = (row: Row, key: string) => {
    const ready = { ...row, key, status: 'waiting' as const, message: undefined };
    update(row.id, ready);
    upload(ready);
  };

  const takenKeys = new Set(rows.filter((r) => r.key && r.status !== 'error').map((r) => r.key));
  const choices = items.filter((i) => !takenKeys.has(i.key));
  const done = rows.filter((r) => r.status === 'done').length;
  const working = rows.some((r) => r.status === 'waiting' || r.status === 'uploading');

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition',
          over ? 'border-secondary bg-secondary/5' : 'border-[#d8d2c8] bg-[#faf8f4]'
        )}
      >
        <ImagePlus className={cn('size-7', over ? 'text-secondary' : 'text-[#999]')} aria-hidden />
        <p className="text-sm font-medium text-dark">{over ? 'Drop to upload them all' : 'Drag pictures here, as many as you like'}</p>
        <p className="max-w-md text-xs text-[#888]">
          Each goes to the picture its file name matches, e.g. <code>neck-round-neck.jpg</code> or <code>Round Neck.jpg</code>.
          JPG, PNG or WEBP, under 5 MB.
        </p>
        <Button variant="outline" onClick={() => input.current?.click()} className="mt-1">
          Choose pictures
        </Button>
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {rows.length > 0 && (
        <div className="rounded-lg border border-[#e6e0d6] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#eee8de] px-3 py-2 text-xs text-[#666]">
            <span>
              {done} of {rows.length} uploaded{working && '…'}
            </span>
            {!working && (
              <button type="button" onClick={() => setRows([])} className="text-[#888] hover:text-dark">
                Clear list
              </button>
            )}
          </div>
          <ul className="max-h-72 divide-y divide-[#f1ece4] overflow-y-auto">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-sm">
                <StatusIcon status={row.status} />
                <span className="min-w-0 max-w-56 truncate text-[#555]" title={row.file.name}>
                  {row.file.name}
                </span>
                {row.key ? (
                  <span className="min-w-0 flex-1 truncate font-medium text-dark">→ {labelOf(row.key)}</span>
                ) : row.status === 'unmatched' ? (
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && assign(row, e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded-md border border-amber-300 bg-white px-2 text-sm text-dark focus:border-secondary focus:outline-none"
                    aria-label={`Where ${row.file.name} goes`}
                  >
                    <option value="">No match: choose where it goes…</option>
                    {choices.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="flex-1" />
                )}
                {row.message && <span className="w-full pl-7 text-xs text-red-700">{row.message}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'done') return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-label="Uploaded" />;
  if (status === 'uploading') return <Loader2 className="size-4 shrink-0 animate-spin text-secondary" aria-label="Uploading" />;
  if (status === 'waiting') return <Loader2 className="size-4 shrink-0 text-[#bbb]" aria-label="Waiting" />;
  return <CircleAlert className={cn('size-4 shrink-0', status === 'error' ? 'text-red-600' : 'text-amber-600')} aria-label="Needs attention" />;
}
