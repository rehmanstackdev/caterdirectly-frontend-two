import { ServiceItem, ServiceType, ServiceStatus } from '@/types/service-types';

/**
 * Creates a valid ServiceItem object from props to pass to toggleFavorite
 */
export const createServiceItemFromProps = (
  id: string,
  name: string,
  vendorName: string,
  image: string,
  price: string,
  rating: string,
  reviews: string,
  description: string,
  location: string,
  vendorType: string = 'catering',
  available: boolean = true,
  existingService?: ServiceItem
): ServiceItem => {
  // If we already have a service object, just update the fields we need
  if (existingService) {
    return {
      ...existingService,
      name,
      vendorName,
      image,
      price,
      rating,
      reviews,
      description,
      location,
      available
    };
  }
  
  // Otherwise create a new service object from scratch
  return {
    id,
    name,
    vendorName,
    price,
    image,
    rating,
    reviews,
    description,
    location,
    type: vendorType as ServiceType,
    status: 'approved' as ServiceStatus, // Default to approved
    active: available,
    vendor_id: '',
    isManaged: false, 
    service_details: {},
    available
  };
};
