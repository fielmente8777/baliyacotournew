'use client';

/**
 * Small building blocks for the admin panel. Plain and dense on purpose —
 * this is a work tool, not the storefront.
 */

import { useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { ImageOff, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/format';

/* ---- Buttons ---- */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-secondary text-white hover:opacity-90',
  outline: 'border border-[#d8d2c8] bg-white text-dark hover:border-secondary hover:text-secondary',
  ghost: 'text-[#555] hover:bg-[#f1ece4] hover:text-dark',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
};

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        buttonStyles[variant],
        className
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---- Form fields ---- */

export const inputClass =
  'w-full rounded-md border border-[#d8d2c8] bg-white px-3 py-2 text-sm text-dark outline-none transition placeholder:text-[#aaa] focus:border-secondary focus:ring-2 focus:ring-secondary/15';

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-[#666]">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-[#888]">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows = 3,
  type = 'text',
  placeholder,
  className,
  error,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number' | 'email' | 'password' | 'url';
  placeholder?: string;
  className?: string;
  /** Shown in red under the field, with a red border, in place of the hint. */
  error?: string | null;
  /** Single-line fields only: lets the form focus it. */
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <Field
      label={label}
      hint={error ? <span className="font-medium text-red-700">{error}</span> : hint}
      className={className}
    >
      {(id) =>
        multiline ? (
          <textarea
            id={id}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, 'resize-y leading-relaxed')}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            ref={inputRef}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
            className={cn(inputClass, error && 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20')}
          />
        )
      }
    </Field>
  );
}

/** Rupees in the form, paise in the API. */
export function PriceField({
  label,
  paise,
  onChange,
  hint,
}: {
  label: string;
  paise: number;
  onChange: (paise: number) => void;
  hint?: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#888]">₹</span>
          <input
            id={id}
            type="number"
            min={0}
            step="1"
            value={Number.isFinite(paise) ? paise / 100 : 0}
            onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value || 0) * 100)))}
            className={cn(inputClass, 'pl-7')}
          />
        </div>
      )}
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition',
          checked ? 'bg-secondary' : 'bg-[#d8d2c8]'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-4.5' : 'left-0.5'
          )}
        />
      </button>
      <span className="flex flex-col">
        <span className="text-sm text-dark">{label}</span>
        {description && <span className="text-xs text-[#888]">{description}</span>}
      </span>
    </label>
  );
}

/* ---- Layout ---- */

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-lg border border-[#e6e0d6] bg-white', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee8de] px-5 py-3">
          {title && <h2 className="text-sm font-semibold text-dark">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-medium text-dark">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-[#777]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'warn' | 'ok' | 'off'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-[#f1ece4] text-[#555]',
    warn: 'bg-amber-100 text-amber-800',
    ok: 'bg-emerald-100 text-emerald-800',
    off: 'bg-[#eee] text-[#888]',
  };
  return <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium', tones[tone])}>{children}</span>;
}

/* ---- Messages ---- */

export type Notice = { tone: 'ok' | 'error'; text: string } | null;

export function NoticeBar({ notice, onClose }: { notice: Notice; onClose?: () => void }) {
  if (!notice) return null;
  return (
    <div
      role={notice.tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start justify-between gap-3 rounded-md px-4 py-2.5 text-sm',
        notice.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
      )}
    >
      <span>{notice.text}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="text-xs underline opacity-70 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  );
}

/* ---- Image upload ---- */

const MAX_MB = 5;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const ACCEPT = IMAGE_ACCEPT;

/** Why a file can't be uploaded as a picture, or null when it's fine. */
export function imageFileProblem(file: File) {
  if (!ACCEPT.split(',').includes(file.type)) return 'Use a JPG, PNG or WEBP image';
  if (file.size > MAX_MB * 1024 * 1024) return `Images must be under ${MAX_MB} MB`;
  return null;
}

/** Error text from a failed upload: RTK Query rejects with { data: { message } }, other code with an Error. */
export function uploadErrorMessage(err: unknown) {
  const e = err as { data?: { message?: string }; message?: string };
  return e?.data?.message || e?.message || 'Upload failed';
}

/**
 * Shows the current picture (or "No image") with an upload / replace
 * button. A picture can also be dragged onto it. `onUpload` does the work —
 * usually an upload to Shopify.
 */
export function ImageSlot({
  url,
  label,
  onUpload,
  aspect = 'aspect-square',
  className,
}: {
  url?: string;
  label?: string;
  onUpload: (file: File) => Promise<unknown>;
  aspect?: string;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setError(null);
    const problem = imageFileProblem(file);
    if (problem) return setError(problem);

    setBusy(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">{label}</span>}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          if (busy || !e.dataTransfer.types.includes('Files')) return;
          e.preventDefault();
          /* Keeps the drop from reaching a bulk drop zone around the tile. */
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (busy || !e.dataTransfer.types.includes('Files')) return;
          e.preventDefault();
          e.stopPropagation();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        disabled={busy}
        className={cn(
          'group relative w-full overflow-hidden rounded-md border border-dashed bg-[#faf8f4] transition',
          over ? 'border-secondary ring-2 ring-secondary/25' : url ? 'border-[#e6e0d6]' : 'border-amber-300',
          aspect
        )}
        aria-label={url ? `Replace ${label ?? 'image'}` : `Upload ${label ?? 'image'}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Shopify CDN urls, thumbnails only
          <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          /* Fades out under the hover label, so "Upload" doesn't sit on top of "No image". */
          <span
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-1 text-amber-700 transition',
              busy || over ? 'opacity-0' : 'group-hover:opacity-0 group-focus-visible:opacity-0'
            )}
          >
            <ImageOff className="size-5" aria-hidden />
            <span className="text-[11px] font-medium">No image</span>
          </span>
        )}
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 text-xs font-medium text-white transition',
            busy || over ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          {busy ? 'Uploading…' : over ? 'Drop to upload' : url ? 'Replace' : 'Upload'}
        </span>
      </button>
      <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
