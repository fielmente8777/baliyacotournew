interface Props {
  title: string;
}

export default function SectionTitle({
  title,
}: Props) {
  return (
    <h3 className="text-[22px] font-semibold text-[#222]">
      {title}
    </h3>
  );
}