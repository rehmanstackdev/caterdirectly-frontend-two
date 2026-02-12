
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadBookingStateBackup } from '@/utils/booking-state-persistence';
import { useAuth } from '@/contexts/auth';

function CartBadge() {
  // Graceful fallback if CartProvider is not available
  try {
    const { cartCount, cartItems, refreshCartState, clearCart } = useCart();
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

  // Check if we're in booking mode
  const isBookingMode = location.state?.bookingMode || location.state?.addingToExistingBooking;
  // Check if this is from a group order
  const isGroupOrder = location.state?.isGroupOrder || false;
  // Get return route from location state if provided
  const returnRoute = location.state?.returnRoute;

  // Refresh cart state when component mounts
  useEffect(() => {
    refreshCartState();
  }, [refreshCartState]);

  // Only show cart if user is authenticated
  if (!user || cartCount === 0) {
    return null;
  }

  // Get the appropriate booking route based on user role and current pathname
  const getBookingRoute = () => {
    // Priority 1: Check if coming from admin marketplace (most reliable indicator)
    if (location.pathname.includes('/admin/marketplace')) {
      return '/admin/booking';
    }
    
    // Priority 2: Check if coming from vendor marketplace
    if (location.pathname.includes('/vendor/marketplace')) {
      return '/admin/booking';
    }
    
    // Priority 3: Check user role
    if (userRole === 'vendor') {
      return '/vendor/booking';
    } else if (userRole === 'admin' || userRole === 'super-admin') {
      return '/admin/booking';
    }
    
    return '/booking'; // Default for event-host and others
  };

  const handleCompleteOrder = () => {
    const bookingRoute = getBookingRoute();
    
    if (isBookingMode) {
      // Load the original booking state backup
      const bookingBackup = loadBookingStateBackup();
      
      // Priority 1: Use returnRoute if provided (most reliable)
      if (returnRoute) {
        navigate(returnRoute, {
          state: {
            // Preserve all original booking state
            selectedServices: bookingBackup?.selectedServices || [],
            selectedItems: bookingBackup?.selectedItems || {},
            formData: bookingBackup?.formData || {},
            // Add the cart items as additional services
            cartItems: cartItems.map(item => item.service),
            fromCart: true,
            addingAdditionalService: true,
            // Flag to indicate we're returning from marketplace with additional items
            returningFromMarketplace: true,
            isGroupOrder: isGroupOrder
          }
        });
        return;
      }
      
      // Priority 2: If this is from a group order, navigate to appropriate group order setup
      if (isGroupOrder) {
        // Determine the correct group order route based on user role and pathname
        let groupOrderRoute = '/group-order/setup'; // Default
        if (location.pathname.includes('/vendor/') || userRole === 'vendor') {
          groupOrderRoute = '/vendor/group-order/setup';
        } else if (location.pathname.includes('/admin/') || userRole === 'admin' || userRole === 'super-admin') {
          groupOrderRoute = '/admin/group-order/setup';
        }
        
        navigate(groupOrderRoute, {
          state: {
            // Preserve all original booking state
            selectedServices: bookingBackup?.selectedServices || [],
            selectedItems: bookingBackup?.selectedItems || {},
            formData: bookingBackup?.formData || {},
            // Add the cart items as additional services
            cartItems: cartItems.map(item => item.service),
            fromCart: true,
            addingAdditionalService: true,
            // Flag to indicate we're returning from marketplace with additional items
            returningFromMarketplace: true,
            isGroupOrder: true // Ensure group order mode is preserved
          }
        });
      } else {
        // If in booking mode but not group order, return to booking with cart items ADDED to existing state
        navigate(bookingRoute, {
          state: {
            // Preserve all original booking state
            selectedServices: bookingBackup?.selectedServices || [],
            selectedItems: bookingBackup?.selectedItems || {},
            formData: bookingBackup?.formData || {},
            // Add the cart items as additional services
            cartItems: cartItems.map(item => item.service),
            fromCart: true,
            addingAdditionalService: true,
            // Flag to indicate we're returning from marketplace with additional items
            returningFromMarketplace: true
          }
        });
      }
    } else {
      // Normal flow - go to booking with cart items
      navigate(bookingRoute, {
        state: {
          cartItems: cartItems.map(item => item.service),
          fromCart: true
        }
      });
    }
  };

  const handleClearCart = () => {
    if (confirm('Clear cart and start a new order?')) {
      clearCart(true);
    }
  };

  const buttonText = isBookingMode 
    ? `Return to Booking (${cartCount} service${cartCount !== 1 ? 's' : ''})`
    : `Complete Order (${cartCount} service${cartCount !== 1 ? 's' : ''})`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2">
      <Button
        onClick={handleCompleteOrder}
        className="bg-[#F07712] hover:bg-[#F07712]/90 text-white shadow-lg rounded-full px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
        size="sm"
      >
        <div className="relative flex-shrink-0">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white text-[#F07712] text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center min-w-[16px] sm:min-w-[20px]">
            {cartCount}
          </span>
        </div>
        <span className="font-medium hidden sm:inline">
          {buttonText}
        </span>
        <span className="font-medium sm:hidden">
          {cartCount}
        </span>
      </Button>
      
      <Button
        onClick={handleClearCart}
        variant="outline"
        size="sm"
        className="rounded-full px-3 py-2 sm:px-4 text-xs sm:text-sm bg-background/95 backdrop-blur"
      >
        Clear Cart
      </Button>
    </div>
  );
  } catch (error) {
    // If context not available, silently return null
    console.warn('[CartBadge] CartProvider context not available:', error);
    return null;
  }
};

export default CartBadge;
