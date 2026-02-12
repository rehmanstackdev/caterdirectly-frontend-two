
import { ServiceItem, ServiceType } from '@/types/service-types';

export const useServiceTransformation = () => {
  // Transform services to ensure they conform to what ServiceSection expects
  const transformServices = (services: any[]): ServiceItem[] => {
    if (!Array.isArray(services)) {
      console.warn('[useServiceTransformation] Expected an array but got:', services);
      return [];
    }
    
    return services.map(service => {
      if (!service) {
        console.warn('[useServiceTransformation] Null or undefined service item');
        return {
          id: '',
          image: '',
          name: 'Unknown Service',
          vendorName: '',
          rating: '0.0',
          reviews: '0',
          location: 'Location not specified',
          price: '$0',
          description: '',
          available: false,
          type: 'other' as ServiceType,
          serviceType: 'other',
          isManaged: false,
          active: false,
          status: 'draft',
          vendor_id: '',
          service_details: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ServiceItem;
      }
      
      return {
        ...service,
        id: service.id || '',
        // Ensure image is always a string
        image: typeof service.image === 'string' ? service.image : '',
        name: service.name || 'Unnamed Service',
        vendorName: service.vendorName || '',
        rating: service.rating || '0.0',
        reviews: service.reviews || '0',
        location: service.location || 'Location not specified',
        price: service.price || '$0', // Ensure price is always defined
        description: service.description || '',
        available: service.active !== false,
        type: service.type as ServiceType, // Cast to ServiceType enum
        serviceType: service.serviceType || service.type || 'other', // Ensure serviceType is defined
        isManaged: service.isManaged || false,
        active: service.active !== false,
        status: service.status || 'approved',
        vendor_id: service.vendor_id || '',
        service_details: service.service_details || {},
        createdAt: service.createdAt || new Date().toISOString(),
        updatedAt: service.updatedAt || new Date().toISOString()
      };
    });
  };

  return { transformServices };
};
