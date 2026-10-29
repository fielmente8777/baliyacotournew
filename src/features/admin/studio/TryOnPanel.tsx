'use client';

/**
 * Step 3: put the approved pieces on a plain garment.
 *
 * "Preview placement" is free and instant — it pastes every piece at its
 * measured spot, so a wrong position is caught before any money is spent.
 * "Generate" is one AI image per variation, and the AI only blends the
 * pieces into the fabric inside a mask; it cannot move them.
 *
 * With a photo of the finished source design, "Copy layout from the source"
 * has the AI read where every piece sits on it (one cheap vision call per
 * preview) instead of using each piece's region default. The layout the
 * preview shows is sent with Generate, so the paid image matches it exactly.
 */

import { useState } from 'react';
import { CheckCircle2, Download, Eye, Sparkles } from 'lucide-react';

import { ACCEPTABLE_CONFIDENCE, type EmbroideryAsset, type Landmarks, type PlannedPiece } from '@/@types/embroidery';
import {
  useDetectGarmentPointsMutation,
  useGetStudioRunQuery,
  usePreviewPlacementMutation,
  useTryOnEmbroideryMutation,
} from '@/store/api/adminStudioApi';
import { adminErrorMessage } from '@/store/api/adminApi';
import { fileToResizedBase64 } from '@/lib/imageResize';
import { downloadImage } from '@/lib/downloadImage';
import { cn } from '@/lib/format';
import { Button, inputClass } from '../ui';
import LandmarkMarker from './LandmarkMarker';
import UploadTile from './UploadTile';

