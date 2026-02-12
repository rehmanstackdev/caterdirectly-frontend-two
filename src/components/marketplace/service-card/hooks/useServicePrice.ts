
import { ServiceItem } from '@/types/service-types';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';

export const useServicePrice = (service: ServiceItem, vendorType?: string) => {
  console.log(`[ServiceCard] Using unified price formatter for ${service.name}`);
  
  // Use the single unified price formatter for ALL service types
  const displayPrice = formatUnifiedServicePrice(service);
  
  console.log(`[ServiceCard] FINAL RESULT for ${service.name}:`, {
    originalPrice: service.price,
    priceType: service.price_type,
    finalDisplayPrice: displayPrice,
    component: 'ServiceCard'
  });

  return displayPrice;
};
