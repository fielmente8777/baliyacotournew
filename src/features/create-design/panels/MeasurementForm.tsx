'use client';


import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  useGetMeasurementProfilesQuery,
  useSaveMeasurementProfileMutation,
} from '@/store/api/measurementApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProfile, setSubview } from '@/store/features/createDesignSlice';
import { MEASUREMENT_FIELDS, emptyValues } from '@/mocks/measurement.mock';
import type { MeasurementKey } from '@/@types/measurement';

export default function MeasurementForm() {
  const dispatch = useAppDispatch();
  const subview = useAppSelector((s) => s.createDesign.subview);
  const editingId = subview.kind === 'editMeasurement' ? subview.profileId : null;

  const { data: profiles } = useGetMeasurementProfilesQuery();
  const [save, { isLoading: isSaving }] = useSaveMeasurementProfileMutation();

  const existing = profiles?.find((p) => p._id === editingId);

  const [profileName, setProfileName] = useState(existing?.profileName ?? '');
  const [values, setValues] = useState<Record<MeasurementKey, string>>(() =>
    existing
      ? (Object.fromEntries(
          MEASUREMENT_FIELDS.map((f) => [
            f.key as MeasurementKey,
            String(existing.values[f.key as MeasurementKey]),
          ])
        ) as Record<MeasurementKey, string>)
      : emptyValues()
  );
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: MeasurementKey, raw: string) => {
    if (raw !== '' && !/^\d{0,3}(\.\d{0,2})?$/.test(raw)) return;
    setValues((v) => ({ ...v, [key]: raw }));
  };

  const handleSave = async () => {
    if (!profileName.trim()) return setError('Please enter a profile name.');

    const missing = MEASUREMENT_FIELDS.find(
      (f) => !values[f.key as MeasurementKey]
    );
    if (missing) return setError(`Please enter ${missing.label}.`);

    setError(null);

    const saved = await save({
      _id: editingId ?? undefined,
      profileName: profileName.trim(),
      unit: 'inch',
      values: Object.fromEntries(
        MEASUREMENT_FIELDS.map((f) => [f.key, Number(values[f.key as MeasurementKey])])
      ) as Record<MeasurementKey, number>,
    }).unwrap();

    dispatch(selectProfile(saved._id));
    dispatch(setSubview({ kind: 'list' }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <h2 className="text-2xl font-semibold text-dark md:text-3xl lg:text-4xl">
          {editingId ? 'Edit Measurement' : 'New Measurement'}
        </h2>

        <button
          type="button"
          onClick={() => dispatch(setSubview({ kind: 'list' }))}
          className="flex items-center gap-2 text-sm font-medium text-secondary"
        >
          <ArrowLeft size={16} />
          All Measurements
        </button>
      </div>

      <input
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
        placeholder="Profile Name"
        className="h-14 w-full rounded-lg bg-white px-4 text-dark outline-none ring-1 ring-transparent placeholder:text-dark/40 focus:ring-secondary"
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MEASUREMENT_FIELDS.map((f) => (
          <div
            key={f.key}
            className="flex h-14 items-center rounded-lg bg-white px-4 focus-within:ring-1 focus-within:ring-secondary"
          >
            <input
              inputMode="decimal"
              value={values[f.key as MeasurementKey]}
              onChange={(e) => setValue(f.key as MeasurementKey, e.target.value)}
              placeholder={f.label}
              aria-label={f.label}
              className="w-full bg-transparent text-dark outline-none placeholder:text-dark/40"
            />
            <span className="shrink-0 pl-3 text-sm text-dark/60">Inch</span>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-secondary">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 h-12 w-full rounded-md bg-secondary text-white transition-colors hover:bg-secondary/90 disabled:opacity-60 sm:w-56 md:h-14"
      >
        {isSaving ? 'Saving…' : 'Save Measurement'}
      </button>
    </div>
  );
}
