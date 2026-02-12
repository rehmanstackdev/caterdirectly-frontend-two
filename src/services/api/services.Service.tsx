import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";
import { APIServicesResponse, APIService } from "@/types/services";

const ApiUrl = import.meta.env.VITE_API_URL || '';
// Ensure API_URL ends with a single slash
const API_URL = ApiUrl.endsWith('/') ? ApiUrl : `${ApiUrl}/`;

export interface ServiceFilters {
  serviceType?: 'catering' | 'venues' | 'party_rentals' | 'events_staff';
  status?: 'pending' | 'drafted' | 'approved' | 'rejected';
  visibleStatus?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  // Location filter - matches against vendor fullAddress using partial text matching
  location?: string;
  // Service name search filter - matches against service name using partial text matching
  serviceName?: string;
  // Coordinate-based distance filtering (for delivery range filtering)
  lat?: number;
  lng?: number;
  // Advanced filters - Catering
  serviceStyle?: string;
  cuisineTypes?: string[];
  dietaryOptions?: string[];
  minGuestCount?: number;
  maxGuestCount?: number;
  minPrice?: number;
  maxPrice?: number;
  // Advanced filters - Venues
  venueMinPrice?: number;
  venueMaxPrice?: number;
  seatedCapacityMin?: number;
  seatedCapacityMax?: number;
  // Advanced filters - Party Rentals
  minPartyPrice?: number;
  maxPartyPrice?: number;
  deliveryAvailable?: boolean;
  setupIncluded?: boolean;
  pickupAvailable?: boolean;
  // Advanced filters - Event Staff
  eventStaffPricingType?: 'hourly_rate' | 'flat_rate';
  minEventHourlyPrice?: number;
  maxEventHourlyPrice?: number;
  eventStaffExperienceLevel?: string[];
}

