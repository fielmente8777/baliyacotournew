interface Props {
  selections: { groupLabel: string; optionLabel: string }[];
}

/** A custom design's choices (Neck, Sleeve, Embroidery…) as small label/value pairs. */
export default function DesignSelections({ selections }: Props) {
  if (!selections.length) return null;

  return (
    <dl className="mt-3 flex flex-wrap gap-1.5">
      {selections.map((selection) => (
        <div
          key={selection.groupLabel}
          className="flex min-w-0 max-w-full items-baseline gap-1 rounded-sm bg-[#FAF7F2] px-2 py-1 text-xs"
        >
          <dt className="shrink-0 text-[#8B6E54]">{selection.groupLabel}</dt>
          <dd className="truncate font-medium text-dark">{selection.optionLabel}</dd>
        </div>
      ))}
    </dl>
  );
}
