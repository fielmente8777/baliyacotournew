/** Five stars filled to the exact average — 4.5 shows four and a half. */
export default function StarRating({ value, className = "" }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of 5`}
      className={`relative inline-block leading-none tracking-widest text-[#C9C9C9] ${className}`}
    >
      ★★★★★
      <span aria-hidden className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#426340]" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
