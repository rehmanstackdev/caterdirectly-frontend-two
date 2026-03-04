
import { ChangeEvent } from "react";
import ResponsiveBookingForm from "./ResponsiveBookingForm";

import { LocationData } from "@/components/shared/address/types";

interface BookingFormProps {
  formData: {
    location: string;
    orderName: string;
    date: string;
    deliveryWindow: string;
    headcount: number;
    primaryContactName: string;
    primaryContactPhone: string;
    primaryContactEmail: string;
    hasBackupContact: boolean;
    backupContactName: string;
    backupContactPhone: string;
    backupContactEmail: string;
    additionalNotes: string;
    // Service style selections for catering services
    serviceStyleSelections?: Record<string, string>; // serviceId -> selected style
    // Invoice-specific fields
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCompany?: string;
    invoiceMessage?: string;
    invoiceExpiryDate?: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onQuantityChange?: (value: number) => void;
  onDurationChange?: (value: number) => void;
  onServiceStyleChange?: (serviceId: string, style: string) => void;
  onLocationSelected?: (address: string, locationData?: LocationData) => void;
  eventLocationData?: LocationData | null; // Structured location data with coordinates
  serviceType?: string;
  quantity?: number;
  duration?: number;
  isInvoiceMode?: boolean;
  selectedServices?: any[]; // To access catering service styles
  showValidationErrors?: boolean;
}

function BookingForm({ 
  formData, 
  onChange, 
  onQuantityChange, 
  onDurationChange,
  onServiceStyleChange,
  onLocationSelected,
  eventLocationData = null,
  serviceType,
  quantity = 1,
  duration = 1,
  selectedServices = [],
  isInvoiceMode = false,
  showValidationErrors = false,
}: BookingFormProps) {
  return (
    <ResponsiveBookingForm
      formData={formData}
      onChange={onChange}
      onQuantityChange={onQuantityChange}
      onDurationChange={onDurationChange}
      onServiceStyleChange={onServiceStyleChange}
      onLocationSelected={onLocationSelected}
      eventLocationData={eventLocationData}
      serviceType={serviceType}
      quantity={quantity}
      duration={duration}
      selectedServices={selectedServices}
      isInvoiceMode={isInvoiceMode}
      showValidationErrors={showValidationErrors}
    />
  );
};

export default BookingForm;