export interface PaginatedServicesResponse {
  data: APIService[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit?: number;
    itemsPerPage?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

class ServicesService extends BaseRequestService {
  // Get all services with optional filters (returns array for backward compatibility)
  getServices(filters?: ServiceFilters): Promise<APIService[]> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Location filter - matches against vendor fullAddress using partial text matching
    if (filters?.location) params.append('location', filters.location);

    // Service name search filter - matches against service name, description, vendor name
    if (filters?.serviceName) params.append('serviceName', filters.serviceName);

    // Coordinate-based distance filtering (for delivery range filtering)
    if (filters?.lat !== undefined) params.append('lat', filters.lat.toString());
    if (filters?.lng !== undefined) params.append('lng', filters.lng.toString());

    // Advanced filters - Catering
    if (filters?.serviceStyle) params.append('serviceStyle', filters.serviceStyle);
    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('cuisineTypes', filters.cuisineTypes.join(','));
    }
    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      params.append('dietaryOptions', filters.dietaryOptions.join(','));
    }
    if (filters?.minGuestCount !== undefined) params.append('minGuestCount', filters.minGuestCount.toString());
    if (filters?.maxGuestCount !== undefined) params.append('maxGuestCount', filters.maxGuestCount.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    // Advanced filters - Venues
    if (filters?.venueMinPrice !== undefined) params.append('venueMinPrice', filters.venueMinPrice.toString());
    if (filters?.venueMaxPrice !== undefined) params.append('venueMaxPrice', filters.venueMaxPrice.toString());
    if (filters?.seatedCapacityMin !== undefined) params.append('seatedCapacityMin', filters.seatedCapacityMin.toString());
    if (filters?.seatedCapacityMax !== undefined) params.append('seatedCapacityMax', filters.seatedCapacityMax.toString());

    // Advanced filters - Party Rentals
    if (filters?.minPartyPrice !== undefined) params.append('minPartyPrice', filters.minPartyPrice.toString());
    if (filters?.maxPartyPrice !== undefined) params.append('maxPartyPrice', filters.maxPartyPrice.toString());
    if (filters?.deliveryAvailable !== undefined) params.append('deliveryAvailable', filters.deliveryAvailable.toString());
    if (filters?.setupIncluded !== undefined) params.append('setupIncluded', filters.setupIncluded.toString());
    if (filters?.pickupAvailable !== undefined) params.append('pickupAvailable', filters.pickupAvailable.toString());

    // Advanced filters - Event Staff
    if (filters?.eventStaffPricingType) params.append('eventStaffPricingType', filters.eventStaffPricingType);
    if (filters?.minEventHourlyPrice !== undefined) params.append('minEventHourlyPrice', filters.minEventHourlyPrice.toString());
    if (filters?.maxEventHourlyPrice !== undefined) params.append('maxEventHourlyPrice', filters.maxEventHourlyPrice.toString());
    if (filters?.eventStaffExperienceLevel && filters.eventStaffExperienceLevel.length > 0) {
      params.append('eventStaffExperienceLevel', filters.eventStaffExperienceLevel.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}services?${queryString}` : `${API_URL}services`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data: { data: [...], pagination: {...} } }
      // or { status, response, message, data: [...] }
      if (response && 'data' in response) {
        // Check for nested data structure (response.data.data)
        if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Direct array in response.data
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      // Fallback for direct data response
      return Array.isArray(response) ? response : [];
    });
  }

  // Get all services with pagination info
  getServicesPaginated(filters?: ServiceFilters): Promise<PaginatedServicesResponse> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Location filter - matches against vendor fullAddress using partial text matching
    if (filters?.location) params.append('location', filters.location);

    // Service name search filter - matches against service name, description, vendor name
    if (filters?.serviceName) params.append('serviceName', filters.serviceName);

    // Coordinate-based distance filtering (for delivery range filtering)
    if (filters?.lat !== undefined) params.append('lat', filters.lat.toString());
    if (filters?.lng !== undefined) params.append('lng', filters.lng.toString());

    // Advanced filters - Catering
    if (filters?.serviceStyle) params.append('serviceStyle', filters.serviceStyle);
    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('cuisineTypes', filters.cuisineTypes.join(','));
    }
    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      params.append('dietaryOptions', filters.dietaryOptions.join(','));
    }
    if (filters?.minGuestCount !== undefined) params.append('minGuestCount', filters.minGuestCount.toString());
    if (filters?.maxGuestCount !== undefined) params.append('maxGuestCount', filters.maxGuestCount.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    // Advanced filters - Venues
    if (filters?.venueMinPrice !== undefined) params.append('venueMinPrice', filters.venueMinPrice.toString());
    if (filters?.venueMaxPrice !== undefined) params.append('venueMaxPrice', filters.venueMaxPrice.toString());
    if (filters?.seatedCapacityMin !== undefined) params.append('seatedCapacityMin', filters.seatedCapacityMin.toString());
    if (filters?.seatedCapacityMax !== undefined) params.append('seatedCapacityMax', filters.seatedCapacityMax.toString());

    // Advanced filters - Party Rentals
    if (filters?.minPartyPrice !== undefined) params.append('minPartyPrice', filters.minPartyPrice.toString());
    if (filters?.maxPartyPrice !== undefined) params.append('maxPartyPrice', filters.maxPartyPrice.toString());
    if (filters?.deliveryAvailable !== undefined) params.append('deliveryAvailable', filters.deliveryAvailable.toString());
    if (filters?.setupIncluded !== undefined) params.append('setupIncluded', filters.setupIncluded.toString());
    if (filters?.pickupAvailable !== undefined) params.append('pickupAvailable', filters.pickupAvailable.toString());

    // Advanced filters - Event Staff
    if (filters?.eventStaffPricingType) params.append('eventStaffPricingType', filters.eventStaffPricingType);
    if (filters?.minEventHourlyPrice !== undefined) params.append('minEventHourlyPrice', filters.minEventHourlyPrice.toString());
    if (filters?.maxEventHourlyPrice !== undefined) params.append('maxEventHourlyPrice', filters.maxEventHourlyPrice.toString());
    if (filters?.eventStaffExperienceLevel && filters.eventStaffExperienceLevel.length > 0) {
      params.append('eventStaffExperienceLevel', filters.eventStaffExperienceLevel.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}services?${queryString}` : `${API_URL}services`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data: { data: [...], pagination: {...} } }
      if (response && 'data' in response) {
        // Check for nested data structure with pagination
        if (response.data && 'data' in response.data) {
          return {
            data: Array.isArray(response.data.data) ? response.data.data : [],
            pagination: response.data.pagination
          };
        }
        // Direct array in response.data (no pagination)
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: undefined
          };
        }
      }
      // Fallback
      return {
        data: Array.isArray(response) ? response : [],
        pagination: undefined
      };
    });
  }

  // Get services by vendor with optional filters
  getServicesByVendor(vendorId: string, filters?: ServiceFilters): Promise<APIService[]> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.visibleStatus) params.append('visibleStatus', filters.visibleStatus);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Location filter - matches against vendor fullAddress using partial text matching
    if (filters?.location) params.append('location', filters.location);

    // Service name search filter
    if (filters?.serviceName) params.append('serviceName', filters.serviceName);

    // Advanced filters - Catering
    if (filters?.serviceStyle) params.append('serviceStyle', filters.serviceStyle);
    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('cuisineTypes', filters.cuisineTypes.join(','));
    }
    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      params.append('dietaryOptions', filters.dietaryOptions.join(','));
    }
    if (filters?.minGuestCount !== undefined) params.append('minGuestCount', filters.minGuestCount.toString());
    if (filters?.maxGuestCount !== undefined) params.append('maxGuestCount', filters.maxGuestCount.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    // Advanced filters - Venues
    if (filters?.venueMinPrice !== undefined) params.append('venueMinPrice', filters.venueMinPrice.toString());
    if (filters?.venueMaxPrice !== undefined) params.append('venueMaxPrice', filters.venueMaxPrice.toString());
    if (filters?.seatedCapacityMin !== undefined) params.append('seatedCapacityMin', filters.seatedCapacityMin.toString());
    if (filters?.seatedCapacityMax !== undefined) params.append('seatedCapacityMax', filters.seatedCapacityMax.toString());

    // Advanced filters - Party Rentals
    if (filters?.minPartyPrice !== undefined) params.append('minPartyPrice', filters.minPartyPrice.toString());
    if (filters?.maxPartyPrice !== undefined) params.append('maxPartyPrice', filters.maxPartyPrice.toString());
    if (filters?.deliveryAvailable !== undefined) params.append('deliveryAvailable', filters.deliveryAvailable.toString());
    if (filters?.setupIncluded !== undefined) params.append('setupIncluded', filters.setupIncluded.toString());
    if (filters?.pickupAvailable !== undefined) params.append('pickupAvailable', filters.pickupAvailable.toString());

    // Advanced filters - Event Staff
    if (filters?.eventStaffPricingType) params.append('eventStaffPricingType', filters.eventStaffPricingType);
    if (filters?.minEventHourlyPrice !== undefined) params.append('minEventHourlyPrice', filters.minEventHourlyPrice.toString());
    if (filters?.maxEventHourlyPrice !== undefined) params.append('maxEventHourlyPrice', filters.maxEventHourlyPrice.toString());
    if (filters?.eventStaffExperienceLevel && filters.eventStaffExperienceLevel.length > 0) {
      params.append('eventStaffExperienceLevel', filters.eventStaffExperienceLevel.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}services/vendor/${vendorId}?${queryString}` : `${API_URL}services/vendor/${vendorId}`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: APIServicesResponse | any) => {
      // Backend returns { status, response, message, data: { data: [...], pagination: {...} } }
      if (response && 'data' in response) {
        // Check for nested data structure (response.data.data)
        if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Direct array in response.data
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      // Fallback for direct data response
      return Array.isArray(response) ? response : [];
    });
  }

  // Get services by vendor with pagination info
  getServicesByVendorPaginated(vendorId: string, filters?: ServiceFilters): Promise<PaginatedServicesResponse> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.visibleStatus) params.append('visibleStatus', filters.visibleStatus);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Location filter - matches against vendor fullAddress using partial text matching
    if (filters?.location) params.append('location', filters.location);

    // Service name search filter
    if (filters?.serviceName) params.append('serviceName', filters.serviceName);

    // Advanced filters - Catering
    if (filters?.serviceStyle) params.append('serviceStyle', filters.serviceStyle);
    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('cuisineTypes', filters.cuisineTypes.join(','));
    }
    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      params.append('dietaryOptions', filters.dietaryOptions.join(','));
    }
    if (filters?.minGuestCount !== undefined) params.append('minGuestCount', filters.minGuestCount.toString());
    if (filters?.maxGuestCount !== undefined) params.append('maxGuestCount', filters.maxGuestCount.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    // Advanced filters - Venues
    if (filters?.venueMinPrice !== undefined) params.append('venueMinPrice', filters.venueMinPrice.toString());
    if (filters?.venueMaxPrice !== undefined) params.append('venueMaxPrice', filters.venueMaxPrice.toString());
    if (filters?.seatedCapacityMin !== undefined) params.append('seatedCapacityMin', filters.seatedCapacityMin.toString());
    if (filters?.seatedCapacityMax !== undefined) params.append('seatedCapacityMax', filters.seatedCapacityMax.toString());

    // Advanced filters - Party Rentals
    if (filters?.minPartyPrice !== undefined) params.append('minPartyPrice', filters.minPartyPrice.toString());
    if (filters?.maxPartyPrice !== undefined) params.append('maxPartyPrice', filters.maxPartyPrice.toString());
    if (filters?.deliveryAvailable !== undefined) params.append('deliveryAvailable', filters.deliveryAvailable.toString());
    if (filters?.setupIncluded !== undefined) params.append('setupIncluded', filters.setupIncluded.toString());
    if (filters?.pickupAvailable !== undefined) params.append('pickupAvailable', filters.pickupAvailable.toString());

    // Advanced filters - Event Staff
    if (filters?.eventStaffPricingType) params.append('eventStaffPricingType', filters.eventStaffPricingType);
    if (filters?.minEventHourlyPrice !== undefined) params.append('minEventHourlyPrice', filters.minEventHourlyPrice.toString());
    if (filters?.maxEventHourlyPrice !== undefined) params.append('maxEventHourlyPrice', filters.maxEventHourlyPrice.toString());
    if (filters?.eventStaffExperienceLevel && filters.eventStaffExperienceLevel.length > 0) {
      params.append('eventStaffExperienceLevel', filters.eventStaffExperienceLevel.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}services/vendor/${vendorId}?${queryString}` : `${API_URL}services/vendor/${vendorId}`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data: { data: [...], pagination: {...} } }
      if (response && 'data' in response) {
        // Check for nested data structure with pagination
        if (response.data && 'data' in response.data) {
          return {
            data: Array.isArray(response.data.data) ? response.data.data : [],
            pagination: response.data.pagination
          };
        }
        // Direct array in response.data (no pagination)
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: undefined
          };
        }
      }
      // Fallback
      return {
        data: Array.isArray(response) ? response : [],
        pagination: undefined
      };
    });
  }

  // Get all services with optional filters
  getServicesByVendorId(vendorId: string, filters?: ServiceFilters): Promise<APIService[]> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.visibleStatus) params.append('visibleStatus', filters.visibleStatus);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // Location filter - matches against vendor fullAddress using partial text matching
    if (filters?.location) params.append('location', filters.location);

    // Service name search filter
    if (filters?.serviceName) params.append('serviceName', filters.serviceName);

    // Advanced filters - Catering
    if (filters?.serviceStyle) params.append('serviceStyle', filters.serviceStyle);
    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('cuisineTypes', filters.cuisineTypes.join(','));
    }
    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      params.append('dietaryOptions', filters.dietaryOptions.join(','));
    }
    if (filters?.minGuestCount !== undefined) params.append('minGuestCount', filters.minGuestCount.toString());
    if (filters?.maxGuestCount !== undefined) params.append('maxGuestCount', filters.maxGuestCount.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    // Advanced filters - Venues
    if (filters?.venueMinPrice !== undefined) params.append('venueMinPrice', filters.venueMinPrice.toString());
    if (filters?.venueMaxPrice !== undefined) params.append('venueMaxPrice', filters.venueMaxPrice.toString());
    if (filters?.seatedCapacityMin !== undefined) params.append('seatedCapacityMin', filters.seatedCapacityMin.toString());
    if (filters?.seatedCapacityMax !== undefined) params.append('seatedCapacityMax', filters.seatedCapacityMax.toString());

    // Advanced filters - Party Rentals
    if (filters?.minPartyPrice !== undefined) params.append('minPartyPrice', filters.minPartyPrice.toString());
    if (filters?.maxPartyPrice !== undefined) params.append('maxPartyPrice', filters.maxPartyPrice.toString());
    if (filters?.deliveryAvailable !== undefined) params.append('deliveryAvailable', filters.deliveryAvailable.toString());
    if (filters?.setupIncluded !== undefined) params.append('setupIncluded', filters.setupIncluded.toString());
    if (filters?.pickupAvailable !== undefined) params.append('pickupAvailable', filters.pickupAvailable.toString());

    // Advanced filters - Event Staff
    if (filters?.eventStaffPricingType) params.append('eventStaffPricingType', filters.eventStaffPricingType);
    if (filters?.minEventHourlyPrice !== undefined) params.append('minEventHourlyPrice', filters.minEventHourlyPrice.toString());
    if (filters?.maxEventHourlyPrice !== undefined) params.append('maxEventHourlyPrice', filters.maxEventHourlyPrice.toString());
    if (filters?.eventStaffExperienceLevel && filters.eventStaffExperienceLevel.length > 0) {
      params.append('eventStaffExperienceLevel', filters.eventStaffExperienceLevel.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}services/vendor/${vendorId}?${queryString}` : `${API_URL}services/vendor/${vendorId}`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: APIServicesResponse | any) => {
      // Backend returns { status, response, message, data: { data: [...], pagination: {...} } }
      if (response && 'data' in response) {
        // Check for nested data structure (response.data.data)
        if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Direct array in response.data
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      // Fallback for direct data response
      return Array.isArray(response) ? response : [];
    });
  }

  // Get service by ID
  getServiceById(serviceId: string): Promise<APIService> {
    return this.get(`${API_URL}services/${serviceId}`, {
      headers: getAuthHeader(),
    }).then((response: { status: number; response: string; message: string; data: APIService } | any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  // Create catering service
  createCateringService(formData: FormData) {
    return this.post(`${API_URL}services/catering/create`, formData, {
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  // Create venue service
  createVenueService(formData: FormData) {
    return this.post(`${API_URL}services/venue/create`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    });
  }

  // Create party rental service
  createPartyRentalService(formData: FormData) {
    return this.post(`${API_URL}services/party-rental/create`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    });
  }

  // Create event staff service
  createEventStaffService(formData: FormData) {
    return this.post(`${API_URL}services/event-staff/create`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    });
  }

  // Update service status (admin only)
  updateServiceStatus(serviceId: string, status: 'pending' | 'drafted' | 'approved' | 'rejected') {
    return this.patch(`${API_URL}services/${serviceId}/status`, { status }, {
      headers: getAuthHeader(),
    }).then(response => {
      return response.data || response;
    });
  }

  // Update service manage field (admin only)
  updateServiceManage(serviceId: string, manage: boolean) {
    return this.patch(`${API_URL}services/${serviceId}/manage`, { manage }, {
      headers: getAuthHeader(),
    }).then(response => {
      return response.data || response;
    });
  }

  // Update service visible status (activate/deactivate)
  updateServiceVisibleStatus(serviceId: string, visibleStatus: 'active' | 'inactive') {
    return this.patch(`${API_URL}services/${serviceId}/visible-status`, { visibleStatus }, {
      headers: getAuthHeader(),
    }).then(response => {
      return response.data || response;
    });
  }

  // Update catering service
  updateCateringService(serviceId: string, formData: FormData) {
    return this.patch(`${API_URL}services/catering/${serviceId}`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    }).then(response => {
      return response.data || response;
    });
  }

  // Update venue service
  updateVenueService(serviceId: string, formData: FormData) {
    return this.patch(`${API_URL}services/venue/${serviceId}`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    }).then(response => {
      return response.data || response;
    });
  }

  // Update party rental service
  updatePartyRentalService(serviceId: string, formData: FormData) {
    return this.patch(`${API_URL}services/party-rental/${serviceId}`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    }).then(response => {
      return response.data || response;
    });
  }

  // Update event staff service
  updateEventStaffService(serviceId: string, formData: FormData) {
    return this.patch(`${API_URL}services/event-staff/${serviceId}`, formData, {
      headers: {
        ...getAuthHeader(),
      },
    }).then(response => {
      return response.data || response;
    });
  }

  // Delete service
  deleteService(serviceId: string) {
    return this.delete(`${API_URL}services/${serviceId}`, {
      headers: getAuthHeader(),
    }).then(response => {
      return response.data || response;
    });
  }

  // Get top-rated catering services
  getTopRatedCatering(): Promise<APIService[]> {
    return this.get(`${API_URL}services/catering/top-rated`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data: [...] }
      if (response && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback for direct data response
      return Array.isArray(response) ? response : [];
    });
  }

  // Get top-rated venue services
  getTopRatedVenues(): Promise<APIService[]> {
    return this.get(`${API_URL}services/venues/Top-Rated`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data: [...] }
      if (response && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback for direct data response
      return Array.isArray(response) ? response : [];
    });
  }

  getStateOfVendors(): Promise<any> {
    return this.get(`${API_URL}vendor/service-stats`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

}

export default new ServicesService();
