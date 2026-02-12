import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ServiceItem, ServiceType, PriceType } from '@/types/service-types';
import { useAuth } from '@/contexts/auth';
import HostService from '@/services/api/host/host.Service';

export interface FavoritedVendor {
  id: string;
  name: string;
  image: string;
  role?: string;
  serviceCount: number;
  services: ServiceItem[];
}

const mapServiceType = (apiType: string): ServiceType => {
  switch (apiType) {
    case 'party_rentals': return 'party-rentals';
    case 'events_staff': return 'staff';
    case 'venues': return 'venues';
    case 'catering': return 'catering';
    default: return 'catering';
  }
};

const mapStatus = (backendStatus: string): 'draft' | 'pending_approval' | 'approved' | 'rejected' => {
  switch (backendStatus) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'drafted': return 'draft';
    case 'pending': return 'pending_approval';
    default: return 'pending_approval';
  }
};

const transformFavoriteService = (service: any): ServiceItem => {
  const vendorName = service.vendor?.businessName || 'Unknown Vendor';
  
  let price = 'Contact for pricing';
  let price_type: PriceType | undefined;
  
  if (service.venue) {
    price = service.venue.price ? `$${service.venue.price}` : 'Contact for pricing';
    price_type = service.venue.pricingType === 'per_person' ? 'per_person' : 
                 service.venue.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.eventStaff) {
    price = service.eventStaff.price ? `$${service.eventStaff.price}` : 'Contact for pricing';
    price_type = service.eventStaff.pricingType === 'per_hour' ? 'per_hour' : 
                 service.eventStaff.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.partyRental) {
    price = service.partyRental.price ? `$${service.partyRental.price}` : 'Contact for pricing';
    price_type = service.partyRental.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.catering) {
    price = service.catering.minimumOrderAmount ? `$${service.catering.minimumOrderAmount}` : 'Contact for pricing';
  }
  
  const image = service.venue?.serviceImage || 
                service.eventStaff?.serviceImage || 
                service.partyRental?.serviceImage || 
                service.catering?.menuPhoto || 
                '';
  
  const location = service.vendor?.fullAddress || 
                   (service.vendor?.city && service.vendor?.state 
                     ? `${service.vendor.city}, ${service.vendor.state}` 
                     : '') || 
                   '';
  
  const isActive = service.status === 'approved' && service.visibleStatus === 'active';
  const isManaged = service.manage || service.catering?.manage || service.service_details?.manage || false;
  
  return {
    id: service.id,
    name: service.serviceName,
    type: mapServiceType(service.serviceType),
    serviceType: service.serviceType,
    description: service.description || '',
    price,
    price_type,
    image,
    status: mapStatus(service.status),
    active: isActive,
    isManaged,
    vendorName,
    vendor_id: service.vendor?.id || '',
    location,
    reviews: '0',
    rating: '0',
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    service_details: {
      ...(service.venue && { venue: service.venue }),
      ...(service.eventStaff && { eventStaff: service.eventStaff }),
      ...(service.partyRental && { partyRental: service.partyRental }),
      ...(service.catering && { catering: service.catering }),
      ...(service.createdBy && { createdBy: service.createdBy }),
      ...(service.vendor && { vendor: service.vendor })
    }
  };
};

export function useFavorites() {
  const [favoritedServices, setFavoritedServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // const loadFavorites = useCallback(async () => {
  //   if (!user) {
  //     setFavoritedServices([]);
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const response = await HostService.getFavouriteServices();
      
  //     let favoritesData: any[] = [];
  //     if (response?.data && Array.isArray(response.data)) {
  //       favoritesData = response.data;
  //     } else if (Array.isArray(response)) {
  //       favoritesData = response;
  //     }
      
  //     const services = favoritesData
  //       .filter(service => service.isFavourite === true)
  //       .map(transformFavoriteService);

  //     setFavoritedServices(services);
  //   } catch (error: any) {
  //     console.error('Error loading favorites:', error);
  //     toast.error('Failed to load favorites');
  //     setFavoritedServices([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [user]);

  // useEffect(() => {
  //   loadFavorites();
  // }, [loadFavorites]);
  
  const toggleFavorite = useCallback(async (service: ServiceItem) => {
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }

    const isCurrentlyFavorited = favoritedServices.some(item => item.id === service.id);
    
    try {
      if (isCurrentlyFavorited) {
        await HostService.removeFavouriteService(service.id);
        setFavoritedServices(prev => prev.filter(item => item.id !== service.id));
        toast.success(`Removed ${service.name} from favorites`);
      } else {
        await HostService.addFavouriteService(service.id);
        setFavoritedServices(prev => [...prev, service]);
        toast.success(`Added ${service.name} to favorites`);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  }, [user, favoritedServices]);
  
  const isFavorited = useCallback((serviceId: string) => {
    return favoritedServices.some(service => service.id === serviceId);
  }, [favoritedServices]);
  
  const getFavoritedVendors = useCallback((): FavoritedVendor[] => {
    const vendorsMap = new Map<string, FavoritedVendor>();
    
    favoritedServices.forEach(service => {
      const vendorName = service.vendorName;
      
      if (!vendorsMap.has(vendorName)) {
        vendorsMap.set(vendorName, {
          id: vendorName.replace(/\s+/g, '-').toLowerCase(),
          name: vendorName,
          image: service.image || '', 
          serviceCount: 1,
          services: [service]
        });
      } else {
        const vendor = vendorsMap.get(vendorName)!;
        vendor.serviceCount += 1;
        vendor.services.push(service);
      }
    });
    
    return Array.from(vendorsMap.values());
  }, [favoritedServices]);

  const promptLogin = useCallback(() => {
    toast.error('Please log in to save favorites');
  }, []);
  
  return {
    favoritedServices,
    loading,
    toggleFavorite,
    isFavorited,
    getFavoritedVendors,
    promptLogin,
    isAuthenticated: !!user,
    // loadFavorites
  };
}