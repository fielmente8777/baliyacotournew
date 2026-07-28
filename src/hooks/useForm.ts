// useForm.ts
import { useCallback, useState } from "react";
import axios from "axios";
import { contact } from "@/utils/constent";

// Types
interface BaseFormData {
  name: string;
  email?: string;
  phone: string;
  countryCode?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
  city?: string;
  budget?: string;
  villa?: string;
  createdFrom?: string;
  guests?: string;
  [key: string]: string | undefined;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
  city?: string;
  budget?: string;
  villa?: string;
  guests?: string;
  [key: string]: string | undefined;
}

// Define the expected API payload type
interface ApiPayload {
  Domain: string;
  Name: string;
  email?: string;
  Contact: string;
  check_in?: string;
  check_out?: string;
  Description: string;
  created_from: string;
  source_url: string;
  guests?: string;
  hId?: string;
  [key: string]: string | number | boolean | undefined;
}

// Type for the transform function - converts form data to API payload
type TransformFunction<T extends BaseFormData> = (data: T) => ApiPayload;

interface UseFormProps<T extends BaseFormData> {
  initialData?: Partial<T>;
  includeCheckIn?: boolean;
  includeCheckOut?: boolean;
  includeMessage?: boolean;
  includeCity?: boolean;
  includeBudget?: boolean;
  includeVilla?: boolean;
  includeEmail?: boolean;
  formHid?: string;
  createdFrom?: string;
  singleDateMode?: boolean;
  onSubmitSuccess?: () => void;
  onValidationError?: (errors: FormErrors) => void;
  validateForm?: (data: T) => FormErrors;
  transformData?: TransformFunction<T>;
}

// Validation utilities
export const validators = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  phone: (phone: string): boolean => /^[0-9]{10,15}$/.test(phone),

  required: (value: string): boolean => value?.trim().length > 0,
};

// Default initial data
const getDefaultInitialData = (): BaseFormData => ({
  name: "",
  email: "",
  phone: "",
  countryCode: "+91",
  checkIn: "",
  checkOut: "",
  message: "",
  city: "",
  budget: "",
  villa: "",
  guests: "",
  createdFrom: "webform",
});

// Default transform function
const defaultTransform = <T extends BaseFormData>(data: T): ApiPayload => ({
  Domain: contact.formDomain,
  Name: data.name,
  email: data.email,
  Contact: data.countryCode + data.phone,
  check_in: data.checkIn,
  check_out: data.checkOut,
  Description: buildDescription(data),
  created_from: data.createdFrom || "webform",
  source_url: window.location.href,
  hId: contact.formHid,
});

// Helper function to build description
const buildDescription = <T extends BaseFormData>(data: T): string => {
  const parts: string[] = [];

  if (data.checkIn) {
    parts.push(`Check-in: ${data.checkIn}`);
  }
  if (data.checkOut) {
    parts.push(`Check-out: ${data.checkOut}`);
  }
  if (data.message) {
    parts.push(`Message: ${data.message}`);
  }
  if (data.city) {
    parts.push(`location: ${data.city}`);
  }
  if (data.guests) {
    parts.push(`Guests: ${data.guests}`);
  }

  return parts.join("\n");
};

