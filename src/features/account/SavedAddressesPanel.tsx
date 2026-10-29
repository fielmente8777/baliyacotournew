'use client';

/**
 * Saved Addresses (Profile-1) + add/edit form (Profile-3).
 *
 * Read view: one card per address, the default one highlighted, plus an
 * "Add a new address" tile. Deleting asks first.
 */

import { useState } from 'react';
import { Briefcase, CheckCircle2, Home, MapPin, Pencil, Phone, Plus, Star, Trash2 } from 'lucide-react';
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '@/store/api/addressApi';
import type { Address, AddressType } from '@/@types/account';
import { DEFAULT_COUNTRY_CODE, getAddressCountry, shippableCountry } from '@/lib/addressCountries';
import { detectCountry } from '@/lib/detectCountry';
import { cn } from '@/lib/format';
import { formatPhone } from '@/lib/phone';
import {
  CountrySelect,
  PostalField,
  StateField,
  regionResetFor,
  validateRegion,
} from '@/components/inputs/AddressRegionFields';
import PhoneField from '@/components/inputs/PhoneField';
import PlaceAutocomplete, { placeToAddress } from '@/components/inputs/PlaceAutocomplete';
import { useConfirm } from '@/components/ConfirmDialog';
import Flag from '@/components/Flag';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';
import FormField, { accountInputClass } from '../../app/(website)/my-account/components/FormField';

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
  country: DEFAULT_COUNTRY_CODE,
  phone: '',
  type: 'home' as AddressType,
};

