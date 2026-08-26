'use client';

/**
 * Dial-code selector with search (Login-Focus-1 / Login-Focus-2).
 * Closes on outside click and on Escape; the search box is focused when it
 * opens so a user can type straight away.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { COUNTRIES, flagEmoji, searchCountries } from '@/lib/countries';
import { cn } from '@/lib/format';

interface Props {
  value: string;
  onChange: (dial: string) => void;
}

export default function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.dial === value) ?? COUNTRIES[0],
    [value]
  );

  const results = useMemo(() => searchCountries(query), [query]);

  useEffect(() => {
    if (!open) return;

    searchRef.current?.focus();

    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-full items-center gap-1.5 pr-3 text-[15px] font-medium text-[#1B2B36]"
      >
        <span className="text-lg leading-none">{flagEmoji(selected.iso)}</span>
        <span>{selected.dial}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+10px)] z-30 w-[320px] max-w-[80vw] overflow-hidden rounded-lg bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-2 border-b border-[#EFEFEF] px-4 py-3">
            <Search size={16} className="shrink-0 text-[#9A9A9A]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your country"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A9A9A]"
            />
          </div>

          <ul className="max-h-[260px] overflow-y-auto">
            {results.map((c) => (
              <li key={`${c.iso}-${c.dial}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.dial === value}
                  onClick={() => {
                    onChange(c.dial);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[#F6F6F6]',
                    c.dial === value && 'bg-[#F6F6F6]'
                  )}
                >
                  <span className="text-lg leading-none">{flagEmoji(c.iso)}</span>
                  <span className="text-[#1B2B36]">
                    {c.name} ({c.dial})
                  </span>
                </button>
              </li>
            ))}

            {results.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[#9A9A9A]">
                No country matches “{query}”
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
