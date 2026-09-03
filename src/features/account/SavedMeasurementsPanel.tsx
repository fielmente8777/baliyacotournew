'use client';

/**
 * Saved Measurements (Profile-5) with an inline add/edit form (Profile-2).
 *
 * Shares measurementApi with the Create Your Own Design flow, so a profile
 * saved in either place shows up in the other with no sync code.
 */

import { useMemo, useState } from 'react';

import {
  useCreateMeasurementProfileMutation,
  useDeleteMeasurementProfileMutation,
  useGetMeasurementFieldsQuery,
  useGetMeasurementProfilesQuery,
  useUpdateMeasurementProfileMutation,
} from '@/store/api/measurementApi';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';

export default function SavedMeasurementsPanel() {
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const { data: fields = [], isLoading: fieldsLoading } = useGetMeasurementFieldsQuery();

  const [createProfile, { isLoading: isCreating }] = useCreateMeasurementProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMeasurementProfileMutation();
  const [deleteProfile] = useDeleteMeasurementProfileMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [touched, setTouched] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const isSaving = isCreating || isUpdating;
  const existing = profiles?.find((p) => p._id === editingId);

  const values = useMemo(() => {
    const seed: Record<string, string> = {};
    for (const f of fields) {
      const saved = existing?.values.find((v) => v.templateId === f._id);
      seed[f._id] = saved ? String(saved.value) : '';
    }
    return { ...seed, ...touched };
  }, [fields, existing, touched]);

  const openForm = (id?: string) => {
    const target = profiles?.find((p) => p._id === id);
    setEditingId(target?._id ?? null);
    setProfileName(target?.profileName ?? '');
    setTouched({});
    setError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const missing = fields.find((f) => !values[f._id]);
    if (missing) return setError(`Please enter ${missing.name}.`);

    setError(null);

    const body = {
      ...(profileName.trim() ? { profileName: profileName.trim() } : {}),
      values: fields.map((f) => ({ templateId: f._id, value: Number(values[f._id]) })),
    };

    try {
      if (editingId) await updateProfile({ id: editingId, body }).unwrap();
      else await createProfile(body).unwrap();
      setFormOpen(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 409
          ? 'You already have a profile with that name.'
          : 'Could not save your measurements. Please try again.'
      );
    }
  };

  if (isFormOpen) {
    return (
      <AccountContent>
        <PageHeader title="Saved Measurements" />

        <div className="p-5 md:p-6">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Enter profile name (optional)"
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f._id}
                className="flex h-12 items-center rounded-md border border-[#EAE6DF] px-4 focus-within:border-[#A52C45]"
              >
                <input
                  inputMode="decimal"
                  value={values[f._id] ?? ''}
                  onChange={(e) =>
                    /^\d{0,3}(\.\d{0,2})?$/.test(e.target.value) &&
                    setTouched({ ...touched, [f._id]: e.target.value })
                  }
                  placeholder={f.name}
                  aria-label={f.name}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A9A9A]"
                />
                <span className="shrink-0 pl-3 text-sm text-[#6B6B6B]">
                  {f.unit === 'cm' ? 'Cm' : 'Inch'}
                </span>
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
          <PrimaryButton
            type="button"
            onClick={() => openForm()}
            className="h-9 px-5"
            // disabled={fieldsLoading || fields.length === 0}
          >
            Add New Measurement
          </PrimaryButton>
        }
      />

      {isLoading && <p className="p-5 text-sm text-[#8A8A8A] md:p-6">Loading measurements…</p>}

      {!isLoading && profiles?.length === 0 && (
        <p className="p-5 text-sm text-[#8A8A8A] md:p-6">
          You haven&apos;t saved any measurements yet.
        </p>
      )}

      <div className="divide-y divide-[#F2EEE8]">
        {profiles?.map((p) => (
          <article key={p._id} className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[#222]">{p.profileName}</h3>
              {p.isDefault && (
                <span className="rounded-full bg-[#F4F7F2] px-2.5 py-0.5 text-[11px] text-[#4B6B44]">
                  Default
                </span>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
              {fields.map((f) => {
                const value = p.values.find((v) => v.templateId === f._id);
                return (
                  <div
                    key={f._id}
                    className="border-l border-[#F0ECE6] pl-3 first:border-l-0 first:pl-0"
                  >
                    <dt className="text-xs leading-tight text-[#8A8A8A]">{f.name}</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#222]">
                      {value ? `${value.value}"` : '—'}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <OutlineButton
                type="button"
                onClick={() => openForm(p._id)}
                className="h-10 px-5"
              >
                Edit Measurements
              </OutlineButton>

              {!p.isDefault && (
                <button
                  type="button"
                  onClick={() => deleteProfile(p._id)}
                  className="h-10 px-3 text-sm text-[#8A8A8A] transition-colors hover:text-[#A52C45]"
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </AccountContent>
  );
}
