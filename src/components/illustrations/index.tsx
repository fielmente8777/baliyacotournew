/**
 * Line-art illustrations for empty and error states, drawn in the brand
 * palette (maroon #A52C45, blush #F6E7EA, cream #FAF6EE, stone #E4DED4).
 * Inline SVG: no image requests, crisp at any size, and they inherit the
 * width you give them through className.
 */

interface Props {
  className?: string;
}

const MAROON = '#A52C45';
const BLUSH = '#F6E7EA';
const CREAM = '#FAF6EE';
const STONE = '#E4DED4';

/** Empty shopping bag — empty cart. */
export function EmptyBagIllustration({ className = 'w-40' }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="146" rx="62" ry="7" fill={STONE} opacity="0.6" />
      <circle cx="100" cy="78" r="62" fill={CREAM} />
      <path d="M62 58h76l-6 80H68l-6-80Z" fill="#fff" stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M62 58h76l-2 22H64l-2-22Z" fill={BLUSH} />
      <path d="M82 66V50a18 18 0 0 1 36 0v16" stroke={MAROON} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="82" cy="66" r="3" fill={MAROON} />
      <circle cx="118" cy="66" r="3" fill={MAROON} />
      <path d="M88 106c4 4 20 4 24 0" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M150 34l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill={MAROON} opacity="0.35" />
      <path d="M44 96l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" fill={MAROON} opacity="0.3" />
    </svg>
  );
}

/** Open parcel box — no orders yet. */
export function EmptyOrdersIllustration({ className = 'w-40' }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="146" rx="64" ry="7" fill={STONE} opacity="0.6" />
      <circle cx="100" cy="80" r="62" fill={CREAM} />
      <path d="M52 76l48-18 48 18v52l-48 16-48-16V76Z" fill="#fff" stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M52 76l48 17 48-17" stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 93v51" stroke={MAROON} strokeWidth="2.5" />
      <path d="M52 76l-12-16 48-17 12 15" fill={BLUSH} stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M148 76l12-16-48-17-12 15" fill={BLUSH} stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 112l14 5" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M100 30v-8M88 34l-5-6M112 34l5-6" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** Bell with a soft glow — no notifications. */
export function NotificationsIllustration({ className = 'w-40' }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="146" rx="52" ry="7" fill={STONE} opacity="0.6" />
      <circle cx="100" cy="78" r="62" fill={CREAM} />
      <path
        d="M70 110V82a30 30 0 0 1 60 0v28l8 10H62l8-10Z"
        fill="#fff"
        stroke={MAROON}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M70 110h60" stroke={MAROON} strokeWidth="2" opacity="0.35" />
      <path d="M90 124a10 10 0 0 0 20 0" stroke={MAROON} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="48" r="4" fill={MAROON} />
      <path d="M78 76a22 22 0 0 1 10-14" stroke={BLUSH} strokeWidth="5" strokeLinecap="round" />
      <path d="M146 60a26 26 0 0 1 6 18M154 50a38 38 0 0 1 9 28" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M54 60a26 26 0 0 0-6 18M46 50a38 38 0 0 0-9 28" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** Empty hanger — no products match. */
export function NoProductsIllustration({ className = 'w-40' }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="100" cy="146" rx="60" ry="7" fill={STONE} opacity="0.6" />
      <circle cx="100" cy="80" r="62" fill={CREAM} />
      <path d="M36 44h128" stroke={STONE} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M100 44v4a8 8 0 1 1 8 8c-4 0-8 2-8 6"
        stroke={MAROON}
        strokeWidth="2.5"
        strokeLinecap="round"
        transform="translate(-8 0)"
      />
      <path d="M92 62L50 96h84L92 62Z" fill="#fff" stroke={MAROON} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="140" cy="112" r="16" fill="#fff" stroke={MAROON} strokeWidth="2.5" />
      <path d="M152 124l12 12" stroke={MAROON} strokeWidth="3" strokeLinecap="round" />
      <path d="M134 112h12" stroke={MAROON} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Thread spool and needle — page not found / something went wrong. */
export function LostThreadIllustration({ className = 'w-48' }: Props) {
  return (
    <svg viewBox="0 0 220 160" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="110" cy="146" rx="70" ry="7" fill={STONE} opacity="0.6" />
      <circle cx="110" cy="78" r="64" fill={CREAM} />
      <rect x="62" y="52" width="44" height="12" rx="3" fill="#fff" stroke={MAROON} strokeWidth="2.5" />
      <rect x="62" y="112" width="44" height="12" rx="3" fill="#fff" stroke={MAROON} strokeWidth="2.5" />
      <rect x="68" y="64" width="32" height="48" fill={BLUSH} stroke={MAROON} strokeWidth="2.5" />
      <path d="M68 74h32M68 84h32M68 94h32M68 104h32" stroke={MAROON} strokeWidth="1.5" opacity="0.35" />
      <path
        d="M100 88c22 0 20 30 44 26s16-40 34-34"
        stroke={MAROON}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <path d="M170 60l18 30" stroke={MAROON} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="172" cy="64" rx="2" ry="4" transform="rotate(-30 172 64)" fill="#fff" stroke={MAROON} strokeWidth="1.5" />
    </svg>
  );
}