export default function TryOnPanel({
  approved,
  sourcePhoto,
  onError,
}: {
  approved: EmbroideryAsset[];
  /** Front photo from step 1, when this session uploaded one. */
  sourcePhoto: string | null;
  onError: (message: string) => void;
}) {
  const [target, setTarget] = useState<{ preview: string; base64: string } | null>(null);
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [needsMarking, setNeedsMarking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [variations, setVariations] = useState(1);
  const [runId, setRunId] = useState<string | null>(null);
  /* An uploaded source photo wins over step 1's; null falls back to it. */
  const [ownSource, setOwnSource] = useState<{ preview: string; base64: string } | null>(null);
  const [copyLayout, setCopyLayout] = useState(true);
  const [plan, setPlan] = useState<{ key: string; pieces: PlannedPiece[] } | null>(null);

  const [detect, { isLoading: detecting }] = useDetectGarmentPointsMutation();
  const [renderPreview, { isLoading: previewing }] = usePreviewPlacementMutation();
  const [tryOn, { isLoading: sending }] = useTryOnEmbroideryMutation();

  const { data: jobs = [] } = useGetStudioRunQuery(runId ?? '', {
    skip: !runId,
    pollingInterval: 4000,
    skipPollingIfUnfocused: true,
  });
  const results = jobs.filter((j) => j.stage === 'apply');
  const assetIds = approved.map((a) => a._id);
  const reference = ownSource?.base64 ?? sourcePhoto;
  const fromSource = copyLayout && Boolean(reference);
  /* Reading a layout needs no landmarks: the AI finds the body on both photos. */
  const ready = Boolean(target) && approved.length > 0 && (fromSource || !(needsMarking && !landmarks));
  /* A plan only fits the garment, source and pieces it was read for. */
  const planKey = [target?.preview, reference?.length, reference?.slice(-32), assetIds.join(',')].join('|');
  const currentPlan = fromSource && plan?.key === planKey ? plan.pieces : undefined;

  const pickSource = async (file: File) => {
    try {
      const base64 = await fileToResizedBase64(file, 1536);
      setOwnSource({ base64, preview: URL.createObjectURL(file) });
      setPreview(null);
    } catch {
      onError('That image could not be read. Export it as a JPEG and try again.');
    }
  };

  const pickGarment = async (file: File) => {
    try {
      const base64 = await fileToResizedBase64(file);
      setTarget({ base64, preview: URL.createObjectURL(file) });
      setPreview(null);
      setLandmarks(null);
      /* Decide straight away whether it can be measured automatically. */
      const found = await detect({ image: base64 }).unwrap().catch(() => null);
      if (found && found.confidence >= ACCEPTABLE_CONFIDENCE) {
        setLandmarks(found);
        setNeedsMarking(false);
      } else {
        setNeedsMarking(true);
      }
    } catch {
      onError('That image could not be read. Export it as a JPEG and try again.');
    }
  };

  const showPreview = async () => {
    if (!target) return;
    try {
      const result = await renderPreview({
        targetImage: target.base64,
        assetIds,
        landmarks: landmarks ?? undefined,
        referenceImage: fromSource ? reference ?? undefined : undefined,
      }).unwrap();
      setPreview(result.preview);
      setPlan(result.plan?.length ? { key: planKey, pieces: result.plan } : null);
    } catch (err) {
      onError(adminErrorMessage(err, 'Could not render the preview'));
    }
  };

  const generate = async () => {
    if (!target) return;
    try {
      const result = await tryOn({
        targetImage: target.base64,
        assetIds,
        instruction: instruction.trim() || undefined,
        variations,
        runId: runId ?? undefined,
        landmarks: landmarks ?? undefined,
        /* The previewed layout if there is one; otherwise read it now. */
        plan: currentPlan,
        referenceImage: fromSource && !currentPlan ? reference ?? undefined : undefined,
      }).unwrap();
      if (result.plan?.length) setPlan({ key: planKey, pieces: result.plan });
      if (result.jobs[0]) setRunId(result.jobs[0].runId);
    } catch (err) {
      onError(adminErrorMessage(err, 'Could not start the try-on'));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        {preview ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-dark">Placement preview</p>
              <button type="button" onClick={() => setPreview(null)} className="text-xs text-secondary underline">
                Show the plain garment
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from the compositor */}
            <img src={preview} alt="Where each piece will be placed" className="w-full rounded-lg border border-[#e6e0d6]" />
            <p className="mt-2 text-xs text-[#888]">
              Looks flat and pasted on — that&apos;s expected. Check only that each piece is in the right place.
              {currentPlan && ' Generate uses exactly this layout.'}
            </p>
          </div>
        ) : (
          <UploadTile
            label="Plain garment (no embroidery)"
            hint="Front view, whole garment in frame. Its colour, cut and pose are kept exactly."
            preview={target?.preview ?? null}
            onFile={pickGarment}
            onClear={() => {
              setTarget(null);
              setLandmarks(null);
              setNeedsMarking(false);
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {detecting && <p className="text-xs text-[#888]">Measuring the garment…</p>}
        {landmarks && !needsMarking && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="size-4" aria-hidden /> Garment measured — every piece has a fixed spot.
          </p>
        )}

        <div className="rounded-lg border border-[#e6e0d6] p-4">
          <label className="flex items-start gap-2 text-sm text-dark">
            <input
              type="checkbox"
              checked={copyLayout}
              onChange={(e) => {
                setCopyLayout(e.target.checked);
                setPreview(null);
              }}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Copy the layout from the source photo</span>
              <span className="block text-xs text-[#888]">
                The AI reads where each piece sits on the finished design and puts it in the same place — instead of
                each piece&apos;s default spot.
              </span>
            </span>
          </label>
          {copyLayout && (
            <div className="mt-3 max-w-[220px]">
              <UploadTile
                label="Source design photo"
                hint={sourcePhoto && !ownSource ? 'Using the front photo from step 1.' : 'Front view of the embroidered garment.'}
                preview={ownSource?.preview ?? (sourcePhoto ? `data:image/jpeg;base64,${sourcePhoto}` : null)}
                onFile={pickSource}
                onClear={() => {
                  setOwnSource(null);
                  setPreview(null);
                }}
              />
            </div>
          )}
          {copyLayout && !reference && (
            <p className="mt-2 text-xs text-amber-800">Add the source photo, or untick this to use default spots.</p>
          )}
        </div>

        {needsMarking && !fromSource && target && !preview && (
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="mb-3 text-sm text-amber-900">
              This garment is too close in colour to its background to measure automatically. Tap the six points once —
              they&apos;re reused for every try-on on this garment.
            </p>
            <LandmarkMarker
              imageSrc={target.preview}
              onComplete={(marked) => {
                setLandmarks(marked);
                setNeedsMarking(false);
              }}
            />
          </div>
        )}

        <div className="rounded-lg bg-[#faf8f4] p-4 text-sm">
          <p className="font-medium text-dark">
            {approved.length} approved piece{approved.length === 1 ? '' : 's'} will be placed
          </p>
          {approved.length === 0 && <p className="mt-1 text-xs text-[#888]">Approve pieces in step 2 first.</p>}
        </div>

        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={2}
          placeholder="Extra instructions (optional) — e.g. make the zari a little shinier."
          className={cn(inputClass, 'resize-y')}
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#555]">
            Variations
            <select value={variations} onChange={(e) => setVariations(Number(e.target.value))} className={cn(inputClass, 'w-16 py-1.5')}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="text-xs text-[#888]">Each variation is one AI image.</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={showPreview} loading={previewing} disabled={!ready}>
            <Eye className="size-4" aria-hidden /> Preview placement (free)
          </Button>
          <Button onClick={generate} loading={sending} disabled={!ready}>
            <Sparkles className="size-4" aria-hidden /> Generate try-on
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-dark">Results</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {results.flatMap((job) =>
              job.status === 'completed'
                ? job.resultUrls.map((url) => (
                    <div key={url} className="overflow-hidden rounded-lg border border-[#e6e0d6] bg-white">
                      <a href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Shopify CDN result */}
                        <img src={url} alt="Try-on result" className="aspect-3/4 w-full object-cover" />
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadImage(url, 'try-on.png').catch(() => onError('Download failed — open the image and save it instead.'))}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-[#eee8de] py-2 text-xs text-secondary"
                      >
                        <Download className="size-3.5" aria-hidden /> Download
                      </button>
                    </div>
                  ))
                : [
                    <div
                      key={job._id}
                      className="flex aspect-3/4 items-center justify-center rounded-lg border border-[#e6e0d6] bg-white p-4 text-center text-xs text-[#888]"
                    >
                      {job.status === 'failed' ? <span className="text-red-700">{job.error ?? 'Failed'}</span> : 'Generating… about a minute'}
                    </div>,
                  ]
            )}
          </div>
        </div>
      )}
    </div>
  );
}
