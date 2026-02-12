// Combo selections interface
export interface ComboSelections {
  comboItemId: string;
  comboName: string;
  basePrice: number;
  selections: {
    categoryId: string;
    categoryName: string;
    selectedItems: {
      itemId: string;
      itemName: string;
      additionalPrice?: number;
      quantity?: number; // For proteins
      price?: number; // Price for each item
    }[];
  }[];
  totalPrice: number;
  headcount?: number; // Total headcount for the order
}

export interface ServiceSelection {
  id: string;
  name: string;
  serviceName: string;
  servicePrice: string | number;
  quantity: number;
  duration: number;
  serviceType: string;
  price: string | number;
  image?: string;
  serviceImage?: string;
  vendor?: string;
  vendorName?: string;
  serviceId: string;
  vendor_id?: string;
  description?: string;
  // Add service_details to maintain compatibility with booking flow
  service_details?: any;
  // Add missing properties for compatibility with ServiceItem
  type?: string;
  status?: string;
  active?: boolean;
  isManaged?: boolean;
  comboSelections?: ComboSelections; // Legacy: single combo (backward compatibility)
  comboSelectionsList?: ComboSelections[]; // NEW: Array of combo selections (SSOT)
  // Add price type properties to fix TypeScript errors
  price_type?: string;
  priceType?: string;
}

// Event-related types
export interface Event {
  id: string;
  title: string;
  description: string;
  date?: string; // Keep for backward compatibility
  startDate: string | Date;
  endDate: string | Date;
  location?: string;
  venueName?: string;
  type?: string;
  capacity?: number;
  guests: EventGuest[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  image?: string;
  eventUrl?: string;
  isPublic?: boolean;
  isTicketed?: boolean;
  ticketTypes?: TicketType[];
  host_id?: string;
  // Additional event properties
  address?: string;
  parking?: string;
  specialInstructions?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  // Guest management settings
  allowPlusOnes?: boolean;
  autoNotify?: boolean;
  autoNotifyThreshold?: number;
  customRsvpMessage?: string;
  allowWaitlist?: boolean;
}

export interface EventGuest {
  id: string;
  name: string;
  email: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  createdAt?: string;
  updatedAt?: string;
  ticketType?: string;
  ticketTypeId?: string;
  foodSelection?: any;
  invitationSent?: boolean;
  invitationToken?: string;
  // Additional guest properties
  phone?: string;
  company?: string;
  jobTitle?: string;
  ticketPrice?: number;
  dietaryRestrictions?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  sold?: number;
  description?: string;
  quantity?: number;
}

// Order-related types
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  total?: number;
  duration?: number; // For time-based services like staff
  // For combo items
  isCombo?: boolean;
  comboSelections?: ComboSelections;
}

export interface GuestOrder {
  id: string;
  name: string;
  email: string;
  items: OrderItem[];
  // Additional properties used in components
  guestName?: string;
  guestEmail?: string;
}

// Updated OrderInfo interface to match actual form data structure
export interface OrderInfo {
  // Basic order information
  orderName: string;
  location: string;
  date: string;
  deliveryWindow: string;
  headcount: number;
  
  // Primary contact information
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  
  // Backup contact information (optional)
  hasBackupContact: boolean;
  backupContactName: string;
  backupContactPhone: string;
  backupContactEmail: string;
  
  // Additional information
  additionalNotes: string;
  
  // Company information (compliance)
  company?: string;
  clientCompany?: string;
  
  // Payment method details (for receipts/invoices) - captured from Stripe
  paymentMethod?: {
    brand: string;        // 'visa', 'mastercard', 'amex', etc.
    last4: string;        // Last 4 digits
    exp_month: number;
    exp_year: number;
    funding?: string;     // 'credit', 'debit', 'prepaid'
  };
  
  // Order deadline (for group orders)
  orderDeadlineDate?: string;
  orderDeadlineTime?: string;
  budgetPerPerson?: number;
  
  // Legacy fields for backward compatibility
  name?: string;
  time?: string;
  contact?: string;
  guests?: number;
}
