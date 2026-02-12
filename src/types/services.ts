// Service Types
export type ServiceType = 'catering' | 'venues' | 'party_rentals' | 'events_staff';
export type ServiceStatus = 'pending' | 'drafted' | 'approved' | 'rejected';
export type PricingType = 'flat_rate' | 'hourly_rate' | 'per_person' | 'daily_rate' | 'per_item';

// Base Service Interface
export interface Service {
  id: string;
  serviceName: string;
  serviceType: ServiceType;
  brand?: string;
  description: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

// Menu Item Interface
export interface MenuItem {
  name: string;
  description: string;
  price: number;
  priceType: string;
  category: string;
  minimumOrderQuantity: number;
  isPopular: boolean;
  dietaryOptions?: string;
  allergens?: string;
  hasImage: boolean;
  imageUrl?: string;
}

// Combo Category Item Interface
export interface ComboCategoryItem {
  name: string;
  description?: string;
  hasImage: boolean;
  imageUrl?: string;
  additionalPrice: number;
}

// Combo Category Interface
export interface ComboCategory {
  name: string;
  maxSelections: number;
  items: ComboCategoryItem[];
}

// Combo Interface
export interface Combo {
  name: string;
  description: string;
  category: string;
  pricePerPerson: number;
  imageUrl?: string;
  comboCategories: ComboCategory[];
}

// Catering Service Interface
export interface CateringService {
  vendorId: string;
  serviceName: string;
  serviceType: 'catering';
  brand?: string;
  description: string;
  serviceStyles: string[];
  cuisineTypes?: string[];
  minimumOrderAmount: number;
  minimumGuests: number;
  maximumGuests: number;
  leadTimeHours?: number;
  menuPhoto?: string;
  offerDisposablePackaging: boolean;
  disposablePackagingFee?: number;
  offerReusablePackaging: boolean;
  reusablePackagingType?: string;
  reusablePackagingAmount?: number;
  offerDelivery: boolean;
  offerPickup: boolean;
  deliveryMinimum?: number;
  deliveryRanges?: Record<string, number>;
  eatingUtensilsFee?: number;
  napkinsFee?: number;
  platesBowlsFee?: number;
  servingUtensilsFee?: number;
  manage: boolean;
  hasCombo: boolean;
  menuItems: MenuItem[];
  combos: Combo[];
}

// Venue Service Interface
export interface VenueService {
  vendorId: string;
  serviceName: string;
  serviceType: 'venues';
  brand?: string;
  description: string;
  pricingType: PricingType;
  price: number;
  minimumGuests?: number;
  maximumGuests?: number;
  seatedCapacity: number;
  standingCapacity: number;
  venueType: 'indoor_only' | 'outdoor_only' | 'indoor_and_outdoor';
  venueAmenities?: string;
  venueRestrictions?: string;
  accessibilityFeatures?: string[];
  insuranceRequirements?: string[];
  licenseRequirements?: string[];
  vendorPolicy?: 'accept_any_platform_vendor' | 'preferred_vendors_only' | 'hybrid_approach';
}

// Party Rental Service Interface
export interface PartyRentalService {
  vendorId: string;
  serviceName: string;
  serviceType: 'party_rentals';
  brand?: string;
  description: string;
  pricingType: PricingType;
  price: number;
  setupRequired: boolean;
  setupFee?: number;
  availableQuantity: number;
  deliveryAvailable: boolean;
  customerPickupAvailable: boolean;
}

// Event Staff Service Interface
export interface EventStaffService {
  vendorId: string;
  serviceName: string;
  serviceType: 'events_staff';
  brand?: string;
  description: string;
  pricingType: PricingType;
  price: number;
  qualificationsExperience: string;
  minimumHours?: number;
  attireOptions?: string[];
}

// Service with Details (for API responses)
export interface ServiceWithDetails extends Service {
  catering?: CateringService & { menuItems: MenuItem[]; combos: Combo[] };
  venue?: VenueService;
  partyRental?: PartyRentalService;
  eventStaff?: EventStaffService;
}

// ============================================
// API Response Interfaces (matching backend response structure)
// ============================================

// Delivery Range Interface (for API response)
export interface DeliveryRange {
  range: string;
  fee: number;
}

// API Menu Item Interface (matches backend response)
export interface APIMenuItem {
  id: string;
  name: string;
  description: string;
  price: string; // API returns as string
  priceType: 'per_person' | 'per_item' | 'flat_rate';
  category: string;
  minimumOrderQuantity: number;
  isPopular: boolean;
  dietaryOptions: string;
  allergens: string;
  hasImage: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Party Rental Interface (matches backend response)
export interface APIPartyRental {
  id: string;
  pricingType: 'flat_rate' | 'per_day' | 'per_hour' | 'per_item';
  price: string; // API returns as string
  setupRequired: boolean;
  setupFee: string | null; // API returns as string or null
  availableQuantity: number;
  deliveryAvailable: boolean;
  customerPickupAvailable: boolean;
  serviceImage: string;
  createdAt: string;
  updatedAt: string;
}

// API Catering Interface (matches backend response)
export interface APICatering {
  id: string;
  serviceStyles: string[];
  cuisineTypes?: string[];
  minimumOrderAmount: string; // API returns as string
  minimumGuests: number;
  maximumGuests: number;
  leadTimeHours: number | null;
  menuPhoto: string | null;
  offerDisposablePackaging: boolean;
  disposablePackagingFee: string | null; // API returns as string or null
  offerReusablePackaging: boolean;
  reusablePackagingType: 'flat_rate' | 'per_person' | null;
  reusablePackagingAmount: string | null; // API returns as string or null
  offerDelivery: boolean;
  offerPickup: boolean;
  deliveryMinimum: string; // API returns as string
  deliveryRanges: DeliveryRange[];
  eatingUtensilsFee: string | null; // API returns as string or null
  napkinsFee: string | null; // API returns as string or null
  platesBowlsFee: string | null; // API returns as string or null
  servingUtensilsFee: string | null; // API returns as string or null
  manage: boolean;
  hasCombo: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems: APIMenuItem[];
  combos: Combo[]; // Using existing Combo interface
}

// API Event Staff Interface (matches backend response)
export interface APIEventStaff {
  id: string;
  pricingType: 'flat_rate' | 'per_hour' | 'per_day' | 'per_person';
  price: string; // API returns as string
  qualificationsExperience: string;
  minimumHours: number;
  attireOptions: string[] | null;
  serviceImage: string;
  createdAt: string;
  updatedAt: string;
}

// API Venue Interface (matches backend response)
export interface APIVenue {
  id: string;
  pricingType: 'flat_rate' | 'per_hour' | 'per_day' | 'per_person';
  price: string; // API returns as string
  minimumGuests: number | null;
  maximumGuests: number | null;
  seatedCapacity: number;
  standingCapacity: number;
  venueType: 'indoor_only' | 'outdoor_only' | 'indoor_and_outdoor';
  venueAmenities: string | null;
  venueRestrictions: string | null;
  accessibilityFeatures: string[];
  insuranceRequirements: string[];
  licenseRequirements: string[];
  vendorPolicy: 'accept_any_platform_vendor' | 'preferred_vendors_only' | 'hybrid_approach';
  serviceImage: string;
  serviceImages?: string[];
  createdAt: string;
  updatedAt: string;
}

// API CreatedBy User Interface (matches backend response)
export interface APICreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Usually excluded in responses, but included in type for completeness
  imageUrl: string | null;
  isVerified: boolean;
  verifyToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: string | null;
  phone: string | null;
  jobTitle: string | null;
  userType: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Vendor Interface (matches backend response)
export interface APIVendor {
  id: string;
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  einTin: string;
  licenses: string[];
  insurance_policies: string[];
  serviceTypes: string[];
  website: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  certifications: string | null;
  service_area_certifications: string | null;
  businessLicense: string | null;
  foodHandlerCertification: string | null;
  healthPermit: string | null;
  liabilityInsurance: string | null;
  termsAccepted: boolean;
  vendorStatus: 'pending' | 'approved' | 'rejected';
  commissionRate?: number;
  accountHolderName?: string;
  bankName?: string;
  accountType?: 'business' | 'personal';
  routingNumber?: string;
  accountNumber?: string;
  businessDescription?: string;
  stripeConnectAccountId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageUrl: string | null;
    isVerified: boolean;
    verifyToken: string | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
    phone: string | null;
    jobTitle: string | null;
    userType: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

// API Service Response Interface (matches backend response structure)
export interface APIService {
  id: string;
  serviceName: string;
  serviceType: 'catering' | 'venues' | 'party_rentals' | 'events_staff';
  brand: string | null;
  description: string;
  status: 'pending' | 'drafted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: APICreatedBy;
  vendor: APIVendor;
  partyRental?: APIPartyRental;
  catering?: APICatering;
  eventStaff?: APIEventStaff;
  venue?: APIVenue;
}

// API Services Response Root Interface (matches backend response)
export interface APIServicesResponse {
  status: number;
  response: string;
  message: string;
  data: APIService[];
}
