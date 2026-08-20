'use client';

/**
 * "Option" step — saved measurement profiles (Stensil-3). Radio-selecting
 * a profile is what unlocks Add To Cart.
 */

import { useGetMeasurementProfilesQuery } from '@/store/api/measurementApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProfile, setSubview } from '@/store/features/createDesignSlice';
import { MEASUREMENT_FIELDS } from '@/mocks/measurement.mock';
import { cn } from '@/lib/format';

export default function MeasurementPanel() {
  const dispatch = useAppDispatch();
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const selectedProfileId = useAppSelector((s) => s.createDesign.selectedProfileId);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <h2 className="text-2xl font-semibold text-dark md:text-3xl lg:text-4xl">
          My Measurement
        </h2>

        <button
          type="button"
          onClick={() => dispatch(setSubview({ kind: 'newMeasurement' }))}
          className="h-11 rounded-md bg-secondary px-5 text-sm font-medium text-white transition-colors hover:bg-secondary/90 md:h-12"
        >
          Add New Measurement
        </button>
      </div>

      {isLoading && <p className="text-sm text-dark/60">Loading measurements…</p>}

      {profiles?.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-dark/60">
          No measurements saved yet. Add one to continue.
        </p>
      )}

      <div className="space-y-5">
        {profiles?.map((p) => {
          const active = selectedProfileId === p._id;
          return (
            <article
              key={p._id}
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
                  onChange={() => dispatch(selectProfile(p._id))}
                  className="h-4 w-4 accent-[#9B2C40]"
                />
                <span className="font-semibold text-dark">{p.profileName}</span>
              </label>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {MEASUREMENT_FIELDS.map((f) => (
                  <div key={f.key} className="border-l border-[#EFEFEF] pl-3 first:border-l-0 first:pl-0">
                    <dt className="text-xs text-dark/50">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-dark">
                      {p.values[f.key]}&quot;
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={() =>
                  dispatch(setSubview({ kind: 'editMeasurement', profileId: p._id }))
                }
                className="mt-5 h-10 rounded-md border border-secondary px-4 text-sm font-medium text-secondary transition-colors hover:bg-secondary/5"
              >
                Edit measurements
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
