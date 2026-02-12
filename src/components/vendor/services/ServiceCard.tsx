
import React from 'react';
import { ServiceItem } from '@/types/service-types';

// Import all the smaller component pieces from index file
import {
  ServiceImage,
  ServiceHeader,
  CompletionIndicator,
  MenuHighlights,
  AdminFeedback,
  CommissionDisplay,
  CardQuickActions,
  CardMainAction
} from './card';
import { useVendorCommission } from '@/hooks/vendor/use-vendor-commission';

interface ServiceCardProps {
  service: ServiceItem;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
  activeTab: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onToggle, 
  onEdit, 
  onView, 
  onDelete,
  onSubmit,
  activeTab
}) => {
  const { commissionRate, loading } = useVendorCommission();
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <ServiceImage service={service} />
      
      <div className="p-4">
        <ServiceHeader service={service} />
        
        {/* Draft progress indicator */}
        <CompletionIndicator service={service} />
        
        {/* Menu highlights for catering services */}
        <MenuHighlights service={service} />
        
        {/* Commission display */}
        {!loading && commissionRate > 0 && (
          <CommissionDisplay service={service} commissionRate={commissionRate} />
        )}
        
        {/* Enhanced admin feedback display */}
        <AdminFeedback service={service} />
      </div>
      
      <CardQuickActions
        service={service}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onSubmit={onSubmit}
      />
      
      <CardMainAction
        service={service}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default ServiceCard;
