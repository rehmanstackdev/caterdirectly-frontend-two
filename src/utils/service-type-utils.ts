/**
 * Service Type Utility
 * Centralizes service type handling and naming consistency
 */

export type ServiceType = 'all' | 'catering' | 'venues' | 'party_rentals' | 'events_staff' | 'party-rentals' | 'staff';

export const SERVICE_TYPES = {
  ALL: 'all' as const,
  CATERING: 'catering' as const,
  VENUES: 'venues' as const,
  PARTY_RENTALS: 'party_rentals' as const,
  STAFF: 'events_staff' as const,
  // Tab values for UI
  PARTY_RENTALS_TAB: 'party-rentals' as const,
  STAFF_TAB: 'staff' as const,
} as const;

// Legacy type mappings for backwards compatibility
export const LEGACY_TYPE_MAPPINGS: Record<string, ServiceType> = {
  'party-rental': 'party_rentals',
  'party-rentals': 'party_rentals',
  'rental': 'party_rentals',
  'venue': 'venues',
  'staff': 'events_staff',
  'staffing': 'events_staff',
};

// Tab to database type mappings
export const TAB_TO_DB_MAPPINGS: Record<string, ServiceType> = {
  'party-rentals': 'party_rentals',
  'staff': 'events_staff',
  'catering': 'catering',
  'venues': 'venues',
};

/**
 * Normalizes service type to standard format
 */
export const normalizeServiceType = (type: string | undefined): ServiceType | null => {
  if (!type) return null;
  
  const lowerType = type.toLowerCase();
  
  // Check if it's already a standard type
  if (Object.values(SERVICE_TYPES).includes(lowerType as ServiceType)) {
    return lowerType as ServiceType;
  }
  
  // Check tab to database mappings first
  if (TAB_TO_DB_MAPPINGS[lowerType]) {
    return TAB_TO_DB_MAPPINGS[lowerType];
  }
  
  // Check legacy mappings
  if (LEGACY_TYPE_MAPPINGS[lowerType]) {
    return LEGACY_TYPE_MAPPINGS[lowerType];
  }
  
  return null;
};

/**
 * Get display label for service type
 */
export const getServiceTypeLabel = (type: string | undefined): string => {
  if (!type) return 'Service';
  
  // Handle backend enum values directly
  switch (type.toLowerCase()) {
    case 'catering':
      return 'Catering';
    case 'venues':
    case 'venue':
      return 'Venues';
    case 'party_rentals':
    case 'party-rentals':
    case 'party-rental':
    case 'rental':
      return 'Party Rental';
    case 'events_staff':
    case 'staff':
    case 'staffing':
      return 'Event Staff';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }
};

/**
 * Get database filter value for service type
 */
export const getServiceTypeFilter = (type: ServiceType): string => {
  // For database queries, we need to handle the actual stored values
  switch (type) {
    case SERVICE_TYPES.PARTY_RENTALS:
      return 'party-rental'; // Database might have legacy format
    default:
      return type;
  }
};

/**
 * Get route path for service type
 */
export const getServiceTypeRoute = (type: ServiceType): string => {
  return type;
};

/**
 * Check if service type is valid
 */
export const isValidServiceType = (type: string): type is ServiceType => {
  return normalizeServiceType(type) !== null;
};