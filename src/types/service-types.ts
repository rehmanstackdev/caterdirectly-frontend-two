
// Original ServiceItem interface with additional properties
export interface ServiceItem {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
  price: string;
  price_type?: PriceType;
  image?: string;
  additional_images?: string[]; // Added missing property
  status: ServiceStatus;
  active: boolean;
  isManaged: boolean;
  createdAt?: string; // Made optional
  updatedAt?: string; // Made optional
  vendorName: string;
  vendor_id: string; // Changed to required (not optional)
  location?: string;
  reviews?: string;
  rating?: string;
  adminFeedback?: string;
  serviceType?: string; // Added for backward compatibility
  available?: boolean;  // Added for backward compatibility
  service_details?: any; // JSONB column for storing service-specific details
}

// Required service type enum - updated to match marketplace tabs
export type ServiceType = 'catering' | 'venues' | 'party_rentals' | 'events_staff';

// Service status enum
export type ServiceStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

// Price type enum - added per_day
export type PriceType = 'per_person' | 'flat_rate' | 'per_hour' | 'per_day' | 'per_item';

// Catering specific types
export type CateringServiceStyle = 'buffet' | 'plated' | 'passed_appetizers' | 'boxed_individual' | 'food_stations';
export type DietaryFlag = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'kosher' | 'halal';
export type AllergenFlag = 'nuts' | 'dairy' | 'eggs' | 'soy' | 'wheat' | 'shellfish' | 'fish';
export type PackagingType = 'disposable' | 'eco_friendly' | 'reusable';

// Menu item interface for catering services
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: PriceType; // Added price type for each menu item
  image?: string;
  dietaryFlags?: DietaryFlag[];
  allergenFlags?: AllergenFlag[];
  isPopular?: boolean;
  category?: string;
  minQuantity?: number; // Minimum order quantity per item (optional)
  isCombo?: boolean; // Flag to indicate if this is a combo item
  comboCategories?: ComboCategory[]; // Categories for the combo item
}

// Combo category and options
export interface ComboCategory {
  id: string;
  name: string;
  description?: string;
  maxSelections: number; // Maximum number of items that can be selected from this category
  items: ComboItem[]; // Items available in this category
  selectionBehavior?: 'quantity' | 'choice'; // 'quantity' for proteins (quantity-first), 'choice' for sides/toppings (checkbox-first)
}

export interface ComboItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  dietaryFlags?: DietaryFlag[];
  allergenFlags?: AllergenFlag[];
  quantity?: number; // Quantity for each item
  price?: number; // Price for each item
  isPremium?: boolean; // Flag to mark item as premium
  additionalCharge?: number; // Additional charge for premium items (only sent if isPremium is true)
}

// Packaging options interface
export interface PackagingOptions {
  disposable: boolean;
  disposableFee?: number;
  reusable: boolean;
  reusableFeeType?: 'percentage' | 'flat_rate';
  reusableServiceFeePercentage?: number;
  reusableServiceFeeFlatRate?: number;
}

// Delivery range interface
export interface DeliveryRange {
  range: string;
  fee: number;
}

// Delivery options interface
export interface DeliveryOptions {
  delivery: boolean;
  pickup: boolean;
  deliveryRanges: DeliveryRange[];
  deliveryMinimum?: number;
}

// Service additions interface
export interface ServiceAdditions {
  providesUtensils: boolean;
  utensilsFee?: number;
  providesPlates: boolean;
  platesFee?: number;
  providesNapkins: boolean;
  napkinsFee?: number;
  providesServingUtensils: boolean;
  servingUtensilsFee?: number;
  providesLabels: boolean;
}

export interface CateringServiceDetails {
  serviceStyles: CateringServiceStyle[]; // Multiple styles can be offered by vendor
  cuisineTypes?: string[];
  minimumOrderAmount?: number; // Order minimum for the entire order
  minGuests?: number; // Added min guests
  maxGuests?: number; // Added max guests
  leadTimeHours?: number;
  packagingOptions?: PackagingOptions;
  menuItems?: MenuItem[]; // Each menu item has its own dietary flags, allergens and pricing
  deliveryOptions?: DeliveryOptions;
  serviceAdditions?: ServiceAdditions;
  menuImage?: string; // Added field for overall menu image
}

// Venue specific types
export type VendorPolicy = 'preferred_only' | 'platform_open' | 'hybrid';
export type InsuranceType = 'general_liability' | 'product_liability' | 'professional_liability' | 'property_insurance' | 'workers_compensation';
export type LicenseType = 'liquor_license' | 'catering_permit' | 'food_handler_permit' | 'business_license' | 'health_department_permit';

export interface VenueServiceDetails {
  capacity: {
    seated: number;
    standing: number;
  };
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  amenities: string[];
  restrictions?: string[];
  accessibilityFeatures?: string[];
  insuranceRequirements?: InsuranceType[];
  licenseRequirements?: LicenseType[];
  vendorPolicy?: VendorPolicy;
  preferredVendorIds?: string[];
}

// Party rental specific types
export interface PartyRentalServiceDetails {
  setupRequired: boolean;
  setupFee?: number;
  deliveryOptions: string[];
  availableQuantity: number;
  minimumRentalPeriod?: number;
  depositRequired?: boolean;
}

// Staff specific types
export type StaffAttire = 'formal' | 'business_casual' | 'casual' | 'uniform' | 'custom';
export type ExperienceLevel = 'entry_level' | 'experienced' | 'senior' | 'expert';

export interface StaffServiceDetails {
  qualifications: string[];
  qualificationsExperience?: ExperienceLevel;
  minimumHours: number;
  attire: StaffAttire[];
  languages?: string[];
  specialties?: string[];
}
