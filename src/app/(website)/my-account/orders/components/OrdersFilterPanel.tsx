'use client';

/**
 * The panel the "Filter" button opens. Inline under the header rather than a
 * floating popover, so it never runs off a phone screen. Choices apply
 * immediately — there's no Apply button to forget.
 */

import type { OrderStage } from '../orderView';

export type StatusFilter = 'all' | OrderStage;
export type TypeFilter = 'all' | 'custom' | 'shopify';
export type TimeFilter = 'all' | '30d' | '6m' | 'year';

export interface OrderFilters {
  status: StatusFilter;
  type: TypeFilter;
  time: TimeFilter;
}

export const DEFAULT_ORDER_FILTERS: OrderFilters = { status: 'all', type: 'all', time: 'all' };

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'In progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'custom', label: 'Custom designs' },
  { value: 'shopify', label: 'Ready to wear' },
];

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
];

export const countActiveFilters = (f: OrderFilters) =>
  (f.status !== 'all' ? 1 : 0) + (f.type !== 'all' ? 1 : 0) + (f.time !== 'all' ? 1 : 0);

/** Earliest placement date the time filter allows, or null for "all time". */
export function timeFilterStart(time: TimeFilter, now = new Date()): Date | null {
  switch (time) {
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '6m': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return d;
    }
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

interface GroupProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function ChipGroup<T extends string>({ label, value, options, onChange }: GroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A8A8A]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-8 rounded-full border px-3.5 text-[13px] transition-colors ${
                selected
                  ? 'border-[#A52C45] bg-[#A52C45] text-white'
                  : 'border-[#E4DED4] bg-white text-[#444] hover:border-[#A52C45] hover:text-[#A52C45]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface Props {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
}

export default function OrdersFilterPanel({ filters, onChange }: Props) {
  const active = countActiveFilters(filters);

  return (
    <div
      id="orders-filter-panel"
      className="grid animate-slide-down gap-5 border-b border-[#E9E4DC] bg-[#FCFBF8] px-4 py-5 sm:px-5 md:grid-cols-3 md:px-6"
    >
      <ChipGroup
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <ChipGroup
        label="Type"
        value={filters.type}
        options={TYPE_OPTIONS}
        onChange={(type) => onChange({ ...filters, type })}
      />
      <ChipGroup
        label="Placed"
        value={filters.time}
        options={TIME_OPTIONS}
        onChange={(time) => onChange({ ...filters, time })}
      />

      {active > 0 && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_ORDER_FILTERS)}
          className="justify-self-start text-sm font-medium text-[#A52C45] underline underline-offset-2 md:col-span-3"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
