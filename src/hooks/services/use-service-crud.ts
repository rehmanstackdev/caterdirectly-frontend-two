
import { useState } from 'react';
import { ServiceItem } from '@/types/service-types';
import { useCreateService } from './crud/use-create-service';
import { useUpdateService } from './crud/use-update-service';
import { useDeleteService } from './crud/use-delete-service';

export function useServiceCrud(initialServices: ServiceItem[] = []) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  // Import our CRUD hooks
  const createService = useCreateService(setServices);
  const updateService = useUpdateService(setServices);
  const deleteService = useDeleteService(setServices);

  return {
    services,
    setServices,
    createService,
    updateService,
    deleteService,
  };
}
