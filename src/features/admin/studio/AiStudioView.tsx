'use client';

/**
 * AI Studio — turn the embroidery on a garment into named, reusable pieces.
 *
 *   1  Add the embroidery: garment photos (one AI image to extract it), or a
 *      clean embroidery image the admin already has (free).
 *   2  Check the pieces: the sheet is cut into pieces for free, and a small AI
 *      names each one and says where it sits — neckline, left shoulder, hem…
 *      The admin corrects anything wrong and approves.
 *   3  Try it on a plain garment: every approved piece is pasted at its
 *      measured spot (free preview), then one AI image blends it in.
 *
 * Pieces are stored once, with their position, and reused on every garment
 * and colour after that — nothing is extracted or positioned again, which is
 * what keeps the cost and the placement steady. Images live in Shopify Files.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, CloudAlert, CloudCheck, Download, ImagePlus, Layers, Pencil, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';

import type { EmbroideryAsset } from '@/@types/embroidery';
import { REGION_LABELS } from '@/@types/embroidery';
import {
  useApproveEmbroideryPieceMutation,
  useBuildPiecesMutation,
  useDeleteEmbroideryCollectionMutation,
  useExtractEmbroideryMutation,
  useGetEmbroideryCollectionsQuery,
  useGetExtractionsQuery,
  useGetEmbroideryPiecesQuery,
  useGetStudioRunQuery,
  useRenameEmbroideryCollectionMutation,
} from '@/store/api/adminStudioApi';
import { adminErrorMessage } from '@/store/api/adminApi';
import { MAX_UPLOAD_BYTES, base64Bytes, fileToResizedBase64 } from '@/lib/imageResize';
import { downloadImage } from '@/lib/downloadImage';
import { cn } from '@/lib/format';
import { Badge, Button, Card, NoticeBar, PageTitle, TextField, type Notice } from '../ui';
import PhotoSlots, { PHOTO_SLOTS, type SlotKey, type SlotPhoto } from './PhotoSlots';
import PieceCard from './PieceCard';
import PositionMap, { zonesFor, type ZoneId } from './PositionMap';
import TryOnPanel from './TryOnPanel';
import UploadTile from './UploadTile';

type Source = 'photos' | 'sheet';

/** Small copies of the photos for the AI that names the pieces. */
const SMALL = 640;

function StepHeading({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
          done ? 'bg-emerald-600 text-white' : 'bg-secondary text-white'
        )}
      >
        {done ? <Check className="size-3.5" aria-hidden /> : n}
      </span>
      {title}
    </span>
  );
}

/**
 * Where an image is kept, read from its address: Shopify's CDN means Shopify
 * Files. Anything else means the Shopify upload failed and the server kept
 * its own copy — which a redeploy on Render wipes.
 */
function StoredIn({ url }: { url?: string }) {
  if (!url) return null;
  const inShopify = url.includes('cdn.shopify.com');
  return (
    <span
      title={url}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        inShopify ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
      )}
    >
      {inShopify ? <CloudCheck className="size-3.5" aria-hidden /> : <CloudAlert className="size-3.5" aria-hidden />}
      {inShopify ? 'Saved in Shopify Files' : 'Only on the server — Shopify upload failed'}
    </span>
  );
}

