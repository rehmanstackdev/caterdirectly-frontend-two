import { useEffect, useState } from 'react';
import { calculateDistance } from '@/utils/location-utils';
import { ServiceSelection } from '@/types/order';

interface DistancesMapResult {
  distancesByService: Record<string, number>;
  loading: boolean;
  error?: string | null;
}

interface LocationCoordinates {
  lat: number;
  lng: number;
}

// Helper function to get coordinates from vendor object
function getVendorCoordinates(service: ServiceSelection): { lat: number; lng: number } | null {
  const serviceAny = service as any;

  // Priority 1: Check for vendorCoordinates at top level (from AdminBookingFlow)
  if (serviceAny.vendorCoordinates) {
    const coords = serviceAny.vendorCoordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  // Priority 2: Try to get coordinates from vendor object
  const vendor = typeof service.vendor === 'object' && service.vendor !== null ? service.vendor as any : null;

  if (vendor) {
    // Check for coordinates in vendor object
    if (vendor.coordinates && typeof vendor.coordinates.lat === 'number' && typeof vendor.coordinates.lng === 'number') {
      return { lat: vendor.coordinates.lat, lng: vendor.coordinates.lng };
    }

    // Check for direct lat/lng properties on vendor
    if (typeof vendor.lat === 'number' && typeof vendor.lng === 'number') {
      return { lat: vendor.lat, lng: vendor.lng };
    }
  }

  // Priority 3: Check service_details for vendor coordinates
  const serviceDetails = service.service_details;
  if (serviceDetails?.vendor?.coordinates) {
    const coords = serviceDetails.vendor.coordinates;
    if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  return null;
}

// Helper function to get event location coordinates (if available from LocationData)
function getEventCoordinates(locationData: any): { lat: number; lng: number } | null {
  if (!locationData) return null;
  
  // Check for coordinates in locationData
  if (locationData.coordinates && typeof locationData.coordinates.lat === 'number' && typeof locationData.coordinates.lng === 'number') {
    return { lat: locationData.coordinates.lat, lng: locationData.coordinates.lng };
  }
  
  // Check for direct lat/lng
  if (typeof locationData.lat === 'number' && typeof locationData.lng === 'number') {
    return { lat: locationData.lat, lng: locationData.lng };
  }
  
  return null;
}

export function useServiceDistances(
  services: ServiceSelection[] = [],
  destinationAddress?: string | null,
  destinationCoordinates?: LocationCoordinates | null
): DistancesMapResult {
  const [distancesByService, setDistances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Listen for vendor address updates
  useEffect(() => {
    const handleVendorAddressUpdate = () => {
      setRefreshVersion(prev => prev + 1);
    };

    window.addEventListener('vendor-address-updated', handleVendorAddressUpdate);
    return () => window.removeEventListener('vendor-address-updated', handleVendorAddressUpdate);
  }, []);

  // Serialize coordinates for stable dependency comparison
  const destCoordsKey = destinationCoordinates
    ? `${destinationCoordinates.lat},${destinationCoordinates.lng}`
    : null;

  useEffect(() => {
    if (!destinationAddress || services.length === 0) {
      setDistances({});
      return;
    }

    // Check if we have destination coordinates
    if (!destinationCoordinates) {
      setError('Destination coordinates not available. Please select location from the autocomplete dropdown.');
      setDistances({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: Record<string, number> = {};

      // Calculate distances using vendor coordinates
      services.forEach((svc) => {
        const id = (svc.id || (svc as any).serviceId) as string | undefined;
        if (!id) return;

        // Get vendor coordinates
        const vendorCoords = getVendorCoordinates(svc);
        if (!vendorCoords) return;

        // Calculate distance using the Haversine formula
        const miles = calculateDistance(
          vendorCoords.lat,
          vendorCoords.lng,
          destinationCoordinates.lat,
          destinationCoordinates.lng
        );

        if (miles !== Infinity && !isNaN(miles)) {
          results[id] = miles;
        }
      });

      setDistances(results);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to compute distances');
      setDistances({});
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(services.map(s => s.id || (s as any).serviceId)), destinationAddress, destCoordsKey, refreshVersion]);

  return { distancesByService, loading, error };
}
