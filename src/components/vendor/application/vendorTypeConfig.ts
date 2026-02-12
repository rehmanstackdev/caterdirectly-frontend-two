// SSOT for 4 Marketplace Service Categories
export type DocumentRequirement = {
  id: string;
  label: string; 
  description: string;
  required: boolean;
};

export type ServiceCategoryConfig = {
  id: string;
  name: string;
  description: string;
  documentRequirements: DocumentRequirement[];
  requiresFoodHandlerCertification: boolean;
};

// Configuration for the 4 marketplace service categories
export const serviceCategoryConfigs: Record<string, ServiceCategoryConfig> = {
  catering: {
    id: 'catering',
    name: 'Catering Services',
    description: 'Food & beverage catering',
    documentRequirements: [
      { 
        id: "businessLicense", 
        label: "Business License", 
        description: "Current business license issued by your local government",
        required: true
      },
      { 
        id: "healthPermit", 
        label: "Health Permit", 
        description: "Current health department permit for food service",
        required: true
      },
      { 
        id: "liabilityInsurance", 
        label: "Liability Insurance", 
        description: "Proof of current liability insurance coverage",
        required: true
      },
      { 
        id: "foodHandlerCertification", 
        label: "Food Handler Certification", 
        description: "Food handler/manager certifications",
        required: true
      }
    ],
    requiresFoodHandlerCertification: true
  },
  venues: {
    id: 'venues',
    name: 'Venue Rental',
    description: 'Event spaces & locations',
    documentRequirements: [
      { 
        id: "businessLicense", 
        label: "Business License", 
        description: "Current business license issued by your local government",
        required: true
      },
      { 
        id: "liabilityInsurance", 
        label: "Liability Insurance", 
        description: "Proof of current liability insurance coverage",
        required: true
      },
      { 
        id: "fireInspectionCertificate", 
        label: "Fire Inspection Certificate", 
        description: "Current fire safety inspection certificate",
        required: true
      },
      { 
        id: "occupancyPermit", 
        label: "Certificate of Occupancy", 
        description: "Document certifying building safety for occupancy",
        required: true
      }
    ],
    requiresFoodHandlerCertification: false
  },
  'party-rentals': {
    id: 'party-rentals',
    name: 'Party Rentals',
    description: 'Equipment, decor & supplies',
    documentRequirements: [
      { 
        id: "businessLicense", 
        label: "Business License", 
        description: "Current business license issued by your local government",
        required: true
      },
      { 
        id: "liabilityInsurance", 
        label: "Liability Insurance", 
        description: "Proof of current liability insurance coverage",
        required: true
      }
    ],
    requiresFoodHandlerCertification: false
  },
  staff: {
    id: 'staff',
    name: 'Event Staffing',
    description: 'Servers, bartenders & staff',
    documentRequirements: [
      { 
        id: "businessLicense", 
        label: "Business License", 
        description: "Current business license issued by your local government",
        required: true
      },
      { 
        id: "liabilityInsurance", 
        label: "Liability Insurance", 
        description: "Proof of current liability insurance coverage",
        required: true
      },
      { 
        id: "employerIdentificationCertificate", 
        label: "Employer Identification Certificate", 
        description: "Documentation of employer status",
        required: true
      }
    ],
    requiresFoodHandlerCertification: false
  }
};

// Get all service categories (for form selection)
export const getAllServiceCategories = (): ServiceCategoryConfig[] => {
  return Object.values(serviceCategoryConfigs);
};

// Get document requirements for selected service types
// Merges requirements from multiple services intelligently
export const getDocumentRequirementsForServices = (serviceTypes: string[] | undefined): DocumentRequirement[] => {
  if (!serviceTypes || serviceTypes.length === 0) {
    return [];
  }
  
  // Collect all unique documents across selected services
  const documentMap = new Map<string, DocumentRequirement>();
  
  serviceTypes.forEach(serviceType => {
    const config = serviceCategoryConfigs[serviceType];
    if (config) {
      config.documentRequirements.forEach(doc => {
        const existing = documentMap.get(doc.id);
        // If document exists in multiple services, it's required if ANY service requires it
        if (!existing || doc.required) {
          documentMap.set(doc.id, {
            ...doc,
            required: existing ? (existing.required || doc.required) : doc.required
          });
        }
      });
    }
  });
  
  return Array.from(documentMap.values());
};

// Check if food handler certification is required for selected services
export const requiresFoodHandlerCertification = (serviceTypes: string[] | undefined): boolean => {
  if (!serviceTypes || serviceTypes.length === 0) {
    return false;
  }
  
  return serviceTypes.some(serviceType => {
    const config = serviceCategoryConfigs[serviceType];
    return config?.requiresFoodHandlerCertification || false;
  });
};
