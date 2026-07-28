export interface QuickFormData {
  checkIn: string;
  checkOut: string;
  fullName: string;
  PhoneNumber: string;
  EmailId: string;
}

export interface QuickFormErrors {
  checkIn?: string;
  checkOut?: string;
  fullName?: string;
  PhoneNumber?: string;
  EmailId?: string;
}

export interface UseQuickFormProps {
  createdFrom: string;
  singleDate?: boolean; // New prop for single date mode
  onSubmitSuccess?: () => void;
  onValidationError?: (errors: QuickFormErrors) => void;
}

export interface DateRangeType {
  startDate: Date | null;
  endDate: Date | null;
}