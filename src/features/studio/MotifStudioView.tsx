'use client';

/**
 * Embroidery transfer studio.
 *
 * Mirrors the Magnific Spaces canvas as a linear two-step flow:
 *
 *   1  Donor garment  ──►  isolated motif sheet on white
 *   2  Target garment + that sheet  ──►  finished garment
 *
 * Step 1 exists because copying trim straight off a photographed garment drags
 * the donor's fabric colour along with it. Flattening the motifs onto white
 * first is what makes step 2 faithful.
 *
 * Both steps are billed generations, so nothing runs automatically.
 *
 * Open to anyone for the demo. Restore the admin check here and in
 * routes/ai.ts before this is deployed anywhere public.
 */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

import {
  useApplyMotifsMutation,
  useExtractMotifsMutation,
  useGetRunQuery,
  type MotifRegion,
} from '@/store/api/studioApi';
import { cropToBase64, type CropBox } from '@/lib/imageCrop';
import { fileToResizedBase64 } from '@/lib/imageResize';

import CropSelector from './CropSelector';

import UploadTile from './UploadTile';

interface Slot {
  preview: string;
  base64: string;
}

/** The borders a crop can be labelled as — mirrors the backend enum. */
const REGIONS: { value: MotifRegion; label: string }[] = [
  { value: 'neckline', label: 'Neckline' },
  { value: 'sleeve', label: 'Sleeve / cuff' },
  { value: 'hem', label: 'Hem' },
  { value: 'placket', label: 'Placket' },
  { value: 'motif', label: 'Single motif' },
];

/** How long between polls while Magnific is working. */
const POLL_MS = 4000;

