

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface ServiceLoadingStateProps {
  isLoading: boolean;
  serviceExists: boolean;
  onBack: () => void;
}

const ServiceLoadingState = ({ 
  isLoading, 
  serviceExists, 
  onBack 
}: ServiceLoadingStateProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
        <span className="ml-3">Loading service details...</span>
      </div>
    );
  }

  if (!serviceExists) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-red-600">Service Not Found</h2>
        <p className="mt-2">The service you're looking for doesn't exist or has been removed.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </Card>
    );
  }

  return null;
};

export default ServiceLoadingState;
