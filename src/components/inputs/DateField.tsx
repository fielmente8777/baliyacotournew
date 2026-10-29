'use client';

/**
 * The site's date picker — replaces <input type="date">, whose calendar
 * can't be themed and which pops the keyboard up on phones.
 *
 * The field is a button, not a text input, so nothing ever asks for the
 * keyboard: tap it, pick a day, the calendar closes and the date is in.
 *   - Desktop: a calendar popover under the field.
 *   - Phone: a bottom sheet over a dimmed page (the page stays put).
 * Month and year are dropdowns, so a birth year decades back is two taps.
 *
 * Value in and out is "YYYY-MM-DD" (or ""), the same as the native input,
 * built from local date parts so no timezone can shift the day.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { cn } from '@/lib/format';

interface Props {
  /** "YYYY-MM-DD", or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown as the sheet's heading on phones. */
  label?: string;
  min?: Date;
  max?: Date;
  /** Month the calendar opens on when nothing is picked yet. */
  defaultMonth?: Date;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromValue = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
};
const display = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function DateField({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  min = new Date(1920, 0, 1),
  max,
  defaultMonth,
  className,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const selected = value ? fromValue(value) : undefined;

  const close = () => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  };

  /* Click outside or Escape closes; on phones the page behind can't scroll. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);

    const phone = window.matchMedia('(max-width: 639px)').matches;
    const overflow = document.body.style.overflow;
    if (phone) document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={label ? `${label}: ${selected ? display.format(selected) : 'not set'}` : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-md border border-[#EAE6DF] bg-white px-4 text-left text-sm outline-none transition-colors focus:border-[#A52C45]',
          open && 'border-[#A52C45]',
          className
        )}
      >
        <span className={selected ? 'text-[#222]' : 'text-[#9A9A9A]'}>
          {selected ? display.format(selected) : placeholder}
        </span>
        <CalendarDays size={18} aria-hidden className="shrink-0 text-[#A52C45]" />
      </button>

      {open && (
        <>
          {/* Phone only: dims the page behind the sheet. */}
          <div aria-hidden className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} />

          <div
            id={id}
            role="dialog"
            aria-modal="false"
            aria-label={label ?? placeholder}
            className={cn(
              'baliye-calendar z-50 animate-fade-in bg-white',
              /* phone: bottom sheet */
              'fixed inset-x-0 bottom-0 rounded-t-2xl px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.18)]',
              /* desktop: popover under the field */
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:rounded-xl sm:border sm:border-[#EAE6DF] sm:p-3 sm:shadow-[0_12px_32px_rgba(27,43,54,0.14)]'
            )}
          >
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-[#E5E0D8] sm:hidden" />
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <p className="text-sm font-semibold text-[#222]">{label ?? placeholder}</p>
              <button
                type="button"
                onClick={close}
                aria-label="Close calendar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#F6EEF0]"
              >
                <X size={18} />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(day) => {
                if (!day) return;
                onChange(toValue(day));
                close();
              }}
              captionLayout="dropdown"
              reverseYears
              startMonth={min}
              endMonth={max ?? new Date(new Date().getFullYear() + 10, 11)}
              disabled={[{ before: min }, ...(max ? [{ after: max }] : [])]}
              defaultMonth={selected ?? defaultMonth ?? max}
              autoFocus
              showOutsideDays
              className="mx-auto w-fit"
            />
          </div>
        </>
      )}
    </div>
  );
}
