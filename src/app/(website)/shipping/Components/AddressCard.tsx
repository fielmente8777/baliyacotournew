"use client";

import { Address } from "../pageData";

interface Props {
  address: Address;
}

export default function AddressCard({
  address,
}: Props) {
  return (
    <div className="border-b border-[#EEE] py-8 last:border-none">

      <div className="flex items-start gap-4">

        <input
          type="radio"
          checked={address.selected}
          readOnly
          className="mt-1 accent-[#972E47]"
        />

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <h3 className="font-semibold">
              {address.name}
            </h3>

            <span
              className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-[#EEF7E8]
              px-3
              py-1
              text-xs
              text-[#54724D]
            "
            >
              {/* {address.type === "Home" ? (
                <Home size={14} />
              ) : (
                <Briefcase size={14} />
              )} */}

              {address.type}
            </span>

          </div>

          <p className="mt-3 text-[#666] leading-7">
            {address.address}
            <br />
            {address.city}, {address.state}
            <br />
            {address.pincode}
          </p>

          <button
            className="
            mt-5
            rounded-md
            border
            border-[#972E47]
            px-6
            py-2
            text-[#972E47]
            transition
            hover:bg-[#972E47]
            hover:text-white
          "
          >
            Edit Address
          </button>

        </div>

      </div>

    </div>
  );
}