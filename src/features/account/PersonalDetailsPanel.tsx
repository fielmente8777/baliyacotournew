'use client';

/**
 * Personal Details — read view (Profile.pdf) that flips to an edit form
 * (Profile-4.pdf) in place. Two screens, one route: the design shows no
 * URL change, and keeping it local means the form state dies when the
 * user cancels, which is what you want.
 */

import { useState } from 'react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/profileApi';
import type { Gender } from '@/@types/account';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';

const GENDERS: Array<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

/** 19/02/1999 — the display format used in the design. */
const formatDob = (iso: string | null) => {
  if (!iso) return '- not added-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '- not added-'
    : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function PersonalDetailsPanel() {
  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', dob: '' });
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    if (!profile) return;
    setForm({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      gender: profile.gender ?? '',
      dob: profile.dob ? profile.dob.slice(0, 10) : '',
    });
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email.');
    if (!/^\d{10}$/.test(form.phone)) return setError('Mobile number must be 10 digits.');

    setError(null);
    await updateProfile({
      name: form.name.trim(),
      phone: form.phone,
      email: form.email.trim(),
      gender: (form.gender || null) as Gender | null,
      dob: form.dob || null,
    }).unwrap();
    setEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <AccountContent>
        <PageHeader title="Personal Details" />
        <div className="space-y-4 p-5 md:p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full animate-pulse rounded bg-black/5" />
          ))}
        </div>
      </AccountContent>
    );
  }

  if (!editing) {
    const rows: Array<[string, string]> = [
      ['Full Name', profile.name],
      ['Mobile Number', `${profile.countryCode}- ${profile.phone}`],
      ['Email ID', profile.email],
      ['Gender', GENDERS.find((g) => g.value === profile.gender)?.label ?? '- not added-'],
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

        <div className="flex h-12 items-center rounded-md border border-[#EAE6DF] px-4 focus-within:border-[#A52C45]">
          <span className="shrink-0 border-r border-[#EAE6DF] pr-3 text-sm text-[#222]">
            {profile.countryCode}
          </span>
          <input
            inputMode="numeric"
            value={form.phone}
            onChange={(e) =>
              /^\d{0,10}$/.test(e.target.value) && setForm({ ...form, phone: e.target.value })
            }
            placeholder="Mobile Number"
            className="w-full bg-transparent pl-3 text-sm outline-none"
          />
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
