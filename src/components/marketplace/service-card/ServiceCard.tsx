
import { memo } from 'react';
import { VendorCard } from '@/components/marketplace/vendor-card';
import { ServiceItem, ServiceType, ServiceStatus } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { useUnifiedServiceImage } from '@/hooks/useUnifiedServiceImage';
import { useServicePrice } from './hooks/useServicePrice';

interface ServiceCardProps {
  service: ServiceItem;
  onViewDetails: (service: ServiceItem) => void;
  vendorType?: string;
  priority?: boolean;
  existingServices?: ServiceSelection[];
}

const ServiceCard = ({ 
  service, 
  onViewDetails, 
  vendorType, 
  priority = false, 
  existingServices = [] 
}: ServiceCardProps) => {
  // Ensure service is valid
  if (!service || typeof service !== 'object') {
    console.error('[ServiceCard] Invalid service object:', service);
    return null;
  }
  
  // Use unified image hook for better performance and consistency
  const { imageUrl: imageToDisplay } = useUnifiedServiceImage(service, { priority });
  const displayPrice = useServicePrice(service, vendorType);
  
  // Ensure service has all required properties to match ServiceItem
  const serviceWithRequired: ServiceItem = {
    ...service,
    image: typeof service.image === 'string' ? service.image : '',
    type: (service.type || service.serviceType || vendorType || 'other') as ServiceType, 
    status: service.status as ServiceStatus, 
    active: service.active !== false,
    vendor_id: service.vendor_id || '', 
    isManaged: service.isManaged || false,
  };
  
  // Pass the final formatted price with suffix to VendorCard
  return (
    <VendorCard
      key={service.id}
      id={service.id}
      image={imageToDisplay}
      name={service.name || 'Unnamed Service'}
      vendorName={service.vendorName || ''}
      rating={service.rating || "0.0"}
      reviews={service.reviews || "0"}
      location={service.location}
      price={displayPrice || '$0'}
      priceType={service.price_type || ''}
      description={service.description || ""}
      available={service.active !== false}
      isManaged={service.isManaged}
      onViewDetails={() => onViewDetails(serviceWithRequired)}
      vendorType={(typeof service.type === 'string' ? service.type : '') || vendorType || ''}
      service={serviceWithRequired}
      priority={priority}
      existingServices={existingServices}
    />
  );
};

export default memo(ServiceCard);
