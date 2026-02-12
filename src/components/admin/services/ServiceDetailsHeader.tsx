

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Settings } from 'lucide-react';
import { getServiceTypeLabel } from '@/utils/service-utils';
import ServiceStatusBadge from '@/components/vendor/services/ServiceStatusBadge';
import { ServiceStatus } from '@/types/service-types';

interface ServiceDetailsHeaderProps {
  service: {
    id: string;
    name: string;
    type: string;
    active: boolean;
    status: ServiceStatus;
  };
  onDelete: () => void;
  onEdit: () => void;
  onBack: () => void;
}

const ServiceDetailsHeader = ({
  service,
  onDelete,
  onEdit,
  onBack,
}: ServiceDetailsHeaderProps) => {
  const navigate = useNavigate();

  const handleComprehensiveEdit = () => {
    navigate(`/admin/services/editor/${service.id}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{service.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge>{getServiceTypeLabel(service.type)}</Badge>
          <Badge variant={service.active ? "default" : "outline"}>
            {service.active ? "Active" : "Inactive"}
          </Badge>
          <ServiceStatusBadge status={service.status} active={service.active} />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" onClick={handleComprehensiveEdit}>
          <Settings className="mr-2 h-4 w-4" />
          Advanced Editor
        </Button>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Quick Edit
        </Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetailsHeader;
