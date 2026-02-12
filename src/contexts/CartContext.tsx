
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, FC } from 'react';
import { ServiceItem } from '@/types/service-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { safeSetItem, progressiveCleanup } from '@/utils/storage-manager';
import { clearBookingStateBackup } from '@/utils/booking-state-persistence';

// Cart item - stores full service data for reliability
interface OptimizedCartItem {
  service: ServiceItem;
  addedAt: Date;
  expiresAt: Date;
  selectedItems?: Record<string, number>;
}

interface CartItem {
  service: ServiceItem;
  addedAt: Date;
  expiresAt: Date;
  selectedItems?: Record<string, number>; // For regular quantity and staff duration (using itemId_duration pattern)
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (service: ServiceItem, selectedItems?: Record<string, number>) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: (userConfirmed?: boolean) => void;
  cartCount: number;
  isInCart: (serviceId: string) => boolean;
  hasStartedOrder: boolean;
  refreshCartState: () => void;
  updateCartItemSelections: (serviceId: string, selectedItems: Record<string, number>) => void;
  getCartItemSelections: (serviceId: string) => Record<string, number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Prune heavy fields from service while preserving essential menu/items data
const pruneServiceForStorage = (service: ServiceItem): Partial<ServiceItem> => {
  const pruned: any = {
    id: service.id,
    name: service.name,
    description: service.description,
    type: service.type,
    price: service.price,
    status: service.status,
    active: service.active,
    vendor_id: service.vendor_id,
    vendorName: service.vendorName,
    image: service.image,
  };

  // Selectively preserve essential service_details for each type
  if (service.service_details) {
    const details = service.service_details;
    const prunedDetails: any = {};

    // Catering: Keep lean menu items (remove heavy descriptions/images)
    if (service.type === 'catering' && details.catering?.menuItems) {
      prunedDetails.catering = {
        menuItems: details.catering.menuItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          priceType: item.priceType,
          category: item.category,
          isCombo: item.isCombo,
          comboCategories: item.comboCategories
        }))
      };
    }

    // Party Rentals: Keep lean rental items
    if (service.type === 'party-rentals' && details.rentalItems) {
      prunedDetails.rentalItems = details.rentalItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        priceType: item.priceType,
        category: item.category
      }));
    }

    // Staff: Keep basic staff info
    if (service.type === 'staff' && details.staffServices) {
      prunedDetails.staffServices = details.staffServices.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        priceType: item.priceType,
        minimumHours: item.minimumHours
      }));
    }

    // Venue: Keep basic venue options
    if (service.type === 'venues' && details.venueOptions) {
      prunedDetails.venueOptions = details.venueOptions.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        priceType: item.priceType
      }));
    }

    if (Object.keys(prunedDetails).length > 0) {
      pruned.service_details = prunedDetails;
    }
  }

  return pruned;
};

// Helper functions for cart storage
const serviceToOptimizedItem = (service: ServiceItem, selectedItems: Record<string, number> = {}): OptimizedCartItem => {
  const now = new Date();
  return {
    service,
    addedAt: now,
    expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours expiry
    selectedItems
  };
};

const optimizedToCartItem = (optimized: OptimizedCartItem): CartItem => ({
  service: optimized.service,
  addedAt: optimized.addedAt,
  expiresAt: optimized.expiresAt,
  selectedItems: optimized.selectedItems || {}
});

// In-memory fallback cart for when localStorage is full
let inMemoryCart: CartItem[] = [];