/** The how-to, folded away once there's saved embroidery to work with. */
function StudioGuide({ open }: { open: boolean }) {
  const steps = [
    ['Name it and add photos', 'Type a name (e.g. "Zari Work"), then add photos of the embroidered garment: front, neckline and hem are enough for most suits. Or upload a clean embroidery image you already have (free).'],
    ['Extract', 'One AI image pulls the embroidery off the garment. When it finishes, the pieces are cut out, named and saved automatically under your name, with their images in Shopify Files.'],
    ['Check the pieces', 'Each piece has a name, a position (neckline, shoulder, hem…) and a side. Fix anything wrong, delete fabric or noise, and approve the good ones. Only approved pieces are ever placed.'],
    ['Try it on', 'Upload a plain garment. "Preview placement" (free) pastes every approved piece where it will go. "Generate try-on" blends it in with one AI image.'],
    ['Testing only, for now', 'AI Studio is not connected to the website yet: nothing here appears in the Design Builder or to customers until that is decided with the client.'],
  ];
  const faq = [
    ['Is it saved?', 'Yes. Once the pieces are found, the embroidery appears under "Saved embroidery" at the top. The badge on each image says whether it is in Shopify Files.'],
    ['A piece is missing', 'Open the embroidery, then use "Add a missing piece" and upload a clean image of just that piece on white. It joins the same embroidery, and the AI names it.'],
    ['A piece is wrong or empty', 'Change its position or side, or delete it with the bin icon. Deleting can\'t be undone, but you can add it again from an image.'],
    ['The whole extraction is poor', 'Start "New embroidery" with clearer, closer photos and extract again. Old embroidery can be deleted from its page.'],
    ['Is the plain garment saved?', 'No, it is only used for that try-on. The try-on results are saved, and you can download them.'],
  ];

  return (
    <details open={open} className="group mb-5 rounded-lg border border-[#e6e0d6] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-dark [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <CircleHelp className="size-4 text-secondary" aria-hidden /> How AI Studio works
        </span>
        <span className="text-xs font-normal text-[#888] group-open:hidden">Show</span>
        <span className="hidden text-xs font-normal text-[#888] group-open:inline">Hide</span>
      </summary>
      <div className="grid gap-6 border-t border-[#eee8de] px-5 py-5 lg:grid-cols-2">
        <ol className="space-y-3">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">{i + 1}</span>
              <span className="text-sm">
                <span className="font-semibold text-dark">{title}.</span> <span className="text-[#555]">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <dl className="space-y-3 rounded-md bg-[#faf8f4] p-4">
          {faq.map(([q, a]) => (
            <div key={q} className="text-sm">
              <dt className="font-semibold text-dark">{q}</dt>
              <dd className="mt-0.5 text-[#555]">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

export default function AiStudioView() {
  const [notice, setNotice] = useState<Notice>(null);
  const fail = (text: string) => setNotice({ tone: 'error', text });

  /* ---- Step 1 state ---- */
  const [collectionName, setCollectionName] = useState('');
  const [source, setSource] = useState<Source>('photos');
  const [photos, setPhotos] = useState<Partial<Record<SlotKey, SlotPhoto>>>({});
  const [sheet, setSheet] = useState<{ preview: string; base64: string } | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  /* ---- Step 2 state ---- */
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [focused, setFocused] = useState<EmbroideryAsset | null>(null);

  const [extract, { isLoading: extracting }] = useExtractEmbroideryMutation();
  const [build, { isLoading: building }] = useBuildPiecesMutation();
  const [approve] = useApproveEmbroideryPieceMutation();
  const [rename] = useRenameEmbroideryCollectionMutation();
  const [deleteCollection] = useDeleteEmbroideryCollectionMutation();

  const { data: collections = [] } = useGetEmbroideryCollectionsQuery();
  const { data: extractions = [] } = useGetExtractionsQuery();
  const unsaved = extractions.filter((x) => !x.savedAs);
  const { data: pieces = [], isFetching: loadingPieces } = useGetEmbroideryPiecesQuery(
    { collectionId: collectionId ?? '' },
    { skip: !collectionId }
  );
  const { data: jobs = [] } = useGetStudioRunQuery(runId ?? '', {
    skip: !runId,
    pollingInterval: 4000,
    skipPollingIfUnfocused: true,
  });

  const extractJob = [...jobs].reverse().find((j) => j.stage === 'extract');
  const sheetUrl = extractJob?.status === 'completed' ? extractJob.resultUrls[0] : undefined;
  const extractPending = extractJob?.status === 'pending';
  const photoCount = Object.keys(photos).length;
  const approved = pieces.filter((p) => p.isApproved);
  const active = collections.find((c) => c._id === collectionId);

  /* Every zone that has a piece, for the map beside the pieces. */
  const zones = useMemo(() => {
    const source = focused ? [focused] : pieces;
    return source.flatMap((p) => zonesFor(p.region, p.side)) as ZoneId[];
  }, [focused, pieces]);

  const addPhoto = async (key: SlotKey, file: File) => {
    try {
      const [base64, small] = await Promise.all([
        fileToResizedBase64(file),
        fileToResizedBase64(file, SMALL, { quality: 0.8 }),
      ]);
      setPhotos((current) => ({ ...current, [key]: { base64, small, preview: URL.createObjectURL(file) } }));
    } catch {
      fail('That photo could not be read. Export it as a JPEG and try again.');
    }
  };

  const references = () =>
    PHOTO_SLOTS.filter((s) => photos[s.key])
      .slice(0, 4)
      .map((s) => ({ image: photos[s.key]!.small, label: s.label }));

  const runExtract = async () => {
    setNotice(null);
    /* The name is what the pieces are saved under — needed up front, since
       they're saved automatically as soon as the extraction finishes. */
    if (!collectionName.trim()) return fail('Give this embroidery a name first, e.g. "Zari Work".');
    const views = PHOTO_SLOTS.filter((s) => photos[s.key]).map((s) => ({ image: photos[s.key]!.base64, label: s.label }));
    const total = views.reduce((sum, v) => sum + base64Bytes(v.image), 0);
    if (total > MAX_UPLOAD_BYTES) {
      return fail(`These photos add up to ${(total / 1024 / 1024).toFixed(1)} MB — the limit is 9 MB. Remove a photo or use smaller ones.`);
    }
    try {
      const job = await extract({ views, runId: runId ?? undefined }).unwrap();
      setRunId(job.runId);
    } catch (err) {
      fail(adminErrorMessage(err, 'Extraction failed. Please try again.'));
    }
  };

  const findPieces = async () => {
    setNotice(null);
    const name = collectionName.trim();
    if (!name) return fail('Give this embroidery a name first, e.g. "Zari Work".');
    try {
      const result = await build(
        source === 'sheet'
          ? { sheetImage: sheet!.base64, collectionName: name }
          : { jobId: extractJob!._id, collectionName: name, references: references() }
      ).unwrap();
      setCollectionId(result.collectionId);
      const named = result.assets.filter((a) => a.aiLabelled).length;
      setNotice({
        tone: 'ok',
        text: `${result.assets.length} piece${result.assets.length === 1 ? '' : 's'} found${named ? `, ${named} named by AI` : ''}. Check each one and approve it.`,
      });
      if (result.colourWarning) fail(result.colourWarning);
    } catch (err) {
      fail(adminErrorMessage(err, 'Could not find pieces in that image.'));
    }
  };

  /* As soon as an extraction finishes, find, name and save its pieces — no
     extra click, so a finished extraction is never left unsaved. Once per
     extraction; "Find & name the pieces" stays as the manual retry. */
  const autoBuilt = useRef(new Set<string>());
  const extractJobId = extractJob?._id;
  useEffect(() => {
    if (!sheetUrl || !extractJobId || collectionId || building || source !== 'photos' || !collectionName.trim()) return;
    if (autoBuilt.current.has(extractJobId)) return;
    autoBuilt.current.add(extractJobId);
    queueMicrotask(() => void findPieces());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the extraction finishes
  }, [sheetUrl, extractJobId]);

  /** Adds one clean embroidery image to the open collection. */
  const addPiece = async (file: File) => {
    if (!collectionId) return;
    setNotice(null);
    try {
      const result = await build({
        sheetImage: await fileToResizedBase64(file, 2048, { format: 'image/png' }),
        collectionName: active?.collectionName ?? (collectionName.trim() || 'Embroidery'),
        collectionId,
      }).unwrap();
      setNotice({
        tone: 'ok',
        text: `${result.assets.length} piece${result.assets.length === 1 ? '' : 's'} added. Check the position and approve it.`,
      });
    } catch (err) {
      fail(adminErrorMessage(err, 'Could not add that image. Use embroidery on a plain white background.'));
    }
  };

  const startNew = () => {
    setCollectionId(null);
    setCollectionName('');
    setPhotos({});
    setSheet(null);
    setRunId(null);
    setNotice(null);
  };

  const openCollection = (id: string, name: string) => {
    setCollectionId(id);
    setCollectionName(name);
    setNotice(null);
  };

  const approveAll = async () => {
    try {
      await Promise.all(pieces.filter((p) => !p.isApproved).map((p) => approve({ id: p._id, isApproved: true }).unwrap()));
    } catch (err) {
      fail(adminErrorMessage(err, 'Could not approve every piece'));
    }
  };

  const canFind = source === 'sheet' ? Boolean(sheet) : Boolean(sheetUrl);

  return (
    <div className="max-w-6xl">
      <PageTitle
        title="AI Studio"
        description="Turn the embroidery on a garment into named pieces — neckline, shoulder, hem — that are placed in the same spot on every garment. Extract once, reuse forever."
        actions={
          collectionId || photoCount || sheet ? (
            <Button variant="outline" onClick={startNew}>
              <Plus className="size-4" aria-hidden /> New embroidery
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      </div>

      <StudioGuide open={collections.length === 0} />

      {/* ---- Library ------------------------------------------------- */}
      {collections.length > 0 && (
        <Card className="mb-5" title={<span className="flex items-center gap-2"><Layers className="size-4" aria-hidden /> Saved embroidery</span>}>
          <div className="scrollbar-brand -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {collections.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => openCollection(c._id, c.collectionName)}
                className={cn(
                  'flex w-44 shrink-0 items-center gap-3 rounded-lg border p-2 text-left transition',
                  c._id === collectionId ? 'border-secondary bg-secondary/5' : 'border-[#e6e0d6] hover:border-secondary/40'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Shopify CDN thumbnail */}
                <img src={c.thumbnailUrl} alt="" className="size-11 shrink-0 rounded-md bg-[#f1ece4] object-contain" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-dark">{c.collectionName}</span>
                  <span className="text-xs text-[#888]">
                    {c.approvedCount}/{c.assetCount} approved
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ---- Paid extractions whose pieces were never saved ----------- */}
      {!collectionId && unsaved.length > 0 && (
        <Card
          className="mb-5"
          title={<span className="flex items-center gap-2"><CloudAlert className="size-4 text-amber-600" aria-hidden /> Extractions not saved yet</span>}
        >
          <p className="mb-3 text-sm text-[#666]">
            These finished, but their pieces were never saved (for example, the page was reloaded). Type a name in step 1,
            then open one: it saves straight away. No new AI image is used.
          </p>
          <div className="scrollbar-brand -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {unsaved.map((x) => (
              <div key={x._id} className="flex w-40 shrink-0 flex-col gap-2 rounded-lg border border-[#e6e0d6] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- extracted sheet */}
                <img src={x.sheetUrl} alt="" className="aspect-3/4 w-full rounded-md bg-white object-contain" />
                <span className="text-[11px] text-[#888]">
                  {new Date(x.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                </span>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSource('photos');
                    setRunId(x.runId);
                    if (!collectionName.trim()) fail('Type a name for this embroidery in step 1, then press "Find & name the pieces".');
                  }}
                >
                  Open &amp; save
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ---- Step 1 -------------------------------------------------- */}
      {!collectionId && (
        <Card className="mb-5" title={<StepHeading n={1} title="Add the embroidery" />}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex flex-col gap-5">
              <TextField
                label="Name of this embroidery"
                value={collectionName}
                onChange={setCollectionName}
                placeholder="e.g. Zari Work, Mirror Work Anarkali"
                hint="Shown in the Design Builder when you link it to an Embroidery option."
              />

              <div role="radiogroup" aria-label="Where the embroidery comes from" className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ['photos', 'From garment photos', 'The AI pulls the embroidery off the garment. 1 AI image.'],
                    ['sheet', 'I have a clean embroidery image', 'Embroidery already on a plain white background. Free.'],
                  ] as const
                ).map(([value, title, text]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={source === value}
                    onClick={() => setSource(value)}
                    className={cn(
                      'rounded-lg border-2 p-3 text-left transition',
                      source === value ? 'border-secondary bg-secondary/5' : 'border-[#e6e0d6] hover:border-secondary/40'
                    )}
                  >
                    <span className="block text-sm font-medium text-dark">{title}</span>
                    <span className="mt-0.5 block text-xs text-[#777]">{text}</span>
                  </button>
                ))}
              </div>

              {source === 'photos' ? (
                <>
                  <div>
                    <p className="mb-1 text-sm font-medium text-dark">Photos of the embroidered garment</p>
                    <p className="mb-3 text-xs text-[#777]">
                      Each box shows what that photo should cover. Front + neckline + hem is enough for most suits; add the
                      sleeves or back only if they have their own work.
                    </p>
                    <PhotoSlots
                      photos={photos}
                      disabled={extracting || extractPending}
                      onAdd={addPhoto}
                      onRemove={(key) =>
                        setPhotos((current) => {
                          const next = { ...current };
                          delete next[key];
                          return next;
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={runExtract} loading={extracting} disabled={!photoCount || extractPending}>
                      <Wand2 className="size-4" aria-hidden />
                      {extractJob ? 'Extract again' : 'Extract embroidery'}
                    </Button>
                    <span className="text-xs text-[#888]">One AI image · usually under 2 minutes</span>
                  </div>

                  {extractJob && (
                    <div className="grid gap-4 rounded-lg bg-[#faf8f4] p-4 sm:grid-cols-[200px_minmax(0,1fr)]">
                      <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-md border border-[#e6e0d6] bg-white">
                        {sheetUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- Shopify CDN result
                          <img src={sheetUrl} alt="Extracted embroidery" className="size-full object-contain" />
                        ) : (
                          <span className="px-4 text-center text-xs text-[#888]">
                            {extractJob.status === 'failed' ? (
                              <span className="text-red-700">{extractJob.error ?? 'Extraction failed — try clearer photos'}</span>
                            ) : (
                              'Extracting… usually under 2 minutes'
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center gap-3 text-sm text-[#555]">
                        {sheetUrl ? (
                          <>
                            <StoredIn url={sheetUrl} />
                            <p>
                              {building ? (
                                <>
                                  Cutting it into pieces, naming each one and saving them as{' '}
                                  <b className="text-dark">&ldquo;{collectionName.trim()}&rdquo;</b>…
                                </>
                              ) : (
                                <>
                                  The embroidery is off the garment. The pieces are cut out, named and saved as{' '}
                                  <b className="text-dark">&ldquo;{collectionName.trim() || 'your embroidery'}&rdquo;</b>{' '}
                                  automatically. If that didn&apos;t start, use the button below.
                                </>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={findPieces} loading={building} disabled={!canFind}>
                                <Sparkles className="size-4" aria-hidden /> Find &amp; name the pieces
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => downloadImage(sheetUrl, 'embroidery-sheet.png').catch(() => fail('Download failed'))}
                              >
                                <Download className="size-4" aria-hidden /> Download
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p>Hang on — the result appears here on its own.</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <UploadTile
                    label="Clean embroidery image"
                    hint="PNG or JPG, embroidery on plain white"
                    preview={sheet?.preview ?? null}
                    onFile={async (file) => {
                      try {
                        setSheet({ base64: await fileToResizedBase64(file, 2048, { format: 'image/png' }), preview: URL.createObjectURL(file) });
                      } catch {
                        fail('That image could not be read.');
                      }
                    }}
                    onClear={() => setSheet(null)}
                  />
                  <div className="text-sm text-[#555]">
                    <p className="font-medium text-dark">What a good image looks like</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
                      <li>Only embroidery, on a plain white background — no fabric behind it.</li>
                      <li>Each piece separate, with white space around it.</li>
                      <li>Laid out like the garment: neck at the top, shoulders in the top corners, sleeves at the sides, borders along the bottom.</li>
                      <li>One of each buti is enough — they&apos;re scattered automatically.</li>
                    </ul>
                    <Button className="mt-4" onClick={findPieces} loading={building} disabled={!canFind}>
                      <Sparkles className="size-4" aria-hidden /> Find &amp; name the pieces
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* The legend: every position, named. */}
            <aside className="hidden rounded-lg bg-[#faf8f4] p-4 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#666]">Positions</p>
              <PositionMap muted showLabels className="mt-2" />
              <p className="mt-2 text-[11px] leading-snug text-[#888]">
                Left and right are as seen in the photo. Pieces on both sides are stored once and mirrored.
              </p>
            </aside>
          </div>

          {source === 'photos' && (
            <div className="mt-5 grid gap-2 border-t border-[#eee8de] pt-4 text-xs text-[#666] sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Plain background, daylight or soft light — no flash glare on zari.',
                'Garment flat or on a mannequin, straight on, nothing cropped.',
                'Close-ups sharp enough to see individual stitches.',
                'One garment per photo — all photos of the same suit.',
              ].map((tip) => (
                <p key={tip} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden /> {tip}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---- Step 2 -------------------------------------------------- */}
      {collectionId && (
        <Card
          className="mb-5"
          title={<StepHeading n={2} title={`Check the pieces — ${active?.collectionName ?? collectionName}`} done={pieces.length > 0 && approved.length === pieces.length} />}
          actions={
            <>
              <StoredIn url={pieces[0]?.assetUrl} />
              <Badge tone={approved.length ? 'ok' : 'warn'}>
                {approved.length}/{pieces.length} approved
              </Badge>
              {pieces.some((p) => !p.isApproved) && (
                <Button variant="outline" onClick={approveAll}>
                  <Check className="size-4" aria-hidden /> Approve all
                </Button>
              )}
              <Button
                variant="ghost"
                aria-label="Rename"
                onClick={() => {
                  const name = window.prompt('Rename this embroidery', active?.collectionName ?? collectionName)?.trim();
                  if (name) {
                    rename({ collectionId, collectionName: name })
                      .unwrap()
                      .then(() => setCollectionName(name))
                      .catch((err) => fail(adminErrorMessage(err, 'Could not rename')));
                  }
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                aria-label="Delete this embroidery"
                className="text-red-700"
                onClick={() => {
                  if (!window.confirm('Delete this embroidery and all its pieces?')) return;
                  deleteCollection(collectionId)
                    .unwrap()
                    .then(startNew)
                    .catch((err) => fail(adminErrorMessage(err, 'Could not delete')));
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <div className="mx-auto max-w-50 rounded-lg bg-[#faf8f4] p-3">
                <PositionMap highlight={zones} muted />
                <p className="mt-2 text-center text-xs text-[#666]">
                  {focused ? (
                    <>
                      <span className="font-medium text-dark">{focused.name}</span>
                      <br />
                      {REGION_LABELS[focused.region]}
                    </>
                  ) : (
                    'Where the pieces go. Hover a piece to see its spot.'
                  )}
                </p>
              </div>
              <p className="mt-3 text-[11px] leading-snug text-[#888]">
                Check the position and side of each piece — that is what decides where it lands on every garment.
                Wrong pieces (fabric, noise) can be deleted.
              </p>
            </aside>

            <div>
              {loadingPieces && pieces.length === 0 ? (
                <p className="text-sm text-[#888]">Loading pieces…</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pieces.map((piece) => (
                    <PieceCard key={piece._id} piece={piece} onFocus={setFocused} onError={fail} />
                  ))}

                  {/* One image at a time: a piece the extraction missed, or a
                      replacement for one that came out wrong. */}
                  <label
                    className={cn(
                      'flex min-h-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#d8cdbd] bg-[#fcfaf7] p-5 text-center transition hover:border-secondary/60',
                      building && 'pointer-events-none opacity-60'
                    )}
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
                      <ImagePlus className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-dark">{building ? 'Adding…' : 'Add a missing piece'}</span>
                    <span className="text-xs leading-snug text-[#888]">
                      Upload a clean image of the piece on a plain white background. The AI names it and finds its position.
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      disabled={building}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void addPiece(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ---- Step 3 -------------------------------------------------- */}
      {collectionId && (
        <Card title={<StepHeading n={3} title="Try it on a plain garment" />}>
          {approved.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#777]">
              <ArrowRight className="size-4" aria-hidden /> Approve at least one piece above to try it on.
            </p>
          ) : (
            <TryOnPanel approved={approved} sourcePhoto={photos.front?.base64 ?? null} onError={fail} />
          )}
          <p className="mt-5 border-t border-[#eee8de] pt-3 text-xs text-[#888]">
            Testing only: this embroidery is not shown on the website.
          </p>
        </Card>
      )}
    </div>
  );
}
