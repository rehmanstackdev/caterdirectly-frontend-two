
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceFormLoadingProps {
  message?: string;
}

const ServiceFormLoading: React.FC<ServiceFormLoadingProps> = ({ 
  message = "Validating Vendor Information..." 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{message}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
          <span className="ml-3">Loading vendor details...</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceFormLoading;
