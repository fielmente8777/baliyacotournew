'use client';

import { useState } from 'react';
import { KeyRound, Plus, Trash2, UserRound } from 'lucide-react';

import type { TeamMember } from '@/@types/admin';
import {
  adminErrorMessage,
  useAddTeamMemberMutation,
  useGetAdminMeQuery,
  useGetTeamQuery,
  useRemoveTeamMemberMutation,
  useUpdateTeamMemberMutation,
} from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Badge, Button, Card, NoticeBar, PageTitle, PasswordField, TextField, Toggle, type Notice } from './ui';

const MIN_PASSWORD = 8;

/**
 * Admin → Team: the people who can sign in to this panel. An owner adds a
 * team member with their email and a password; they sign in at /admin/login
 * with those and see the whole panel. Switching someone off or removing them
 * signs them out at once. Owners can also remove another owner, never
 * themselves. Only owners see or change this page.
 */
export default function TeamView() {
  const { data: me } = useGetAdminMeQuery();
  const isOwner = (me?.role ?? 'owner') === 'owner';
  const { data: team = [], isLoading, error } = useGetTeamQuery(undefined, { skip: !me || !isOwner });
  const [notice, setNotice] = useState<Notice>(null);

  if (me && !isOwner) {
    return (
      <div className="max-w-3xl">
        <PageTitle title="Team" />
        <p className="text-sm text-[#666]">Only the account owner can add or remove team members.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageTitle
        title="Team"
        description="Add the people who should be able to sign in to this admin panel. Each one signs in at the admin login with their own email and password, and sees everything you see except this page."
      />
      <div className="mb-5">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      </div>

      <AddMemberCard onDone={(text) => setNotice({ tone: 'ok', text })} />

      <Card title={`Who can sign in (${team.length})`}>
        {isLoading ? (
          <p className="text-sm text-[#888]">Loading…</p>
        ) : error ? (
          <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load the team') }} />
        ) : (
          <ul className="divide-y divide-[#f1ece4]">
            {team.map((m) => (
              <MemberRow key={m._id} member={m} isMe={m._id === me?._id} onNotice={setNotice} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AddMemberCard({ onDone }: { onDone: (text: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [add, { isLoading, error, reset }] = useAddTeamMemberMutation();

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email.trim()) && password.length >= MIN_PASSWORD;

  const submit = async () => {
    try {
      const member = await add({ name: name.trim(), email: email.trim(), password }).unwrap();
      setName('');
      setEmail('');
      setPassword('');
      onDone(`${member.name} can now sign in with ${member.email} and the password you set. Share it with them privately.`);
    } catch {
      /* Shown below. */
    }
  };

  return (
    <Card className="mb-5" title={<span className="flex items-center gap-2"><Plus className="size-4" aria-hidden /> Add a team member</span>}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
        onChange={() => error && reset()}
      >
        <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Priya Sharma" />
        <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="name@example.com" />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD} characters. You can change it later.`}
        />
        <div className="flex items-end">
          <Button type="submit" loading={isLoading} disabled={!valid} className="h-10 w-full sm:w-auto">
            <Plus className="size-4" aria-hidden /> Add member
          </Button>
        </div>
        {error && (
          <div className="sm:col-span-2">
            <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not add this member') }} />
          </div>
        )}
      </form>
    </Card>
  );
}

function MemberRow({ member, isMe, onNotice }: { member: TeamMember; isMe: boolean; onNotice: (n: Notice) => void }) {
  const [settingPassword, setSettingPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [update, { isLoading: saving }] = useUpdateTeamMemberMutation();
  const [remove, { isLoading: removing }] = useRemoveTeamMemberMutation();
  const isMember = member.role === 'member';
  /* Another owner (e.g. a leftover seed account) can be removed too, never yourself.
     The backend also keeps the last active owner. */
  const canRemove = isMember || !isMe;

  const run = async (action: () => Promise<unknown>, ok: string) => {
    try {
      await action();
      onNotice({ tone: 'ok', text: ok });
      return true;
    } catch (err) {
      onNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save') });
      return false;
    }
  };

  const lastSeen = member.lastLoginAt
    ? `Last signed in ${new Date(member.lastLoginAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`
    : 'Not signed in yet';

  const removeButton = canRemove && (
    <Button
      variant="ghost"
      loading={removing}
      className="text-red-700 hover:bg-red-50"
      aria-label={`Remove ${member.name} (${member.email})`}
      onClick={() => {
        const what = isMember ? 'They are signed out and can no longer sign in.' : 'This owner account is signed out and deleted.';
        if (!window.confirm(`Remove ${member.name} (${member.email})? ${what}`)) return;
        void run(() => remove(member._id).unwrap(), `${member.email} was removed.`);
      }}
    >
      <Trash2 className="size-4" aria-hidden />
      <span className="hidden sm:inline">Remove</span>
    </Button>
  );

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1ece4] text-[#777]">
          <UserRound className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('flex flex-wrap items-center gap-2 text-sm font-medium', member.isActive ? 'text-dark' : 'text-[#999]')}>
            {member.name}
            <Badge tone={isMember ? 'neutral' : 'ok'}>{isMember ? 'Team member' : 'Owner'}</Badge>
            {isMe && <Badge>You</Badge>}
            {!member.isActive && <Badge tone="off">Switched off</Badge>}
          </span>
          <span className="block truncate text-xs text-[#888]">
            {member.email} · {lastSeen}
          </span>
        </span>

        {isMember && (
          <div className="flex flex-wrap items-center gap-2">
            <Toggle
              checked={member.isActive}
              onChange={(on) =>
                run(
                  () => update({ id: member._id, body: { isActive: on } }).unwrap(),
                  on ? `${member.name} can sign in again.` : `${member.name} is switched off and signed out.`
                )
              }
              label="Can sign in"
            />
            <Button variant="outline" onClick={() => setSettingPassword((s) => !s)}>
              <KeyRound className="size-4" aria-hidden /> {settingPassword ? 'Cancel' : 'New password'}
            </Button>
            {removeButton}
          </div>
        )}
        {!isMember && canRemove && removeButton}
      </div>

      {isMember && settingPassword && (
        <form
          className="mt-3 flex flex-col gap-3 rounded-md bg-[#faf8f4] p-3 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await run(
              () => update({ id: member._id, body: { password } }).unwrap(),
              `New password saved for ${member.name}. They were signed out and need to sign in with it.`
            );
            if (ok) {
              setPassword('');
              setSettingPassword(false);
            }
          }}
        >
          <div className="flex-1">
            <PasswordField label={`New password for ${member.name}`} value={password} onChange={setPassword} autoComplete="new-password" />
          </div>
          <Button type="submit" loading={saving} disabled={password.length < MIN_PASSWORD} className="h-10">
            Save password
          </Button>
        </form>
      )}
    </li>
  );
}
