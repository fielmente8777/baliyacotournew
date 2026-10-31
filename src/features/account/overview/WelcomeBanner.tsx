'use client';

import { useGetProfileQuery } from '@/store/api/profileApi';
import { formatPhone } from '@/lib/phone';

import { PillLink } from '../../../app/(website)/Home/Components/ui';
import { initialsOf } from '../../../app/(website)/my-account/components/accountMenu';

/** The burgundy greeting at the top of the overview, in the "design it yourself" block's style. */
export default function WelcomeBanner() {
  const { data: profile } = useGetProfileQuery();
  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const contact = profile?.email || formatPhone(profile?.phone);

  return (
    <section className="flex flex-col gap-6 rounded-md bg-secondary px-5 py-7 text-white md:flex-row md:items-center md:justify-between md:px-8 md:py-9">
      <div className="flex items-center gap-4 md:gap-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-lg font-semibold text-secondary md:size-16 md:text-xl">
          {initialsOf(profile?.name)}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F3D9A4] md:text-xs">Your account</p>
          <h2 className="mt-1.5 text-[26px] font-medium leading-tight md:text-[34px]">
            Hello{firstName ? `, ${firstName}` : ''}. <span className="text-[#F8E7CF]">Good to see you.</span>
          </h2>
          {contact && <p className="mt-1 truncate text-sm text-white/80">{contact}</p>}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
        <PillLink href="/create-your-own-design" label="Start designing" variant="light" arrow />
        <PillLink href="/my-account/personal-details" label="Edit profile" variant="outlineLight" />
      </div>
    </section>
  );
}
