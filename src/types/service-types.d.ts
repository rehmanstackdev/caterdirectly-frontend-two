// Add this if it doesn't already exist
export type ServiceType = 'catering' | 'venues' | 'party-rentals' | 'staff';
export type PriceType = 'per_person' | 'flat_rate' | 'per_hour' | 'per_day' | 'per_item';

export type CateringServiceStyle = 
  | 'buffet'
  | 'family_style'
  | 'plated'
  | 'passed_appetizers'
  | 'boxed_individual'
  | 'food_stations';

export type DietaryFlag = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'kosher'
  | 'halal';

export type AllergenFlag = 
  | 'nuts'
  | 'dairy'
  | 'eggs'
  | 'soy'
  | 'wheat'
  | 'shellfish'
  | 'fish';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: PriceType;
  category?: string;
  dietaryFlags?: DietaryFlag[];
  allergenFlags?: AllergenFlag[];
  imageUrl?: string;
  isPopular?: boolean;
  isCombo?: boolean;
  comboCategories?: ComboCategory[];
}

export interface DeliveryRange {
  range: string;
  fee: number;
}

export interface DeliveryOptions {
  delivery: boolean;
  pickup: boolean;
  deliveryRanges: DeliveryRange[];
  deliveryMinimum: number;
}

export interface PackagingOptions {
  disposable: boolean;
  disposableFee: number;
  reusable: boolean;
  reusableFee: number;
  returnRequired: boolean;
}

export interface ServiceAdditions {
  providesUtensils: boolean;
  utensilsFee: number;
  providesPlates: boolean;
  platesFee: number;
  providesNapkins: boolean;
  napkinsFee: number;
  providesServingUtensils: boolean;
  servingUtensilsFee: number;
  providesLabels: boolean;
}

export interface CateringServiceDetails {
  serviceStyles: CateringServiceStyle[];
  minimumOrderAmount?: number;
  leadTimeHours?: number;
  dietaryOptions?: DietaryFlag[];
  allergenInfo?: AllergenFlag[];
  menuItems?: MenuItem[];
  packagingOptions?: PackagingOptions;
  deliveryOptions?: DeliveryOptions;
  serviceAdditions?: ServiceAdditions;
}

export interface VenueServiceDetails {
  // Venue-specific details
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  price: string;
  priceType: PriceType;
  status: string;
  active: boolean;
  vendor_id: string;
  vendorName?: string;
  image?: string;
  images?: string[];
  additional_images?: string[]; 
  adminFeedback?: string;
  service_details?: any;
}

export interface ComboItem {
  id: string;
  name: string;
  description?: string;
  additionalPrice?: number;
  image?: string;
  dietaryFlags?: DietaryFlag[];
  allergenFlags?: AllergenFlag[];
}

export interface ComboCategory {
  id: string;
  name: string;
  maxSelections: number;
  items: ComboItem[];
  description?: string;
}