export default function MotifStudioView() {
  const [donor, setDonor] = useState<Slot | null>(null);
  /** Kept so a new crop can be cut from the original at full resolution. */
  const [donorFile, setDonorFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropBox | null>(null);
  const [region, setRegion] = useState<MotifRegion>('neckline');
  const [target, setTarget] = useState<Slot | null>(null);
  const [instruction, setInstruction] = useState('');
  const [variations, setVariations] = useState(1);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [extractMotifs, { isLoading: isExtracting }] = useExtractMotifsMutation();
  const [applyMotifs, { isLoading: isApplying }] = useApplyMotifsMutation();

  /* Only poll while a run is open and something in it is unfinished. */
  const { data: jobs = [] } = useGetRunQuery(runId as string, {
    skip: !runId,
    pollingInterval: POLL_MS,
  });

  const extractJob = useMemo(
    () => jobs.find((job) => job.stage === 'extract'),
    [jobs]
  );

  const applyJobs = useMemo(
    () => jobs.filter((job) => job.stage === 'apply'),
    [jobs]
  );

  const motifSheetUrl = extractJob?.status === 'completed'
    ? extractJob.resultUrls[0]
    : undefined;

  const isBusy = jobs.some((job) => job.status === 'pending');

  /* Stop polling once nothing is pending — an idle tab shouldn't hit the API. */
  useEffect(() => {
    if (!runId || isBusy) return;
    /* Left intentionally: RTK Query stops when the component unmounts, and a
       finished run still needs its data on screen. */
  }, [runId, isBusy]);

  const readFile = async (file: File, set: (slot: Slot) => void) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      return setError('Please choose an image file.');
    }

    try {
      const base64 = await fileToResizedBase64(file);
      set({ base64, preview: URL.createObjectURL(file) });
    } catch {
      setError('We could not read that image.');
    }
  };

  const handleExtract = async () => {
    if (!donorFile) return setError('Upload a garment with the embroidery you want.');
    if (!crop || crop.width < 0.02) {
      return setError('Drag a box around one border first — the whole garment gives poor results.');
    }

    setError(null);

    try {
      /* Cut from the original file, not the downscaled preview, so the crop
         keeps every pixel the camera captured. */
      const cropped = await cropToBase64(donorFile, crop);

      const job = await extractMotifs({ donorImage: cropped, region }).unwrap();
      setRunId(job.runId);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'Extraction failed. Check the API key and credits.');
    }
  };

  /** Runs the same crop again — output varies between calls, so retrying is
   *  a legitimate part of the workflow rather than a workaround. */
  const handleRetryExtract = async () => {
    if (!donorFile || !crop) return;
    setError(null);

    try {
      const cropped = await cropToBase64(donorFile, crop);
      const job = await extractMotifs({
        donorImage: cropped,
        region,
        runId: runId ?? undefined,
      }).unwrap();
      setRunId(job.runId);
    } catch {
      setError('Retry failed.');
    }
  };

  const handleApply = async () => {
    if (!target) return setError('Upload the plain garment to apply the trim to.');
    if (!motifSheetUrl) return setError('Run step 1 first.');
    setError(null);

    try {
      await applyMotifs({
        targetImage: target.base64,
        motifSheetImage: motifSheetUrl,
        instruction: instruction.trim() || undefined,
        variations,
        sourceJobId: extractJob?._id,
        runId: runId ?? undefined,
      }).unwrap();
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'Generation failed.');
    }
  };

  const reset = () => {
    setDonor(null);
    setTarget(null);
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
              Take the embroidery from one garment and put it on another. Upload a
              piece whose trim you like, then the plain garment you want it on.
            </p>
          </div>

          {runId && (
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

          <div className="grid items-start gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className="mb-2 text-sm font-medium text-dark">
                Garment with the embroidery you want
              </p>

              {donor ? (
                <>
                  <CropSelector src={donor.preview} value={crop} onChange={setCrop} />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#6B6B6B]">This crop is the</span>

                    {REGIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRegion(option.value)}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                          region === option.value
                            ? 'bg-secondary text-white'
                            : 'bg-[#F2EEE8] text-[#5C5C5C] hover:bg-[#E9E3DA]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDonor(null);
                      setDonorFile(null);
                      setCrop(null);
                    }}
                    className="mt-3 text-xs text-[#8B6E54] underline"
                  >
                    Choose a different photo
                  </button>
                </>
              ) : (
                <UploadTile
                  label=""
                  hint="Upload a photo, then drag a box around one border"
                  preview={null}
                  onFile={(file) => {
                    setDonorFile(file);
                    setCrop(null);
                    readFile(file, setDonor);
                  }}
                  onClear={() => {
                    setDonor(null);
                    setDonorFile(null);
                  }}
                />
              )}
            </div>

            <div className="hidden self-center md:block">
              <ArrowRight size={22} className="text-[#CCC]" />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-dark">Isolated motifs</p>

              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-[#FBFAF8] ring-1 ring-[#EEE]">
                {motifSheetUrl ? (
                  <Image
                    src={motifSheetUrl}
                    alt="Extracted embroidery motifs"
                    width={400}
                    height={533}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-6 text-center text-xs text-[#9A9A9A]">
                    {extractJob?.status === 'pending'
                      ? 'Extracting… usually 20–60 seconds'
                      : extractJob?.status === 'failed'
                        ? 'Extraction failed — try another photo'
                        : 'The neckline, cuff and hem borders will appear here'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!extractJob && (
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || !crop}
                className="h-11 rounded-md bg-secondary px-8 text-sm font-medium text-white disabled:bg-[#EDEDED] disabled:text-[#B4B4B4]"
              >
                {isExtracting ? 'Sending…' : 'Extract embroidery'}
              </button>
            )}

            {extractJob && extractJob.status !== 'pending' && (
              <button
                type="button"
                onClick={handleRetryExtract}
                disabled={isExtracting}
                className="h-11 rounded-md border border-secondary px-6 text-sm font-medium text-secondary"
              >
                {isExtracting ? 'Sending…' : 'Try again'}
              </button>
            )}

            <p className="text-xs text-[#9A9A9A]">
              Output varies between runs — retry if a piece comes back wrong.
            </p>
          </div>
        </section>

        {/* ---- Step 2 ---------------------------------------------------- */}
        <section
          className={`mt-6 rounded-2xl bg-white p-5 transition-opacity md:p-6 ${
            motifSheetUrl ? '' : 'pointer-events-none opacity-50'
          }`}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs text-white">
              2
            </span>
            <h2 className="text-lg font-semibold text-dark">Apply it to a garment</h2>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[1fr_1fr]">
            <UploadTile
              label="Plain garment to decorate"
              hint="Its colour, cut and pose are kept exactly"
              preview={target?.preview ?? null}
              onFile={(file) => readFile(file, setTarget)}
              onClear={() => setTarget(null)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">
                Extra instructions (optional)
              </label>

              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={5}
                placeholder="e.g. Keep the hem border narrower than the neckline."
                className="w-full rounded-lg border border-[#E4E0D8] p-3 text-sm outline-none focus:border-secondary"
              />

              <label className="mt-4 block text-sm text-[#6B6B6B]">
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

              <p className="mt-1 text-xs text-[#9A9A9A]">
                Each variation is a separate paid generation.
              </p>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying || !target || !motifSheetUrl}
                className="mt-5 h-11 w-full rounded-md bg-secondary text-sm font-medium text-white disabled:bg-[#EDEDED] disabled:text-[#B4B4B4]"
              >
                {isApplying ? 'Sending…' : 'Generate garment'}
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
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-xl bg-white ring-1 ring-[#EEE]"
                      >
                        <Image
                          src={url}
                          alt="Generated garment"
                          width={400}
                          height={533}
                          unoptimized
                          className="aspect-[3/4] w-full object-cover"
                        />
                      </a>
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
