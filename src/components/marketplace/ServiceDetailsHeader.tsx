
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ServiceItem } from '@/types/service-types';

interface ServiceDetailsHeaderProps {
  service: ServiceItem;
}

function ServiceDetailsHeader({ service }: ServiceDetailsHeaderProps) {
  return (
    <DialogHeader className="space-y-2 pr-8 flex-shrink-0">
      <DialogTitle className="text-left text-base sm:text-lg md:text-xl break-words hyphens-auto leading-tight">
        {service.name}
      </DialogTitle>
      <DialogDescription className="text-left text-sm break-words">
        by {service.vendorName}
      </DialogDescription>
    </DialogHeader>
  );
};

export default ServiceDetailsHeader;
