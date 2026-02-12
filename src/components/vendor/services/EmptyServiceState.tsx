
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingBag } from 'lucide-react';

interface EmptyServiceStateProps {
  activeTab: string;
  onCreateService: () => void;
  vendorName?: string | null;
}

const EmptyServiceState: React.FC<EmptyServiceStateProps> = ({ activeTab, onCreateService, vendorName }) => {
  const getEmptyStateMessage = () => {
    const vendorPrefix = vendorName ? `${vendorName} has` : "You have";
    
    switch (activeTab) {
      case 'active':
        return `${vendorPrefix} no active services.`;
      case 'pending':
        return `${vendorPrefix} no services pending approval.`;
      case 'drafts':
        return `${vendorPrefix} no draft services.`;
      case 'rejected':
        return `${vendorPrefix} no rejected services.`;
      case 'inactive':
        return `${vendorPrefix} no inactive services.`;
      default:
        return `${vendorPrefix} no services.`;
    }
  };

  const getActionText = () => {
    switch (activeTab) {
      case 'active':
        return "Create and publish a service to attract customers.";
      case 'drafts':
        return "Save your service ideas as drafts before submission.";
      case 'pending':
        return "Services awaiting admin approval will appear here.";
      case 'rejected':
        return "Update and resubmit rejected services to meet requirements.";
      case 'inactive':
        return "Reactivate your services to make them visible to customers.";
      default:
        return "Add a new service to get started.";
    }
  };

  return (
    <div className="text-center py-12 border rounded-lg bg-gray-50">
      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{getEmptyStateMessage()}</h3>
      <p className="text-gray-500 mb-6">{getActionText()}</p>
      <Button onClick={onCreateService} className="bg-[#F07712] hover:bg-[#F07712]/90">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Service
      </Button>
    </div>
  );
};

export default EmptyServiceState;
