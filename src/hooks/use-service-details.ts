
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ServiceItem } from '@/types/service-types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useServiceDetails = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasStartedOrder, addToCart } = useCart();
  const { userRole } = useAuth();
  const { toast } = useToast();
  
  // Handle service selection for details dialog
  const handleOpenDetails = useCallback((service: ServiceItem) => {
    console.log('[useServiceDetails] Opening service details:', service, 'cart context:', hasStartedOrder);
    console.log('[FULL SERVICE RESPONSE]:', JSON.stringify(service, null, 2));
    setSelectedService(service);
  }, [hasStartedOrder]);

  // Handle closing details dialog
  const handleCloseDetails = useCallback(() => {
    setSelectedService(null);
  }, []);

  // Handle booking service - pass complete service object and preserve existing context
  const handleBookService = useCallback(() => {
    if (selectedService) {
      // Get the current location state to check if we're adding to an existing order
      const currentState = location.state as any;
      
      console.log('[useServiceDetails] Current location state:', currentState);
      console.log('[useServiceDetails] Adding service to existing order:', currentState?.addingAdditionalService);
      
      // For fresh bookings (not adding to existing or changing service), add to cart first
      const isAddToExisting = Boolean(currentState?.addingAdditionalService || currentState?.addingToExistingBooking || currentState?.bookingMode);
      const isChangingService = Boolean(currentState?.changingService);
      const isGroupOrderFromState = Boolean(currentState?.isGroupOrder);
      const isGroupOrderContext = isGroupOrderFromState;
      const normalizedSelectedType = String(selectedService.type || selectedService.serviceType || '').toLowerCase();

      if (isGroupOrderContext && normalizedSelectedType !== 'catering') {
        toast({
          title: "Catering Only",
          description: "Only Catering services can be added in Group Order.",
          variant: "destructive",
        });
        return;
      }
      
      if (!isAddToExisting && !isChangingService) {
        console.log('[useServiceDetails] Adding service to cart for fresh booking:', selectedService.name);
        addToCart(selectedService);
      }
      
      // Prepare the navigation state
      const navigationState = {
        // Pass the complete service object
        service: selectedService,
        // Keep these for backward compatibility
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceImage: selectedService.image || '',
        serviceType: selectedService.type || selectedService.serviceType,
        vendorName: selectedService.vendorName
      };

      // If we're changing a service, preserve that context (check FIRST - takes priority over adding)
      if (currentState?.changingService) {
        console.log('[useServiceDetails] Preserving service change context:', {
          serviceIndex: currentState.serviceIndex,
          currentServices: currentState.currentServices,
          isGroupOrder: currentState.isGroupOrder
        });

        Object.assign(navigationState, {
          changingService: true,
          serviceIndex: currentState.serviceIndex,
          currentServices: currentState.currentServices || [],
          selectedItems: currentState.selectedItems || {},
          formData: currentState.formData || {},
          isGroupOrder: currentState.isGroupOrder || false
        });
      } else if (isAddToExisting) {
        // If we're adding to an existing order (not changing), preserve the context
        console.log('[useServiceDetails] Preserving existing order context:', {
          currentServices: currentState.currentServices || currentState.currentBookingServices,
          selectedItems: currentState.selectedItems,
          formData: currentState.formData
        });

        Object.assign(navigationState, {
          // Normalize to the canonical flag
          addingAdditionalService: true,
          currentServices: currentState.currentServices || currentState.currentBookingServices || [],
          selectedItems: currentState.selectedItems || {},
          formData: currentState.formData || {}
        });
      }

      console.log('[useServiceDetails] Navigating to booking with state:', navigationState);

      // Get the appropriate booking route based on user role and current pathname
      const getBookingRoute = () => {
        // Check for group order context ONLY from location state
        // Only consider it a group order if we have currentServices (meaning we came from group order with data)
        const isGroupOrderFromState = Boolean(currentState?.isGroupOrder);
        const hasCurrentServices = Array.isArray(currentState?.currentServices) && currentState.currentServices.length > 0;
        const isChangingServiceMode = Boolean(currentState?.changingService);
        const isGroupOrder = isGroupOrderFromState && (hasCurrentServices || isChangingServiceMode);

        // Priority 0: Check if this is a group order context (return to group order setup)
        if (isGroupOrder) {
          // Check admin context first
          if (location.pathname.includes('/admin/') || userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin') {
            return '/admin/group-order/setup';
          }
          // Vendor context
          if (location.pathname.includes('/vendor/') || userRole === 'vendor') {
            return '/vendor/group-order/setup';
          }
          return '/group-order/setup';
        }

        // Priority 1: Check if coming from admin path (most reliable indicator)
        if (location.pathname.includes('/admin/marketplace') || location.pathname.includes('/admin/')) {
          return '/admin/booking';
        }

        // Priority 2: Check user role (support both formats)
        if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin') {
          return '/admin/booking';
        }

        // Priority 3: Check if coming from vendor path
        if (location.pathname.includes('/vendor/marketplace') || location.pathname.includes('/vendor/')) {
          return '/vendor/booking';
        }

        // Priority 4: Check vendor role
        if (userRole === 'vendor') {
          return '/vendor/booking';
        }

        return '/booking'; // Default for event-host and others
      };
      
      navigate(getBookingRoute(), {
        state: navigationState
      });
      handleCloseDetails();
    }
  }, [selectedService, navigate, location.state, addToCart, userRole, toast]);
  
  return {
    selectedService,
    handleOpenDetails,
    handleCloseDetails,
    handleBookService,
    openedFromCartContext: hasStartedOrder // Pass the cart context to dialog
  };
};
