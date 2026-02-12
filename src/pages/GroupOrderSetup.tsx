import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import OrderSetupForm from "@/components/group-order/OrderSetupForm";
import BookingForm from "@/components/booking/BookingForm";
import InvitedGuestsList from "@/components/group-order/InvitedGuestsList";
import PaymentSettings from "@/components/group-order/PaymentSettings";
import OrderTypeHeader from "@/components/group-order/OrderTypeHeader";
import SelectedVendorCard from "@/components/group-order/SelectedVendorCard";
import AdditionalNotes from "@/components/group-order/AdditionalNotes";
import CreateOrderButton from "@/components/group-order/CreateOrderButton";
import BookingVendorCard from "@/components/booking/BookingVendorCard";
import AdditionalServices from "@/components/booking/AdditionalServices";
import { EnhancedCartManagement } from "@/components/cart/EnhancedCartManagement";
import { useToast } from "@/components/ui/use-toast";
import { ServiceSelection } from "@/types/order";
import { ServiceItem } from "@/types/service-types";
import { useGroupOrder } from "@/contexts/GroupOrderContext";
import { groupOrderService } from "@/services/groupOrderService";
import { toast } from "sonner";
import {
  saveBookingStateBackup,
  loadBookingStateBackup,
} from "@/utils/booking-state-persistence";
import invoiceService from "@/services/api/admin/invoice.service";
import { useCart } from "@/contexts/CartContext";
import { getServiceTypeLabel } from "@/utils/service-utils";
import { useServiceDistances } from "@/hooks/use-service-distances";
import { getServiceAddress } from "@/utils/delivery-calculations";
import { LocationData } from "@/components/shared/address/types";
import { calculateDeliveryFee } from "@/utils/delivery-calculations";
import { calculateCateringPrice, extractCateringItems } from "@/utils/catering-price-calculation";

interface InvitedGuest {
  email: string;
}

interface LocationState {
  selectedServices?: ServiceSelection[];
  selectedItems?: Record<string, number>;
  formData?: any;
  cartItems?: ServiceItem[];
  returningFromMarketplace?: boolean;
  fromCart?: boolean;
  addingAdditionalService?: boolean;
  isGroupOrder?: boolean;
  changingService?: boolean;
  serviceIndex?: number;
  currentServices?: ServiceSelection[];
  service?: ServiceItem;
}

function GroupOrderSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: toastui } = useToast();
  const { clearCart, removeFromCart } = useCart();
  const {
    state,
    setOrderInfo,
    setSelectedServices,
    setSelectedItems,
    setVendorDetails,
    addGuest,
    removeGuest,
    setPaymentMethod,
    setOrderType,
    setAdditionalNotes,
  } = useGroupOrder();

  // Local state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  // Store delivery fees per service (serviceId -> { range: string, fee: number })
  // Initialize from localStorage to persist across navigation
  const [serviceDeliveryFees, setServiceDeliveryFees] = useState<Record<string, { range: string; fee: number }>>(() => {
    try {
      const saved = localStorage.getItem('serviceDeliveryFees');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track event location coordinates for distance calculation
  const [eventLocationData, setEventLocationData] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem('eventLocationData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Get passed data from previous step
  const {
    selectedServices = [],
    selectedItems = {},
    formData,
    cartItems,
    returningFromMarketplace,
    fromCart,
    addingAdditionalService,
    isGroupOrder: isGroupOrderFromState,
    changingService,
    serviceIndex,
    currentServices,
    service: incomingService,
  } = (location.state as LocationState) || {};

  // Helper function to convert ServiceItem to ServiceSelection
  const convertServiceItemToSelection = (
    serviceItem: ServiceItem
  ): ServiceSelection => {
    const convertPriceToNumber = (
      price: string | number | undefined
    ): number => {
      if (typeof price === "number") return price;
      if (typeof price === "string") {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
        return isNaN(numericPrice) ? 0 : numericPrice;
      }
      return 0;
    };

    const numericPrice = convertPriceToNumber(serviceItem.price);

    const serviceTypeStr = String(
      serviceItem.type || serviceItem.serviceType || ""
    );
    const isStaffService =
      serviceTypeStr.toLowerCase() === "staff" ||
      serviceTypeStr.toLowerCase() === "events_staff";

    return {
      id: serviceItem.id,
      name: serviceItem.name,
      serviceName: serviceItem.name,
      servicePrice: numericPrice,
      quantity: isStaffService ? 0 : 1,
      duration: isStaffService ? 0 : 1,
      serviceType: serviceTypeStr,
      type: serviceTypeStr,
      price: numericPrice,
      image: serviceItem.image,
      serviceImage: serviceItem.image,
      vendor: serviceItem.vendorName,
      vendorName: serviceItem.vendorName,
      serviceId: serviceItem.id,
      vendor_id: serviceItem.vendor_id,
      description: serviceItem.description,
      service_details: serviceItem.service_details || {},
    } as ServiceSelection;
  };

  // Use the first service as primary if available (from context or location state)
  const primaryService =
    (state.selectedServices.length > 0
      ? state.selectedServices[0]
      : selectedServices[0]) || null;

  // Track if context has been initialized to prevent repeated updates
  const hasInitializedRef = useRef(false);

  // Initialize context with location state (only once)
  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitializedRef.current) {
      return;
    }

    let finalServices = [...selectedServices];

    // Case 1: Changing/replacing a service at a specific index (PRIORITY - check first)
    if (changingService && incomingService && typeof serviceIndex === 'number' && currentServices) {
      console.log('[GroupOrderSetup] Replacing service at index:', serviceIndex);

      // Convert the incoming service to ServiceSelection format
      const newSelection = convertServiceItemToSelection(incomingService);

      // Create a copy of current services and replace at the specified index
      const updatedServices = [...currentServices];
      if (updatedServices[serviceIndex]) {
        updatedServices[serviceIndex] = newSelection;
        console.log('[GroupOrderSetup] Service replaced successfully:', newSelection.serviceName || newSelection.name);
      }

      finalServices = updatedServices;
    }
    // Case 2: If returning from marketplace with cart items, merge them with existing services
    else if (
      returningFromMarketplace &&
      cartItems &&
      Array.isArray(cartItems) &&
      cartItems.length > 0
    ) {
      console.log(
        "[GroupOrderSetup] Merging cart items with existing services"
      );

      // Get existing services from context or location state
      const existingServices =
        state.selectedServices.length > 0
          ? state.selectedServices
          : selectedServices;

      // Convert cart items to ServiceSelection format
      const newServices = cartItems
        .filter((item) => item && item.id)
        .map((item) => convertServiceItemToSelection(item));

      // Merge: add new services to existing ones (avoid duplicates)
      const mergedServices = [...existingServices];
      newServices.forEach((newService) => {
        const serviceAlreadyExists = mergedServices.some((s) => {
          const existingId = s?.serviceId || s?.id;
          const newServiceId = newService?.serviceId || newService?.id;
          return existingId === newServiceId;
        });

        if (!serviceAlreadyExists) {
          mergedServices.push(newService);
        }
      });

      finalServices = mergedServices;
      console.log(
        "[AdminGroupOrderSetup] Merged services count:",
        finalServices.length
      );
    }

    const cateringOnlyServices = finalServices.filter((service) => {
      const serviceType = String(service?.serviceType || service?.type || "").toLowerCase();
      return serviceType === "catering";
    });

    if (cateringOnlyServices.length !== finalServices.length) {
      toast.error("Only Catering service type is allowed for group orders.");
      finalServices = cateringOnlyServices;
    }

    if (finalServices.length > 0) {
      setSelectedServices(finalServices);

      // Set vendor details
      const firstService = finalServices[0];
      setVendorDetails(
        getServiceName(firstService),
        firstService.serviceImage || firstService.image || ""
      );
    }
    if (Object.keys(selectedItems).length > 0) {
      setSelectedItems(selectedItems);
    }
    if (formData) {
      setOrderInfo(formData);
    }

    hasInitializedRef.current = true;
  }, [
    selectedServices,
    selectedItems,
    formData,
    cartItems,
    returningFromMarketplace,
    changingService,
    incomingService,
    serviceIndex,
    currentServices,
    setSelectedServices,
    setSelectedItems,
    setOrderInfo,
    setVendorDetails,
    state.selectedServices,
  ]);

  // Check if service is selected (after initialization)
  useEffect(() => {
    // Only check after initialization is complete
    if (!hasInitializedRef.current) {
      return;
    }

    const currentPrimaryService =
      (state.selectedServices.length > 0
        ? state.selectedServices[0]
        : selectedServices[0]) || null;
    if (!currentPrimaryService) {
      toastui({
        title: "No service selected",
        description: "Please select a service from the marketplace first",
        variant: "destructive",
      });
      navigate("/marketplace");
    }
  }, [state.selectedServices, selectedServices, navigate, toastui]);

  const handleRemoveGuest = (email: string) => {
    removeGuest(email);
  };

  const handleAddGuest = (email: string) => {
    if (email && !state.invitedGuests.includes(email)) {
      addGuest(email);
    }
  };

  const handleOrderTypeChange = (checked: boolean) => {
    if (!checked) {
      // Navigate first, then the booking page will handle the state
      navigate("/booking", {
        state: {
          selectedServices: state.selectedServices,
          selectedItems: state.selectedItems,
          formData: state.orderInfo,
          isGroupOrder: false,
        },
      });
    } else {
      // Only update state if staying on this page (turning ON group order)
      setOrderType(checked);
    }
  };

  // Handle combo selection properly by updating service state
  const handleComboSelection = (payload: any) => {
    if (payload && "serviceId" in payload && "selections" in payload) {
      const { serviceId, selections } = payload;

      console.log("[AdminGroupOrderSetup] ✅ Combo selected:", {
        serviceId,
        comboName: selections.comboName,
        totalPrice: selections.totalPrice,
      });

      // Update the service by adding combo to comboSelectionsList
      const updatedServices = state.selectedServices.map((service) => {
        const svcId = service.id || service.serviceId;
        if (svcId === serviceId) {
          return {
            ...service,
            comboSelectionsList: [
              ...(service.comboSelectionsList || []),
              selections,
            ],
          };
        }
        return service;
      });
      setSelectedServices(updatedServices);
    } else {
      // Legacy format fallback
      console.warn("[AdminGroupOrderSetup] Legacy combo format used");
      const comboItemId = `combo_${payload.comboItemId}_${Date.now()}`;
      const newSelectedItems = { ...state.selectedItems };
      newSelectedItems[comboItemId] = (newSelectedItems[comboItemId] || 0) + 1;
      setSelectedItems(newSelectedItems);
    }
  };

  const [customAdjustments, setCustomAdjustments] = useState<any[]>([]);

  // Handle loading draft
  const handleLoadDraft = (draft: any) => {
    console.log("Loading draft:", draft);
    if (
      window.confirm(
        `Load draft "${draft.name}"? This will replace your current selections.`
      )
    ) {
      window.location.reload();
    }
  };

  // Enhance services with vendor addresses and coordinates for distance calculation
  const servicesWithAddresses = useMemo(() => {
    return state.selectedServices.map(service => {
      const vendorAddress = getServiceAddress(service);
      const serviceAny = service as any;
      
      // Try to get vendor coordinates from various locations
      let vendorCoordinates = null;
      
      // Check for coordinates at top level
      if (serviceAny.vendorCoordinates) {
        vendorCoordinates = serviceAny.vendorCoordinates;
      }
      // Check vendor object for coordinates
      else if (service.vendor && typeof service.vendor === 'object') {
        const vendor = service.vendor as any;
        if (vendor.coordinates && typeof vendor.coordinates.lat === 'number' && typeof vendor.coordinates.lng === 'number') {
          vendorCoordinates = vendor.coordinates;
        } else if (typeof vendor.lat === 'number' && typeof vendor.lng === 'number') {
          vendorCoordinates = { lat: vendor.lat, lng: vendor.lng };
        }
      }
      // Check service_details for vendor coordinates
      else if (service.service_details?.vendor?.coordinates) {
        const coords = service.service_details.vendor.coordinates;
        if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          vendorCoordinates = coords;
        }
      }
      
      // Add vendor address and coordinates to service for useServiceDistances hook
      return {
        ...service,
        vendorFullAddress: vendorAddress,
        vendorAddress: vendorAddress,
        ...(vendorCoordinates ? { vendorCoordinates } : {})
      };
    });
  }, [state.selectedServices]);

  // Calculate distances for all services using useServiceDistances hook
  const destinationCoordinates = eventLocationData?.coordinates 
    ? { lat: eventLocationData.coordinates.lat, lng: eventLocationData.coordinates.lng }
    : null;
  
  const { distancesByService, loading: distancesLoading } = useServiceDistances(
    servicesWithAddresses,
    state.orderInfo?.location || null,
    destinationCoordinates
  );

  // Auto-calculate delivery fees when distances are available
  // Use ref to avoid infinite loop (serviceDeliveryFees would cause re-trigger if in deps)
  const serviceDeliveryFeesRef = useRef(serviceDeliveryFees);
  serviceDeliveryFeesRef.current = serviceDeliveryFees;

  useEffect(() => {
    if (Object.keys(distancesByService).length === 0 || !state.orderInfo?.location) {
      return;
    }

    state.selectedServices.forEach((service) => {
      const serviceId = service.id || service.serviceId;
      if (!serviceId) return;

      const distance = distancesByService[serviceId];
      if (!distance || distance <= 0) return;

      // Skip if delivery fee already selected (use ref to avoid stale closure)
      if (serviceDeliveryFeesRef.current[serviceId]) return;

      const deliveryOptions = service.service_details?.deliveryOptions ||
                             service.service_details?.catering?.deliveryOptions;

      if (deliveryOptions?.delivery && deliveryOptions.deliveryRanges) {
        const deliveryResult = calculateDeliveryFee(
          state.orderInfo.location,
          deliveryOptions,
          distance
        );

        if (deliveryResult.eligible && deliveryResult.fee >= 0) {
          // Find matching range
          const matchingRange = deliveryOptions.deliveryRanges.find((range: any) =>
            range.range === deliveryResult.range
          );

          if (matchingRange) {
            setServiceDeliveryFees((prev) => {
              // Double-check to avoid duplicate updates
              if (prev[serviceId]) return prev;
              const updated = { ...prev, [serviceId]: matchingRange };
              // Persist to localStorage
              try {
                localStorage.setItem('serviceDeliveryFees', JSON.stringify(updated));
              } catch (error) {
                console.warn('[GroupOrderSetup] Failed to persist delivery fees:', error);
              }
              return updated;
            });
          }
        }
      }
    });
  }, [distancesByService, state.orderInfo?.location, state.selectedServices]);

  // Handler for location selection to store coordinates
  const handleLocationSelected = useCallback((address: string, locationData?: LocationData) => {
    if (locationData) {
      setEventLocationData(locationData);
      // Persist to localStorage to survive page reloads
      try {
        localStorage.setItem('eventLocationData', JSON.stringify(locationData));
      } catch (error) {
        console.warn('[GroupOrderSetup] Failed to persist location data:', error);
      }
      console.log('[GroupOrderSetup] Location selected with coordinates:', locationData);
    }
  }, []);

  const handleDeliveryRangeSelect = useCallback((serviceIndex: number, range: { range: string; fee: number }) => {
    const service = state.selectedServices[serviceIndex];
    const serviceId = service?.id || service?.serviceId || `service-${serviceIndex}`;

    setServiceDeliveryFees((prev) => {
      // Skip if fee is already set for this service with same range
      if (prev[serviceId]?.range === range.range && prev[serviceId]?.fee === range.fee) {
        return prev;
      }
      return {
        ...prev,
        [serviceId]: range,
      };
    });

    toast.success(`Delivery fee of $${range.fee} automatically applied for ${range.range}`);
  }, [state.selectedServices]);

  // Handler for changing/replacing a service (edit icon functionality)
  const handleChangeService = useCallback((serviceIndex: number) => {
    return () => {
      navigate("/marketplace", {
        state: {
          changingService: true,
          serviceIndex: serviceIndex,
          currentServices: state.selectedServices,
          selectedItems: state.selectedItems,
          formData: state.orderInfo,
          bookingMode: true,
          addingToExistingBooking: true,
          replaceService: true,
          isGroupOrder: true,
        },
      });
    };
  }, [navigate, state.selectedServices, state.selectedItems, state.orderInfo]);

  // Handler for removing a service (delete icon functionality)
  const handleRemoveService = useCallback((serviceIndex: number) => {
    return () => {
      const serviceToRemove = state.selectedServices[serviceIndex];
      const serviceName = serviceToRemove?.serviceName || serviceToRemove?.name || 'Service';

      // Remove the service at the specified index
      const updatedServices = state.selectedServices.filter((_, idx) => idx !== serviceIndex);
      setSelectedServices(updatedServices);

      // Also clean up any selected items for this service
      const serviceId = serviceToRemove?.id || serviceToRemove?.serviceId;
      if (serviceId) {
        // Remove from cart context as well
        removeFromCart(serviceId);

        const newSelectedItems = { ...state.selectedItems };
        // Remove items that belong to this service (items prefixed with serviceId)
        Object.keys(newSelectedItems).forEach(key => {
          if (key.startsWith(`${serviceId}_`)) {
            delete newSelectedItems[key];
          }
        });
        setSelectedItems(newSelectedItems);

        // Also clean up delivery fees for this service
        setServiceDeliveryFees(prev => {
          const updated = { ...prev };
          delete updated[serviceId];
          try {
            localStorage.setItem('serviceDeliveryFees', JSON.stringify(updated));
          } catch (error) {
            console.warn('[GroupOrderSetup] Failed to persist delivery fees:', error);
          }
          return updated;
        });
      }

      toast.success(`${serviceName} removed from order`);
      console.log('[GroupOrderSetup] Service removed:', serviceName);
    };
  }, [state.selectedServices, state.selectedItems, setSelectedServices, setSelectedItems, removeFromCart]);

  const handleCreateGroupOrder = async () => {
    if (
      !state.orderInfo ||
      !state.orderInfo.orderName ||
      !state.orderInfo.primaryContactEmail
    ) {
      toast.error(
        "Please fill in the required order information (Order Name and Contact Email)"
      );
      return;
    }

    if (state.invitedGuests.length === 0) {
      toast.error("Please add at least one guest to the group order");
      return;
    }

    // Validate minimum guests and minimum order amount for catering services
    const guestCount = state.orderInfo?.headcount || 1;
    for (const service of state.selectedServices) {
      const serviceType = (service.serviceType || service.type || "").toLowerCase();
      if (serviceType === "catering") {
        const details = service.service_details || {};
        const cateringObj = details.catering || {};
        const serviceName = service.serviceName || service.name || "Catering service";

        // Get minimumGuests from service_details.catering.minimumGuests
        const minimumGuests = Number(cateringObj.minimumGuests) || 0;

        // Validate minimum guests
        if (minimumGuests > 0 && guestCount < minimumGuests) {
          toast.error(`Minimum guests not met`, {
            description: `${serviceName} requires at least ${minimumGuests} guests. You entered ${guestCount} guests.`,
            duration: 5000
          });
          return;
        }

        // Get minimumOrderAmount from service_details.catering.minimumOrderAmount
        const minimumOrderAmount = Number(cateringObj.minimumOrderAmount) || 0;

        // Calculate service total for validation
        if (minimumOrderAmount > 0 && details) {
          const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
            state.selectedItems,
            details
          );

          const basePricePerPerson = baseItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
          }, 0);

          const additionalCharges = additionalChargeItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            additionalCharge: item.additionalCharge,
            isMenuItem: item.isMenuItem
          }));

          const cateringCalcResult = calculateCateringPrice(
            basePricePerPerson,
            additionalCharges,
            guestCount,
            comboCategoryItems
          );

          const serviceTotal = cateringCalcResult.finalTotal;

          console.log('[GroupOrderSetup] Minimum order amount validation:', {
            serviceName,
            serviceTotal,
            minimumOrderAmount,
            guestCount,
            minimumGuests
          });

          // Validate minimum order amount
          // if (serviceTotal < minimumOrderAmount) {
          //   toast.error(`Minimum order amount not met`, {
          //     description: `${serviceName} requires a minimum order of $${minimumOrderAmount.toFixed(2)}. Your current total is $${serviceTotal.toFixed(2)}.`,
          //     duration: 5000
          //   });
          //   return;
          // }
        }
      }
    }

    const hasNonCateringService = state.selectedServices.some((service) => {
      const serviceType = String(service.serviceType || service.type || "").toLowerCase();
      return serviceType === "venue" ||
             serviceType === "venues" ||
             serviceType === "staff" ||
             serviceType === "events_staff" ||
             serviceType === "party_rentals" ||
             serviceType === "party-rental" ||
             serviceType === "party-rentals";
    });

    if (hasNonCateringService) {
      toast.error("Only Catering service type is allowed for group orders.");
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Helper function to map services with their items
      const mapServiceWithItems = (service: any, index: number) => {
        const serviceId = service.id || service.serviceId || "";
        const serviceType = (
          service.serviceType ||
          service.type ||
          "catering"
        ).toLowerCase();
        const details = service.service_details || {};
        
        // Get delivery fee for this service
        const deliveryFee = serviceDeliveryFees[serviceId] || null;

        // Parse service_details if it's a string
        let parsedDetails = details;
        if (typeof details === "string") {
          try {
            parsedDetails = JSON.parse(details);
          } catch {
            parsedDetails = {};
          }
        }

        // Handle venues service type - simple structure with price, quantity, totalPrice, priceType
        if (serviceType === "venues" || serviceType === "venue") {
          // Get quantity - always ensure it's at least 1
          const quantity = service.quantity || 
                          service.serviceQuantity || 
                          (service as any).qty || 
                          1;
          
          // Get base price - try multiple sources
          let price = parseFloat(String(service.servicePrice || service.price || "0"));
          
          // If price is 0 or not found, try to derive from totalPrice
          if (price === 0 || isNaN(price)) {
            const existingTotalPrice = parseFloat(String(service.totalPrice || service.serviceTotalPrice || "0"));
            if (existingTotalPrice > 0 && quantity > 0) {
              price = existingTotalPrice / quantity;
            }
          }
          
          // Extract image from venue service (try multiple possible fields)
          const venueImage = service.image || 
                            service.serviceImage || 
                            service.vendorImage || 
                            service.coverImage ||
                            service.imageUrl ||
                            service.image_url ||
                            parsedDetails?.image ||
                            parsedDetails?.serviceImage ||
                            parsedDetails?.venueImage ||
                            "";
          
          // Always include price and quantity, even if quantity is 1
          return {
            serviceId: serviceId,
            serviceType: "venues",
            serviceName: service.serviceName || service.name || "",
            vendorId: service.vendor_id || service.vendorId || "",
            price: price,
            quantity: quantity,
            totalPrice: price * quantity,
            priceType: service.priceType || service.price_type || "flat",
            image: venueImage,
          };
        }

        // Get all available items for this service
        let availableItems: any[] = [];
        if (serviceType === "catering") {
          availableItems =
            parsedDetails.menuItems ||
            parsedDetails.catering?.menuItems ||
            parsedDetails.menu?.items ||
            parsedDetails.menu?.menu_items ||
            parsedDetails.items ||
            parsedDetails.menu_items ||
            parsedDetails.menu ||
            [];
          // Add combo items if they exist
          if (
            parsedDetails.catering?.combos &&
            Array.isArray(parsedDetails.catering.combos)
          ) {
            availableItems = [
              ...availableItems,
              ...parsedDetails.catering.combos,
            ];
          }
        } else if (
          serviceType === "party-rental" ||
          serviceType === "party-rentals"
        ) {
          availableItems =
            parsedDetails.rentalItems ||
            parsedDetails.rental?.items ||
            parsedDetails.rental_items ||
            parsedDetails.items ||
            [];
        } else if (serviceType === "staff" || serviceType === "events_staff") {
          availableItems =
            parsedDetails.staffServices ||
            parsedDetails.services ||
            parsedDetails.staff?.services ||
            [];
        }

        // Filter selectedItems that belong to this service
        const serviceItems: any[] = [];

        Object.entries(state.selectedItems).forEach(([itemId, quantity]) => {
          // Ensure quantity is a valid number, default to 1 if missing
          const validQuantity = quantity && typeof quantity === 'number' ? quantity : (quantity || 1);
          // Skip items with zero or negative quantity (but allow 1 and above)
          if (!validQuantity || validQuantity < 1) {
            return;
          }

          // Legacy combo key format: combo_<comboItemId>_<timestamp>
          if (itemId.startsWith("combo_")) {
            const parts = itemId.split("_");
            if (parts.length >= 3 && parts[0] === "combo") {
              const comboItemId = parts[1];
              const legacyComboItem = availableItems.find((item: any) =>
                item.id === comboItemId ||
                item.itemId === comboItemId ||
                item.comboItemId === comboItemId
              );

              if (legacyComboItem && serviceType === "catering") {
                const legacyPrice = parseFloat(
                  String(
                    legacyComboItem.pricePerPerson ||
                    legacyComboItem.price ||
                    legacyComboItem.itemPrice ||
                    legacyComboItem.basePrice ||
                    0
                  )
                );

                const legacyImage = legacyComboItem.image ||
                  legacyComboItem.imageUrl ||
                  legacyComboItem.itemImage ||
                  legacyComboItem.image_url ||
                  legacyComboItem.photo ||
                  legacyComboItem.picture ||
                  legacyComboItem.menuItemImage ||
                  "";

                serviceItems.push({
                  menuName:
                    legacyComboItem.menuName ||
                    legacyComboItem.category ||
                    legacyComboItem.menu?.name ||
                    service.serviceName ||
                    service.name ||
                    "Menu",
                  menuItemName:
                    legacyComboItem.name ||
                    legacyComboItem.menuItemName ||
                    legacyComboItem.itemName ||
                    comboItemId,
                  price: legacyPrice,
                  quantity: validQuantity,
                  totalPrice: legacyPrice * validQuantity,
                  cateringId: legacyComboItem.id || legacyComboItem.cateringId || comboItemId,
                  serviceId: serviceId,
                  image: legacyImage,
                });
              }
              return;
            }
          }

          // Check if this is a combo category item (format: comboId_categoryId_itemId)
          if (itemId.includes('_') && itemId.split('_').length >= 3) {
            const parts = itemId.split('_');
            const comboId = parts[0];
            const categoryId = parts[1];
            const actualItemId = parts[2];
            
            const comboSelections = Array.isArray(service.comboSelectionsList)
              ? service.comboSelectionsList
              : [];
            if (comboSelections.length > 0) {
              return;
            }
            // Find the combo and category to get the actual item details
            let categoryItem = null;
            let categoryName = "Category";
            
            // Look for the combo in available items
            const combo = availableItems.find(item => 
              (item.id === comboId || item.itemId === comboId) && 
              (item.comboCategories || item.isCombo)
            );
            
            if (combo && combo.comboCategories) {
              const category = combo.comboCategories.find((cat: any) => 
                cat.id === categoryId || cat.categoryId === categoryId
              );
              
              if (category) {
                categoryName = category.name || category.categoryName || "Category";
                
                if (category.items) {
                  categoryItem = category.items.find((item: any) => 
                    item.id === actualItemId || item.itemId === actualItemId
                  );
                }
              }
            }
            else {
              return;
            }
            
            if (!categoryItem) {
              return;
            }

            // Get item details or use fallback
            const itemName = categoryItem?.name || categoryItem?.itemName || actualItemId;
            const itemPrice = parseFloat(String(categoryItem?.price || 0));
            const upchargePrice = parseFloat(String(categoryItem?.additionalCharge || categoryItem?.upcharge || 0));
            
            // Extract image from category item
            const itemImage = categoryItem?.image || 
                            categoryItem?.imageUrl || 
                            categoryItem?.itemImage || 
                            categoryItem?.image_url ||
                            categoryItem?.photo ||
                            categoryItem?.picture ||
                            "";
            
            // Add combo category item with proper details
            if (serviceType === "catering") {
              serviceItems.push({
                menuName: categoryName,
                menuItemName: itemName,
                price: itemPrice,
                quantity: validQuantity,
                totalPrice: itemPrice * validQuantity,
                cateringId: actualItemId,
                serviceId: serviceId,
                isComboCategoryItem: true,
                comboId: comboId,
                image: itemImage,
                premiumCharge: upchargePrice
              });
            }
            return;
          }

          // Check if this item belongs to this service
          // Try multiple matching strategies similar to SelectedItemsBreakdown
          let item = availableItems.find(
            (item: any) =>
              item.id === itemId ||
              item.itemId === itemId ||
              item.name === itemId ||
              item.title === itemId ||
              `${serviceId}_${item.id}` === itemId ||
              `${serviceId}_${item.itemId}` === itemId
          );

          // If not found and serviceId prefix is used, try stripping the prefix
          if (!item && serviceId && itemId.startsWith(serviceId + '_')) {
            const actualId = itemId.slice((serviceId + '_').length);
            item = availableItems.find((it: any) =>
              it.id === actualId ||
              it.itemId === actualId ||
              it.name === actualId ||
              it.title === actualId
            );
          }

          // Only process if item is found OR if we have a valid quantity (fallback for unmatched items)
          if (item || validQuantity >= 1) {
            // If item not found but has valid quantity, create a minimal item entry
            if (!item) {
              // For party rentals, still include the item even if not found in availableItems
              // This handles cases where items might be added dynamically
              if (serviceType === "party-rental" || serviceType === "party-rentals") {
                serviceItems.push({
                  name: itemId,
                  quantity: validQuantity,
                  eachPrice: 0,
                  totalPrice: 0,
                  rentalId: itemId,
                });
                return; // Skip further processing for unmatched items
              }
              // For other service types, skip if item not found
              return;
            }

            // Check if this is a combo item - if so, skip it here as it will be processed in comboSelectionsList
            const isComboItem = item.isCombo || item.comboCategories || item.pricePerPerson !== undefined;
            if (isComboItem && service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
              const isInComboSelections = service.comboSelectionsList.some(
                (combo: any) => combo.comboItemId === item.id || combo.comboItemId === item.itemId
              );
              if (isInComboSelections) {
                // Skip this combo item as it will be processed in comboSelectionsList
                return;
              }
            }
            
            // Extract price properly - check multiple possible price fields
            // For combo items, prioritize pricePerPerson
            const itemPrice = parseFloat(
              String(
                item.pricePerPerson ||
                item.price ||
                item.itemPrice ||
                item.basePrice ||
                item.unitPrice ||
                0
              )
            );

            if (serviceType === "catering") {
              const itemImage = item.image || 
                              item.imageUrl || 
                              item.itemImage || 
                              item.image_url ||
                              item.photo ||
                              item.picture ||
                              item.menuItemImage ||
                              "";

              serviceItems.push({
                menuName:
                  item.menuName ||
                  item.category ||
                  item.menu?.name ||
                  service.serviceName ||
                  service.name ||
                  "Menu",
                menuItemName:
                  item.name || 
                  item.menuItemName || 
                  item.itemName ||
                  itemId,
                price: itemPrice,
                quantity: validQuantity,
                totalPrice: itemPrice * validQuantity,
                cateringId: item.id || item.cateringId || itemId,
                serviceId: serviceId,
                image: itemImage,
              });
            } else if (
              serviceType === "party-rental" ||
              serviceType === "party-rentals"
            ) {
              serviceItems.push({
                name: item.name || item.itemName || item.title || itemId,
                quantity: validQuantity,
                eachPrice: itemPrice,
                totalPrice: itemPrice * validQuantity,
                rentalId: item.id || item.rentalId || item.itemId || itemId,
              });
            } else if (
              serviceType === "staff" ||
              serviceType === "events_staff"
            ) {
              // For staff, check if there's a duration key
              const durationKey = `${itemId}_duration`;
              const hours =
                state.selectedItems[durationKey] ||
                service.duration ||
                service.hours ||
                1;
              const perHourPrice = parseFloat(
                item.price || 
                item.perHourPrice || 
                item.hourlyRate ||
                0
              );
              serviceItems.push({
                name: item.name || item.itemName || itemId,
                pricingType: item.pricingType || "hourly",
                perHourPrice: perHourPrice,
                hours: hours,
                totalPrice: perHourPrice * hours,
                staffId: item.id || item.staffId || itemId,
              });
            }
          }
        });

        // Also include combo selections if they exist
        if (serviceType === "catering" && service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
          // Get combo items from multiple possible locations
          const comboItemsFromDetails = parsedDetails.catering?.combos || [];
          
          service.comboSelectionsList.forEach((combo: any) => {
            if (combo) {
              const comboItemId = combo.comboItemId;
              
              // Find the original combo item from multiple sources
              // First check availableItems (which already includes combos)
              let originalComboItem = availableItems.find(
                (item: any) =>
                  (item.id === comboItemId ||
                  item.itemId === comboItemId ||
                  item.comboItemId === comboItemId) &&
                  (item.isCombo || item.comboCategories || item.pricePerPerson !== undefined)
              );
              
              // If not found, check comboItemsFromDetails
              if (!originalComboItem) {
                originalComboItem = comboItemsFromDetails.find(
                  (item: any) =>
                    item.id === comboItemId ||
                    item.itemId === comboItemId ||
                    item.comboItemId === comboItemId
                );
              }
              
              // Get base price per person from the original combo item
              const basePrice = parseFloat(
                String(
                  originalComboItem?.pricePerPerson ||
                  originalComboItem?.price ||
                  combo.basePrice ||
                  combo.pricePerPerson ||
                  combo.price ||
                  0
                )
              );

              // Calculate protein quantity for base combo price (NOT guest count)
              const finalComboItemId = comboItemId || originalComboItem?.id;

              // PRIORITY: Protein quantity determines base combo price
              // Guest count (headcount) only used for sides/toppings upcharges
              let proteinQuantity = 0;

              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  // Check if this is a protein category
                  const isProtein = category.categoryName && (
                    category.categoryName.toLowerCase().includes('protein') ||
                    category.categoryName.toLowerCase().includes('meat') ||
                    category.categoryName.toLowerCase().includes('main')
                  );

                  if (isProtein && category.selectedItems && Array.isArray(category.selectedItems)) {
                    category.selectedItems.forEach((item: any) => {
                      proteinQuantity += item.quantity || 0;
                    });
                  }
                });
              }

              // If no protein quantity found, try selectedItems or combo.quantity as fallback
              if (proteinQuantity === 0) {
                const directQuantity = state.selectedItems[finalComboItemId];
                const prefixedQuantity = state.selectedItems[`${serviceId}_${finalComboItemId}`];
                proteinQuantity = directQuantity || prefixedQuantity || combo.quantity || 0;
              }

              // Use minimum of 1 for protein quantity if still 0
              const effectiveProteinQuantity = proteinQuantity > 0 ? proteinQuantity : 1;

              // Get guest count for sides/toppings upcharges
              const guestCount = parseInt(String(state.orderInfo?.headcount || '1')) || 1;

              // CORRECT COMBO PRICING FORMULA:
              // Base Combo Price = Base Price × Protein Quantity (NOT guest count)
              // Sides/Toppings Upcharges = Upcharge × Guest Count

              // Calculate base total: Base Price × Protein Quantity
              const baseTotal = basePrice * effectiveProteinQuantity;

              // Calculate premium upcharges from selected items (multiply by guest count)
              let totalUpcharges = 0;

              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  if (category.selectedItems && Array.isArray(category.selectedItems)) {
                    category.selectedItems.forEach((categoryItem: any) => {
                      // Get the upcharge price for this item (could be 0 for base options)
                      const upchargePrice = parseFloat(String(categoryItem.upcharge || 0));

                      // Add upcharge × guestCount (for sides/toppings)
                      if (upchargePrice > 0) {
                        totalUpcharges += upchargePrice * guestCount;
                      }
                    });
                  }
                });
              }

              // Final combo total = base total + total upcharges
              const comboTotal = baseTotal + totalUpcharges;

              // Quantity for display = protein quantity (what was actually ordered)
              const comboQuantity = effectiveProteinQuantity;

              // Debug logging (only in development)
              if (import.meta.env.DEV) {
                console.log('[GroupOrderSetup] Combo pricing calculation:', {
                  comboName: combo.comboName,
                  comboItemId: comboItemId,
                  basePrice: basePrice,
                  proteinQuantity: proteinQuantity,
                  effectiveProteinQuantity: effectiveProteinQuantity,
                  guestCount: guestCount,
                  baseTotal: baseTotal,
                  totalUpcharges: totalUpcharges,
                  comboTotal: comboTotal,
                  formula: `(${basePrice} × ${effectiveProteinQuantity} proteins) + (${totalUpcharges / guestCount} upcharge × ${guestCount} guests) = ${comboTotal}`
                });
              }

              // Extract image from combo item
              const comboImage = originalComboItem?.image ||
                              originalComboItem?.imageUrl ||
                              originalComboItem?.itemImage ||
                              originalComboItem?.image_url ||
                              originalComboItem?.photo ||
                              originalComboItem?.picture ||
                              combo?.image ||
                              combo?.imageUrl ||
                              "";

              // Send the combo as a single item with calculated total
              // Quantity = protein quantity (what was actually ordered)
              // Price = base price per combo
              const pricePerCombo = comboTotal / comboQuantity;

              serviceItems.push({
                menuName: combo.comboName || originalComboItem?.category || "Combo Items",
                menuItemName: combo.comboName || originalComboItem?.name || "",
                price: pricePerCombo,
                quantity: comboQuantity,
                totalPrice: comboTotal,
                cateringId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
                serviceId: serviceId,
                image: comboImage,
              });

              // Add combo category items with additional fields for itemized breakdown
              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  if (category.selectedItems && Array.isArray(category.selectedItems)) {
                    category.selectedItems.forEach((categoryItem: any) => {
                      // Get upcharge (additional charge) and total price
                      const upchargePrice = parseFloat(String(categoryItem.additionalCharge || categoryItem.upcharge || 0));
                      const totalPrice = parseFloat(String(categoryItem.price || 0));

                      // Extract image from category item
                      const categoryItemImage = categoryItem?.image ||
                                                              categoryItem?.imageUrl ||
                                                              categoryItem?.itemImage ||
                                                              categoryItem?.image_url ||
                                                              categoryItem?.photo ||
                                                              categoryItem?.picture ||
                                                              "";

                      // Use the selected quantity for all items (no guest count multiplication)
                      const itemQuantity = categoryItem.quantity || 1;
                      const itemTotalPrice = totalPrice * itemQuantity;

                      serviceItems.push({
                        menuName: category.categoryName || "Category",
                        menuItemName: categoryItem.name || categoryItem.itemName || categoryItem.id || "",
                        price: totalPrice,
                        quantity: itemQuantity,
                        totalPrice: itemTotalPrice,
                        cateringId: categoryItem.id || categoryItem.itemId || "",
                        serviceId: serviceId,
                        isComboCategoryItem: true,
                        comboId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
                        image: categoryItemImage,
                        premiumCharge: upchargePrice
                      });
                    });
                  }
                });
              }
            }
          });
        }

        // Calculate total price from all service items
        const calculatedTotalPrice = serviceItems.reduce((sum, item) => {
          const itemTotal = parseFloat(String(item.totalPrice || 0));
          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
        }, 0);

        // Normalize service type
        let normalizedServiceType = serviceType;
        if (serviceType === "party-rental" || serviceType === "party-rentals") {
          normalizedServiceType = "party_rentals";
        } else if (serviceType === "staff" || serviceType === "events_staff") {
          normalizedServiceType = "events_staff";
        } else if (serviceType === "venues" || serviceType === "venue") {
          normalizedServiceType = "venues";
        }

        // Build service object
        // Try to get quantity from multiple possible fields
        const quantity = service.quantity || 
                        service.serviceQuantity || 
                        (service as any).qty || 
                        1;
        const basePrice = parseFloat(String(service.servicePrice || service.price || "0"));
        
        // For catering services, DO NOT include base service price - only use items total
        // For other services, use items total if available, otherwise use base price
        let calculatedTotal;
        if (normalizedServiceType === "catering") {
          // For catering services, only use items total (base price is excluded)
          calculatedTotal = calculatedTotalPrice;
        } else {
          // Use items total if available, otherwise use base price
          calculatedTotal = calculatedTotalPrice > 0 
            ? calculatedTotalPrice 
            : basePrice * quantity;
        }

        // Extract image from service (try multiple possible fields)
        const serviceImage = service.image || 
                            service.serviceImage || 
                            service.vendorImage || 
                            service.coverImage ||
                            service.imageUrl ||
                            service.image_url ||
                            parsedDetails?.image ||
                            parsedDetails?.serviceImage ||
                            "";

        const mappedService: any = {
          serviceId: serviceId,
          serviceType: normalizedServiceType,
          serviceName: service.serviceName || service.name || "",
          vendorId: service.vendor_id || service.vendorId || "",
          totalPrice: calculatedTotal,
          priceType: service.priceType || service.price_type || "flat",
          image: serviceImage,
        };

        // Add items based on service type
        if (normalizedServiceType === "catering") {
          mappedService.cateringItems = serviceItems;

          // Add delivery fee only for catering services (as a number)
          if (deliveryFee && deliveryFee.fee > 0) {
            mappedService.deliveryFee = deliveryFee.fee;
          }

          // Add delivery ranges for catering services
          const deliveryOptions = service.service_details?.deliveryOptions ||
                                 service.service_details?.catering?.deliveryOptions;

          // Try to get deliveryRanges from multiple possible locations
          let deliveryRanges = deliveryOptions?.deliveryRanges ||
                              service.service_details?.deliveryRanges ||
                              service.service_details?.catering?.deliveryRanges ||
                              service.deliveryRanges;

          if (deliveryRanges && Array.isArray(deliveryRanges) && deliveryRanges.length > 0) {
            mappedService.deliveryRanges = deliveryRanges;
          }

          if (import.meta.env.DEV) {
            console.log('[GroupOrderSetup] Delivery ranges for service:', {
              serviceName: service.serviceName || service.name,
              deliveryOptions,
              deliveryRanges: deliveryRanges,
              mappedDeliveryRanges: mappedService.deliveryRanges
            });
          }

          // Calculate catering service total using the same logic as EnhancedOrderSummaryCard
          // and update totalPrice to match the Service Total shown in the UI
          if (service.service_details) {
            const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
              state.selectedItems,
              service.service_details
            );

            // Calculate base price per person (sum of all base items)
            const basePricePerPerson = baseItems.reduce((sum, item) => {
              return sum + (item.price * item.quantity);
            }, 0);

            // Prepare additional charges for calculation
            const additionalCharges = additionalChargeItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              additionalCharge: item.additionalCharge,
              isMenuItem: item.isMenuItem
            }));

            const guestCount = parseInt(String(state.orderInfo?.headcount || '1')) || 1;

            const cateringCalcResult = calculateCateringPrice(
              basePricePerPerson,
              additionalCharges,
              guestCount,
              comboCategoryItems
            );

            // Update totalPrice to use the calculated catering service total
            mappedService.totalPrice = cateringCalcResult.finalTotal;

            if (import.meta.env.DEV) {
              console.log('[GroupOrderSetup] Catering service total calculation:', {
                serviceName: service.serviceName || service.name,
                basePricePerPerson,
                guestCount,
                basePriceTotal: cateringCalcResult.basePriceTotal,
                additionalChargesTotal: cateringCalcResult.additionalChargesTotal,
                totalPrice: cateringCalcResult.finalTotal
              });
            }
          }
        } else if (normalizedServiceType === "party_rentals") {
          mappedService.partyRentalItems = serviceItems;
          // For party_rentals, also include price and quantity if no items
          if (serviceItems.length === 0) {
            mappedService.price = basePrice;
            mappedService.quantity = quantity;
          }
        } else if (normalizedServiceType === "events_staff") {
          // Always include staffItems array, even if empty
          mappedService.staffItems = serviceItems;
          // For events_staff, also include price and quantity if no items
          if (serviceItems.length === 0) {
            mappedService.price = basePrice;
            mappedService.quantity = quantity;
          }
        }

        return mappedService;
      };

      // Format order deadline as ISO string from orderDeadlineDate and orderDeadlineTime
      // Format: "2025-12-30T23:59:59.000Z"
      const formatOrderDeadline = (date: string, time: string): string => {
        if (!date) return "";
        try {
          // Parse time - should be in HH:MM format from time input
          let timeString = "23:59:59";
          if (time) {
            // If it's in HH:MM format, add seconds
            if (time.match(/^\d{2}:\d{2}$/)) {
              timeString = `${time}:59`;
            }
            // If it's already in HH:MM:SS format, use it
            else if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
              timeString = time;
            }
          }

          // Combine date and time
          const dateTimeString = `${date}T${timeString}`;
          const dateObj = new Date(dateTimeString);

          // If timezone offset causes issues, ensure we have a valid date
          if (isNaN(dateObj.getTime())) {
            // Fallback: parse date manually
            const [year, month, day] = date.split("-");
            const [hours, minutes, seconds] = timeString.split(":");
            const fallbackDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hours || "23"),
              parseInt(minutes || "59"),
              parseInt(seconds || "59"),
              0
            );
            return fallbackDate.toISOString();
          }
          return dateObj.toISOString();
        } catch {
          return "";
        }
      };

      // Get primary service type for selectItem
      const primaryServiceType =
        state.selectedServices[0]?.serviceType ||
        state.selectedServices[0]?.type ||
        "catering";
      const normalizedServiceType =
        primaryServiceType === "party-rental" ||
        primaryServiceType === "party-rentals"
          ? "party_rentals"
          : primaryServiceType === "events_staff" ||
            primaryServiceType === "staff"
          ? "events_staff"
          : primaryServiceType;

      const budgetPerPerson = 30.0;
      const guestCount = state.orderInfo.headcount || state.invitedGuests.length + 1;
      
      // Try multiple possible company name fields
      // Check both 'company' (regular booking) and 'clientCompany' (invoice mode)
      const companyName = (state.orderInfo as any)?.company || 
                         state.orderInfo?.clientCompany || 
                         (state.orderInfo as any)?.companyName || 
                         (state.orderInfo as any)?.organizationName || 
                         '';
      
      const invoiceData = {
        eventName: state.orderInfo.orderName || "Group Order Event",
        companyName: companyName,
        eventLocation: state.orderInfo.location || "",
        eventDate: state.orderInfo.date || "",
        serviceTime: state.orderInfo.deliveryWindow || "",
        guestCount: guestCount,
        contactName: state.orderInfo.primaryContactName || "",
        phoneNumber: state.orderInfo.primaryContactPhone || "",
        emailAddress: state.orderInfo.primaryContactEmail || "",
        addBackupContact: state.orderInfo.hasBackupContact || false,
        additionalNotes:
          state.additionalNotes || state.orderInfo.additionalNotes || "",
        taxExemptStatus: false,
        waiveServiceFee: false,
        budgetPerPerson: budgetPerPerson,
        budget: guestCount * budgetPerPerson,
        selectItem: normalizedServiceType,
        quantity: guestCount,
        orderDeadline: formatOrderDeadline(
          state.orderInfo.orderDeadlineDate || "",
          state.orderInfo.orderDeadlineTime || ""
        ),
        inviteFriends: state.invitedGuests.map((email) => ({
          email,
          acceptanceStatus: false,
        })),
        paymentSettings:
          state.paymentMethod || "split_equally_between_all_guests",
        services: state.selectedServices.map((service, index) => mapServiceWithItems(service, index)),
        customLineItems: [],
      };

     // console.log(JSON.stringify(invoiceData))
    
      const response = await invoiceService.createGroupOrderInvoice(invoiceData);
      const invoiceId = response.data.invoice.id;
      clearCart(true);
      setServiceDeliveryFees({}); // Clear delivery fees on successful submission
      // Clear from localStorage
      try {
        localStorage.removeItem('serviceDeliveryFees');
        localStorage.removeItem('eventLocationData');
      } catch (error) {
        console.warn('[GroupOrderSetup] Failed to clear localStorage:', error);
      }
      toast.success(
        "Group order invoice created successfully"
      );
      navigate(`/host/order-summary/${invoiceId}`);
    } catch (error) {
      console.error("Failed to create group order invoice:", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Get service name from either serviceName or name property
  const getServiceName = (service: ServiceSelection | null): string => {
    if (!service) return "";
    return service.serviceName || service.name || "";
  };

  // Get service price from either servicePrice or price property
  const getServicePrice = (service: ServiceSelection | null): string => {
    if (!service) return "0";
    if (service.servicePrice !== undefined) {
      return service.servicePrice.toString();
    }
    return service.price.toString();
  };

  return (
    <Dashboard activeTab="orders" userRole="event-host">
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-4 md:px-6 box-border overflow-x-hidden">
          <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="w-full max-w-full overflow-x-hidden">
              <EnhancedCartManagement
                selectedServices={state.selectedServices}
                selectedItems={state.selectedItems}
                formData={state.orderInfo}
                onLoadDraft={handleLoadDraft}
              />
            </div>

            <div className="w-full max-w-full overflow-x-hidden">
              <OrderTypeHeader
                isGroupOrder={state.orderType}
                onOrderTypeChange={handleOrderTypeChange}
              />
            </div>

            {/* {(primaryService || state.vendorName) && (
              <div className="w-full max-w-full overflow-x-hidden">
                <SelectedVendorCard
                  vendorName={state.vendorName || getServiceName(primaryService)}
                  vendorImage={state.vendorImage || primaryService?.serviceImage || ''}
                  vendorPrice={primaryService ? getServicePrice(primaryService) : ''}
                  onChangeVendor={() => navigate('/admin/marketplace')}
                />
              </div>
            )} */}

            {/* Host Meal Selection Section */}
            {state.selectedServices.length > 0 && (
              <div className="w-full max-w-full overflow-x-hidden">
                <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Meal Selection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select your meal preferences. Guests will be able to choose
                    from the same menu options.
                  </p>
                  {state.selectedServices.map((service, index) => {
                    const guestCount = state.orderInfo?.headcount || state.invitedGuests.length + 1 || 1;
                    return (
                      <div
                        key={index}
                        className="w-full max-w-full overflow-x-hidden"
                      >
                        <BookingVendorCard
                          showChooseItems={false}
                          vendorImage={service?.serviceImage || service?.image}
                          vendorName={service?.serviceName || service?.name}
                          vendorType={getServiceTypeLabel(service?.serviceType || service?.type)}
                          vendorPrice={getServicePrice(service)}
                          serviceDetails={service}
                          selectedItems={state.selectedItems}
                          onItemQuantityChange={(itemId, quantity) => {
                            const newSelectedItems = { ...state.selectedItems };
                            if (quantity > 0) {
                              newSelectedItems[itemId] = quantity;
                            } else {
                              delete newSelectedItems[itemId];
                            }
                            setSelectedItems(newSelectedItems);
                          }}
                          onComboSelection={handleComboSelection}
                          canRemove={state.selectedServices.length > 1}
                          onRemoveService={handleRemoveService(index)}
                          serviceIndex={index}
                          quantity={service?.quantity || 1}
                          onQuantityChange={(quantity) => {
                            const updatedServices = [...state.selectedServices];
                            updatedServices[index] = {
                              ...updatedServices[index],
                              quantity,
                            };
                            setSelectedServices(updatedServices);
                          }}
                          onDeliveryRangeSelect={handleDeliveryRangeSelect}
                          guestCount={guestCount}
                          calculatedDistance={distancesByService[service?.id || service?.serviceId || `service-${index}`] || undefined}
                          preselectedDeliveryFee={serviceDeliveryFees[service?.id || service?.serviceId || `service-${index}`] || undefined}
                          onChangeService={handleChangeService(index)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Services Section */}
            <div className="w-full max-w-full overflow-x-hidden">
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Services
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add more services to your group order that guests can also
                  choose from.
                </p>
                <AdditionalServices
                  selectedServices={state.selectedServices}
                  showOrderSummary={false}
                  selectedItems={state.selectedItems}
                  customAdjustments={customAdjustments}
                  serviceDeliveryFees={serviceDeliveryFees}
                  serviceDistances={distancesByService}
                  guestCount={state.orderInfo?.headcount || state.invitedGuests.length + 1 || 1}
                  onAddService={() => {
                    // Save latest booking state before navigating to marketplace
                    try {
                      saveBookingStateBackup(
                        state.selectedServices,
                        state.selectedItems,
                        state.orderInfo
                      );
                    } catch (e) {
                      // Failed to save backup
                    }
                    navigate("/marketplace", {
                      state: {
                        addingAdditionalService: true,
                        currentServices: state.selectedServices,
                        selectedItems: state.selectedItems,
                        formData: formData,
                        bookingMode: true,
                        addingToExistingBooking: true,
                        isGroupOrder: true, // Flag to indicate this is from group order setup
                      },
                    });
                  }}
                />
              </div>
            </div>

            <div className=" border border-gray-200 rounded-lg p-4 md:p-6">
              {/* Basic Order Information Form */}
              <div className="w-full max-w-full overflow-x-hidden">
                <div className="bg-white rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Information
                  </h3>
                  <BookingForm
                    formData={
                      state.orderInfo || {
                        location: "",
                        orderName: "",
                        date: "",
                        deliveryWindow: "",
                        headcount: 1,
                        primaryContactName: "",
                        primaryContactPhone: "",
                        primaryContactEmail: "",
                        hasBackupContact: false,
                        backupContactName: "",
                        backupContactPhone: "",
                        backupContactEmail: "",
                        additionalNotes: "",
                        clientCompany: "",
                      }
                    }
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                      const { name, value, type } = target;
                      const newValue = type === "checkbox" ? (target as HTMLInputElement).checked : value;
                      setOrderInfo({
                        ...state.orderInfo,
                        [name]: newValue,
                      });
                    }}
                    selectedServices={state.selectedServices}
                    isInvoiceMode={false}
                    onLocationSelected={handleLocationSelected}
                    eventLocationData={eventLocationData}
                  />
                </div>
              </div>
              <div className="w-full max-w-full overflow-x-hidden">
                <div className="border border-gray-200 rounded-lg p-4 md:p-6 mt-4">
                  <OrderSetupForm />
                  {state.orderType && (
                    <>
                      <div className="w-full max-w-full overflow-x-hidden">
                        <div className="bg-white mt-4 rounded-xl shadow-sm">
                          <InvitedGuestsList
                            invitedGuests={state.invitedGuests.map((email) => ({
                              email,
                            }))}
                            onRemoveGuest={handleRemoveGuest}
                            onAddGuest={handleAddGuest}
                          />
                        </div>
                      </div>

                      <div className="w-full max-w-full overflow-x-hidden">
                        <AdditionalNotes
                          value={state.additionalNotes}
                          onChange={setAdditionalNotes}
                        />
                      </div>

                      <div className="w-full max-w-full overflow-x-hidden">
                        <div className="bg-white py-4 rounded-xl shadow-sm">
                          <PaymentSettings
                            paymentMethod={state.paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                          />
                        </div>
                      </div>

                      <div className="w-full max-w-full overflow-x-hidden">
                        <CreateOrderButton
                          isGroupOrder={state.orderType}
                          onClick={handleCreateGroupOrder}
                          isLoading={isCreatingOrder}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default GroupOrderSetup;
