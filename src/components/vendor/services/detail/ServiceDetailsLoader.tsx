
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ServiceDetailsLoaderProps {
  loading: boolean;
  serviceExists: boolean;
}

const ServiceDetailsLoader: React.FC<ServiceDetailsLoaderProps> = ({ 
  loading, 
  serviceExists 
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/vendor/services');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
            <span className="ml-3">Loading service details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serviceExists) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Service Not Found</h3>
            <p className="text-gray-500 mt-2">The requested service could not be found.</p>
            <Button className="mt-4" onClick={handleBack}>
              Return to Services
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ServiceDetailsLoader;
