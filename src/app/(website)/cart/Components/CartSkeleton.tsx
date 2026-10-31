/** Placeholder lines and summary while the bag loads. */
export default function CartSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10" aria-busy="true" aria-label="Loading your bag">
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex animate-pulse gap-4 rounded-md border border-[#E8DFD3] bg-white p-3 sm:gap-6 sm:p-5">
            <div className="h-32 w-24 rounded-sm bg-black/5 sm:h-44 sm:w-33" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-3 w-24 rounded bg-black/5" />
              <div className="h-5 w-2/3 rounded bg-black/5" />
              <div className="h-11 w-32 rounded-full bg-black/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden h-72 animate-pulse rounded-md border border-[#E8DFD3] bg-white lg:block" />
    </div>
  );
}
