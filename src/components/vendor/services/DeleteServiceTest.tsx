import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ServicesService from '@/services/api/services.Service';

interface DeleteServiceTestProps {
  serviceId: string;
  serviceName: string;
  onSuccess?: () => void;
}

const DeleteServiceTest: React.FC<DeleteServiceTestProps> = ({ 
  serviceId, 
  serviceName, 
  onSuccess 
}) => {
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      return;
    }

    try {
      await ServicesService.deleteService(serviceId);
      toast.success('Service deleted successfully');
      onSuccess?.();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service';
      toast.error(message);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
    >
      Delete Service
    </Button>
  );
};

export default DeleteServiceTest;