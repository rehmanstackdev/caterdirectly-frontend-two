
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, FileEdit, AlertTriangle } from 'lucide-react';
import { ServiceStatus } from '@/types/service-types';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ 
  status, 
  active = true,
  size = 'md',
  className = '' 
}) => {
  // Size adjustments for the badge
  const getSizeClasses = () => {
    switch(size) {
      case 'sm':
        return 'text-xs py-0 px-1.5';
      case 'lg':
        return 'text-sm py-1 px-3';
      default:
        return 'text-xs py-0.5 px-2';
    }
  };
  
  // Icon size based on badge size
  const getIconSize = () => {
    switch(size) {
      case 'sm':
        return 'h-2.5 w-2.5';
      case 'lg':
        return 'h-4 w-4';
      default:
        return 'h-3 w-3';
    }
  };
  
  switch (status) {
    case 'pending_approval':
      return (
        <Badge className={`flex items-center gap-1 bg-yellow-100 text-yellow-800 ${getSizeClasses()} ${className}`}>
          <Clock className={getIconSize()} />
          <span>Pending Approval</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className={`flex items-center gap-1 bg-red-100 text-red-800 ${getSizeClasses()} ${className}`}>
          <AlertTriangle className={getIconSize()} />
          <span>Rejected</span>
        </Badge>
      );
    case 'draft':
      return (
        <Badge className={`flex items-center gap-1 bg-purple-100 text-purple-800 ${getSizeClasses()} ${className}`}>
          <FileEdit className={getIconSize()} />
          <span>Draft</span>
        </Badge>
      );
    default:
      return active ? (
        <Badge className={`flex items-center gap-1 bg-green-100 text-green-800 ${getSizeClasses()} ${className}`}>
          <CheckCircle className={getIconSize()} />
          <span>Active</span>
        </Badge>
      ) : (
        <Badge className={`flex items-center gap-1 bg-gray-100 text-gray-800 ${getSizeClasses()} ${className}`}>
          <AlertCircle className={getIconSize()} />
          <span>Inactive</span>
        </Badge>
      );
  }
};

export default ServiceStatusBadge;
