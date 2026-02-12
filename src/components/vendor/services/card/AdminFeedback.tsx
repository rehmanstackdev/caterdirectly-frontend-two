
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';

interface AdminFeedbackProps {
  service: ServiceItem;
}

const AdminFeedback: React.FC<AdminFeedbackProps> = ({ service }) => {
  if (service.status !== 'rejected' || !service.adminFeedback) return null;
  
  return (
    <div className="mt-3 p-2 bg-red-50 text-sm border border-red-200 rounded">
      <p className="font-medium text-red-800 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        Feedback:
      </p>
      <p className="text-red-700 mt-1">{service.adminFeedback}</p>
      <p className="text-xs text-red-600 mt-2">
        Make the requested changes and submit again.
      </p>
    </div>
  );
};

export default AdminFeedback;
