

import { ServiceItem } from '@/types/service-types';
import ServiceDetailsDialog from '../ServiceDetailsDialog';

interface ServiceDetailsContainerProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookService: () => void;
}

const ServiceDetailsContainer = ({
  service,
  isOpen,
  onClose,
  onBookService
}: ServiceDetailsContainerProps) => {
  return (
    <ServiceDetailsDialog
      service={service}
      isOpen={isOpen}
      onClose={onClose}
      onBookService={onBookService}
    />
  );
};

export default ServiceDetailsContainer;
