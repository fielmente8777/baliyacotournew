/** Shared loading state so every panel fails the same way. */
export default function PanelSkeleton({ title }: { title: string }) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-dark md:mb-8 md:text-3xl lg:text-4xl">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] w-full rounded-xl bg-black/5" />
            <div className="mt-2 h-4 w-20 rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
