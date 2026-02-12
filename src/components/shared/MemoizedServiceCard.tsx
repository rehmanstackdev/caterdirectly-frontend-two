import React, { memo } from 'react';
import VendorCard from '@/components/marketplace/vendor-card/VendorCard';
import { ServiceItem } from '@/types/service-types';

interface MemoizedServiceCardProps {
  service: ServiceItem;
  onViewDetails: (service: ServiceItem) => void;
  isSelected?: boolean;
  className?: string;
}

const MemoizedServiceCard = memo(({
  service,
  onViewDetails,
  isSelected = false,
  className = ""
}: MemoizedServiceCardProps) => {
  return (
    <VendorCard
      id={service.id}
      name={service.name}
      description={service.description}
      image={service.image}
      location={service.location}
      rating={service.rating}
      reviews={service.reviews}
      price={service.price}
      isManaged={service.isManaged}
      available={service.available}
      vendorName={service.vendorName}
      onViewDetails={() => onViewDetails(service)}
      service={service}
    />
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing only essential props
  return (
    prevProps.service.id === nextProps.service.id &&
    prevProps.service.name === nextProps.service.name &&
    prevProps.service.image === nextProps.service.image &&
    prevProps.service.rating === nextProps.service.rating &&
    prevProps.service.available === nextProps.service.available &&
    prevProps.isSelected === nextProps.isSelected
  );
});

MemoizedServiceCard.displayName = 'MemoizedServiceCard';

export default MemoizedServiceCard;