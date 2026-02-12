
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useCart } from '@/contexts/CartContext';
import ServiceDetailsHeader from '@/components/marketplace/ServiceDetailsHeader';
import ServiceDetailsContent from '@/components/marketplace/ServiceDetailsContent';
import ServiceDetailsActions from '@/components/marketplace/ServiceDetailsActions';
import { ServiceItem } from '@/types/service-types';

interface ServiceDetailsDialogProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookService: () => void;
  openedFromCartContext?: boolean;
}

const ServiceDetailsDialog = ({ 
  service, 
  isOpen, 
  onClose, 
  onBookService,
  openedFromCartContext = false
}: ServiceDetailsDialogProps) => {
  const navigate = useNavigate();
  const { hasStartedOrder, refreshCartState } = useCart();

  // Force cart state refresh when dialog opens to ensure hasStartedOrder is current
  useEffect(() => {
    if (isOpen) {
      console.log('[ServiceDetailsDialog] Dialog opened, refreshing cart state, openedFromCartContext:', openedFromCartContext);
      refreshCartState();
    }
  }, [isOpen, refreshCartState, openedFromCartContext]);

  // Debug the hasStartedOrder value
  useEffect(() => {
    console.log('[ServiceDetailsDialog] hasStartedOrder value:', hasStartedOrder, 'openedFromCartContext:', openedFromCartContext);
  }, [hasStartedOrder, openedFromCartContext]);

  if (!service) return null;

  const handleCreateInvoice = (service: ServiceItem) => {
    navigate(`/admin/invoices/create/${service.id}`);
    onClose();
  };

  const handleEditService = (serviceId: string) => {
    navigate(`/admin/services/editor/${serviceId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] xs:max-w-[90vw] sm:max-w-[85vw] md:max-w-[600px] lg:max-w-[650px] max-h-[90vh] flex flex-col">
        <ServiceDetailsHeader service={service} />
        
        <ServiceDetailsContent 
          service={service}
          onCreateProposal={handleCreateInvoice}
          onEditService={handleEditService}
        />
        
        <ServiceDetailsActions
          service={service}
          onBookService={onBookService}
          onClose={onClose}
          hasStartedOrder={hasStartedOrder}
          openedFromCartContext={openedFromCartContext}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsDialog;
