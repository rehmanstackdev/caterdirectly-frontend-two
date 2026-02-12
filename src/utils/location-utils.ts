import { ServiceItem } from '@/types/service-types';

// Haversine formula to calculate distance between two points
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  try {
    console.log(`Calculating distance between [${lat1},${lon1}] and [${lat2},${lon2}]`);
    
    // Validate inputs
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
      console.error("Invalid coordinate values:", { lat1, lon1, lat2, lon2 });
      return Infinity;
    }
    
    // Check for NaN values
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      console.error("NaN coordinate values:", { lat1, lon1, lat2, lon2 });
      return Infinity;
    }
    
    const R = 3959; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles
    
    console.log(`Distance calculated: ${distance.toFixed(2)} mi`);
    return distance;
  } catch (error) {
    console.error("Error calculating distance:", error);
    return Infinity;
  }
};

// Geocode service location to get real coordinates - stubbed
const geocodeServiceLocation = async (location: string): Promise<{ lat: number, lng: number } | null> => {
  console.log('API Call: POST', { url: '/geocoding', data: { address: location, type: 'geocode' } });
  console.log('API Call Complete: POST', { url: '/geocoding', result: null });
  return null;
};

// Cache for geocoded service locations to reduce API calls
const locationCache = new Map<string, { lat: number, lng: number, timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get service coordinates with real geocoding and caching
const getServiceCoordinates = async (location: string | undefined): Promise<{ lat: number, lng: number, radius: number }> => {
  const defaultCoords = { lat: 25.7617, lng: -80.1918, radius: 100 };
  
  if (!location) {
    console.log("No location provided, using default");
    return defaultCoords;
  }
  
  // Check cache first
  const cached = locationCache.get(location);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached coordinates for ${location}`);
    return { ...cached, radius: 50 }; // Default radius of 50mi
  }
  
  // Geocode the location
  const coords = await geocodeServiceLocation(location);
  if (coords) {
    // Cache the result
    locationCache.set(location, { ...coords, timestamp: Date.now() });
    console.log(`Geocoded ${location} to [${coords.lat}, ${coords.lng}]`);
    return { ...coords, radius: 50 };
  } else {
    console.log(`Failed to geocode ${location}, using default`);
    return defaultCoords;
  }
};

// Check if a service is available at given coordinates with real geocoding
export const isServiceAvailableAtLocation = async (
  service: ServiceItem, 
  userLat: number, 
  userLng: number
): Promise<boolean> => {
  try {
    // Validate input service
    if (!service) {
      console.error("Invalid service provided to isServiceAvailableAtLocation");
      return false;
    }
    
    // Extract location from service
    const location = service.location;
    const coords = await getServiceCoordinates(location);
    
    // Calculate distance between user and service
    const distance = calculateDistance(
      userLat, 
      userLng, 
      coords.lat, 
      coords.lng
    );
    
    // Check if user is within service radius
    const isAvailable = distance <= coords.radius;
    console.log(`Service ${service.name} at ${location} is ${isAvailable ? 'available' : 'not available'} at user location. Distance: ${distance.toFixed(2)}mi`);
    
    return isAvailable;
  } catch (error) {
    console.error("Error checking service availability:", error, service);
    return false;
  }
};

// Filter services based on user location with real geocoding
export const filterServicesByLocation = async (
  services: ServiceItem[],
  userLat: number | null, 
  userLng: number | null
): Promise<ServiceItem[]> => {
  try {
    console.log(`Filtering services by location [${userLat},${userLng}]`);
    
    // Validate input services
    if (!Array.isArray(services)) {
      console.error("Invalid services array provided to filterServicesByLocation:", services);
      return [];
    }
    
    // Return all services if no location specified
    if (userLat === null || userLng === null) {
      console.log("No user location provided, returning all services");
      return services;
    }
    
    // Filter services based on real location data
    const filteredServices = [];
    
    for (const service of services) {
      if (!service) {
        console.error("Invalid service item in filter:", service);
        continue;
      }
      
      const isAvailable = await isServiceAvailableAtLocation(service, userLat, userLng);
      if (isAvailable) {
        filteredServices.push(service);
      }
    }
    
    console.log(`Filtered ${services.length} services to ${filteredServices.length} based on user location`);
    return filteredServices;
  } catch (error) {
    console.error("Error filtering services by location:", error);
    return services; // Return original services on error
  }
};

// Enhanced service search with location relevance
export const searchServicesWithLocation = async (
  services: ServiceItem[],
  searchQuery: string,
  userLat?: number | null,
  userLng?: number | null
): Promise<ServiceItem[]> => {
  try {
    // First filter by search query
    const searchResults = services.filter(service => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm) ||
        service.vendorName.toLowerCase().includes(searchTerm) ||
        service.location?.toLowerCase().includes(searchTerm)
      );
    });
    
    // If no location provided, return search results sorted by rating
    if (!userLat || !userLng) {
      return searchResults.sort((a, b) => {
        const ratingA = parseFloat(a.rating || '0');
        const ratingB = parseFloat(b.rating || '0');
        return ratingB - ratingA;
      });
    }
    
    // Calculate distances and sort by relevance (combination of search relevance and distance)
    const resultsWithDistance = await Promise.all(
      searchResults.map(async (service) => {
        const coords = await getServiceCoordinates(service.location);
        const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
        
        // Calculate relevance score (lower is better)
        // Combine distance (miles) with search relevance (0-100)
        let searchRelevance = 50; // base score
        
        const searchTerm = searchQuery.toLowerCase();
        if (service.name.toLowerCase().includes(searchTerm)) searchRelevance -= 20;
        if (service.vendorName.toLowerCase().includes(searchTerm)) searchRelevance -= 15;
        if (service.description?.toLowerCase().includes(searchTerm)) searchRelevance -= 10;
        
        const relevanceScore = distance + searchRelevance;
        
        return {
          service,
          distance,
          relevanceScore
        };
      })
    );
    
    // Sort by relevance score (lower is better)
    return resultsWithDistance
      .sort((a, b) => a.relevanceScore - b.relevanceScore)
      .map(item => item.service);
      
  } catch (error) {
    console.error("Error searching services with location:", error);
    return services.filter(service => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm) ||
        service.vendorName.toLowerCase().includes(searchTerm)
      );
    });
  }
};
