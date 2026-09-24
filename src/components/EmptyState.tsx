import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  illustration: ReactNode;
  title: string;
  message?: string;
  /** A link (href) or a button (onClick). */
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

/**
 * Illustration + heading + one line + one action. Used wherever a list can
 * be empty, so every empty screen looks and reads the same way.
 */
export default function EmptyState({ illustration, title, message, action, className = '' }: Props) {
  const actionClass =
    'mt-5 inline-flex h-10 items-center justify-center rounded-md bg-secondary px-6 text-sm font-medium text-white transition hover:opacity-90';

  return (
    <div className={`flex animate-fade-in flex-col items-center px-5 py-12 text-center ${className}`}>
      {illustration}
      <h3 className="mt-4 text-base font-semibold text-[#222]">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#7A7A7A]">{message}</p>}
      {action?.href && (
        <Link href={action.href} className={actionClass}>
          {action.label}
        </Link>
      )}
      {action?.onClick && !action.href && (
        <button type="button" onClick={action.onClick} className={actionClass}>
          {action.label}
        </button>
      )}
    </div>
  );
}
