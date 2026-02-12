import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Eye } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';
import { useCart } from '@/contexts/CartContext';

interface CardActionsProps {
  id: string;
  name: string;
  price: string;
  priceType?: string;
  available: boolean;
  hasStartedOrder?: boolean;
  inCart?: boolean;
  onViewDetails: () => void;
  onBookNow: () => void;
  onAddToCart: () => void;
  service?: ServiceItem;
  isBookingMode?: boolean;
  isInExistingBooking?: boolean;
  isChangingService?: boolean;
  disableAddAction?: boolean;
}

const CardActions = ({
  id,
  name,
  price,
  priceType = '',
  available,
  hasStartedOrder: externalHasStartedOrder,
  inCart: externalInCart,
  onViewDetails,
  onBookNow,
  onAddToCart,
  service,
  isBookingMode = false,
  isInExistingBooking = false,
  isChangingService = false,
  disableAddAction = false
}: CardActionsProps) => {
  const [justAdded, setJustAdded] = useState(false);
  const { isInCart: checkIsInCart, hasStartedOrder: contextHasStartedOrder } = useCart();
  
  // Use either externally provided values or get them from context
  const inCart = externalInCart !== undefined ? externalInCart : checkIsInCart(id);
  const hasStartedOrder = externalHasStartedOrder !== undefined ? externalHasStartedOrder : contextHasStartedOrder;
  
  // Handle "just added" animation state
  useEffect(() => {
    if (inCart) {
      setJustAdded(false); // Reset animation if already in cart
    }
  }, [inCart]);
  
  // Custom handler for add to cart to manage animation state
  const handleAddToCart = useCallback(() => {
    setJustAdded(true);
    onAddToCart();
    
    // Reset the "just added" state after 2 seconds
    setTimeout(() => setJustAdded(false), 2000);
  }, [onAddToCart]);

  // In booking mode, use the same add to cart handler for "Add to Booking"
  const handleBookNow = useCallback(() => {
    if (isBookingMode) {
      handleAddToCart();
    } else {
      onBookNow();
    }
  }, [isBookingMode, handleAddToCart, onBookNow]);

  // ENHANCED: Pass cart context flag to View Details when user has items in cart
  const handleViewDetails = useCallback(() => {
    console.log(`[CardActions ${name}] handleViewDetails called - hasStartedOrder: ${hasStartedOrder}`);
    // Pass flag to indicate this dialog was opened from a cart context (when View Details button is shown alongside Add to Cart)
    onViewDetails();
  }, [onViewDetails, hasStartedOrder, name]);
  
  const displayPrice = service 
    ? formatUnifiedServicePrice(service)
    : price || 'Price on request';
    
  // Debug the button logic
  console.log(`[CardActions ${name}] Button logic - bookingMode:`, isBookingMode, 'inExistingBooking:', isInExistingBooking, 'hasStartedOrder:', hasStartedOrder, 'inCart:', inCart, 'isChangingService:', isChangingService);
  const isMainActionAddFlow = isChangingService || isBookingMode || hasStartedOrder;
  const shouldDisableMainAction = disableAddAction && isMainActionAddFlow;

  // Determine button text and action based on mode
  const getMainButtonText = () => {
    if (shouldDisableMainAction) {
      if (isChangingService) return 'Replace Service';
      if (isBookingMode) return 'Add to Booking';
      return 'Add to Cart';
    }
    // Changing service mode takes priority
    if (isChangingService) {
      return 'Replace Service';
    }
    if (isBookingMode) {
      return isInExistingBooking ? 'Already Selected' : (inCart || justAdded) ? (inCart ? 'In Booking' : 'Added') : 'Add to Booking';
    }
    if (!hasStartedOrder) {
      return 'View Details';  // Changed from 'Book Now' to 'View Details'
    }
    if (inCart || justAdded) {
      return inCart ? 'In Cart' : 'Added';
    }
    return 'Add to Cart';
  };

  const getMainButtonVariant = () => {
    if (shouldDisableMainAction) {
      return 'bg-gray-300 text-gray-500';
    }
    // Changing service mode - use orange color
    if (isChangingService) {
      return 'bg-[#F07712] hover:bg-[#F07712]/90 text-white';
    }
    if (isBookingMode && isInExistingBooking) {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    if (isBookingMode && (inCart || justAdded)) {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    if (isBookingMode) {
      return 'bg-green-500 hover:bg-green-600 text-white';
    }
    if (!hasStartedOrder) {
      return 'bg-[#F07712] hover:bg-[#F07712]/90 text-white';  // Keep same styling for View Details
    }
    if (inCart || justAdded) {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    return 'bg-green-500 hover:bg-green-600 text-white';
  };

  // Determine the main button action
  const getMainButtonAction = () => {
    // Changing service mode - use add to cart handler which now handles replacement
    if (isChangingService) {
      return handleAddToCart;
    }
    if (isBookingMode) {
      return handleBookNow;
    }
    if (!hasStartedOrder) {
      return handleViewDetails;  // Changed from onBookNow to onViewDetails
    }
    return handleAddToCart;
  };

  // Determine if we should show two buttons (View Details + Main Action)
  // In changing service mode, show two buttons for consistency
  const shouldShowTwoButtons = hasStartedOrder || isBookingMode || isChangingService;
  
  return (
    <div className="mt-auto p-2">
      {/* Price display */}
      <div className="mb-2">
        <div className="font-bold text-lg text-[#F07712] break-words leading-tight">
          {displayPrice}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-1.5 w-full">
        {/* Show View Details button when cart has items OR in booking mode */}
        {shouldShowTwoButtons && (
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 min-w-0 border-[#F07712] text-[#F07712] hover:bg-[#F07712]/10 text-xs sm:text-sm font-medium px-2 py-1.5 h-auto whitespace-nowrap overflow-hidden"
            disabled={!available}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">View Details</span>
          </Button>
        )}
        
        {/* Main Action Button */}
        <Button
          onClick={getMainButtonAction()}
          className={`${shouldShowTwoButtons ? 'flex-1' : 'w-full'} min-w-0 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 px-2 py-1.5 h-auto ${getMainButtonVariant()}`}
          disabled={shouldDisableMainAction || !available || (isBookingMode && isInExistingBooking) || (!isBookingMode && !isChangingService && inCart)}
        >
          {/* In changing service mode, show plain text */}
          {isChangingService ? (
            <span className="truncate">{getMainButtonText()}</span>
          ) : (inCart || justAdded || (isBookingMode && isInExistingBooking)) ? (
            <div className="flex items-center gap-1 min-w-0">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{getMainButtonText()}</span>
            </div>
          ) : !hasStartedOrder && !isBookingMode ? (
            <div className="flex items-center gap-1 min-w-0">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{getMainButtonText()}</span>
            </div>
          ) : (
            <span className="truncate">{getMainButtonText()}</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CardActions;
