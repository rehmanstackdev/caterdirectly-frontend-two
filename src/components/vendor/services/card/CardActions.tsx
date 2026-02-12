import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileEdit, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ServiceItem, ServiceStatus } from '@/types/service-types';
import { useAuth } from '@/contexts/auth';

interface CardActionsProps {
  service: ServiceItem;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
}

export const CardQuickActions: React.FC<CardActionsProps> = ({ 
  service, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const { userRole } = useAuth();
  const canDelete = userRole === 'admin' || userRole === 'super_admin' || userRole === 'vendor';
  
  return (
    <div className="p-3 bg-gray-50 border-t flex justify-between">
      <Button variant="ghost" size="sm" onClick={() => onView(service.id)}>
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onEdit(service.id)}>
        <FileEdit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      {canDelete && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-600"
          onClick={() => onDelete(service.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}
    </div>
  );
};

export const CardMainAction: React.FC<CardActionsProps> = ({
  service,
  onToggle,
  onSubmit
}) => {
  // Calculate completion percentage for draft services
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

  const renderActionButton = () => {
    const status = service.status as ServiceStatus;
    
    switch (status) {
      case 'draft':
        const completionPercentage = getCompletionPercentage();
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-[#F07712] hover:bg-[#F07712]/90 text-white"
            onClick={() => onSubmit(service.id)}
            disabled={completionPercentage < 80}
          >
            {completionPercentage >= 80 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for Approval
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Complete Service Details First
              </>
            )}
          </Button>
        );
      case 'rejected':
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-[#F07712] hover:bg-[#F07712]/90 text-white"
            onClick={() => onSubmit(service.id)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Again
          </Button>
        );
      case 'pending_approval':
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            Awaiting Review
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onToggle(service.id)}
          >
            {service.active ? 'Deactivate' : 'Activate'} Service
          </Button>
        );
    }
  };
  
  return (
    <div className="p-3 bg-gray-50 border-t">
      {renderActionButton()}
    </div>
  );
};

export default { CardQuickActions, CardMainAction };
