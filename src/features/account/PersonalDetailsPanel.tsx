'use client';

/**
 * Personal Details — read view (Profile.pdf) flipping to an edit form
 * (Profile-4.pdf) in place. All data comes from GET /profile.
 */

import { useState } from 'react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/profileApi';
import type { Gender, UpdateProfileBody } from '@/@types/account';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';

const GENDERS: Array<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

const NOT_ADDED = '- not added-';

/** 19/02/1999 — the display format used in the design. */
const formatDob = (iso?: string) => {
  if (!iso) return NOT_ADDED;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? NOT_ADDED
    : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/** "+918580547174" → "+91- 8580547174" as the design shows it. */
const formatPhone = (phone?: string) => {
  if (!phone) return NOT_ADDED;
  const match = phone.match(/^(\+\d{1,3})(\d{6,})$/);
  return match ? `${match[1]}- ${match[2]}` : phone;
};

/** <input type="date"> needs YYYY-MM-DD, not a full ISO timestamp. */
const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '');

export default function PersonalDetailsPanel() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', gender: '', dob: '' });
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      email: profile.email ?? '',
      gender: profile.gender ?? '',
      dob: toDateInput(profile.dob),
    });
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (form.name && form.name.trim().length < 2) {
      return setError('Name must be at least 2 characters.');
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      return setError('Please enter a valid email address.');
    }

    setError(null);

    /* Send only fields with a value — the backend treats every key as a set,
       so an empty string would overwrite a good value with nothing. */
    const body: UpdateProfileBody = {};
    if (form.name.trim()) body.name = form.name.trim();
    if (form.email.trim()) body.email = form.email.trim().toLowerCase();
    if (form.gender) body.gender = form.gender as Gender;
    if (form.dob) body.dob = form.dob;

    try {
      console.log('body', body);
      await updateProfile(body).unwrap();
      setEditing(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 409
          ? 'That email is already used by another account.'
          : 'Could not save your details. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <AccountContent>
        <PageHeader title="Personal Details" />
        <div className="space-y-5 p-5 md:p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full animate-pulse rounded bg-black/5" />
          ))}
        </div>
      </AccountContent>
    );
  }

  if (isError || !profile) {
    return (
      <AccountContent>
        <PageHeader title="Personal Details" />
        <div className="p-5 md:p-6">
          <p className="text-sm text-[#A52C45]">We couldn&apos;t load your profile.</p>
          <OutlineButton type="button" onClick={() => refetch()} className="mt-4">
            Try again
          </OutlineButton>
        </div>
      </AccountContent>
    );
  }

  if (!editing) {
    const rows: Array<[string, string]> = [
      ['Full Name', profile.name || NOT_ADDED],
      ['Mobile Number', formatPhone(profile.phone)],
      ['Email ID', profile.email || NOT_ADDED],
      ['Gender', GENDERS.find((g) => g.value === profile.gender)?.label ?? NOT_ADDED],
      ['DOB', formatDob(profile.dob)],
    ];

    return (
      <AccountContent>
        <PageHeader title="Personal Details" />

        <dl className="px-5 py-2 md:px-6">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-1 gap-1 border-b border-[#F2EEE8] py-4 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="text-sm text-[#8A8A8A]">{label}</dt>
              <dd className="break-words text-sm text-[#222]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-[#EAE6DF] p-5 md:p-6">
          <OutlineButton type="button" onClick={startEditing} className="w-full sm:w-auto">
            Edit Profile Details
          </OutlineButton>
        </div>
      </AccountContent>
    );
  }

  return (
    <AccountContent>
      <PageHeader title="Personal Details" />

      <div className="space-y-4 p-5 md:p-6">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full Name"
          className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
        />

        {/* Read-only: phone is the login identity and only the OTP flow changes it. */}
        <div className="flex h-12 items-center rounded-md border border-[#EAE6DF] bg-[#FAF9F7] px-4">
          <span className="text-sm text-[#8A8A8A]">
            {formatPhone(profile.phone)}
          </span>
          <span className="ml-auto text-xs text-[#9A9A9A]">Cannot be changed</span>
        </div>

        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email ID"
          className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm outline-none focus:border-[#A52C45]"
        />

        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="h-12 w-full rounded-md border border-[#EAE6DF] bg-white px-4 text-sm outline-none focus:border-[#A52C45]"
        >
          <option value="">Select Gender</option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.dob}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
          className="h-12 w-full rounded-md border border-[#EAE6DF] px-4 text-sm text-[#222] outline-none focus:border-[#A52C45]"
        />

        {error && <p className="text-sm text-[#A52C45]">{error}</p>}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#EAE6DF] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <OutlineButton type="button" onClick={() => setEditing(false)}>
          Cancel
        </OutlineButton>

        <PrimaryButton type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Profile'}
        </PrimaryButton>
      </div>
    </AccountContent>
  );
}
