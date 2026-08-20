import type { OrderTimelineItem } from '../pageData';

interface Props {
  items: OrderTimelineItem[];
}

export default function OrderTimeline({ items }: Props) {
  return (
    <div className="mt-5 overflow-x-auto ">
      <div className="min-w-155 w-full border-[#9BA1B04D] box-shadow bg-[#FAFAFB] px-4 py-5">
        <ol className="grid grid-cols-5">
          {items.map((item) => {
            const isDone = item.status === 'completed';
            const isCurrent = item.status === 'current';

            return (
              <li key={item.id} className="px-2 text-center space-y-4">
                <span
                  className={[
                    'mx-auto flex w-8 items-center justify-center aspect-square rounded-full border leading-none',
                    isDone
                      ? 'border-[#A52C45] bg-[#A52C45] text-white'
                      : isCurrent
                        ? 'border-[#A52C45] bg-white text-[#A52C45]'
                        : 'border-[#D5D5D5] bg-white text-[#AFAFAF]',
                  ].join(' ')}
                >
                  {item.id}
                </span>

                <p
                  className={[
                    'mt-2.5 text-[13px] leading-tight',
                    isDone || isCurrent ? 'font-medium text-[#222]' : 'text-[#9A9A9A]',
                  ].join(' ')}
                >
                  {item.title}
                </p>

                {/* Pending steps have no date in the design. */}
                {item.date && (isDone || isCurrent) && (
                  <p className="mt-1.5 text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                    {item.date}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
