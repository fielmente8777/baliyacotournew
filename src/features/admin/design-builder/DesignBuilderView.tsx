'use client';

import { useState } from 'react';
import { ImageOff, Plus, RefreshCw } from 'lucide-react';

import {
  adminErrorMessage,
  useCreateGarmentMutation,
  useGetCatalogQuery,
  useSyncCatalogMutation,
  useUploadCatalogImageMutation,
} from '@/store/api/adminApi';
import { cn, formatINR } from '@/lib/format';
import { Badge, Button, Card, ImageSlot, NoticeBar, PageTitle, PriceField, TextField, type Notice } from '../ui';
import BulkImportPanel from './BulkImportPanel';
import BulkPictureDrop from './BulkPictureDrop';
import GarmentEditor from './GarmentEditor';
import OptionGroupsPanel from './OptionGroupsPanel';
import { byPosition, garmentKey, groupMissingImages, type MissingGroup } from './catalogKeys';

type Tab = 'garments' | 'steps' | 'missing' | 'import';

export default function DesignBuilderView() {
  const { data: catalog, isLoading, error, refetch, isFetching } = useGetCatalogQuery();
  const [sync, { isLoading: syncing }] = useSyncCatalogMutation();
  const [tab, setTab] = useState<Tab>('garments');
  const [garmentId, setGarmentId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  if (isLoading) return <p className="text-sm text-[#888]">Loading the design catalogue…</p>;
  if (error || !catalog) {
    return (
      <div className="flex flex-col items-start gap-3">
        <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load the design catalogue') }} />
        <Button variant="outline" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  const garments = [...catalog.garments].sort(byPosition);
  const selected = garments.find((g) => g._id === garmentId) ?? garments[0];
  const missingGroups = groupMissingImages(catalog);
  const missing = missingGroups.flatMap((g) => g.items);

  const pull = async () => {
    setNotice(null);
    try {
      const s = await sync().unwrap();
      setNotice({
        tone: 'ok',
        text: `Pulled from Shopify: ${s.garments} garments, ${s.groups} steps, ${s.optionsUpdated} options updated, ${s.optionsCreated} new.`,
      });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not pull from Shopify') });
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'garments', label: 'Garments', count: garments.length },
    { id: 'steps', label: 'Steps & options', count: catalog.groups.length },
    { id: 'missing', label: 'Missing pictures', count: missing.length },
    { id: 'import', label: 'Bulk import' },
  ];

  return (
    <div>
      <PageTitle
        title="Design Builder"
        description="Everything customers see in “Create your own design”. Names, prices, pictures and visibility are saved to Shopify too, so the two always match."
        actions={
          <Button variant="outline" onClick={pull} loading={syncing || isFetching}>
            <RefreshCw className="size-4" /> Pull edits made in Shopify
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        {catalog.shopifyError && (
          <NoticeBar
            notice={{
              tone: 'error',
              text: `Shopify could not be reached (${catalog.shopifyError}). Pictures shown are from the last sync, and saving may fail.`,
            }}
          />
        )}
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e6e0d6]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition',
              tab === t.id ? 'border-secondary font-medium text-secondary' : 'border-transparent text-[#666] hover:text-dark'
            )}
          >
            {t.label}
            {t.count !== undefined && <Badge tone={t.id === 'missing' && t.count > 0 ? 'warn' : 'neutral'}>{t.count}</Badge>}
          </button>
        ))}
      </div>

      {tab === 'garments' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {garments.map((g) => {
              const image = catalog.images[garmentKey(g)];
              return (
                <button
                  key={g._id}
                  type="button"
                  onClick={() => setGarmentId(g._id)}
                  className={cn(
                    'overflow-hidden rounded-lg border bg-white text-left transition',
                    selected?._id === g._id ? 'border-secondary ring-2 ring-secondary/20' : 'border-[#e6e0d6] hover:border-secondary/50'
                  )}
                >
                  <div className="relative aspect-4/3 bg-[#faf8f4]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Shopify CDN thumbnail
                      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-amber-700">
                        <ImageOff className="size-5" />
                      </span>
                    )}
                    {!g.isActive && (
                      <span className="absolute left-2 top-2">
                        <Badge tone="off">Hidden</Badge>
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-sm font-medium text-dark">{g.name}</p>
                    <p className="text-xs text-[#888]">
                      from {formatINR(g.basePrice / 100)} · {g.optionConfigs?.length ?? 0} steps
                    </p>
                  </div>
                </button>
              );
            })}
            <NewGarmentTile onCreated={setGarmentId} />
          </div>

          {selected && <GarmentEditor key={selected._id} garment={selected} catalog={catalog} />}
        </div>
      )}

      {tab === 'steps' && <OptionGroupsPanel catalog={catalog} />}

      {tab === 'missing' && <MissingPictures groups={missingGroups} />}

      {tab === 'import' && <BulkImportPanel />}
    </div>
  );
}

