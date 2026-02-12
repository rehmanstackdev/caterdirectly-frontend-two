export interface Review {
  rating: number;
  comment?: string;
  dateSubmitted?: string;
}

export type OrderStatus = 'active' | 'ended' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'draft';

export interface Dispute {
  status: string;
  reason?: string;
  details?: string;
}

export interface Order {
  id: string;
  invoiceId?: string;
  stripePaymentIntentId?: string;
  paymentStatus?: string;
  amountPaid?: number;
  currency?: string;
  paymentMethodType?: string;
  paymentMethodId?: string;
  stripeChargeId?: string;
  stripeCustomerId?: string;
  paymentDetails?: Record<string, any>;
  receiptUrl?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
  // Host order display properties
  title?: string;
  location?: string;
  date?: string;
  price?: number;
  guests?: number;
  vendor_name?: string;
  status?: string;
  needs_review?: boolean;
  review?: Review;
  dispute?: any;
  image?: string;
  additionalTip?: string | null;
  invoice?: {
    id: string;
    eventName: string;
    contactName: string;
    emailAddress: string;
    phoneNumber?: string;
    companyName?: string;
    eventLocation?: string;
    eventDate?: string;
    guestCount?: number;
    status: string;
    additionalTip?: string | null;
    createdBy?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}