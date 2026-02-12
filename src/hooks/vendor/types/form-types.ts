
import { ServiceType, PriceType, MenuItem, CateringServiceStyle } from '@/types/service-types';

// Define the form data type
export interface ServiceFormData {
  id?: string; // Add optional id field to track existing services
  name: string;
  type: ServiceType;
  description: string;
  price: string;
  priceType: PriceType;
  minGuests?: number;
  maxGuests?: number;
  images: string[];
  coverImage?: string;
  adminNotes: string;
  // Ghost brand support
  brandId?: string; // Optional brand selection for ghost brands
  // Combo support
  hasCombo?: boolean;
  combos?: any[]; // Array to store combo data
  manage?: boolean;
  brand?: string;
  // Top-level catering fields for CateringServiceDetails component
  menuItems?: MenuItem[];
  menuImage?: string;
  packagingOptions?: Record<string, any>;
  deliveryOptions?: Record<string, any>;
  serviceAdditions?: Record<string, any>;
  // Service type details
  cateringDetails: {
    serviceStyles?: CateringServiceStyle[];
    cuisineTypes?: string[];
    minimumOrderAmount?: number;
    leadTimeHours?: number;
    minGuests?: number;
    maxGuests?: number;
    menuItems?: MenuItem[];
    menuImage?: string; // Added field for overall menu image
    packagingOptions?: Record<string, any>;
    deliveryOptions?: Record<string, any>;
    serviceAdditions?: Record<string, any>;
  };
  venueDetails: Record<string, any>;
  rentalDetails: Record<string, any>;
  staffDetails: Record<string, any>;
}
 
// Define the vendor info type
export interface VendorInfo {
  vendorName: string;
  vendorId: string;
}

// Extend service form to support ghost brand selection
declare module './form-types' {}
