"use client";
import { getDateInputLimits } from "@/hooks/getDateInputLimits";
import useForm from "@/hooks/useForm";
import {
  CalendarIcon,
  CallIcon,
  LocationIcon,
  MailIcon,
  UserIcon,
  VilaIcon,
  WalletIcon,
} from "@/utils/formIcons";
import React, { useState, useRef, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";
import { countries } from "../../utils/constent";
import { landingPageData } from "@/app/(landing-page)/component/pageData";

interface Props {
  gridView?: boolean;
}

// Location options
const locationOptions = [
  // { value: "mandrem", label: "Mandrem, North Goa" },
  // { value: "pilerne", label: "Pilerne, North Goa" },
  ...new Set(
    landingPageData.accommodationSection.cards
      .filter(
        (card) =>
          card.location.toLocaleLowerCase() === "mandrem" &&
          card.type.toLocaleLowerCase() === "villa",
      )
      .map((card) => ({ value: card.title, label: card.title })),
  ),
];

const budgetOption = [
  {
    value: "20000",
    label: "20,000",
  },
  {
    value: "30000",
    label: "30,000",
  },
  {
    value: "40000",
    label: "40,000",
  },
  {
    value: "50000",
    label: "50,000",
  },
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
        <div className="absolute z-50 -left-4 w-[110%] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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

const Form1 = ({ gridView }: Props) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { min, max } = getDateInputLimits({
    showPast: false,
    showFuture: true,
  });

  const minDate = min ? new Date(min) : undefined;
  const maxDate = max ? new Date(max) : undefined;

  const {
    isSubmitting,
    errors,
    handleSubmit,
    formData,
    handleChange,
    setFieldValue,
    submitSuccess,
  } = useForm({
    includeCheckIn: true,
    includeCheckOut: true,
    includeMessage: true,
    includeCity: false,
    includeBudget: true,
    includeVilla: true,
    onSubmitSuccess: () => {
      setStartDate(null);
      setEndDate(null);
      window.open("/thank-you/", "_blank");
    },
  });

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    setStartDate(start);
    setEndDate(end);

    if (start) {
      setFieldValue("checkIn", start.toISOString().split("T")[0]);
    }
    if (end) {
      setFieldValue("checkOut", end.toISOString().split("T")[0]);
    }
  };

  // Handle location change
  const handleLocationChange = (value: string) => {
    setFieldValue("city", value);
  };

  // Handle budget change
  const handleBudgetChange = (value: string) => {
    setFieldValue("budget", value);
  };

  // Handle villa change
  const handleVillaChange = (value: string) => {
    setFieldValue("villa", value);
  };

  type DropdownOption = {
  value: string;
  label: string;
};

type FormField =
  | {
      name: string;
      label: string;
      type: "text" | "tel" | "date";
      value: string;
      onChange: React.ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement
      >;
      icon: React.ReactNode;
    }
  | {
      name: string;
      label: string;
      type: "dropdown";
      value: string;
      options: DropdownOption[];
      onChange: (value: string) => void;
      icon: React.ReactNode;
    };

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      value: formData.name,
      onChange: handleChange,
      icon: <UserIcon />,
    },
    {
      name: "phone",
      label: "Ph Number",
      type: "tel",
      value: formData.phone,
      onChange: handleChange,
      icon: <CallIcon />,
    },
    {
      name: "budget",
      label: "Select Budget*",
      type: "dropdown",
      value: formData.budget || "",
      options: budgetOption,
      icon: <WalletIcon />,
      onChange: handleBudgetChange,
    },
    {
      name: "villa",
      label: "Select Villa*",
      type: "dropdown",
      value: formData.villa || "",
      options: locationOptions,
      icon: <VilaIcon />,
      onChange: handleVillaChange,
    },
    // {
    //   name: "city",
    //   label: "Preferred Location",
    //   type: "dropdown",
    //   value: formData.city || "",
    //   icon: <VilaIcon />,
    // },
    {
      name: "checkIn",
      label: "Check-in & out",
      type: "date",
      value: formData.checkIn || "",
      onChange: handleChange,
      icon: <CalendarIcon />,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className={`${gridView ? "flex flex-col gap-3" : "grid md:grid-cols-6 items-center gap-3.5"} font-body px-4 bg-transparent max-md:divide-y divide-p1`}
    >
      {formFields.map((field, index) => (
        <React.Fragment key={index}>
          {field.type === "date" ? (
            <div
              className={`lg:bg-white flex items-center gap-2.5 lg:shadow border-light/30 lg:rounded-lg ${gridView ? "p-4" : "max-md:pb-4 max-md:pt-2 py-3 lg:px-2"}`}
            >
              <label className="text-p2">{field.icon}</label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                minDate={minDate}
                maxDate={maxDate}
                placeholderText={field.label}
                calendarClassName="!z-[99999]"
                popperClassName="!z-[99999]"
                className="pointer-events-auto placeholder:text-secondarya outline-none w-full h-full bg-transparent text-base text-secondarya"
                wrapperClassName="w-full h-full !flex items-center"
              />
            </div>
          ) : field.type === "dropdown" ? (
            <div
              className={`lg:bg-white flex items-center gap-2.5 lg:shadow border-light/30 lg:rounded-lg ${gridView ? "p-4" : "max-md:pb-4 max-md:pt-2 py-3 lg:px-2"}`}
            >
              <label className="text-p2">{field.icon}</label>
              <CustomDropdown
                value={field.value}
                onChange={
                  field.name === "budget"
                    ? handleBudgetChange
                    : field.name === "villa"
                      ? handleVillaChange
                      : handleLocationChange
                }
                placeholder={field.label}
                options={field.options ?? []}
                error={errors[field.name]}
              />
            </div>
          ) : field.type === "tel" ? (
            <div
              className={`flex lg:bg-white items-center gap-2.5 lg:shadow border-light/30 lg:rounded-lg ${gridView ? "p-4" : "max-md:pb-4 max-md:pt-2 py-3 lg:px-2"}`}
            >
              <label className="text-p2">{field.icon}</label>
              <div className="relative">
                <select
                  className="ps-2 cursor-pointer border-p1 appearance-none w-full placeholder:text-secondarya focus:outline-none text-secondarya"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={(e) => setFieldValue("countryCode", e.target.value)}
                  style={{
                    width: `${(formData.countryCode || "+91").length * 2}ch`,
                  }}
                  aria-label="Country Code"
                >
                  {countries.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IoIosArrowDown />
                </span>
              </div>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.label}
                className="w-full placeholder:text-secondarya focus:outline-none text-secondarya"
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          ) : (
            <div
              className={`flex lg:bg-white items-center gap-2.5 lg:shadow border-light/30 lg:rounded-lg ${gridView ? "p-4" : "max-md:pb-4 max-md:pt-2 py-3 lg:px-2"}`}
            >
              <label className="text-p2">{field.icon}</label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.label}
                className="w-full placeholder:text-secondarya focus:outline-none text-secondarya"
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}

          {errors[field.name] && (
            <p className="text-red-500">{errors[field.name]}</p>
          )}
        </React.Fragment>
      ))}
      <button
        type="submit"
        className="bg-primary text-white w-full rounded-lg lg:text-lg py-3 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Submitting..."
        ) : submitSuccess ? (
          "Thank You!"
        ) : (
          <span className="flex items-center justify-center gap-2.5">
            BOOK YOUR STAY
          </span>
        )}
      </button>
    </form>
  );
};

export default Form1;

// Location Icon Component
