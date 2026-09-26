'use client';

/**
 * Alteration or remake for a delivered made-to-measure order. A custom garment
 * is cut to one body, so there is no "return for refund" — the two fixes are
 * adjust it, or make it again.
 *
 *   1. What's wrong      item (if several) + reason
 *   2. How to fix it     alteration or remake, a description, photos
 */

import { useState } from 'react';
import { ImagePlus, Ruler, Scissors, X } from 'lucide-react';

import type { ReplacementReason, ReplacementType } from '@/@types/order';
import { fileToResizedBase64 } from '@/lib/imageResize';
import { apiErrorMessage, useRequestReplacementMutation } from '@/store/api/orderApi';
import Sheet from './Sheet';
import { ChoiceCard, InfoNote, SectionLabel, SuccessView, btnPrimary, btnSecondary, textArea } from './ui';

const REASONS: { value: ReplacementReason; label: string; suggests: ReplacementType }[] = [
  { value: 'fit_issue', label: "It doesn't fit well", suggests: 'alteration' },
  { value: 'defect', label: 'Stitching or embroidery defect', suggests: 'alteration' },
  { value: 'not_as_designed', label: "It's not what I designed", suggests: 'replacement' },
  { value: 'damaged', label: 'It arrived damaged', suggests: 'replacement' },
  { value: 'wrong_item', label: 'I received the wrong item', suggests: 'replacement' },
  { value: 'other', label: 'Something else', suggests: 'alteration' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  items: { name: string }[];
}

export default function AlterationSheet({ open, onClose, orderId, items }: Props) {
  const [step, setStep] = useState(1);
  const [itemIndex, setItemIndex] = useState(0);
  const [reason, setReason] = useState<ReplacementReason | ''>('');
  const [type, setType] = useState<ReplacementType | ''>('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [request, { isLoading, error, data: created, reset }] = useRequestReplacementMutation();

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setReason('');
      setType('');
      setDescription('');
      setPhotos([]);
      reset();
    }, 200);
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setPhotoError('');
    try {
      const next = await Promise.all(Array.from(files).slice(0, 4 - photos.length).map((f) => fileToResizedBase64(f, 1200)));
      setPhotos((p) => [...p, ...next].slice(0, 4));
    } catch {
      setPhotoError("One of those photos couldn't be read — try a JPG or PNG.");
    }
  };

  const submit = async () => {
    try {
      await request({
        orderId,
        body: {
          itemIndex,
          type: type as ReplacementType,
          reason: reason as ReplacementReason,
          description: description.trim(),
          photos,
        },
      }).unwrap();
    } catch {
      /* shown in the sheet */
    }
  };

  if (created) {
    return (
      <Sheet open={open} onClose={close} title="Request received" footer={<button type="button" onClick={close} className={btnPrimary}>Done</button>}>
        <SuccessView
          title={type === 'alteration' ? 'Your alteration request is in' : 'Your remake request is in'}
          reference={created.requestNumber}
          steps={[
            'Request received',
            'Our tailor reviews your photos and details — within 1–2 working days',
            'We arrange a free pickup',
            type === 'alteration' ? 'Garment is altered and sent back' : 'A new garment is made and dispatched',
          ]}
          note="We'll call or email you if we need more measurements."
        />
      </Sheet>
    );
  }

  const canContinue = step === 1 ? reason !== '' : type !== '' && description.trim().length >= 10;

  return (
    <Sheet
      open={open}
      onClose={close}
      title={step === 1 ? "What's wrong?" : 'How should we fix it?'}
      step={{ current: step, total: 2 }}
      footer={
        <>
          <button type="button" onClick={step === 1 ? close : () => setStep(1)} className={btnSecondary}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step === 1 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep(2)} className={btnPrimary}>
              Continue
            </button>
          ) : (
            <button type="button" disabled={!canContinue || isLoading} onClick={submit} className={btnPrimary}>
              {isLoading ? 'Submitting…' : 'Submit request'}
            </button>
          )}
        </>
      }
    >
      {step === 1 && (
        <>
          {items.length > 1 && (
            <div className="mb-5">
              <SectionLabel>Which piece?</SectionLabel>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <ChoiceCard key={i} name="item" checked={itemIndex === i} onChange={() => setItemIndex(i)} title={item.name} />
                ))}
              </div>
            </div>
          )}
          <SectionLabel>Tell us the problem</SectionLabel>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <ChoiceCard
                key={r.value}
                name="reason"
                checked={reason === r.value}
                onChange={() => {
                  setReason(r.value);
                  setType(r.suggests);
                }}
                title={r.label}
              />
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="space-y-2.5">
            <ChoiceCard
              name="fix"
              checked={type === 'alteration'}
              onChange={() => setType('alteration')}
              title={
                <span className="inline-flex items-center gap-2">
                  <Ruler size={15} className="text-[#A52C45]" aria-hidden="true" />
                  Alter this garment
                </span>
              }
              description="We adjust the fit or fix the stitching. Fastest option."
            />
            <ChoiceCard
              name="fix"
              checked={type === 'replacement'}
              onChange={() => setType('replacement')}
              title={
                <span className="inline-flex items-center gap-2">
                  <Scissors size={15} className="text-[#A52C45]" aria-hidden="true" />
                  Remake it
                </span>
              }
              description="We make the garment again from your design and measurements."
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-[#222]">Describe the issue</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder={
                type === 'alteration'
                  ? 'e.g. Waist is about 1 inch loose; sleeves are 2 cm too long'
                  : 'e.g. The embroidery colour is gold, but I chose silver'
              }
              className={textArea}
            />
            <span className="mt-1 block text-xs text-[#8A8A8A]">
              {description.trim().length < 10 ? 'A sentence or two helps our tailor — at least 10 characters.' : `${description.length}/1000`}
            </span>
          </label>

          <div className="mt-5">
            <SectionLabel>
              Add photos <span className="font-normal text-[#8A8A8A]">(recommended, up to 4)</span>
            </SectionLabel>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#EFEAE2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:image/png;base64,${p}`} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((all) => all.filter((_, n) => n !== i))}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-[#444]"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#CFC6BA] text-[11px] text-[#8A8A8A] hover:border-[#A52C45]">
                  <ImagePlus size={20} aria-hidden="true" />
                  Add
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
                </label>
              )}
            </div>
            {photoError && <p className="mt-1 text-sm text-[#9B1C14]">{photoError}</p>}
          </div>

          <div className="mt-5">
            <InfoNote>Our team reviews every request and confirms the next steps with you before any work starts.</InfoNote>
          </div>

          {Boolean(error) && (
            <p role="alert" className="mt-4 text-sm text-[#9B1C14]">
              {apiErrorMessage(error, "We couldn't submit your request. Please try again.")}
            </p>
          )}
        </>
      )}
    </Sheet>
  );
}
