'use client';

/**
 * The site's dropdown — replaces the browser's native <select>, whose open
 * list can't be styled and looks different on every OS.
 *
 * Accessible listbox: Arrow keys / Home / End move, Enter or Space picks,
 * Escape closes, typing jumps to the first match. Long lists (countries)
 * get a search box.
 */

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

import { cn } from '@/lib/format';

export interface SelectOption {
  value: string;
  label: string;
  /** Shown before the label in the list and the button — a flag, an icon. */
  prefix?: ReactNode;
  /** Shown in the button instead of the label (e.g. "+91" for "India +91"). */
  short?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  'aria-label'?: string;
  /** Adds a search box. Defaults on for lists longer than 12. */
  searchable?: boolean;
  disabled?: boolean;
  /** Classes for the trigger button — match the surrounding inputs. */
  className?: string;
  /** Width of the open list when it should be wider than the button. */
  menuClassName?: string;
  /** Classes for the outer box — its width in a flex row. Default full width. */
  wrapperClassName?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select',
  searchable,
  disabled,
  className,
  menuClassName,
  wrapperClassName = 'w-full',
  'aria-label': ariaLabel,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: '', at: 0 });

  const withSearch = searchable ?? options.length > 12;
  const selected = options.find((o) => o.value === value);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.short ?? ''}`.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const openList = () => {
    if (disabled) return;
    setQuery('');
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  };

  const pick = (option: SelectOption | undefined) => {
    if (!option) return;
    onChange(option.value);
    close();
  };

  /* Click outside closes. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* Keep the highlighted option in view. */
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(visible.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(visible.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        pick(visible[active]);
        break;
      case ' ':
        if (!withSearch) {
          e.preventDefault();
          pick(visible[active]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        /* Type-ahead when there is no search box to type into. */
        if (!withSearch && e.key.length === 1) {
          const now = e.timeStamp;
          typed.current.text = (now - typed.current.at < 700 ? typed.current.text : '') + e.key.toLowerCase();
          typed.current.at = now;
          const match = visible.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
          if (match !== -1) setActive(match);
        }
    }
  };

  return (
    <div ref={root} className={cn('relative', wrapperClassName)} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60',
          open && 'border-[#A52C45]',
          className
        )}
      >
        <span className={cn('flex min-w-0 items-center gap-2 truncate', !selected && 'text-[#9A9A9A]')}>
          {selected?.prefix}
          <span className="truncate">{selected ? (selected.short ?? selected.label) : placeholder}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-[#6B6B6B] transition-transform', open && 'rotate-180 text-[#A52C45]')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 top-full z-40 mt-1.5 min-w-full animate-fade-in overflow-hidden rounded-xl border border-[#EAE6DF] bg-white shadow-[0_12px_32px_rgba(27,43,54,0.14)]',
            menuClassName
          )}
        >
          {withSearch && (
            <div className="flex items-center gap-2 border-b border-[#EAE6DF] px-3">
              <Search className="h-4 w-4 text-[#9A9A9A]" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search…"
                aria-label="Search options"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-[#9A9A9A]"
              />
            </div>
          )}

          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={visible[active] ? `${id}-opt-${active}` : undefined}
            className="scrollbar-brand max-h-64 overflow-y-auto py-1.5"
          >
            {visible.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(option)}
                  className={cn(
                    'mx-1.5 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    i === active ? 'bg-[#F6EEF0] text-[#A52C45]' : 'text-[#222]',
                    isSelected && 'font-medium'
                  )}
                >
                  {option.prefix}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-[#A52C45]" aria-hidden />}
                </li>
              );
            })}
            {visible.length === 0 && <li className="px-4 py-3 text-sm text-[#9A9A9A]">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