function NewGarmentTile({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [create, { isLoading, error }] = useCreateGarmentMutation();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cfc6b8] text-sm text-[#666] transition hover:border-secondary hover:text-secondary"
      >
        <Plus className="size-5" /> New garment
      </button>
    );
  }

  const submit = async () => {
    try {
      /* Collection can be changed in the editor once created. */
      const created = await create({ name: name.trim(), basePrice: price, family: 'indian', isActive: false }).unwrap();
      onCreated(created._id);
      setOpen(false);
      setName('');
      setPrice(0);
    } catch {
      /* Shown below. */
    }
  };

  return (
    <div className="col-span-2 flex flex-col gap-3 rounded-lg border border-[#e6e0d6] bg-white p-4">
      <TextField label="Garment name" value={name} onChange={setName} placeholder="e.g. Saree" />
      <PriceField label="Starting price" paise={price} onChange={setPrice} />
      <p className="text-xs text-[#888]">Created hidden. Add its steps and pictures, then switch it to visible.</p>
      {error && <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error) }} />}
      <div className="flex gap-2">
        <Button onClick={submit} loading={isLoading} disabled={name.trim().length < 2}>
          Create
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/**
 * Every missing picture, grouped by the part it belongs to — garment cards,
 * garment previews, then each step (Fabric, Neck, Dupatta…) — so it's clear
 * what each one is for. Chips at the top jump to a group. A tile disappears
 * from here as soon as its picture is uploaded.
 */
function MissingPictures({ groups }: { groups: MissingGroup[] }) {
  const [uploadImage] = useUploadCatalogImageMutation();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  if (!total) {
    return (
      <Card>
        <p className="text-sm text-emerald-800">Every visible garment and option has a picture.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title={`${total} pictures missing in ${groups.length} ${groups.length === 1 ? 'part' : 'parts'}`}>
        <p className="mb-3 text-sm text-[#777]">
          Customers see a blank tile for these. Drop many pictures below at once, or drag one onto its tile (or click the
          tile) further down.
        </p>
        <BulkPictureDrop items={groups.flatMap((g) => g.items)} />
        <nav aria-label="Parts with missing pictures" className="mt-4 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#missing-${g.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white pl-3.5 pr-2 text-sm text-dark transition hover:border-secondary hover:text-secondary"
            >
              {g.title}
              <Badge tone="warn">{g.items.length}</Badge>
            </a>
          ))}
        </nav>
      </Card>

      {groups.map((g) => (
        <section key={g.id} id={`missing-${g.id}`} className="scroll-mt-4">
          <Card
            title={
              <span className="flex items-center gap-2">
                {g.title}
                <Badge tone="warn">
                  {g.items.length} missing
                </Badge>
              </span>
            }
          >
            <p className="mb-4 text-xs text-[#888]">{g.hint}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {g.items.map((m) => (
                <div key={m.key} className="flex flex-col gap-1.5">
                  <ImageSlot onUpload={(file) => uploadImage({ key: m.key, file }).unwrap()} />
                  <p className="text-xs font-medium leading-snug text-dark">{m.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ))}
    </div>
  );
}
