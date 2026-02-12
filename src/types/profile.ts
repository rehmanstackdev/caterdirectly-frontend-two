// Personal Information Types
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle?: string;
  userType: "eventPlanner" | "officeManager" | "individual" | "corporate" | "other";
  profileImage?: string;
  location?: string;
  locationData?: {
    city?: string;
    state?: string;
    street?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  };
}

// Company Information Types
export interface CompanyInfo {
  companyName: string;
  industry: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description?: string;
  logo?: string;
  taxId?: string;
}

// Payment Method Types
export interface CreditCard {
  id: string;
  cardholderName: string;
  cardNumber: string; // Masked number (e.g., •••• •••• •••• 4242)
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountType: "checking" | "savings";
  bankName: string;
  routingNumber: string;
  accountNumber: string; // Masked number (e.g., •••• •••• 1234)
  isDefault: boolean;
}

export interface ACHDetails {
  id: string;
  accountName: string;
  bankName: string;
  accountType: "checking" | "savings";
  routingNumber: string;
  accountNumber: string; // Masked number
  isDefault: boolean;
}

export interface NetTerms {
  companyName: string;
  taxId: string;
  billingEmail: string;
  billingPhone: string;
  paymentTerms: "net15" | "net30" | "net45" | "net60";
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

export interface PaymentMethods {
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  achAccounts: ACHDetails[];
  hasNetTerms: boolean;
  netTermsStatus: "not_applied" | "pending" | "approved" | "rejected";
  netTerms?: NetTerms;
  defaultMethod: "card" | "bank_account" | "ach" | "net_terms";
}

// Notification Preferences
export interface NotificationPreferences {
  orderUpdates: boolean;
  vendorMessages: boolean;
  promotions: boolean;
  reminders: boolean;
  newsletter: boolean;
  productUpdates: boolean;
  eventRecaps: boolean;
  accountAlerts: boolean;
}

// Complete Profile Structure
export interface Profile {
  personal: PersonalInfo;
  company: CompanyInfo;
  paymentMethods: PaymentMethods;
  notifications: NotificationPreferences;
}
