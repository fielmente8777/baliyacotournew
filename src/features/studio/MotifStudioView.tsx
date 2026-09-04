'use client';

/**
 * Embroidery transfer studio.
 *
 *   1  Several photos of a garment  ──►  one sheet of isolated embroidery
 *   2  Plain garment + that sheet   ──►  the finished garment
 *
 * The sheet is downloadable, and stage 2 accepts an uploaded one, so an
 * embroidery extracted and approved once can be reused across any number of
 * colourways without going through stage 1 again. That reuse is what makes
 * output consistent — stage 1 is generative and varies between runs, stage 2
 * with a fixed sheet does not.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Download, Sparkles } from 'lucide-react';

import {
  useApplyMotifsMutation,
  useExtractMotifsMutation,
  useGetRunQuery,
} from '@/store/api/studioApi';
import { fileToResizedBase64 } from '@/lib/imageResize';
import { downloadImage } from '@/lib/downloadImage';

import UploadTile from './UploadTile';
import ViewUploader, { type DonorView } from './ViewUploader';
import SheetPicker, { type SheetChoice } from './SheetPicker';

const POLL_MS = 4000;
const MAX_VIEWS = 6;

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

export default function MotifStudioView() {
  const [views, setViews] = useState<DonorView[]>([]);
  const [target, setTarget] = useState<{ preview: string; base64: string } | null>(null);

  /** Sheets uploaded from disk, kept separately from generated ones. */
  const [uploadedSheets, setUploadedSheets] = useState<SheetChoice[]>([]);
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>([]);
  const [sheetLabels, setSheetLabels] = useState<Record<string, string>>({});

  const [instruction, setInstruction] = useState('');
  const [variations, setVariations] = useState(1);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyNote, setBusyNote] = useState<string | null>(null);

  const [extractMotifs, { isLoading: isExtracting }] = useExtractMotifsMutation();
  const [applyMotifs, { isLoading: isApplying }] = useApplyMotifsMutation();

  const { data: jobs = [] } = useGetRunQuery(runId as string, {
    skip: !runId,
    pollingInterval: POLL_MS,
  });

  const extractJobs = useMemo(() => jobs.filter((j) => j.stage === 'extract'), [jobs]);
  const applyJobs = useMemo(() => jobs.filter((j) => j.stage === 'apply'), [jobs]);
  const isExtractPending = extractJobs.some((j) => j.status === 'pending');

  /** Generated sheets and uploaded ones, offered together in the picker. */
  const availableSheets: SheetChoice[] = useMemo(() => {
    const generated = extractJobs.flatMap((job) =>
      job.status === 'completed'
        ? job.resultUrls.map((url, index) => ({
            id: `${job._id}-${index}`,
            image: url,
            preview: url,
            label: sheetLabels[`${job._id}-${index}`] ?? 'extracted embroidery',
            source: 'generated' as const,
          }))
        : []
    );

    return [...generated, ...uploadedSheets];
  }, [extractJobs, uploadedSheets, sheetLabels]);

  const readFiles = async (files: FileList) => {
    setError(null);
    const room = MAX_VIEWS - views.length;
    const chosen = Array.from(files).slice(0, room);

    try {
      const next = await Promise.all(
        chosen.map(async (file) => ({
          id: newId(),
          base64: await fileToResizedBase64(file),
          preview: URL.createObjectURL(file),
          label: '',
        }))
      );
      setViews((current) => [...current, ...next]);
    } catch {
      setError('One of those images could not be read. Export it as a JPEG and retry.');
    }
  };

  const handleExtract = async () => {
    if (views.length === 0) return setError('Add at least one photo of the garment.');
    setError(null);

    try {
      const job = await extractMotifs({
        views: views.map((view) => ({
          image: view.base64,
          label: view.label || undefined,
        })),
        runId: runId ?? undefined,
      }).unwrap();

      setRunId(job.runId);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'Extraction failed. Check the API key and credits.');
    }
  };

  const handleUploadSheets = async (files: FileList) => {
    setError(null);

    try {
      const next = await Promise.all(
        Array.from(files).map(async (file) => {
          const base64 = await fileToResizedBase64(file);
          return {
            id: newId(),
            image: base64,
            preview: URL.createObjectURL(file),
            label: '',
            source: 'uploaded' as const,
          };
        })
      );

      setUploadedSheets((current) => [...current, ...next]);
      setSelectedSheetIds((current) => [...current, ...next.map((s) => s.id)]);
    } catch {
      setError('That sheet could not be read.');
    }
  };

  const handleApply = async () => {
    if (!target) return setError('Upload the plain garment first.');
    if (selectedSheetIds.length === 0) return setError('Choose at least one embroidery sheet.');

    setError(null);
    setBusyNote('Preparing sheets…');

    try {
      const chosen = availableSheets.filter((s) => selectedSheetIds.includes(s.id));

      /* Generated sheets are URLs on our own server; uploaded ones are already
         base64. Both are accepted, so no conversion is needed either way. */
      const sheets = chosen.map((sheet) => ({
        image: sheet.image,
        label: sheet.label || undefined,
      }));

      setBusyNote(null);

      await applyMotifs({
        targetImage: target.base64,
        sheets,
        instruction: instruction.trim() || undefined,
        variations,
        runId: runId ?? undefined,
      }).unwrap();
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'Generation failed.');
    } finally {
      setBusyNote(null);
    }
  };

  const handleDownload = async (url: string, prefix: string) => {
    try {
      await downloadImage(url, `${prefix}-${Date.now()}.png`);
    } catch {
      setError('Download failed — open the image in a new tab and save it instead.');
    }
  };

  const reset = () => {
    setViews([]);
    setTarget(null);
    setUploadedSheets([]);
    setSelectedSheetIds([]);
    setInstruction('');
    setRunId(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-dark">
              <Sparkles size={24} className="text-secondary" />
              Embroidery Transfer Studio
            </h1>
            <p className="mt-2 max-w-2xl text-[#6B6B6B]">
              Extract the embroidery from a garment once, save it, and apply it to
              as many plain garments as you like.
            </p>
          </div>

          {(runId || views.length > 0) && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-[#DDD] px-4 py-2 text-sm"
            >
              Start over
            </button>
          )}
        </div>

        {/* ---- Step 1 ---------------------------------------------------- */}
        <section className="mt-10 rounded-2xl bg-white p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs text-white">
              1
            </span>
            <h2 className="text-lg font-semibold text-dark">Extract the embroidery</h2>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto_320px]">
            <div>
              <p className="mb-3 text-sm font-medium text-dark">
                Photos of the garment — add several angles
              </p>

              <ViewUploader
                views={views}
                onAdd={readFiles}
                onRelabel={(id, label) =>
                  setViews((current) =>
                    current.map((v) => (v.id === id ? { ...v, label } : v))
                  )
                }
                onRemove={(id) =>
                  setViews((current) => current.filter((v) => v.id !== id))
                }
                max={MAX_VIEWS}
                disabled={isExtractPending}
              />
            </div>

            <div className="hidden self-center lg:block">
              <ArrowRight size={22} className="text-[#CCC]" />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-dark">Isolated embroidery</p>

              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#FBFAF8] ring-1 ring-[#EEE]">
                {extractJobs.find((j) => j.status === 'completed')?.resultUrls[0] ? (
                  <Image
                    src={extractJobs.find((j) => j.status === 'completed')!.resultUrls[0]}
                    alt="Extracted embroidery"
                    width={400}
                    height={400}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-6 text-center text-xs text-[#9A9A9A]">
                    {isExtractPending
                      ? 'Extracting… usually 20–60 seconds'
                      : extractJobs.some((j) => j.status === 'failed')
                        ? 'Extraction failed — try different photos'
                        : 'Every border found across your photos will appear here'}
                  </span>
                )}
              </div>

              {extractJobs
                .filter((j) => j.status === 'completed')
                .flatMap((job) => job.resultUrls)
                .slice(0, 1)
                .map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => handleDownload(url, 'embroidery-sheet')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-secondary py-2.5 text-sm font-medium text-secondary"
                  >
                    <Download size={15} />
                    Download sheet
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || views.length === 0 || isExtractPending}
              className="h-11 rounded-md bg-secondary px-8 text-sm font-medium text-white disabled:bg-[#EDEDED] disabled:text-[#B4B4B4]"
            >
              {isExtracting
                ? 'Sending…'
                : extractJobs.length > 0
                  ? 'Extract again'
                  : 'Extract embroidery'}
            </button>

            <p className="text-xs text-[#9A9A9A]">
              Output varies between runs — extract again if a piece comes back wrong.
            </p>
          </div>
        </section>

        {/* ---- Step 2 ---------------------------------------------------- */}
        <section className="mt-6 rounded-2xl bg-white p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs text-white">
              2
            </span>
            <h2 className="text-lg font-semibold text-dark">Apply it to a plain garment</h2>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-2">
            <UploadTile
              label="Plain garment with no embroidery"
              hint="Its colour, cut and pose are kept exactly"
              preview={target?.preview ?? null}
              onFile={async (file) => {
                try {
                  setTarget({
                    base64: await fileToResizedBase64(file),
                    preview: URL.createObjectURL(file),
                  });
                } catch {
                  setError('That image could not be read.');
                }
              }}
              onClear={() => setTarget(null)}
            />

            <div>
              <SheetPicker
                available={availableSheets}
                selectedIds={selectedSheetIds}
                onToggle={(id) =>
                  setSelectedSheetIds((current) =>
                    current.includes(id)
                      ? current.filter((s) => s !== id)
                      : [...current, id]
                  )
                }
                onUpload={handleUploadSheets}
                onRelabel={(id, label) => {
                  setSheetLabels((current) => ({ ...current, [id]: label }));
                  setUploadedSheets((current) =>
                    current.map((s) => (s.id === id ? { ...s, label } : s))
                  );
                }}
                onRemove={(id) => {
                  setUploadedSheets((current) => current.filter((s) => s.id !== id));
                  setSelectedSheetIds((current) => current.filter((s) => s !== id));
                }}
              />

              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                placeholder="Extra instructions (optional) — e.g. keep the hem border narrower."
                className="mt-4 w-full rounded-lg border border-[#E4E0D8] p-3 text-sm outline-none focus:border-secondary"
              />

              <label className="mt-3 block text-sm text-[#6B6B6B]">
                Variations
                <select
                  value={variations}
                  onChange={(e) => setVariations(Number(e.target.value))}
                  className="ml-3 rounded border border-[#E4E0D8] px-2 py-1"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying || !target || selectedSheetIds.length === 0}
                className="mt-4 h-11 w-full rounded-md bg-secondary text-sm font-medium text-white disabled:bg-[#EDEDED] disabled:text-[#B4B4B4]"
              >
                {busyNote ?? (isApplying ? 'Sending…' : 'Generate garment')}
              </button>
            </div>
          </div>
        </section>

        {error && <p className="mt-4 text-sm text-secondary">{error}</p>}

        {/* ---- Results --------------------------------------------------- */}
        {applyJobs.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-dark">Results</h2>

            <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {applyJobs.flatMap((job) =>
                job.status === 'completed'
                  ? job.resultUrls.map((url) => (
                      <div
                        key={url}
                        className="overflow-hidden rounded-xl bg-white ring-1 ring-[#EEE]"
                      >
                        <a href={url} target="_blank" rel="noreferrer">
                          <Image
                            src={url}
                            alt="Generated garment"
                            width={400}
                            height={533}
                            unoptimized
                            className="aspect-[3/4] w-full object-cover"
                          />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDownload(url, 'garment')}
                          className="flex w-full items-center justify-center gap-2 border-t border-[#EEE] py-2 text-xs text-secondary"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>
                    ))
                  : [
                      <div
                        key={job._id}
                        className="flex aspect-[3/4] items-center justify-center rounded-xl bg-white text-xs text-[#9A9A9A] ring-1 ring-[#EEE]"
                      >
                        {job.status === 'failed' ? 'Failed' : 'Generating…'}
                      </div>,
                    ]
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
