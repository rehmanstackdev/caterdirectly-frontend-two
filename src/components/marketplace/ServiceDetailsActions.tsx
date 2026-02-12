import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ServiceItem } from '@/types/service-types';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';

interface ServiceDetailsActionsProps {
  service: ServiceItem;
  onBookService: () => void;
  onClose: () => void;
  hasStartedOrder: boolean;
  openedFromCartContext?: boolean;
}

const ServiceDetailsActions = ({
  service,
  onBookService,
  onClose,
  hasStartedOrder,
  openedFromCartContext = false
}) => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Get context from location state to determine button text
  const locationState = location.state as any;
  const isBookingMode = Boolean(locationState?.bookingMode || locationState?.addingToExistingBooking);
  const isAddingAdditionalService = Boolean(locationState?.addingAdditionalService || isBookingMode);
  const isChangingService = locationState?.changingService;
  const isFromEditOrder = Boolean(locationState?.fromEditOrder);
  const isGroupOrderFromState = Boolean(locationState?.isGroupOrder);
  const isGroupOrderContext = isGroupOrderFromState;
  const normalizeServiceType = (value: unknown) => String(value || '').toLowerCase();
  const isCateringService = normalizeServiceType(service?.type || service?.serviceType) === 'catering';
  
  // FORCE cart context recognition - if opened from "View Details" button, we know cart has items
  const effectiveHasStartedOrder = openedFromCartContext || hasStartedOrder;
  
  // Debug the cart context recognition
  console.log('[ServiceDetailsActions] Cart context - openedFromCartContext:', openedFromCartContext, 'hasStartedOrder:', hasStartedOrder, 'effectiveHasStartedOrder:', effectiveHasStartedOrder, 'isBookingMode:', isBookingMode);
  
  // Determine button text based on context and cart state
  const getButtonText = () => {
    if (isFromEditOrder) return "Add to Edit Order";
    if (isChangingService) return "Replace Service";
    if (isAddingAdditionalService) return "Add to Order";
    if (effectiveHasStartedOrder) return "Add to Cart";
    return "Book This Service";
  };

  // Determine button color based on context
  const getButtonClassName = () => {
    if (isFromEditOrder) return "w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3";
    if (isChangingService) return "w-full bg-[#F07712] hover:bg-[#F07712]/90 text-sm sm:text-base py-2 sm:py-3";
    if (isAddingAdditionalService) return "w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3";
    if (effectiveHasStartedOrder) return "w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3";
    return "w-full bg-[#F07712] hover:bg-[#F07712]/90 text-sm sm:text-base py-2 sm:py-3";
  };

  // Get consistent price display using the unified formatter
  const priceDisplay = formatUnifiedServicePrice(service);
  
  const handleAddToCart = () => {
    console.log(`[ServiceDetailsActions] handleAddToCart called for ${service.name}`);
    if (isGroupOrderContext && !isCateringService) {
      toast({
        title: "Catering Only",
        description: "Only Catering services can be added in Group Order.",
        variant: "destructive",
      });
      return;
    }
    addToCart(service);
    toast({
      title: "Added to Cart",
      description: `${service.name} has been added to your cart`,
    });
    onClose();
  };
  
  const handleAddToEditOrder = () => {
    // Get stored edit order state
    const editOrderState = sessionStorage.getItem('editOrderState');
    if (editOrderState) {
      try {
        const parsedState = JSON.parse(editOrderState);
        
        // Convert marketplace service to edit order format
        const formattedService = {
          id: service.id,
          serviceId: service.id,
          name: service.name,
          serviceName: service.name,
          price: service.price || 0,
          servicePrice: service.price || 0,
          totalPrice: service.price || 0,
          quantity: 1,
          duration: 0,
          serviceType: service.type || service.serviceType,
          type: service.type || service.serviceType,
          description: service.description || '',
          vendor_id: service.vendor_id,
          priceType: service.priceType || 'flat',
          price_type: service.priceType || 'flat',
          service_details: service.service_details || {},
          selected_menu_items: [],
          image: service.image || '',
          imageUrl: service.image || '',
          serviceImage: service.image || ''
        };
        
        // Extract combo category items and add to selectedItems
        const newSelectedItems = {};
        if (service.service_details?.menuItems) {
          service.service_details.menuItems.forEach(menuItem => {
            if (menuItem.comboCategoryItems) {
              menuItem.comboCategoryItems.forEach(comboItem => {
                const itemKey = `${menuItem.id}_combo-category_${comboItem.cateringId}`;
                newSelectedItems[itemKey] = comboItem.quantity || 0;
              });
            }
          });
        }
        
        // Store both the service and selected items
        sessionStorage.setItem('cartServices', JSON.stringify([formattedService]));
        sessionStorage.setItem('newSelectedItems', JSON.stringify(newSelectedItems));
        
        toast({
          title: "Added to Edit Order",
          description: `${service.name} has been added to your order`,
        });
        
        // Navigate back to edit order page
        navigate(locationState.returnToEditOrder || `/edit-order/${parsedState.editOrderId}`);
        onClose();
        return;
      } catch (e) {
        console.error('Error adding to edit order:', e);
      }
    }
    
    toast({
      title: "Error",
      description: "Could not add service to edit order",
    });
  };

  const handleBookService = useCallback(() => {
    console.log(`[ServiceDetailsActions] handleBookService called - effectiveHasStartedOrder: ${effectiveHasStartedOrder}, openedFromCartContext: ${openedFromCartContext}, isChangingService: ${isChangingService}, isAddingAdditionalService: ${isAddingAdditionalService}, isFromEditOrder: ${isFromEditOrder}`);
    
    // Handle edit order flow
    if (isFromEditOrder) {
      handleAddToEditOrder();
      return;
    }
    
    if (!user) {
      const currentPath = location.pathname;
      const isMarketplace = currentPath.includes('/marketplace');
      
      // Determine the appropriate booking route based on current path
      const getBookingRoute = () => {
        if (currentPath.includes('/admin/marketplace') || currentPath.includes('/admin/')) {
          return '/admin/booking';
        } else if (currentPath.includes('/vendor/marketplace') || currentPath.includes('/vendor/')) {
          return '/vendor/booking';
        }
        return '/booking'; // Default for host marketplace
      };
      
      const bookingRoute = getBookingRoute();
      
      if (service) {
        const pendingBooking = {
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: priceDisplay,
          serviceImage: service.image,
          serviceType: service.type || service.serviceType,
          vendorName: service.vendorName,
          // Store marketplace context
          fromMarketplace: isMarketplace,
          marketplacePath: isMarketplace ? currentPath : '/marketplace',
          originalPath: currentPath
        };
        
        sessionStorage.setItem('pendingBookingService', JSON.stringify(pendingBooking));
      }
      
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service.",
      });
      
      // Determine login route based on context
      const loginRoute = currentPath.includes('/admin') ? '/admin/login' : '/host/login';
      
      navigate(loginRoute, { 
        state: { 
          from: `${bookingRoute}?serviceId=${service.id}`,
          marketplaceContext: isMarketplace,
          intended: bookingRoute
        }
      });
      
      onClose();
      return;
    }
    
    // Replace flow should still navigate out immediately
    if (isChangingService) {
      onBookService();
      return;
    }

    // When adding additional services to an existing booking, keep users in marketplace via cart
    if (isAddingAdditionalService) {
      handleAddToCart();
      return;
    }
    
    // If cart context is active, add to cart and stay
    if (effectiveHasStartedOrder) {
      handleAddToCart();
      return;
    }
    
    // Otherwise proceed to booking
    onBookService();
  }, [effectiveHasStartedOrder, openedFromCartContext, isChangingService, isAddingAdditionalService, isFromEditOrder, user, service, priceDisplay, toast, navigate, onClose, onBookService, handleAddToCart, location.pathname, locationState]);

  return (
    <div className="border-t pt-4 bg-background flex-shrink-0">
      <Button 
        onClick={handleBookService} 
        className={getButtonClassName()}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default ServiceDetailsActions;
