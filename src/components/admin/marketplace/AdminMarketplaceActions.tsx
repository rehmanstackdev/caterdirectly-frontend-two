

import { Button } from '@/components/ui/button';
import { Edit, FileText, Eye } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface AdminMarketplaceActionsProps {
  service: ServiceItem;
  onCreateProposal: (service: ServiceItem) => void;
  onEditService: (serviceId: string) => void;
}

export const AdminMarketplaceActions = ({
  service,
  onCreateProposal,
  onEditService
}: AdminMarketplaceActionsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin (you'll need to implement proper role checking)
  const isAdmin = user?.email && user.email.includes('admin'); // Simplified check

  if (!isAdmin) {
    return null;
  }

  return ( null
   /* <div className="flex gap-2 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCreateProposal(service)}
        className="flex items-center gap-1 text-xs"
      >
        <FileText className="h-3 w-3" />
        Create Proposal
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEditService(service.id)}
        className="flex items-center gap-1 text-xs"
      >
        <Edit className="h-3 w-3" />
        Edit Service
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(`/admin/services/${service.id}`)}
        className="flex items-center gap-1 text-xs"
      >
        <Eye className="h-3 w-3" />
        View Details
      </Button>
    </div>
  */);
};
