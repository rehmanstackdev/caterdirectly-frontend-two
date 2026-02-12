import React from 'react';
import { ServiceItem } from '@/types/service-types';

interface CompletionIndicatorProps {
  service: ServiceItem;
}

const CompletionIndicator: React.FC<CompletionIndicatorProps> = ({ service }) => {
  // Get completion percentage
  const getCompletionPercentage = () => {
    if (service.status !== 'draft') return 100;
    
    let completionScore = 0;
    let totalFields = 4; // Base required fields: name, type, description, price
    
    if (service.name) completionScore += 1;
    if (service.type) completionScore += 1;
    if (service.description) completionScore += 1;
    if (service.price) completionScore += 1;
    
    // Check service specific details based on type
    if (service.service_details) {
      switch (service.type) {
        case 'catering':
          totalFields += 1;
          if (service.service_details.serviceStyles?.length > 0) completionScore += 1;
          break;
        case 'venues':
          totalFields += 1;
          if (service.service_details.capacity) completionScore += 1;
          break;
        case 'staff':
          totalFields += 1;
          if (service.service_details.qualifications?.length > 0) completionScore += 1;
          break;
        case 'party-rentals':
          totalFields += 1;
          if (service.service_details.availableQuantity > 0) completionScore += 1;
          break;
      }
    }
    
    // Add image as a requirement
    totalFields += 1;
    if (service.image) completionScore += 1;
    
    return Math.floor((completionScore / totalFields) * 100);
  };

  if (service.status !== 'draft') return null;
  
  const percentage = getCompletionPercentage();
  
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-gray-500">Service completion</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-green-500 h-1.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CompletionIndicator;