// Safe localStorage operations with error handling and quota cleanup
const saveCartToStorage = (cartItems: CartItem[]) => {
  try {
    // Create lean storage snapshot with pruned services
    const leanItems = cartItems.map(item => ({
      service: pruneServiceForStorage(item.service),
      addedAt: item.addedAt.toISOString(),
      expiresAt: item.expiresAt.toISOString(),
      selectedItems: item.selectedItems || {}
    }));
    
    const cartData = JSON.stringify(leanItems);
    
    // Use safe storage with progressive cleanup
    const success = safeSetItem('marketplace-cart', cartData);
    
    if (!success) {
      // Try progressive cleanup and retry once
      console.log('[CartContext] First save failed, attempting cleanup...');
      progressiveCleanup().then(() => {
        const retrySuccess = safeSetItem('marketplace-cart', cartData);
        if (!retrySuccess) {
          // Silent fallback to in-memory storage
          console.log('[CartContext] localStorage full, using in-memory storage');
          inMemoryCart = cartItems;
        }
      });
    }
    
    return success;
  } catch (error) {
    console.error('[CartContext] Failed to save cart to localStorage:', error);
    // Silent fallback to in-memory storage
    inMemoryCart = cartItems;
    return false;
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('marketplace-cart');
    if (!savedCart) {
      // Check in-memory fallback
      if (inMemoryCart.length > 0) {
        console.log('[CartContext] Loading cart from in-memory storage');
        return inMemoryCart;
      }
      return [];
    }
    
    const parsedCart = JSON.parse(savedCart);
    const now = Date.now();
    
    // Filter out expired items (4 hours expiry)
    const validItems = parsedCart.filter((item: any) => {
      const expiresAt = item.expiresAt ? new Date(item.expiresAt).getTime() : (new Date(item.addedAt).getTime() + 4 * 60 * 60 * 1000);
      return expiresAt > now;
    });
    
    if (validItems.length < parsedCart.length) {
      console.log('[CartContext] Removed', parsedCart.length - validItems.length, 'expired cart items');
    }
    
    // Handle both lean and legacy formats
    return validItems.map((item: any) => ({
      service: item.service as ServiceItem, // May be partial, but UI will handle
      addedAt: new Date(item.addedAt),
      expiresAt: new Date(item.expiresAt || new Date(item.addedAt).getTime() + 4 * 60 * 60 * 1000),
      selectedItems: item.selectedItems || {}
    }));
  } catch (error) {
    console.error('[CartContext] Failed to load cart from localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem('marketplace-cart');
    } catch (clearError) {
      console.error('[CartContext] Failed to clear corrupted cart data:', clearError);
    }
    // Fallback to in-memory cart
    if (inMemoryCart.length > 0) {
      console.log('[CartContext] Using in-memory cart after localStorage error');
      return inMemoryCart;
    }
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [hasMigrated, setHasMigrated] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // One-time migration: rewrite heavy cart data to lean format
  useEffect(() => {
    if (hasMigrated || !user) return;
    
    const migrateCart = async () => {
      try {
        const rawCart = localStorage.getItem('marketplace-cart');
        if (!rawCart) {
          setHasMigrated(true);
          return;
        }
        
        const parsed = JSON.parse(rawCart);
        
        // Check if already migrated (lean format has service.service_details undefined/null)
        const needsMigration = parsed.some((item: any) => 
          item.service?.service_details !== undefined || 
          item.service?.additional_images !== undefined
        );
        
        if (needsMigration) {
          console.log('[CartContext] Migrating cart to lean format...');
          const items: CartItem[] = parsed.map((item: any) => ({
            service: item.service,
            addedAt: new Date(item.addedAt),
            selectedItems: item.selectedItems || {}
          }));
          
          // Save in lean format
          saveCartToStorage(items);
          console.log('[CartContext] Migration complete');
        }
        
        setHasMigrated(true);
      } catch (error) {
        console.error('[CartContext] Migration failed:', error);
        setHasMigrated(true);
      }
    };
    
    migrateCart();
  }, [user, hasMigrated]);

  // Authentication-based cart management
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      console.log('[CartContext] Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      // User is not authenticated - clear any existing cart data
      console.log('[CartContext] User not authenticated, clearing cart state and localStorage');
      setCartItems([]);
      try {
        localStorage.removeItem('marketplace-cart');
        clearBookingStateBackup();
      } catch (error) {
        console.error('[CartContext] Failed to clear cart localStorage:', error);
      }
      return;
    }
    
    // User is authenticated - load cart from localStorage
    const loadCartFromStorageLocal = () => {
      const loadedItems = loadCartFromStorage();
      setCartItems(loadedItems);
      console.log('[CartContext] User authenticated, loaded cart from localStorage:', loadedItems.length, 'items');
    };
    
    loadCartFromStorageLocal();
    
    // Add storage event listener to sync cart across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'marketplace-cart' && user) {
        loadCartFromStorageLocal();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, authLoading]);

  // Save cart to localStorage whenever it changes using optimized storage
  useEffect(() => {
    if (cartItems.length > 0) {
      const success = saveCartToStorage(cartItems);
      if (!success) {
        console.warn('[CartContext] Failed to save complete cart, some items may have been lost');
      }
    } else {
      // Clear storage when cart is empty
      try {
        localStorage.removeItem('marketplace-cart');
      } catch (error) {
        console.error('[CartContext] Failed to clear empty cart from storage:', error);
      }
    }
    console.log('[CartContext] Cart updated - Items:', cartItems.length, 'hasStartedOrder:', cartItems.length > 0);
  }, [cartItems]);

  const addToCart = useCallback((service: ServiceItem, selectedItems: Record<string, number> = {}) => {
    // Prevent adding to cart if user is not authenticated
    if (!user) {
      console.log('[CartContext] Cannot add to cart - user not authenticated');
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    console.log('[CartContext] addToCart called for service:', service.name, service.id, 'selectedItems:', selectedItems);
    
    setCartItems(prev => {
      // Check if service is already in cart using current state
      const existingIndex = prev.findIndex(item => item.service.id === service.id);
      
      if (existingIndex >= 0) {
        // Update existing item's selections
        console.log('[CartContext] Service already in cart, updating selectedItems:', service.id);
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          selectedItems: { ...updatedCart[existingIndex].selectedItems, ...selectedItems }
        };
        return updatedCart;
      } else {
        // Add new item to cart with expiry
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours expiry
        
        const newItem: CartItem = {
          service,
          addedAt: now,
          expiresAt,
          selectedItems
        };
        const updatedCart = [...prev, newItem];
        console.log('[CartContext] Adding to cart - New cart size:', updatedCart.length);
        return updatedCart;
      }
    });
    
    // Force context update
    setLastUpdate(Date.now());
  }, [user]);

  const updateCartItemSelections = useCallback((serviceId: string, selectedItems: Record<string, number>) => {
    if (import.meta.env.DEV) {
      console.log('🟢 CART: updateCartItemSelections called', {
        serviceId,
        itemCount: Object.keys(selectedItems).length,
        stack: new Error().stack?.split('\n').slice(2, 4).join('\n')
      });
    }
    console.log('[CartContext] updateCartItemSelections called for:', serviceId, selectedItems);
    setCartItems(prev => {
      const existingItem = prev.find(item => item.service.id === serviceId);
      
      // ✅ CRITICAL FIX: Shallow equality check to prevent unnecessary updates
      if (existingItem) {
        const existingKeys = Object.keys(existingItem.selectedItems || {});
        const newKeys = Object.keys(selectedItems);
        
        // Check if keys and values are the same
        if (existingKeys.length === newKeys.length) {
          const isEqual = newKeys.every(key => 
            existingItem.selectedItems?.[key] === selectedItems[key]
          );
          
          if (isEqual) {
            console.log('[CartContext] ⏭️ selectedItems unchanged, skipping update');
            return prev; // ← Return same reference if nothing changed
          }
        }
      }
      
      // Only update if actually different
      const updatedCart = prev.map(item => 
        item.service.id === serviceId 
          ? { ...item, selectedItems }
          : item
      );
      console.log('[CartContext] ✅ Updated cart item selections (values changed)');
      return updatedCart;
    });
    
    // Force context update
    setLastUpdate(Date.now());
  }, []);

  const getCartItemSelections = useCallback((serviceId: string): Record<string, number> => {
    const cartItem = cartItems.find(item => item.service.id === serviceId);
    return cartItem?.selectedItems || {};
  }, [cartItems]);

  const removeFromCart = useCallback((serviceId: string) => {
    console.log('[CartContext] removeFromCart called for:', serviceId);
    setCartItems(prev => {
      const updatedCart = prev.filter(item => item.service.id !== serviceId);
      console.log('[CartContext] Removing from cart - New cart size:', updatedCart.length);
      return updatedCart;
    });
    
    // Force context update
    setLastUpdate(Date.now());
  }, []);

  const clearCart = useCallback((userConfirmed = false) => {
    console.log('[CartContext] clearCart called', userConfirmed ? '(user confirmed)' : '(automatic)');

    // Only clear if user explicitly confirmed or it's a genuine completion
    if (!userConfirmed) {
      console.log('[CartContext] Cart clear prevented - requires user confirmation');
      return;
    }

    setCartItems([]);

    // Safe storage clearing - clear both cart and booking backup
    try {
      localStorage.removeItem('marketplace-cart');
      clearBookingStateBackup();
      // Also clear group order flow flag so new services go to regular booking
      sessionStorage.removeItem('isGroupOrderFlow');
    } catch (error) {
      console.error('[CartContext] Failed to clear cart storage:', error);
      toast.error('Failed to clear cart storage completely.');
    }
    

    
    // Force context update
    setLastUpdate(Date.now());
  }, []);

  const isInCart = useCallback((serviceId: string) => {
    const inCart = cartItems.some(item => item.service.id === serviceId);
    console.log('[CartContext] isInCart check for', serviceId, ':', inCart);
    return inCart;
  }, [cartItems]);

  // Refresh cart state (useful for page navigation/component remounts)
  const refreshCartState = useCallback(() => {
    console.log('[CartContext] Manually refreshing cart state');
    setLastUpdate(Date.now());
  }, []);

  const cartCount = cartItems.length;
  const hasStartedOrder = cartCount > 0;

  console.log('[CartContext] Current state -', 'cartCount:', cartCount, 'hasStartedOrder:', hasStartedOrder, 'lastUpdate:', lastUpdate);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      isInCart,
      hasStartedOrder,
      refreshCartState,
      updateCartItemSelections,
      getCartItemSelections
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Safe useCart hook with graceful fallback
let hasLoggedWarning = false;
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // Log warning only once to avoid spam
    if (!hasLoggedWarning) {
      console.warn('[useCart] CartProvider not available. Using safe fallback.');
      hasLoggedWarning = true;
    }
    
    // Return safe no-op fallback to prevent crashes
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      cartCount: 0,
      isInCart: () => false,
      hasStartedOrder: false,
      refreshCartState: () => {},
      updateCartItemSelections: () => {},
      getCartItemSelections: () => ({})
    };
  }
  return context;
};
