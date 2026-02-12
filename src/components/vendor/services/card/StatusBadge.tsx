
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, FileEdit, AlertCircle, CheckCircle } from 'lucide-react';
import { ServiceStatus } from '@/types/service-types';

interface StatusBadgeProps {
  status: ServiceStatus;
  active: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, active }) => {
  switch (status) {
    case 'pending_approval':
      return (
        <Badge className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          <span>Pending Approval</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="flex items-center gap-1 bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      );
    case 'draft':
      return (
        <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800">
          <FileEdit className="h-3 w-3" />
          <span>Draft</span>
        </Badge>
      );
    default:
      return active ? (
        <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          <span>Active</span>
        </Badge>
      ) : (
        <Badge className="flex items-center gap-1 bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3" />
          <span>Inactive</span>
        </Badge>
      );
  }
};

export default StatusBadge;