// Main hook
export const useForm = <T extends BaseFormData = BaseFormData>({
  initialData = {},
  includeCheckIn = false,
  includeCheckOut = false,
  includeMessage = false,
  includeCity = false,
  includeBudget = false,
  includeVilla = false,
  includeEmail = false,
  formHid,
  createdFrom = "webform",
  singleDateMode = false,
  onSubmitSuccess,
  onValidationError,
  validateForm: customValidate,
  transformData,
}: UseFormProps<T> = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<T>(
    () =>
      ({
        ...getDefaultInitialData(),
        ...initialData,
      }) as T,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const defaultValidate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (includeEmail) {
      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!validators.email(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validators.phone(formData.phone)) {
      newErrors.phone = "Phone number must be 10-15 digits";
    }

    // City validation (if needed)
    if (includeCity && !formData.city?.trim()) {
      newErrors.city = "Villa is required";
    }

    // Budget validation
    if (includeBudget && !formData.budget?.trim()) {
      newErrors.budget = "Budget is required";
    }

    if (includeVilla && !formData.villa?.trim()) {
      newErrors.villa = "Villa is required";
    }

    // Check-in validation
    if (includeCheckIn && !formData.checkIn?.trim()) {
      newErrors.checkIn = singleDateMode
        ? "Date is required"
        : "Check-in date is required";
    }

    // Check-out validation
    if (includeCheckOut) {
      if (!formData.checkOut?.trim()) {
        newErrors.checkOut = "Check-out date is required";
      } else if (
        formData.checkIn &&
        formData.checkOut &&
        formData.checkIn > formData.checkOut
      ) {
        newErrors.checkOut = "Check-out must be after check-in";
      }
    }

    // Message validation (if needed)
    if (includeMessage && formData.message && !formData.message.trim()) {
      // Optional: Add message validation if required
    }

    return newErrors;
  }, [
    formData,
    includeCheckIn,
    includeCheckOut,
    includeMessage,
    singleDateMode,
    includeCity,
    includeBudget,
    includeVilla,
    includeEmail,
  ]);

  const validateForm = useCallback((): boolean => {
    const newErrors = customValidate
      ? customValidate(formData)
      : defaultValidate();

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid && onValidationError) {
      onValidationError(newErrors);
    }

    return isValid;
  }, [formData, customValidate, defaultValidate, onValidationError]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (field: keyof T, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: undefined }));
      }
    },
    [errors],
  );

  // Handle date change (for both single and range)
  const handleDateChange = useCallback(
    (dates: [Date | null, Date | null] | Date | null) => {
      // Handle single date
      if (singleDateMode) {
        const date = dates instanceof Date ? dates : (dates as Date | null);
        const dateString = date ? date.toISOString().split("T")[0] : "";
        setFormData((prev) => ({ ...prev, checkIn: dateString }));

        if (errors.checkIn) {
          setErrors((prev) => ({ ...prev, checkIn: undefined }));
        }
        return;
      }

      // Handle range date
      if (Array.isArray(dates)) {
        const [start, end] = dates;
        setFormData((prev) => ({
          ...prev,
          checkIn: start ? start.toISOString().split("T")[0] : "",
          checkOut: end ? end.toISOString().split("T")[0] : "",
        }));

        if (errors.checkIn || errors.checkOut) {
          setErrors((prev) => ({
            ...prev,
            checkIn: undefined,
            checkOut: undefined,
          }));
        }
      }
    },
    [singleDateMode, errors],
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      ...getDefaultInitialData(),
      ...initialData,
    } as T);
    setErrors({});
    setSubmitSuccess(false);
  }, [initialData]);

  // Build description
  const getDescription = useCallback((): string => {
    const parts: string[] = [];

    if (singleDateMode && formData.checkIn) {
      parts.push(`Event Date: ${formData.checkIn}`);
    } else {
      if (includeCheckIn && formData.checkIn) {
        parts.push(`Check-in: ${formData.checkIn}`);
      }
      if (includeCheckOut && formData.checkOut) {
        parts.push(`Check-out: ${formData.checkOut}`);
      }
    }

    if (includeMessage && formData.message) {
      parts.push(`Message: ${formData.message}`);
    }

    if (includeCity && formData.city) {
      parts.push(`City: ${formData.city}`);
    }

    if (includeBudget && formData.budget) {
      parts.push(`Budget: ${formData.budget}`);
    }

    if (includeVilla && formData.villa) {
      parts.push(`Villa: ${formData.villa}`);
    }

    return parts.join("\n");
  }, [
    formData,
    includeCheckIn,
    includeCheckOut,
    includeMessage,
    includeCity,
    singleDateMode,
    includeBudget,
    includeVilla,
  ]);

  // Submit form
  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        // Use custom transform or default
        const payload = transformData
          ? transformData(formData)
          : {
              Domain: contact.formDomain,
              Name: formData.name,
              email: formData.email,
              Contact: formData.countryCode + formData.phone,
              check_in: formData.checkIn,
              check_out: formData.checkOut,
              Description: getDescription(),
              created_from: formData.createdFrom || createdFrom,
              source_url: window.location.href,
              hId: formHid || contact.formHid,
            };

        const { data } = await axios.post<{
          Status: boolean;
          message?: string;
        }>("https://nexon.eazotel.com/eazotel/addcontacts", payload, {
          headers: { "Content-Type": "application/json" },
        });

        if (data.Status) {
          setSubmitSuccess(true);
          resetForm();

          if (onSubmitSuccess) {
            onSubmitSuccess();
          }

          setTimeout(() => setSubmitSuccess(false), 3000);
          window.open("/thank-you/", "_blank");
        } else {
          alert(data.message || "Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      validateForm,
      transformData,
      getDescription,
      createdFrom,
      formHid,
      resetForm,
      onSubmitSuccess,
    ],
  );

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    submitSuccess,
    includeCheckIn,
    includeCheckOut,
    includeMessage,
    includeCity,
    includeBudget,
    includeVilla,
    handleChange,
    setFieldValue,
    handleDateChange,
    handleSubmit,
    resetForm,
    validateForm,
    getDescription,
  };
};

export default useForm;
