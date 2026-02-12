
import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useCart } from '@/contexts/CartContext';
import CardImageSection from './CardImageSection';
import CardContent from './CardContent';
import CardActions from './CardActions';

interface VendorCardProps {
  id: string;
  image: string;
  name: string;
  vendorName: string;
  rating: string;
  reviews: string;
  location: string;
  price: string;
  priceType?: string;
  description: string;
  available: boolean;
  isManaged?: boolean;
  onViewDetails?: () => void;
  vendorType?: string;
  service?: ServiceItem;
  onImageError?: () => void;
  priority?: boolean;
  existingServices?: ServiceSelection[];
  isBookingMode?: boolean;
}

const VendorCard = memo(({
  id,
  image,
  name,
  vendorName,
  rating,
  reviews,
  location,
  price,
  priceType = '',
  description,
  available,
  isManaged = false,
  onViewDetails,
  vendorType = '',
  service,
  onImageError,
  priority = false,
  existingServices = [],
  isBookingMode = false
}: VendorCardProps) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const { addToCart, isInCart, hasStartedOrder } = useCart();
  
  // Get location state to check if we're changing a service
  const locationState = routerLocation.state as any;
  const isChangingService = Boolean(locationState?.changingService);
  const serviceIndexToChange = locationState?.serviceIndex;
  const currentServicesToChange = locationState?.currentServices || [];
  const selectedItemsContext = locationState?.selectedItems || {};
  const formDataContext = locationState?.formData || {};
  // Check for group order context ONLY from location state - don't persist to sessionStorage
  // This ensures that clearing the cart resets the flow to regular booking
  const isGroupOrderFromState = Boolean(locationState?.isGroupOrder);
  // Only consider it a group order context if we have currentServices (meaning we came from group order with data)
  const isGroupOrderContext = isGroupOrderFromState;
  const normalizeServiceType = (value: unknown) => String(value || '').toLowerCase();
  const isCateringService = normalizeServiceType(service?.type || service?.serviceType || vendorType) === 'catering';
  const disableGroupOrderAdd = isGroupOrderContext && !isCateringService;

  // Determine button state based on mode
  const isInExistingBooking = isBookingMode && existingServices.some(s => s.id === id || s.serviceId === id);
  const shouldShowCartLogic = hasStartedOrder;
  const inCart = isInCart(id);

  // Get the appropriate booking route based on user role and current location
  const getBookingRoute = () => {
    // Priority 0: Check if this is a group order context (return to group order setup)
    if (isGroupOrderContext) {
      // Check admin context first
      if (routerLocation.pathname.includes('/admin/') || userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin') {
        return '/admin/group-order/setup';
      }
      // Vendor context
      if (routerLocation.pathname.includes('/vendor/') || userRole === 'vendor') {
        return '/vendor/group-order/setup';
      }
      return '/group-order/setup';
    }

    // Priority 1: Check if in admin marketplace path (most reliable for admin context)
    if (routerLocation.pathname.includes('/admin/marketplace') || routerLocation.pathname.includes('/admin/')) {
      return '/admin/booking';
    }

    // Priority 2: Check if user is admin/super-admin (support both formats)
    if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin') {
      return '/admin/booking';
    }

    // Priority 3: If in vendor marketplace, navigate to vendor booking page
    if (routerLocation.pathname.includes('/vendor/marketplace') || routerLocation.pathname.includes('/vendor/')) {
      return '/vendor/booking';
    }

    // Priority 4: Vendor role
    if (userRole === 'vendor') {
      return '/vendor/booking';
    }

    // Default for event-host and others
    return '/booking';
  };

  const handleBookNow = () => {
    if (!available) {
      toast({
        title: "Service Unavailable",
        description: "This service is currently not available for booking.",
        variant: "destructive"
      });
      return;
    }

    // Simple direct navigation - no complex hook dependencies
    if (service) {
      const bookingRoute = getBookingRoute();
      navigate(bookingRoute, {
        state: {
          selectedServices: [service],
          fromMarketplace: true
        }
      });
    }
  };

  const handleAddToCart = () => {
    console.log(`[VendorCard ${name}] handleAddToCart called, isChangingService:`, isChangingService);
    if (!available) {
      toast({
        title: "Service Unavailable",
        description: "This service is currently not available for booking.",
        variant: "destructive"
      });
      return;
    }

    if (isGroupOrderContext && !isCateringService) {
      toast({
        title: "Catering Only",
        description: "Only Catering services can be added in Group Order.",
        variant: "destructive",
      });
      return;
    }

    // If we're changing a service, navigate directly to booking with replacement context
    if (isChangingService && service) {
      const bookingRoute = getBookingRoute();
      navigate(bookingRoute, {
        state: {
          service: service,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceImage: service.image || '',
          serviceType: service.type || service.serviceType,
          vendorName: service.vendorName,
          changingService: true,
          serviceIndex: serviceIndexToChange,
          currentServices: currentServicesToChange,
          selectedItems: selectedItemsContext,
          formData: formDataContext,
          isGroupOrder: isGroupOrderContext
        }
      });
      return;
    }

    if (service) {
      addToCart(service);
      // Only show toast in normal marketplace mode, not in booking mode
      if (!isBookingMode) {
        toast({
          title: "Added to Cart",
          description: `${name} has been added to your cart`,
        });
      }
    }
  };

  const handleViewDetails = () => {
    console.log(`[VendorCard ${name}] handleViewDetails called - passing cart context: ${shouldShowCartLogic}`);
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <div className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden bg-white h-full flex flex-col rounded-md">
      <CardImageSection 
        id={id}
        image={image}
        name={name}
        available={available}
        isManaged={isManaged}
        service={service}
        onImageError={onImageError}
        priority={priority}
      />
      
      <CardContent
        name={name}
        vendorName={vendorName}
        rating={rating}
        reviews={reviews}
        location={location}
        description={description}
        service={service}
        existingServices={existingServices}
      />
      
      <CardActions
        id={id}
        name={name}
        price={price}
        priceType={priceType}
        available={available}
        hasStartedOrder={shouldShowCartLogic}
        inCart={inCart}
        onViewDetails={handleViewDetails}
        onBookNow={handleBookNow}
        onAddToCart={handleAddToCart}
        service={service}
        isBookingMode={isBookingMode}
        isInExistingBooking={isInExistingBooking}
        isChangingService={isChangingService}
        disableAddAction={disableGroupOrderAdd}
      />
    </div>
  );
});

VendorCard.displayName = 'VendorCard';

export default VendorCard;
