'use client';

/**
 * Personal Details — read view (Profile.pdf) flipping to an edit form
 * (Profile-4.pdf) in place. All data comes from GET /profile.
 */

import { useState, type ReactNode } from 'react';
import { BadgeCheck, Cake, Mail, Pencil, Phone, UserRound, VenusAndMars, type LucideIcon } from 'lucide-react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/profileApi';
import type { Gender, UpdateProfileBody } from '@/@types/account';
import DateField from '@/components/inputs/DateField';
import PhoneField from '@/components/inputs/PhoneField';
import Select from '@/components/inputs/Select';
import TokenSummaryCard from '@/features/tokens/TokenSummaryCard';
import { formatPhone, isPhonePossible } from '@/lib/phone';
import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import PageHeader from '../../app/(website)/my-account/components/PageHeader';
import PrimaryButton from '../../app/(website)/my-account/components/PrimaryButton';
import OutlineButton from '../../app/(website)/my-account/components/OutlineButton';
import { initialsOf } from '../../app/(website)/my-account/components/accountMenu';
import FormField, { accountInputClass } from '../../app/(website)/my-account/components/FormField';

const GENDERS: Array<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

/** "19 February 1999". The DOB is a calendar day — read its date part, not a local time. */
const formatDob = (iso?: string) => {
  const d = iso ? fromDay(iso.slice(0, 10)) : undefined;
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined;
};

const fromDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
};

/** The date picker works in YYYY-MM-DD, not a full ISO timestamp. */
const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '');

/** One detail in the read view: icon, label, value — or "Not added" with a shortcut to add it. */
function DetailTile({
  icon: Icon,
  label,
  value,
  onAdd,
}: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-lg border border-[#F2EEE8] bg-[#FDFBF8] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6EEF0] text-[#A52C45]">
        <Icon size={18} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A8A]">{label}</p>
        {value ? (
          <div className="mt-0.5 wrap-break-word text-[15px] font-medium text-[#222]">{value}</div>
        ) : (
          <p className="mt-0.5 text-sm text-[#9A9A9A]">
            Not added ·{' '}
            <button type="button" onClick={onAdd} className="font-medium text-[#A52C45] hover:underline">
              Add
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function PersonalDetailsPanel() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', dob: '' });
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
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
    if (form.phone && !isPhonePossible(form.phone.trim())) {
      return setError('Please enter a valid phone number.');
    }

    setError(null);

    /* Send only fields with a value — the backend treats every key as a set,
       so an empty string would overwrite a good value with nothing. */
    const body: UpdateProfileBody = {};
    if (form.name.trim()) body.name = form.name.trim();
    if (form.email.trim()) body.email = form.email.trim().toLowerCase();
    if (form.phone.trim()) body.phone = form.phone.trim();
    if (form.gender) body.gender = form.gender as Gender;
    if (form.dob) body.dob = form.dob;

    try {
      await updateProfile(body).unwrap();
      setEditing(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 409
          ? 'That phone number or email is already used by another account.'
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
    const gender = GENDERS.find((g) => g.value === profile.gender)?.label;
    const verified = (
      <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-medium text-emerald-700">
        <BadgeCheck size={14} aria-hidden /> Verified
      </span>
    );

    return (
      <AccountContent>
        <PageHeader title="Personal Details" />

        {/* Who this is, at a glance. */}
        <div className="flex items-center gap-4 border-b border-[#F2EEE8] bg-linear-to-r from-[#FBF6F7] to-white px-5 py-6 md:px-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#A52C45] text-xl font-semibold tracking-wide text-white ring-4 ring-white">
            {initialsOf(profile.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[#222]">{profile.name || 'Your profile'}</p>
            <p className="truncate text-sm text-[#6B6B6B]">
              {[formatPhone(profile.phone), profile.email].filter(Boolean).join('  ·  ') || 'Add your details below'}
            </p>
          </div>
        </div>

        <TokenSummaryCard />

        <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-6">
          <DetailTile icon={UserRound} label="Full name" value={profile.name} onAdd={startEditing} />
          <DetailTile
            icon={Phone}
            label="Mobile number"
            value={
              profile.phone && (
                <>
                  <span className="tabular-nums">{formatPhone(profile.phone)}</span>
                  {profile.isPhoneVerified && verified}
                </>
              )
            }
            onAdd={startEditing}
          />
          <DetailTile
            icon={Mail}
            label="Email"
            value={
              profile.email && (
                <>
                  {profile.email}
                  {profile.isEmailVerified && verified}
                </>
              )
            }
            onAdd={startEditing}
          />
          <DetailTile icon={VenusAndMars} label="Gender" value={gender} onAdd={startEditing} />
          <DetailTile icon={Cake} label="Date of birth" value={formatDob(profile.dob)} onAdd={startEditing} />
        </div>

        <div className="border-t border-[#EAE6DF] p-5 md:p-6">
          <OutlineButton type="button" onClick={startEditing} className="w-full gap-2 sm:w-auto">
            <Pencil size={15} aria-hidden />
            Edit Profile Details
          </OutlineButton>
        </div>
      </AccountContent>
    );
  }

  return (
    <AccountContent>
      <PageHeader title="Edit Personal Details" />

      <div className="grid gap-5 p-5 sm:grid-cols-2 md:p-6">
        <FormField label="Full name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            autoComplete="name"
            className={accountInputClass}
          />
        </FormField>

        {/* Contact number — no longer the login identity (Shopify email is),
            so it's a normal field now, kept unique per account server-side. */}
        <FormField label="Mobile number">
          <PhoneField
            value={form.phone}
            onChange={(phone) => setForm({ ...form, phone })}
            placeholder="Mobile number"
          />
        </FormField>

        <FormField label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            className={accountInputClass}
          />
        </FormField>

        <FormField label="Gender">
          <Select
            value={form.gender}
            onChange={(gender) => setForm({ ...form, gender })}
            aria-label="Gender"
            placeholder="Select gender"
            options={GENDERS}
            className={accountInputClass}
          />
        </FormField>

        {/* A calendar, not a text box: on phones it opens as a sheet and the
            keyboard never comes up. */}
        <FormField label="Date of birth">
          <DateField
            value={form.dob}
            onChange={(dob) => setForm({ ...form, dob })}
            placeholder="Select your date of birth"
            label="Date of birth"
            max={new Date()}
            defaultMonth={new Date(new Date().getFullYear() - 25, 0)}
          />
        </FormField>

        {error && <p className="text-sm text-[#A52C45] sm:col-span-2">{error}</p>}
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
