'use client';

/**
 * Saved Measurements (Profile-5) with an inline add/edit form (Profile-2).
 *
 * Shares measurementApi with the Create Your Own Design flow, so a profile
 * saved in either place shows up in the other with no sync code.
 *
 * Read view: one card per profile, default first, each measurement a small
 * tile with its own unit. Deleting asks first.
 */

import { useMemo, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Ruler, Star, Trash2 } from 'lucide-react';

import type { MeasurementField, MeasurementProfile } from '@/@types/measurement';
import {
  useCreateMeasurementProfileMutation,
  useDeleteMeasurementProfileMutation,
  useGetMeasurementFieldsQuery,
  useGetMeasurementProfilesQuery,
  useUpdateMeasurementProfileMutation,
} from '@/store/api/measurementApi';
import { useConfirm } from '@/components/ConfirmDialog';
import { cn } from '@/lib/format';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';
import FormField, { accountInputClass } from '../../app/(website)/my-account/components/FormField';

const unitLabel = (unit: 'in' | 'cm') => (unit === 'cm' ? 'cm' : 'in');

function ProfileCard({
  profile: p,
  fields,
  onEdit,
  onMakeDefault,
  onDelete,
}: {
  profile: MeasurementProfile;
  fields: MeasurementField[];
  onEdit: () => void;
  onMakeDefault: () => void;
  onDelete: () => void;
}) {
  const filled = p.values.length;
  const units = new Set(p.values.map((v) => v.unit));

  return (
    <article
      className={cn(
        'rounded-lg border p-5',
        p.isDefault ? 'border-[#A52C45]/40 bg-[#FDF9FA]' : 'border-[#F2EEE8] bg-[#FDFBF8]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
            <Ruler size={18} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-[#222]">{p.profileName}</h3>
            <p className="text-xs text-[#8A8A8A]">
              {filled} {filled === 1 ? 'measurement' : 'measurements'}
              {units.size === 1 && ` · in ${[...units][0] === 'cm' ? 'centimetres' : 'inches'}`}
            </p>
          </div>
        </div>
        {p.isDefault && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#A52C45] px-2.5 py-1 text-[11px] font-medium text-white">
            <CheckCircle2 size={12} aria-hidden /> Default
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {fields.map((f) => {
          const value = p.values.find((v) => v.templateId === f._id);
          return (
            <div key={f._id} className="rounded-md border border-[#F2EEE8] bg-white px-3 py-2.5">
              <dt className="truncate text-[11px] font-medium uppercase tracking-wider text-[#8A8A8A]">{f.name}</dt>
              <dd className="mt-0.5 text-base font-semibold text-[#222]">
                {value ? (
                  <>
                    <span className="tabular-nums">{value.value}</span>{' '}
                    <span className="text-xs font-normal text-[#8A8A8A]">{unitLabel(value.unit ?? f.unit)}</span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-[#AFAFAF]">—</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-[#F2EEE8] pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#A52C45] transition-colors hover:bg-[#F6EEF0]"
        >
          <Pencil size={14} aria-hidden /> Edit
        </button>
        {!p.isDefault && (
          <>
            <button
              type="button"
              onClick={onMakeDefault}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-[#555] transition-colors hover:bg-[#F6EEF0] hover:text-[#A52C45]"
            >
              <Star size={14} aria-hidden /> Set as default
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-[#8A8A8A] transition-colors hover:bg-[#F6EEF0] hover:text-[#A52C45]"
            >
              <Trash2 size={14} aria-hidden /> Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function SavedMeasurementsPanel() {
  const { data: profiles, isLoading } = useGetMeasurementProfilesQuery();
  const { data: fields = [] } = useGetMeasurementFieldsQuery();

  const [createProfile, { isLoading: isCreating }] = useCreateMeasurementProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMeasurementProfileMutation();
  const [deleteProfile] = useDeleteMeasurementProfileMutation();
  const { confirm, dialog } = useConfirm();

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

  const makeDefault = (p: MeasurementProfile) =>
    updateProfile({
      id: p._id,
      body: { values: p.values.map((v) => ({ templateId: v.templateId, value: v.value })), isDefault: true },
    });

  const askToDelete = (p: MeasurementProfile) =>
    confirm({
      title: 'Delete these measurements?',
      text: (
        <>
          <strong className="font-medium text-dark">{p.profileName}</strong> will be removed. Orders already placed
          keep their measurements.
        </>
      ),
      confirmLabel: 'Yes, delete',
      onConfirm: () => deleteProfile(p._id),
    });

  if (isFormOpen) {
    return (
      <AccountContent>
        <PageHeader title={editingId ? 'Edit Measurements' : 'Add New Measurements'} />

        <div className="p-5 md:p-6">
          <FormField label="Profile name" optional>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. My measurements, Mom"
              className={accountInputClass}
            />
          </FormField>

          <p className="mb-3 mt-6 text-sm font-semibold text-[#222]">Measurements</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <FormField key={f._id} label={f.name}>
                <div className="flex h-12 items-center rounded-md border border-[#EAE6DF] bg-white px-4 transition-colors focus-within:border-[#A52C45]">
                  <input
                    inputMode="decimal"
                    value={values[f._id] ?? ''}
                    onChange={(e) =>
                      /^\d{0,3}(\.\d{0,2})?$/.test(e.target.value) &&
                      setTouched({ ...touched, [f._id]: e.target.value })
                    }
                    placeholder={f.ui ? `${f.ui.min} – ${f.ui.max}` : f.name}
                    aria-label={f.name}
                    className="w-full bg-transparent text-sm tabular-nums outline-none placeholder:text-[#B5B5B5]"
                  />
                  <span className="shrink-0 pl-3 text-sm text-[#6B6B6B]">{unitLabel(f.unit)}</span>
                </div>
              </FormField>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-[#A52C45]">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE6DF] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <OutlineButton type="button" onClick={() => setFormOpen(false)}>
            Cancel
          </OutlineButton>

          <PrimaryButton type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Measurements'}
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
          profiles && profiles.length > 0 ? (
            <PrimaryButton type="button" onClick={() => openForm()} className="h-9 gap-1.5 px-4">
              <Plus size={16} aria-hidden /> Add New
            </PrimaryButton>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-4 p-5 md:p-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-black/5" />
          ))}
        </div>
      ) : !profiles?.length ? (
        <div className="flex flex-col items-center px-5 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
            <Ruler size={28} aria-hidden />
          </span>
          <h3 className="mt-4 text-base font-semibold text-[#222]">No measurements saved yet</h3>
          <p className="mt-1 max-w-sm text-sm text-[#6B6B6B]">
            Save your measurements once and use them for every outfit you design or order.
          </p>
          <PrimaryButton type="button" onClick={() => openForm()} className="mt-5 gap-1.5">
            <Plus size={16} aria-hidden /> Add measurements
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4 p-5 md:p-6">
          {[...profiles]
            .sort((x, y) => Number(y.isDefault) - Number(x.isDefault))
            .map((p) => (
              <ProfileCard
                key={p._id}
                profile={p}
                fields={fields}
                onEdit={() => openForm(p._id)}
                onMakeDefault={() => makeDefault(p)}
                onDelete={() => askToDelete(p)}
              />
            ))}
        </div>
      )}

      {dialog}
    </AccountContent>
  );
}
