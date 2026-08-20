
interface Props {
  step: 1 | 2;
}

export default function CheckoutStepper({
  step,
}: Props) {
  return (
    <div className="flex items-center gap-4">

      <div className="flex items-center gap-2">

        <div
          className={`
          h-6
          w-6
          rounded-full
          text-xs
          flex
          items-center
          justify-center

          ${
            step >= 1
              ? "bg-[#6D8C54] text-white"
              : "bg-gray-300"
          }
        `}
        >
          1
        </div>

        Cart

      </div>

      {/* <ChevronRight size={18} /> */}
      {">"}

      <div className="flex items-center gap-2">

        <div
          className={`
          h-6
          w-6
          rounded-full
          text-xs
          flex
          items-center
          justify-center

          ${
            step === 2
              ? "bg-[#6D8C54] text-white"
              : "bg-gray-300"
          }
        `}
        >
          2
        </div>

        Address

      </div>

    </div>
  );
}