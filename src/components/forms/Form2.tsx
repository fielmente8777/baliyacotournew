"use client";
import useForm from "@/hooks/useForm";
import { countries } from "@/utils/constent";
import { CallIcon, MailIcon, UserIcon } from "@/utils/formIcons";
import { useMemo, useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";

interface Form2Props {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  gridView?: boolean;
  rounded?: boolean;
  singleDate?: boolean;
}

// Type for DatePicker onChange event
type DatePickerChangeEvent = Date | null | [Date | null, Date | null];

// Location options
const locationOptions = [
  { value: "mandrem", label: "Mandrem, North Goa" },
  { value: "pilerne", label: "Pilerne, North Goa" },
];

// Custom Dropdown Component
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: typeof locationOptions;
  error?: string;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  placeholder = "Preferred Location",
  options,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, options]);

  // Get selected label
  const selectedLabel = useMemo(() => {
    const selected = options.find((opt) => opt.value === value);
    return selected ? selected.label : "";
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <div
        className="flex items-center justify-between w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchTerm(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full placeholder:text-secondarya focus:outline-none text-secondarya bg-transparent"
          aria-label="Location"
        />
        <IoIosArrowDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-2rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                  value === option.value ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No locations found</div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const Form2: React.FC<Form2Props> = ({
  setOpen,
  gridView = false,
  singleDate = false,
}) => {
  const [countryCode, setCountryCode] = useState("+91");

  const {
    formData,
    errors,
    isSubmitting,
    submitSuccess,
    handleChange,
    setFieldValue,
    handleSubmit,
  } = useForm({
    createdFrom: "webform",
    singleDateMode: singleDate,
    includeCheckIn: true,
    includeCheckOut: !singleDate,
    includeMessage: true,
    // includeCity: true,
    onSubmitSuccess: () => {
      if (setOpen) {
        setOpen(false);
      }
      window.open("/thank-you", "_blank");
    },
  });

  const minSelectableDate = useMemo(() => {
    return new Date();
  }, []);

  // Properly typed date picker change handler
  const handleDatePickerChange = (dates: DatePickerChangeEvent) => {
    if (singleDate) {
      // Single date mode - dates is a Date or null
      const date = dates as Date | null;
      if (date) {
        setFieldValue("checkIn", date.toISOString().split("T")[0]);
      } else {
        setFieldValue("checkIn", "");
      }
    } else {
      // Range mode - dates is a tuple [Date | null, Date | null]
      const [start, end] = dates as [Date | null, Date | null];
      if (start) {
        setFieldValue("checkIn", start.toISOString().split("T")[0]);
      }
      if (end) {
        setFieldValue("checkOut", end.toISOString().split("T")[0]);
      }
    }
  };

  // Helper to get DatePicker value
  const getDatePickerValue = useMemo(() => {
    if (singleDate) {
      return formData.checkIn ? new Date(formData.checkIn) : null;
    }
    return {
      startDate: formData.checkIn ? new Date(formData.checkIn) : null,
      endDate: formData.checkOut ? new Date(formData.checkOut) : null,
    };
  }, [singleDate, formData.checkIn, formData.checkOut]);

  // Handle location change
  const handleLocationChange = (value: string) => {
    setFieldValue("city", value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid grid-cols-1 md:grid-cols-2 gap-3`}
    >
      {/* Full Name Field */}
      <div
        className={`flex md:col-span-2 col-span-1 flex-col gap-2.5 p-2 bg-white border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <input
          type="text"
          name="name"
          aria-label="Full Name*"
          placeholder="Full Name"
          onChange={handleChange}
          value={formData.name || ""}
          className="w-full placeholder:text-secondarya focus:outline-none text-secondarya"
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      {/* Phone Number Field */}
      <div
        className={`flex flex-col bg-white gap-2.5 p-2 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              aria-label="Country Code"
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setFieldValue("countryCode", e.target.value);
              }}
              className="ps-2 cursor-pointer appearance-none focus:outline-none text-secondarya"
              style={{ width: `${countryCode.length * 2}ch` }}
            >
              {countries.map((country, index) => (
                <option
                  key={index}
                  value={country.code}
                  aria-label={country.name}
                  className="bg-gray-100"
                >
                  {country.code}
                </option>
              ))}
            </select>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <IoIosArrowDown />
            </span>
          </div>
          <input
            type="tel"
            name="phone"
            aria-label="Phone Number*"
            placeholder="Phone Number*"
            onChange={handleChange}
            value={formData.phone || ""}
            className="w-full placeholder:text-secondarya focus:outline-none text-secondarya no-spinner"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      {/* Email Field */}
      <div
        className={`flex flex-col bg-white gap-2.5 p-2 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <input
          type="email"
          name="email"
          aria-label="Email Id*"
          placeholder="Email Id*"
          onChange={handleChange}
          value={formData.email || ""}
          className="w-full placeholder:text-secondarya focus:outline-none text-secondarya"
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      {/* Date Picker Field */}
      <div
        className={`flex flex-col bg-white p-2 gap-2.5 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        {singleDate ? (
          // Single Date Picker
          <DatePicker
            selected={getDatePickerValue as Date | null}
            onChange={handleDatePickerChange}
            minDate={minSelectableDate}
            placeholderText="Event Date"
            dateFormat="dd/MM/yyyy"
            calendarClassName="!z-[99999]"
            popperClassName="!z-[99999]"
            className="pointer-events-auto placeholder:text-secondarya outline-none w-full h-full bg-transparent text-base text-secondarya"
            wrapperClassName="w-full h-full !flex items-center"
          />
        ) : (
          // Date Range Picker
          <DatePicker
            selected={
              (
                getDatePickerValue as {
                  startDate: Date | null;
                  endDate: Date | null;
                }
              ).startDate
            }
            onChange={handleDatePickerChange}
            selectsRange
            startDate={
              (
                getDatePickerValue as {
                  startDate: Date | null;
                  endDate: Date | null;
                }
              ).startDate
            }
            endDate={
              (
                getDatePickerValue as {
                  startDate: Date | null;
                  endDate: Date | null;
                }
              ).endDate
            }
            minDate={minSelectableDate}
            placeholderText="Check In - Check Out"
            dateFormat="dd/MM/yyyy"
            calendarClassName="!z-[99999]"
            popperClassName="!z-[99999]"
            className="pointer-events-auto placeholder:text-secondarya outline-none w-full h-full bg-transparent text-base text-secondarya"
            wrapperClassName="w-full h-full !flex items-center"
          />
        )}

        {/* Error Display */}
        {singleDate
          ? errors.checkIn && (
              <p className="text-red-500 text-xs">{errors.checkIn}</p>
            )
          : (errors.checkIn || errors.checkOut) && (
              <p className="text-red-500 text-xs">
                {errors.checkIn || errors.checkOut}
              </p>
            )}
      </div>

      {/* Guests Field */}
      <div
        className={`flex  items-center bg-white p-2 gap-2.5 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <input
          type="text"
          name="guests"
          aria-label="Guests"
          placeholder="Guests (e.g. 6)"
          onChange={handleChange}
          value={formData.guests || ""}
          className="w-full placeholder:text-secondarya focus:outline-none text-secondarya no-spinner"
        />
      </div>

      {/* City/Location Field with Custom Dropdown */}
      {/* <div
        className={`flex items-center bg-white p-2 gap-2.5 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <CustomDropdown
          value={formData.city || ""}
          onChange={handleLocationChange}
          placeholder="Preferred Location"
          options={locationOptions}
          error={errors.city}
        />
      </div> */}

      {/* Message Field */}
      <div
        className={`flex md:col-span-2 col-span-1 items-center bg-white gap-2.5 border-[0.5px] shadow border-[#D6D3D1] rounded-lg`}
      >
        <textarea
          rows={4}
          name="message"
          aria-label="Message"
          placeholder="Any special requests? (weddings, offsites, chef, etc.)"
          onChange={handleChange}
          value={formData.message || ""}
          className="w-full placeholder:text-secondarya p-2 resize-none focus:outline-none text-secondarya no-spinner"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        aria-label={singleDate ? "BOOK YOUR EVENT" : "Book Now"}
        className="bg-primary md:col-span-2 col-span-1 text-white w-full rounded-full text-lg py-3 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="border-t-2 border-dark w-6 h-6 rounded-full animate-spin mx-auto block" />
        ) : submitSuccess ? (
          "Thank You!"
        ) : (
          <span className="flex items-center justify-center gap-2.5">
            {singleDate ? "BOOK YOUR EVENT" : "Get Best Rates"}
          </span>
        )}
      </button>
    </form>
  );
};

export default Form2;

export const CalenderIcon = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.33337 12.6667C1.33337 13.8 2.20004 14.6667 3.33337 14.6667H12.6667C13.8 14.6667 14.6667 13.8 14.6667 12.6667V7.33337H1.33337V12.6667ZM12.6667 2.66671H11.3334V2.00004C11.3334 1.60004 11.0667 1.33337 10.6667 1.33337C10.2667 1.33337 10 1.60004 10 2.00004V2.66671H6.00004V2.00004C6.00004 1.60004 5.73337 1.33337 5.33337 1.33337C4.93337 1.33337 4.66671 1.60004 4.66671 2.00004V2.66671H3.33337C2.20004 2.66671 1.33337 3.53337 1.33337 4.66671V6.00004H14.6667V4.66671C14.6667 3.53337 13.8 2.66671 12.6667 2.66671Z"
      fill="#303030"
    />
  </svg>
);
