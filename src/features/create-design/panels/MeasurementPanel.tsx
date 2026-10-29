'use client';

/**
 * Measurement step. Selecting a profile is what unlocks Add To Cart.
 *
 * Controlled by the shell rather than the slice, because the same panel serves
 * the builder and could serve checkout later. Adding a new profile links to the
 * account page rather than duplicating the form — one measurement form, one set
 * of validation rules.
 *
 * Cards match My Account → Saved Measurements; "How to measure" opens the
 * admin's video and tips.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, CheckCircle2, PlayCircle, Plus, Ruler } from 'lucide-react';

import {
  useGetMeasurementFieldsQuery,
  useGetMeasurementProfilesQuery,
} from '@/store/api/measurementApi';
import { useMeasureVideoUrl } from '@/store/api/settingsApi';
import { cn } from '@/lib/format';
import MeasureGuide from './MeasureGuide';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const unitLabel = (unit: 'in' | 'cm') => (unit === 'cm' ? 'cm' : 'in');

export default function MeasurementPanel({ selectedId, onSelect }: Props) {
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const { data: fields = [] } = useGetMeasurementFieldsQuery();
  const videoUrl = useMeasureVideoUrl();
  const [guideOpen, setGuideOpen] = useState(false);

  /* Preselect the default so a single-profile customer never stops here. */
  useEffect(() => {
    if (selectedId || !profiles?.length) return;
    onSelect((profiles.find((p) => p.isDefault) ?? profiles[0])._id);
  }, [profiles, selectedId, onSelect]);

  const howTo = (
    <button
      type="button"
      onClick={() => setGuideOpen(true)}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-secondary bg-white px-4 text-sm font-medium text-secondary transition-colors hover:bg-[#FBF6F7]"
    >
      <PlayCircle size={18} aria-hidden />
      How to measure
    </button>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-dark md:text-3xl">Measurements</h2>
          <p className="mt-1 text-sm text-dark/60">Choose whose measurements we tailor this to.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {howTo}
          <Link
            href="/my-account/saved-measurements"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-secondary px-4 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
          >
            <Plus size={16} aria-hidden />
            Add New
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      )}

      {!isLoading && profiles?.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl bg-white px-5 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6EEF0] text-secondary">
            <Ruler size={28} aria-hidden />
          </span>
          <h3 className="mt-4 text-base font-semibold text-dark">We need your measurements</h3>
          <p className="mt-1 max-w-sm text-sm text-dark/60">
            Every piece is stitched to fit you. Watch the short guide, then save your measurements once.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {howTo}
            <Link
              href="/my-account/saved-measurements"
              className="inline-flex h-11 items-center gap-1.5 rounded-md bg-secondary px-5 text-sm font-medium text-white hover:bg-secondary/90"
            >
              <Plus size={16} aria-hidden /> Add measurements
            </Link>
          </div>
        </div>
      )}

      <div role="radiogroup" aria-label="Measurement profile" className="space-y-4">
        {[...(profiles ?? [])]
          .sort((x, y) => Number(y.isDefault) - Number(x.isDefault))
          .map((profile) => {
            const active = selectedId === profile._id;

            return (
              <button
                key={profile._id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(profile._id)}
                className={cn(
                  'block w-full rounded-2xl border-2 bg-white p-4 text-left transition-all md:p-5',
                  active
                    ? 'border-secondary shadow-[0_8px_24px_rgba(155,44,64,0.10)]'
                    : 'border-transparent hover:border-secondary/30'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                        active ? 'bg-secondary text-white' : 'bg-[#F6EEF0] text-secondary'
                      )}
                    >
                      {active ? <Check size={18} aria-hidden /> : <Ruler size={18} aria-hidden />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-dark">{profile.profileName}</p>
                      <p className="text-xs text-dark/50">
                        {profile.values.length} {profile.values.length === 1 ? 'measurement' : 'measurements'}
                      </p>
                    </div>
                  </div>
                  {profile.isDefault && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FBF6F7] px-2.5 py-1 text-[11px] font-medium text-secondary">
                      <CheckCircle2 size={12} aria-hidden /> Default
                    </span>
                  )}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {fields.map((field) => {
                    const value = profile.values.find((v) => v.templateId === field._id);
                    return (
                      <div key={field._id} className="rounded-md bg-[#FAF7F2] px-3 py-2">
                        <dt className="truncate text-[11px] font-medium uppercase tracking-wider text-dark/50">
                          {field.name}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-dark">
                          {value ? (
                            <>
                              <span className="tabular-nums">{value.value}</span>{' '}
                              <span className="text-xs font-normal text-dark/50">{unitLabel(value.unit ?? field.unit)}</span>
                            </>
                          ) : (
                            <span className="font-normal text-dark/30">—</span>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </button>
            );
          })}
      </div>

      {guideOpen && <MeasureGuide videoUrl={videoUrl} fields={fields} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
