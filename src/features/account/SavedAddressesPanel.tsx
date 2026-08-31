'use client';

/** Saved Addresses (Profile-1) + add/edit form (Profile-3). */

import { useState } from 'react';
import { Briefcase, Home, MapPin } from 'lucide-react';
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '@/store/api/addressApi';
import type { AddressType } from '@/@types/account';
import { INDIAN_STATES } from '@/mocks/account.mock';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';

const TYPES: Array<{ value: AddressType; label: string; Icon: typeof Home }> = [
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'work', label: 'Work', Icon: Briefcase },
  { value: 'other', label: 'Other', Icon: MapPin },
];

const emptyForm = {
  fullName: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  type: 'home' as AddressType,
};

export default function SavedAddressesPanel() {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const isSaving = isCreating || isUpdating;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const openForm = (id?: string) => {
    const existing = addresses?.find((a) => a._id === id);
    setEditingId(existing?._id ?? null);
    setForm(
      existing
        ? {
            fullName: existing.fullName,
            street: existing.street,
            city: existing.city,
            state: existing.state,
            pincode: existing.pincode,
            type: existing.type,
          }
        : emptyForm
    );
    setError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return setError('Please enter a full name.');
    if (!form.street.trim()) return setError('Please enter a street address.');
    if (!/^\d{6}$/.test(form.pincode)) return setError('Pincode must be 6 digits.');

    setError(null);

    try {
      if (editingId) await updateAddress({ id: editingId, body: form }).unwrap();
      else await createAddress(form).unwrap();
      setFormOpen(false);
    } catch {
      setError('Could not save this address. Please try again.');
    }
  };

  if (isFormOpen) {
    return (
      <AccountContent>
        <PageHeader title="Saved Addresses" />

        <div className="space-y-4 p-5 md:p-6">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full Name*"
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          <input
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            placeholder="Street Address*"
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
              className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
            />

            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="h-12 w-full rounded-md border border-[#EAE6DF] bg-white px-4 text-sm outline-none focus:border-[#A52C45]"
            >
              <option value="">State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <input
            inputMode="numeric"
            value={form.pincode}
            onChange={(e) =>
              /^\d{0,6}$/.test(e.target.value) && setForm({ ...form, pincode: e.target.value })
            }
            placeholder="Pincode*"
            className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-[#222]">Address Type</p>

            <div className="flex flex-wrap gap-3">
              {TYPES.map(({ value, label, Icon }) => {
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, type: value })}
                    aria-pressed={active}
                    className={`flex h-10 items-center gap-2 rounded-full border px-5 text-sm transition-colors ${
                      active
                        ? 'border-[#A52C45] bg-[#A52C45]/5 text-[#A52C45]'
                        : 'border-[#EAE6DF] text-[#444] hover:border-[#A52C45]/40'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-[#A52C45]">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE6DF] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <OutlineButton type="button" onClick={() => setFormOpen(false)}>
            Cancel
          </OutlineButton>

          <PrimaryButton type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Address'}
          </PrimaryButton>
        </div>
      </AccountContent>
    );
  }

  return (
    <AccountContent>
      <PageHeader
        title="Saved Addresses"
        action={
          <PrimaryButton type="button" onClick={() => openForm()} className="h-9 px-5">
            Add New Address
          </PrimaryButton>
        }
      />

      {isLoading && <p className="p-5 text-sm text-[#8A8A8A] md:p-6">Loading addresses…</p>}

      {addresses?.length === 0 && (
        <p className="p-5 text-sm text-[#8A8A8A] md:p-6">No addresses saved yet.</p>
      )}

      <div className="divide-y divide-[#F2EEE8]">
        {addresses?.map((a) => {
          const meta = TYPES.find((t) => t.value === a.type);
          const Icon = meta?.Icon ?? MapPin;

          return (
            <article key={a._id} className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-[#222]">{a.fullName}</h3>

                {a.isDefault && (
                  <span className="rounded-full bg-[#FBF6F7] px-2.5 py-1 text-xs text-[#A52C45]">
                    Default
                  </span>
                )}

                <span className="flex items-center gap-1.5 rounded-full bg-[#F4F7F2] px-3 py-1 text-xs text-[#4B6B44]">
                  <Icon size={13} />
                  {meta?.label}
                </span>
              </div>

              <address className="mt-3 space-y-0.5 text-sm not-italic leading-relaxed text-[#5C5C5C]">
                <p>{a.street}</p>
                {a.landmark && <p>{a.landmark}</p>}
                <p>
                  {a.city}, {a.state}
                </p>
                <p>{a.pincode}</p>
              </address>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <OutlineButton
                  type="button"
                  onClick={() => openForm(a._id)}
                  className="h-10 px-5"
                >
                  Edit Address
                </OutlineButton>

                {!a.isDefault && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateAddress({ id: a._id, body: { isDefault: true } })}
                      className="h-10 px-3 text-sm text-[#666] transition-colors hover:text-[#A52C45]"
                    >
                      Set as default
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAddress(a._id)}
                      className="h-10 px-3 text-sm text-[#8A8A8A] transition-colors hover:text-[#A52C45]"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </AccountContent>
  );
}
