'use client';

/** Small shared pieces for the order-action sheets. */

import { CheckCircle2, Info } from 'lucide-react';

export const btnPrimary =
  'flex h-11 flex-1 items-center justify-center rounded-lg bg-[#A52C45] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
export const btnDanger =
  'flex h-11 flex-1 items-center justify-center rounded-lg bg-[#9B1C14] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
export const btnSecondary =
  'flex h-11 flex-1 items-center justify-center rounded-lg border border-[#DDD6CC] px-5 text-sm font-medium text-[#333] transition hover:bg-[#FAF8F4]';
export const textArea =
  'w-full rounded-lg border border-[#DDD6CC] bg-white px-3 py-2.5 text-sm text-[#222] outline-none transition placeholder:text-[#A9A9A9] focus:border-[#A52C45]';

/** A tappable option row — radio or checkbox — styled as a card. */
export function ChoiceCard({
  type = 'radio',
  name,
  checked,
  onChange,
  title,
  description,
  aside,
  children,
}: {
  type?: 'radio' | 'checkbox';
  name?: string;
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
        checked ? 'border-[#A52C45] bg-[#FDF5F7]' : 'border-[#E9E4DC] hover:border-[#CFC6BA]'
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="mt-0.5 h-4 w-4 shrink-0 accent-[#A52C45]" />
      {children}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#222]">{title}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-[#6B6B6B]">{description}</span>}
      </span>
      {aside}
    </label>
  );
}

export function InfoNote({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' }) {
  return (
    <div
      className={`flex gap-2.5 rounded-xl p-3.5 text-[13px] leading-relaxed ${
        tone === 'good' ? 'bg-[#EEF6EC] text-[#2F5E31]' : 'bg-[#FAF6EF] text-[#5C4A36]'
      }`}
    >
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-sm font-semibold text-[#222]">{children}</p>;
}

/** Final screen of every flow: a tick, what happened, what happens next. */
export function SuccessView({
  title,
  reference,
  steps,
  note,
}: {
  title: string;
  reference?: string;
  steps: string[];
  note?: string;
}) {
  return (
    <div className="animate-fade-in text-center">
      <CheckCircle2 size={48} className="mx-auto text-[#2F7D32]" aria-hidden="true" />
      <p className="mt-3 text-lg font-semibold text-[#222]">{title}</p>
      {reference && <p className="mt-1 text-[13px] text-[#6B6B6B]">Reference {reference}</p>}

      <ol className="mx-auto mt-6 max-w-xs space-y-0 text-left">
        {steps.map((s, i) => (
          <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-[#E9E4DC]" aria-hidden="true" />}
            <span
              className={`relative mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                i === 0 ? 'bg-[#2F7D32] text-white' : 'border border-[#DDD6CC] bg-white text-[#8A8A8A]'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-sm ${i === 0 ? 'font-medium text-[#222]' : 'text-[#6B6B6B]'}`}>{s}</span>
          </li>
        ))}
      </ol>

      {note && <p className="mt-6 text-[13px] text-[#6B6B6B]">{note}</p>}
    </div>
  );
}
