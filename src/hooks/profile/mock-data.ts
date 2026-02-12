
import { Profile } from '@/types/profile';

// Mock data as fallback if fetching fails
export const mockProfileData: Profile = {
  personal: {
    firstName: "Emma",
    lastName: "Watson",
    email: "emma@company.com",
    phone: "(415) 555-1234",
    jobTitle: "Event Manager",
    userType: "eventPlanner",
    profileImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
  },
  company: {
    companyName: "Creative Events Co.",
    industry: "Event Management",
    companySize: "11-50",
    website: "https://creativeevents.co",
    address: "123 Market St",
    city: "San Francisco",
    state: "California",
    zipCode: "94105",
    country: "United States",
    description: "Creative Events Co. is a full-service event planning company specializing in corporate events and conferences.",
    logo: "",
    taxId: "12-3456789"
  },
  paymentMethods: {
    creditCards: [
      {
        id: "card1",
        cardholderName: "Emma Watson",
        cardNumber: "•••• •••• •••• 4242",
        expiryMonth: "09",
        expiryYear: "2026",
        isDefault: false
      }
    ],
    bankAccounts: [
      {
        id: "bank1",
        accountName: "Emma Watson",
        accountType: "checking",
        bankName: "Chase Bank",
        routingNumber: "•••••••789",
        accountNumber: "••••••••1234",
        isDefault: true
      }
    ],
    achAccounts: [
      {
        id: "ach1",
        accountName: "Emma Watson",
        bankName: "Bank of America",
        accountType: "checking",
        routingNumber: "•••••••123",
        accountNumber: "••••••••5678",
        isDefault: false
      }
    ],
    hasNetTerms: true,
    netTermsStatus: "approved",
    netTerms: {
      companyName: "Creative Events Co.",
      taxId: "12-3456789",
      billingEmail: "billing@creativeevents.co",
      billingPhone: "(415) 555-5678",
      paymentTerms: "net30",
      billingAddress: "123 Market St",
      billingCity: "San Francisco",
      billingState: "California",
      billingZip: "94105",
      billingCountry: "United States"
    },
    defaultMethod: "bank_account"
  },
  notifications: {
    orderUpdates: true,
    vendorMessages: true,
    promotions: false,
    reminders: true,
    newsletter: false,
    productUpdates: true,
    eventRecaps: true,
    accountAlerts: true
  }
};
