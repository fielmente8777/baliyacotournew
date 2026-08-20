'use client';

/**
 * Saved Measurements (Profile-5) with an inline add/edit form
 * (Profile-2). Reuses the same measurementApi and MEASUREMENT_FIELDS as
 * the Create Your Own Design flow, so a profile saved in one place shows
 * up in the other with no sync code.
 */

import { useState } from 'react';
import {
  useGetMeasurementProfilesQuery,
  useSaveMeasurementProfileMutation,
} from '@/store/api/measurementApi';
import { MEASUREMENT_FIELDS, emptyValues } from '@/mocks/measurement.mock';
import type { MeasurementKey } from '@/@types/measurement';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';

export default function SavedMeasurementsPanel() {
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const [save, { isLoading: isSaving }] = useSaveMeasurementProfileMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [values, setValues] = useState<Record<MeasurementKey, string>>(emptyValues);
  const [error, setError] = useState<string | null>(null);

  const openForm = (id?: string) => {
    const existing = profiles?.find((p) => p._id === id);
    setEditingId(existing?._id ?? null);
    setProfileName(existing?.profileName ?? '');
    setValues(
      existing
        ? (Object.fromEntries(
            MEASUREMENT_FIELDS.map((f) => [f.key, String(existing.values[f.key])])
          ) as Record<MeasurementKey, string>)
        : emptyValues()
    );
    setError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!profileName.trim()) return setError('Please enter a profile name.');
    const missing = MEASUREMENT_FIELDS.find((f) => !values[f.key]);
    if (missing) return setError(`Please enter ${missing.label}.`);

    setError(null);
    await save({
      _id: editingId ?? undefined,
      profileName: profileName.trim(),
      unit: 'inch',
      values: Object.fromEntries(
        MEASUREMENT_FIELDS.map((f) => [f.key, Number(values[f.key])])
      ) as Record<MeasurementKey, number>,
    }).unwrap();

    setFormOpen(false);
  };

  if (isFormOpen) {
    return (
      <AccountContent>
        <PageHeader title="Saved Measurements" />

        <div className="p-5 md:p-6">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Enter profile name"
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {MEASUREMENT_FIELDS.map((f) => (
              <div
                key={f.key}
                className="flex h-12 items-center rounded-md border border-[#EAE6DF] px-4 focus-within:border-[#A52C45]"
              >
                <input
                  inputMode="decimal"
                  value={values[f.key]}
                  onChange={(e) =>
                    /^\d{0,3}(\.\d{0,2})?$/.test(e.target.value) &&
                    setValues({ ...values, [f.key]: e.target.value })
                  }
                  placeholder={f.label}
                  aria-label={f.label}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A9A9A]"
                />
                <span className="shrink-0 pl-3 text-sm text-[#6B6B6B]">Inch</span>
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-[#A52C45]">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE6DF] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <OutlineButton type="button" onClick={() => setFormOpen(false)}>
            Cancel
          </OutlineButton>

          <PrimaryButton type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Measurement'}
          </PrimaryButton>
        </div>
      </AccountContent>
    );
  }

  return (
    <AccountContent>
      <PageHeader
        title="Saved Measurements"
        action={
          <PrimaryButton type="button" onClick={() => openForm()} className="h-9 px-5">
            Add New Measurement
          </PrimaryButton>
        }
      />

      {isLoading && <p className="p-5 text-sm text-[#8A8A8A] md:p-6">Loading measurements…</p>}

      {profiles?.length === 0 && (
        <p className="p-5 text-sm text-[#8A8A8A] md:p-6">
          You haven&apos;t saved any measurements yet.
        </p>
      )}

      <div className="divide-y divide-[#F2EEE8]">
        {profiles?.map((p) => (
          <article key={p._id} className="p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#222]">{p.profileName}</h3>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
              {MEASUREMENT_FIELDS.map((f) => (
                <div key={f.key} className="border-l border-[#F0ECE6] pl-3 first:border-l-0 first:pl-0">
                  <dt className="text-xs leading-tight text-[#8A8A8A]">{f.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-[#222]">{p.values[f.key]}&quot;</dd>
                </div>
              ))}
            </dl>

            <OutlineButton
              type="button"
              onClick={() => openForm(p._id)}
              className="mt-5 h-10 w-full px-5 sm:w-auto"
            >
              Edit Measurements
            </OutlineButton>
          </article>
        ))}
      </div>
    </AccountContent>
  );
}
