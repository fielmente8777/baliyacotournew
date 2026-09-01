'use client';

/**
 * Measurement step. Selecting a profile is what unlocks Add To Cart.
 *
 * Controlled by the shell rather than the slice, because the same panel serves
 * the builder and could serve checkout later. Adding a new profile links to the
 * account page rather than duplicating the form — one measurement form, one set
 * of validation rules.
 */

import Link from 'next/link';
import { useEffect } from 'react';

import {
  useGetMeasurementFieldsQuery,
  useGetMeasurementProfilesQuery,
} from '@/store/api/measurementApi';
import { cn } from '@/lib/format';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function MeasurementPanel({ selectedId, onSelect }: Props) {
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const { data: fields = [] } = useGetMeasurementFieldsQuery();

  /* Preselect the default so a single-profile customer never stops here. */
  useEffect(() => {
    if (selectedId || !profiles?.length) return;
    onSelect((profiles.find((p) => p.isDefault) ?? profiles[0])._id);
  }, [profiles, selectedId, onSelect]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <h2 className="text-2xl font-semibold text-dark md:text-3xl">
          Measurements
        </h2>

        <Link
          href="/my-account/saved-measurements"
          className="flex h-11 items-center rounded-md bg-secondary px-5 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
        >
          Add New Measurement
        </Link>
      </div>

      {isLoading && <p className="text-sm text-dark/60">Loading measurements…</p>}

      {!isLoading && profiles?.length === 0 && (
        <div className="rounded-xl bg-white p-6">
          <p className="text-sm text-dark/60">
            You haven&apos;t saved any measurements yet. We need them to tailor this piece.
          </p>

          <Link
            href="/my-account/saved-measurements"
            className="mt-4 inline-block text-sm font-medium text-secondary underline"
          >
            Add your measurements
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {profiles?.map((profile) => {
          const active = selectedId === profile._id;

          return (
            <article
              key={profile._id}
              className={cn(
                'rounded-2xl bg-white p-4 transition-shadow md:p-6',
                active && 'ring-2 ring-secondary'
              )}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="measurement-profile"
                  checked={active}
                  onChange={() => onSelect(profile._id)}
                  className="h-4 w-4 accent-[#9B2C40]"
                />

                <span className="font-semibold text-dark">{profile.profileName}</span>

                {profile.isDefault && (
                  <span className="rounded-full bg-[#F4F7F2] px-2.5 py-0.5 text-[11px] text-[#4B6B44]">
                    Default
                  </span>
                )}
              </label>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {fields.map((field) => {
                  const value = profile.values.find((v) => v.templateId === field._id);

                  return (
                    <div
                      key={field._id}
                      className="border-l border-[#EFEFEF] pl-3 first:border-l-0 first:pl-0"
                    >
                      <dt className="text-xs text-dark/50">{field.name}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-dark">
                        {value ? `${value.value}"` : '—'}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
