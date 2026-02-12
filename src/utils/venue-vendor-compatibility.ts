import { VenueServiceDetails, InsuranceType, LicenseType } from '@/types/service-types';
import { VendorCertifications } from '@/types/vendor';

export interface CompatibilityResult {
  isCompatible: boolean;
  missingInsurance: InsuranceType[];
  missingLicenses: LicenseType[];
  vendorPolicyCompatible: boolean;
  warnings: string[];
}

/**
 * Check if a vendor is compatible with a venue's requirements
 */
export function checkVenueVendorCompatibility(
  venueDetails: VenueServiceDetails,
  vendorCertifications: VendorCertifications,
  vendorId: string,
  preferredVendorIds: string[] = []
): CompatibilityResult {
  const result: CompatibilityResult = {
    isCompatible: true,
    missingInsurance: [],
    missingLicenses: [],
    vendorPolicyCompatible: true,
    warnings: []
  };

  // Check vendor policy compatibility
  if (venueDetails.vendorPolicy === 'preferred_only') {
    const isPreferred = preferredVendorIds.includes(vendorId);
    if (!isPreferred) {
      result.vendorPolicyCompatible = false;
      result.isCompatible = false;
      result.warnings.push('This venue only accepts vendors from their preferred list');
    }
  } else if (venueDetails.vendorPolicy === 'hybrid') {
    const isPreferred = preferredVendorIds.includes(vendorId);
    if (!isPreferred) {
      result.warnings.push('This venue prioritizes preferred vendors - your booking may require approval');
    }
  }

  // Check insurance requirements
  const requiredInsurance = venueDetails.insuranceRequirements || [];
  const vendorInsurance = vendorCertifications.insurance_policies || [];
  
  for (const requirement of requiredInsurance) {
    if (!vendorInsurance.includes(requirement)) {
      result.missingInsurance.push(requirement as InsuranceType);
      result.isCompatible = false;
    }
  }

  // Check license requirements
  const requiredLicenses = venueDetails.licenseRequirements || [];
  const vendorLicenses = vendorCertifications.licenses || [];
  
  for (const requirement of requiredLicenses) {
    if (!vendorLicenses.includes(requirement)) {
      result.missingLicenses.push(requirement as LicenseType);
      result.isCompatible = false;
    }
  }

  // Add specific warnings for missing certifications
  if (result.missingInsurance.length > 0) {
    result.warnings.push(
      `Missing required insurance: ${result.missingInsurance.join(', ')}`
    );
  }

  if (result.missingLicenses.length > 0) {
    result.warnings.push(
      `Missing required licenses: ${result.missingLicenses.join(', ')}`
    );
  }

  return result;
}

/**
 * Get a user-friendly description of insurance types
 */
export function getInsuranceTypeLabel(insuranceType: InsuranceType): string {
  const labels: Record<InsuranceType, string> = {
    general_liability: 'General Liability Insurance',
    product_liability: 'Product Liability Insurance',
    professional_liability: 'Professional Liability Insurance',
    property_insurance: 'Property Insurance',
    workers_compensation: 'Workers Compensation'
  };
  return labels[insuranceType];
}

/**
 * Get a user-friendly description of license types
 */
export function getLicenseTypeLabel(licenseType: LicenseType): string {
  const labels: Record<LicenseType, string> = {
    liquor_license: 'Liquor License',
    catering_permit: 'Catering Permit',
    food_handler_permit: 'Food Handler Permit',
    business_license: 'Business License',
    health_department_permit: 'Health Department Permit'
  };
  return labels[licenseType];
}

/**
 * Filter venues based on vendor compatibility when a vendor is already selected
 */
export function filterVenuesForVendor(
  venues: any[],
  selectedVendorId: string,
  vendorCertifications: VendorCertifications
): any[] {
  return venues.filter(venue => {
    if (!venue.service_details) return true; // No restrictions means compatible
    
    const compatibility = checkVenueVendorCompatibility(
      venue.service_details,
      vendorCertifications,
      selectedVendorId,
      venue.service_details.preferredVendorIds || []
    );
    
    return compatibility.isCompatible;
  });
}