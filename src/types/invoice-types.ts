
export interface InvoiceItem {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
}

export type InvoiceStatus = 'drafted' | 'pending' | 'accepted' | 'paid' | 'declined' | 'expired' | 'revision_requested';

export interface Invoice {
  id: string;
  eventName: string;
  contactName: string;
  emailAddress: string;
  phoneNumber?: string;
  companyName?: string;
  eventLocation?: string;
  eventDate?: string;
  serviceTime?: string;
  guestCount?: number;
  additionalNotes?: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt?: string;
  services?: any[];
  customLineItems?: any[];
  budget?: number;
  budgetPerPerson?: number;
  orders?: {
    id: string;
    amountPaid: string;
    currency: string;
    paymentStatus: string;
  }[];
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  
  // Legacy fields for backward compatibility
  title?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  vendorName?: string;
  message?: string;
  expiryDate?: Date | null;
  serviceDate?: Date | null;
  deliveryNotes?: string;
  items?: InvoiceItem[];
  total?: number;
  revisionMessage?: string;
  location?: string;
  headcount?: number;
  booking_details?: {
    location?: string;
    headcount?: number;
    guests?: number;
    eventType?: string;
    specialRequests?: string;
    setupRequirements?: string;
    accessNotes?: string;
    [key: string]: any;
  };
  selected_items?: Record<string, number>;
}
