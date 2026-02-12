

import { Star, MapPin } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import CompatibilityIndicator from '../CompatibilityIndicator';

interface CardContentProps {
  name: string;
  vendorName: string;
  rating: string;
  reviews: string;
  location: string;
  description: string;
  service?: ServiceItem;
  existingServices: ServiceSelection[];
}

const CardContent = ({
  name,
  vendorName,
  rating,
  reviews,
  location,
  description,
  service,
  existingServices
}: CardContentProps) => {
  return (
    <div className="p-2 flex flex-col flex-grow">
      {/* Header section with title and vendor name */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <h3 className="font-semibold text-lg leading-tight text-gray-900 min-h-[2.25rem] flex items-start">
          <span className="line-clamp-2">{name}</span>
        </h3>
      </div>

      {/* Vendor name */}
      <div className="mb-1.5 min-h-[1.125rem]">
        <p className="text-sm text-gray-600 font-medium truncate mb-1">{vendorName}</p>
        <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingValue = parseFloat(rating) || 0;
              const filled = i < Math.floor(ratingValue);
              const halfFilled = !filled && i === Math.floor(ratingValue) && ratingValue % 1 >= 0.5;
              
              return (
                <Star 
                  key={i} 
                  className={`h-3.5 w-3.5 flex-shrink-0 ${
                    filled 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : halfFilled
                      ? 'text-yellow-400 fill-yellow-400 opacity-60'
                      : 'text-gray-300'
                  }`} 
                />
              );
            })}
          </div>
          <span className="text-xs text-gray-500 ml-1">{(parseFloat(rating) || 0).toFixed(1)}</span>
          <span className="text-xs text-gray-500">({reviews} {parseInt(reviews) === 0 || parseInt(reviews) === 1 ? 'review' : 'reviews'})</span>
        </div>
      </div>

      {/* Rating and location row */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-1.5 min-h-[1.125rem]">
        <div className="flex items-center gap-1 min-w-0">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-1.5 min-h-[1.75rem] flex items-start">
        <p className="text-sm text-gray-600 line-clamp-2 leading-normal">
          {description}
        </p>
      </div>

      {/* Compatibility Indicator */}
      <div className="mb-1.5 min-h-[1.125rem] flex items-start">
        {service && existingServices.length > 0 ? (
          <CompatibilityIndicator 
            service={service}
            existingServices={existingServices}
          />
        ) : (
          <div className="h-4"></div>
        )}
      </div>
    </div>
  );
};

export default CardContent;
