
import { useState, useEffect, useMemo } from 'react';
import { ServiceSelection } from '@/types/order';
import { ServiceItem } from '@/types/service-types';

interface CompatibilityRules {
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    serviceRadius?: number;
  };
  date?: string;
  guestCount?: number;
  eventStyle?: string;
  venueRequirements?: {
    allowsCatering?: boolean;
    hasKitchen?: boolean;
    outdoorSpace?: boolean;
    parkingAvailable?: boolean;
  };
  cateringRequirements?: {
    needsKitchen?: boolean;
    deliveryAccess?: boolean;
    setupTime?: number;
  };
}

interface ServiceCompatibility {
  isCompatible: boolean;
  reasons: string[];
  warnings: string[];
  suggestions: string[];
}

export const useServiceCompatibility = (existingServices: ServiceSelection[]) => {
  const [compatibilityRules, setCompatibilityRules] = useState<CompatibilityRules>({});

  // Extract compatibility rules from existing services
  const extractRulesFromServices = useMemo(() => {
    const rules: CompatibilityRules = {};

    existingServices.forEach(service => {
      // Extract location information
      if (service.service_details?.location) {
        rules.location = {
          ...rules.location,
          address: service.service_details.location.address,
          latitude: service.service_details.location.latitude,
          longitude: service.service_details.location.longitude,
        };
      }

      // Extract venue requirements
      if (service.serviceType === 'venues' && service.service_details?.venue_details) {
        const venueDetails = service.service_details.venue_details;
        rules.venueRequirements = {
          allowsCatering: venueDetails.catering_policy !== 'not_allowed',
          hasKitchen: venueDetails.amenities?.includes('kitchen'),
          outdoorSpace: venueDetails.amenities?.includes('outdoor_space'),
          parkingAvailable: venueDetails.amenities?.includes('parking'),
        };
      }

      // Extract catering requirements
      if (service.serviceType === 'catering' && service.service_details?.catering_details) {
        const cateringDetails = service.service_details.catering_details;
        rules.cateringRequirements = {
          needsKitchen: cateringDetails.setup_requirements?.includes('kitchen_access'),
          deliveryAccess: cateringDetails.delivery_requirements?.includes('loading_dock'),
          setupTime: cateringDetails.setup_time || 2,
        };
      }

      // Extract guest count
      if (service.quantity && service.quantity > (rules.guestCount || 0)) {
        rules.guestCount = service.quantity;
      }

      // Extract event style
      if (service.service_details?.event_style) {
        rules.eventStyle = service.service_details.event_style;
      }
    });

    return rules;
  }, [existingServices]);

  useEffect(() => {
    setCompatibilityRules(extractRulesFromServices);
  }, [extractRulesFromServices]);

  // Check if a new service is compatible with existing services
  const checkServiceCompatibility = (newService: ServiceItem): ServiceCompatibility => {
    const compatibility: ServiceCompatibility = {
      isCompatible: true,
      reasons: [],
      warnings: [],
      suggestions: [],
    };

    // Check location compatibility
    if (compatibilityRules.location && newService.location) {
      const distance = calculateDistance(
        compatibilityRules.location.latitude || 0,
        compatibilityRules.location.longitude || 0,
        newService.service_details?.location?.latitude || 0,
        newService.service_details?.location?.longitude || 0
      );

      const serviceRadius = newService.service_details?.service_radius || 25;
      if (distance > serviceRadius) {
        compatibility.isCompatible = false;
        compatibility.reasons.push('Service area does not cover event location');
      } else if (distance > serviceRadius * 0.8) {
        compatibility.warnings.push('Near edge of service area - confirm availability');
      }
    }

    // Check venue-catering compatibility
    if (newService.type === 'venues') {
      const hasCatering = existingServices.some(s => s.serviceType === 'catering');
      if (hasCatering) {
        const venueDetails = newService.service_details?.venue_details;
        if (venueDetails?.catering_policy === 'not_allowed') {
          compatibility.isCompatible = false;
          compatibility.reasons.push('Venue does not allow outside catering');
        } else if (venueDetails?.catering_policy === 'restricted') {
          compatibility.warnings.push('Venue has catering restrictions - verify with vendor');
        }

        // Check kitchen requirements
        if (compatibilityRules.cateringRequirements?.needsKitchen && 
            !venueDetails?.amenities?.includes('kitchen')) {
          compatibility.warnings.push('Caterer requires kitchen access - venue may not have adequate facilities');
        }
      }
    }

    // Check catering-venue compatibility
    if (newService.type === 'catering') {
      const hasVenue = existingServices.some(s => s.serviceType === 'venues');
      if (hasVenue && compatibilityRules.venueRequirements) {
        const cateringDetails = newService.service_details?.catering_details;
        
        if (cateringDetails?.setup_requirements?.includes('kitchen_access') && 
            !compatibilityRules.venueRequirements.hasKitchen) {
          compatibility.warnings.push('Caterer requires kitchen access - verify venue has adequate facilities');
        }

        if (cateringDetails?.delivery_requirements?.includes('loading_dock') &&
            !compatibilityRules.venueRequirements.parkingAvailable) {
          compatibility.warnings.push('Caterer requires delivery access - verify venue accessibility');
        }
      }
    }

    // Check guest count compatibility
    if (compatibilityRules.guestCount) {
      const serviceCapacity = newService.service_details?.capacity;
      if (serviceCapacity && serviceCapacity.max < compatibilityRules.guestCount) {
        compatibility.isCompatible = false;
        compatibility.reasons.push(`Service capacity (${serviceCapacity.max}) is less than required (${compatibilityRules.guestCount})`);
      } else if (serviceCapacity && serviceCapacity.min > compatibilityRules.guestCount) {
        compatibility.warnings.push(`Service minimum (${serviceCapacity.min}) exceeds guest count (${compatibilityRules.guestCount})`);
      }
    }

    // Add suggestions based on existing services
    if (existingServices.length > 0 && compatibility.isCompatible) {
      if (!existingServices.some(s => s.serviceType === 'staff') && 
          (compatibilityRules.guestCount || 0) > 50) {
        compatibility.suggestions.push('Consider adding staff for events over 50 guests');
      }

      if (!existingServices.some(s => s.serviceType === 'party-rentals') &&
          newService.type === 'venues' &&
          newService.service_details?.venue_details?.amenities?.includes('outdoor_space')) {
        compatibility.suggestions.push('Consider party rentals for outdoor venue setup');
      }
    }

    return compatibility;
  };

  // Get filtered services based on compatibility
  const getCompatibleServices = (services: ServiceItem[]): ServiceItem[] => {
    return services.filter(service => {
      const compatibility = checkServiceCompatibility(service);
      return compatibility.isCompatible;
    });
  };

  // Get missing service recommendations
  const getMissingServiceRecommendations = (): string[] => {
    const recommendations: string[] = [];
    const serviceTypes = existingServices.map(s => s.serviceType);

    if (!serviceTypes.includes('catering') && !serviceTypes.includes('venues')) {
      recommendations.push('Consider adding catering or a venue for your event');
    }

    if (serviceTypes.includes('venues') && !serviceTypes.includes('catering')) {
      const venue = existingServices.find(s => s.serviceType === 'venues');
      if (venue?.service_details?.venue_details?.catering_policy === 'allowed') {
        recommendations.push('Add catering to complete your venue booking');
      }
    }

    if ((compatibilityRules.guestCount || 0) > 50 && !serviceTypes.includes('staff')) {
      recommendations.push('Consider adding staff for events over 50 guests');
    }

    if (serviceTypes.includes('venues') && 
        !serviceTypes.includes('party-rentals') &&
        compatibilityRules.venueRequirements?.outdoorSpace) {
      recommendations.push('Consider party rentals for outdoor venue setup');
    }

    return recommendations;
  };

  return {
    compatibilityRules,
    checkServiceCompatibility,
    getCompatibleServices,
    getMissingServiceRecommendations,
  };
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