function AddressCard({
  address: a,
  onEdit,
  onMakeDefault,
  onDelete,
}: {
  address: Address;
  onEdit: () => void;
  onMakeDefault: () => void;
  onDelete: () => void;
}) {
  const meta = TYPES.find((t) => t.value === a.type);
  const Icon = meta?.Icon ?? MapPin;
  const country = getAddressCountry(a.country || DEFAULT_COUNTRY_CODE);

  return (
    <article
      className={cn(
        'flex flex-col rounded-lg border p-5 transition-shadow hover:shadow-[0_6px_20px_rgba(27,43,54,0.06)]',
        a.isDefault ? 'border-[#A52C45]/40 bg-[#FDF9FA]' : 'border-[#F2EEE8] bg-[#FDFBF8]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
            <Icon size={18} aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A8A]">{meta?.label ?? 'Address'}</p>
            <h3 className="text-[15px] font-semibold text-[#222]">{a.fullName}</h3>
          </div>
        </div>
        {a.isDefault && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#A52C45] px-2.5 py-1 text-[11px] font-medium text-white">
            <CheckCircle2 size={12} aria-hidden /> Default
          </span>
        )}
      </div>

      <address className="mt-4 flex-1 space-y-0.5 text-sm not-italic leading-relaxed text-[#5C5C5C]">
        <p>{a.street}</p>
        {a.landmark && <p>{a.landmark}</p>}
        <p>{[a.city, a.state].filter(Boolean).join(', ')}</p>
        <p className="flex items-center gap-2">
          <span>{a.pincode}</span>
          <span aria-hidden className="text-[#D5CFC6]">·</span>
          <Flag iso={country.code} />
          <span>{country.name}</span>
        </p>
      </address>

      {a.phone && (
        <p className="mt-3 flex items-center gap-2 text-sm text-[#444]">
          <Phone size={14} aria-hidden className="text-[#A52C45]" />
          <span className="tabular-nums">{formatPhone(a.phone)}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-[#F2EEE8] pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#A52C45] transition-colors hover:bg-[#F6EEF0]"
        >
          <Pencil size={14} aria-hidden /> Edit
        </button>
        {!a.isDefault && (
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

export default function SavedAddressesPanel() {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const { confirm, dialog } = useConfirm();

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
            /* Addresses saved before the country field existed are Indian. */
            country: existing.country || DEFAULT_COUNTRY_CODE,
            phone: existing.phone ?? '',
            type: existing.type,
          }
        : /* A new address starts in the visitor's own country. */
          { ...emptyForm, country: shippableCountry(detectCountry()) ?? DEFAULT_COUNTRY_CODE }
    );
    setError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return setError('Please enter a full name.');
    if (!form.street.trim()) return setError('Please enter a street address.');
    const regionError = validateRegion(form.country, form.state, form.pincode);
    if (regionError) return setError(regionError);

    setError(null);

    try {
      const body = { ...form, pincode: form.pincode.trim() };
      if (editingId) await updateAddress({ id: editingId, body }).unwrap();
      else await createAddress(body).unwrap();
      setFormOpen(false);
    } catch {
      setError('Could not save this address. Please try again.');
    }
  };

  const askToDelete = (a: Address) =>
    confirm({
      title: 'Delete this address?',
      text: (
        <>
          <strong className="font-medium text-[#333]">{a.fullName}</strong>, {a.street}, {a.city} will be removed from
          your saved addresses.
        </>
      ),
      confirmLabel: 'Yes, delete',
      onConfirm: () => deleteAddress(a._id),
    });

  if (isFormOpen) {
    return (
      <AccountContent>
        <PageHeader title={editingId ? 'Edit Address' : 'Add New Address'} />

        <div className="grid gap-5 p-5 sm:grid-cols-2 md:p-6">
          <FormField label="Country" className="sm:col-span-2">
            <CountrySelect
              value={form.country}
              onChange={(country) => setForm({ ...form, ...regionResetFor(country) })}
              className={accountInputClass}
            />
          </FormField>

          <FormField label="Full name">
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Who should receive it"
              autoComplete="name"
              className={accountInputClass}
            />
          </FormField>

          <FormField label="Delivery phone" optional>
            <PhoneField
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
              placeholder="Mobile number"
            />
          </FormField>

          <FormField label="Street address" className="sm:col-span-2">
            <PlaceAutocomplete
              value={form.street}
              onChange={(street) => setForm({ ...form, street })}
              onSelect={(place) => setForm({ ...form, street: place.street, ...placeToAddress(place) })}
              country={form.country}
              placeholder="House no., street — start typing for suggestions"
              className={accountInputClass}
            />
          </FormField>

          <FormField label="City">
            <PlaceAutocomplete
              mode="city"
              value={form.city}
              onChange={(city) => setForm({ ...form, city })}
              onSelect={(place) => {
                const filled = placeToAddress(place);
                setForm({ ...form, country: filled.country, city: filled.city, state: filled.state || form.state });
              }}
              country={form.country}
              placeholder="City"
              className={accountInputClass}
            />
          </FormField>

          <FormField label={getAddressCountry(form.country).subdivisionLabel}>
            <StateField
              country={form.country}
              value={form.state}
              onChange={(state) => setForm({ ...form, state })}
              className={accountInputClass}
            />
          </FormField>

          <FormField label={getAddressCountry(form.country).postalLabel}>
            <PostalField
              country={form.country}
              value={form.pincode}
              onChange={(pincode) => setForm({ ...form, pincode })}
              className={accountInputClass}
            />
          </FormField>

          <FormField label="Address type" className="sm:col-span-2">
            <div className="flex flex-wrap gap-3">
              {TYPES.map(({ value, label, Icon }) => {
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, type: value })}
                    aria-pressed={active}
                    className={cn(
                      'flex h-10 items-center gap-2 rounded-full border px-5 text-sm transition-colors',
                      active
                        ? 'border-[#A52C45] bg-[#A52C45]/5 font-medium text-[#A52C45]'
                        : 'border-[#EAE6DF] text-[#444] hover:border-[#A52C45]/40'
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </FormField>

          {error && <p className="text-sm text-[#A52C45] sm:col-span-2">{error}</p>}
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
          addresses && addresses.length > 0 ? (
            <PrimaryButton type="button" onClick={() => openForm()} className="h-9 gap-1.5 px-4">
              <Plus size={16} aria-hidden /> Add New
            </PrimaryButton>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-lg bg-black/5" />
          ))}
        </div>
      ) : !addresses?.length ? (
        <div className="flex flex-col items-center px-5 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
            <MapPin size={28} aria-hidden />
          </span>
          <h3 className="mt-4 text-base font-semibold text-[#222]">No saved addresses yet</h3>
          <p className="mt-1 max-w-sm text-sm text-[#6B6B6B]">
            Save where your outfits should go, and checkout fills it in for you.
          </p>
          <PrimaryButton type="button" onClick={() => openForm()} className="mt-5 gap-1.5">
            <Plus size={16} aria-hidden /> Add an address
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
          {/* Default first. */}
          {[...addresses]
            .sort((x, y) => Number(y.isDefault) - Number(x.isDefault))
            .map((a) => (
              <AddressCard
                key={a._id}
                address={a}
                onEdit={() => openForm(a._id)}
                onMakeDefault={() => updateAddress({ id: a._id, body: { isDefault: true } })}
                onDelete={() => askToDelete(a)}
              />
            ))}

          <button
            type="button"
            onClick={() => openForm()}
            className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E5DED3] text-sm font-medium text-[#8A8A8A] transition-colors hover:border-[#A52C45]/50 hover:bg-[#FDF9FA] hover:text-[#A52C45]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
              <Plus size={20} aria-hidden />
            </span>
            Add a new address
          </button>
        </div>
      )}

      {dialog}
    </AccountContent>
  );
}
