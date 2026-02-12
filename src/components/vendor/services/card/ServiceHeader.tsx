
import React from 'react';
import { ServiceItem } from '@/types/service-types';
import { getDisplayPrice } from '@/utils/service-utils';

interface ServiceHeaderProps {
  service: ServiceItem;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({ service }) => {
  const displayPrice = getDisplayPrice(service);
  
  return (
    <div>
      <h3 className="font-semibold text-lg truncate">{service.name}</h3>
      <div className="flex justify-between items-center mt-1">
        <p className="text-gray-500">{displayPrice || 'No price set'}</p>
        {service.rating && Number(service.rating) > 0 && (
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-sm">{service.rating}</span>
            <span className="ml-1 text-xs text-gray-500">({service.reviews})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceHeader;
