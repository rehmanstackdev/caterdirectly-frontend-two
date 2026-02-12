export interface VendorBusinessRules {
  id?: string;
  vendor_id: string;
  service_types: string[];
  minimum_order_amount: number;
  lead_time_hours: number;
  delivery_fee_base: number;
  delivery_fee_per_mile: number;
  delivery_radius_miles: number;
  requires_approval: boolean;
  auto_accept_threshold?: number;
}

export interface VendorCertifications {
  insurance_policies: string[];
  licenses: string[];
  service_area_certifications: string[];
}

export interface VendorPolicyPreferences {
  accepts_outside_vendors: boolean;
  preferred_vendor_ids: string[];
  insurance_requirements: string[];
  license_requirements: string[];
}

export interface VendorSettings {
  delivery_fee_settings: {
    enabled: boolean;
    baseAmount: number;
    ranges: Array<{
      range: string;
      fee: number;
    }>;
  };
  lead_time_hours: number;
  minimum_order_amount: number;
  calendar_settings: {
    businessHours: Record<string, {
      enabled: boolean;
      start: string;
      end: string;
    }>;
    blockedDates: string[];
    specialHours: Array<{
      date: string;
      start: string;
      end: string;
    }>;
  };
  availability_status: 'available' | 'busy' | 'unavailable';
  auto_accept_orders: boolean;
  max_orders_per_day: number;
}