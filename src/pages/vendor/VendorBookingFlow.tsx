import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Dashboard from "@/components/dashboard/Dashboard";
import OrderTypeHeader from "@/components/group-order/OrderTypeHeader";
import BookingVendorCard from "@/components/booking/BookingVendorCard";
import BookingForm from "@/components/booking/BookingForm";
import BookingActions from "@/components/booking/BookingActions";
import AdditionalServices from "@/components/booking/AdditionalServices";
import { EnhancedCartManagement } from "@/components/cart/EnhancedCartManagement";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import AdminCustomAdjustments from "@/components/booking/admin/AdminCustomAdjustments";

import { useInvoice } from "@/contexts/InvoiceContext";
import { useCart } from "@/contexts/CartContext";
import AdminProposalActions from "@/components/booking/proposal/AdminProposalActions";
import { useAuth } from "@/contexts/auth";
import { getServiceTypeLabel } from "@/utils/service-utils";
import { processService } from "@/utils/service-item-processor";
import { saveBookingStateBackup } from "@/utils/booking-state-persistence";
import invoiceService from "@/services/api/admin/invoice.service";
import { toast } from "sonner";
import VendorDashboard from "@/components/vendor/dashboard/VendorDashboard";
import { useServiceDistances } from "@/hooks/use-service-distances";
import { getServiceAddress } from "@/utils/delivery-calculations";
import { LocationData } from "@/components/shared/address/types";
import { calculateDeliveryFee } from "@/utils/delivery-calculations";
import { calculateCateringPrice, extractCateringItems } from "@/utils/catering-price-calculation";

function VendorBookingFlow() {
  const navigate = useNavigate();
  const { isInvoiceMode, setInvoiceMode } = useInvoice();
  const { userRole } = useAuth();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [eventLocationData, setEventLocationData] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem('eventLocationData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ENTERPRISE: All state now centralized in useBookingFlow hook
  const {
    isGroupOrder,
    formData,
    selectedServices,
    selectedItems,
    isLoadingEdit, // Loading state for edit flow
    // Admin state (now from hook)
    customAdjustments,
    setCustomAdjustments,
    isTaxExempt,
    setIsTaxExempt,
    isServiceFeeWaived,
    setIsServiceFeeWaived,
    adminNotes,
    setAdminNotes,
    // Actions
    handleChange,
    handleOrderTypeChange: originalHandleOrderTypeChange,
    handleQuantityChange,
    handleDurationChange,
    handleUpdateServiceQuantity,
    handleUpdateServiceDuration,
    handleItemQuantityChange,
    handleAddService,
    handleRemoveService,
    handleSubmit,
    handleServiceStyleChange,
    loadDraftData,
    setSelectedServices,
  } = useBookingFlow();

  // Admin-specific handler to navigate to admin marketplace with state
  const handleAddAdditionalService = useCallback(() => {
    // Save current state before navigating
    try {
      saveBookingStateBackup(selectedServices, selectedItems, formData);
    } catch (error) {
      console.warn(
        "[AdminBookingFlow] Failed to save state before navigation:",
        error
      );
    }

    navigate("/vendor/new-proposal", {
      state: {
        addingAdditionalService: true,
        currentServices: selectedServices,
        addingToExistingBooking: true,
        currentBookingServices: selectedServices,
        selectedItems: selectedItems,
        formData,
        bookingMode: true,
        isGroupOrder: false,
        returnRoute: "/vendor/booking",
      },
    });
  }, [selectedServices, selectedItems, formData, navigate]);

  // Handle invoice creation for regular bookings
  const handleCreateInvoice = async (bookingData: any) => {
    try {
      // Try multiple possible company name fields
      const companyName = formData?.clientCompany || 
                         (formData as any)?.companyName || 
                         (formData as any)?.company || 
                         (formData as any)?.organizationName || 
                         '';
      
      const invoiceData = {
        eventName: formData?.orderName || "Booking Event",
        companyName: companyName,
        eventLocation: formData?.location || "",
        eventDate: formData?.date || "",
        serviceTime: formData?.deliveryWindow || "",
        guestCount: formData?.headcount || 1,
        contactName: formData?.primaryContactName || "",
        phoneNumber: formData?.primaryContactPhone || "",
        emailAddress: formData?.primaryContactEmail || "",
        addBackupContact: false,
        additionalNotes: adminNotes || "",
        taxExemptStatus: isTaxExempt,
        waiveServiceFee: isServiceFeeWaived,
        adminOverrideNotes: adminNotes || "",
        budgetPerPerson: 0,
        budget: 0,
        selectItem: "",
        quantity: 1,
        orderDeadline: formData?.date || "",
        inviteFriends: [],
        paymentSettings: "credit_card",
        services: selectedServices.map((service) => ({
          serviceType: service.serviceType || service.type || "",
          serviceName: service.serviceName || service.name || "",
          vendorId: (service as any).vendor_id || (service as any).vendorId || "",
          totalPrice: parseFloat(
            String(service.servicePrice || service.price || "0")
          ),
          priceType: "fixed",
          cateringItems: Object.entries(selectedItems)
            .filter(([itemId, quantity]) => quantity && quantity > 0)
            .map(([itemId, quantity]) => ({
              menuName: "Selected Items",
              menuItemName: itemId,
              price: 0,
              quantity: quantity,
              totalPrice: 0,
              cateringId: itemId,
            })),
        })),
        customLineItems: customAdjustments.map((adj) => ({
          label: adj.label || "",
          type: adj.type || "fixed",
          mode: adj.mode || "add",
          value: adj.value || 0,
          taxable: adj.taxable || false,
          statusForDrafting: true,
        })),
      };

      await invoiceService.createInvoice(invoiceData);
      clearCart(true);
      return true;
    } catch (error) {
      console.error("Invoice creation failed:", error);
      return false;
    }
  };

  // Override handleOrderTypeChange to use admin-specific route
  const handleOrderTypeChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Navigate to admin-specific group order setup route
        navigate("/vendor/group-order/setup", {
          state: {
            selectedServices,
            selectedItems,
            formData,
          },
        });
      } else {
        // If toggling off, use the original handler
        originalHandleOrderTypeChange(checked);
      }
    },
    [
      navigate,
      selectedServices,
      selectedItems,
      formData,
      originalHandleOrderTypeChange,
    ]
  );

  // ENTERPRISE: Unified invoice mode initialization (KISS - single effect, single priority order)
  // Use ref to track if initialization has been done to prevent infinite loops
  const initDoneRef = useRef(false);
  const mode = searchParams.get("mode");

  useEffect(() => {
    // Prevent re-running if already initialized
    if (initDoneRef.current) {
      return;
    }

    if (import.meta.env.DEV) {
      // Log storage size for monitoring
      try {
        const storageSize =
          JSON.stringify(localStorage).length +
          JSON.stringify(sessionStorage).length;
      } catch (e) {}
    }

    // Priority order: URL parameter > sessionStorage restore > admin auto-enable

    // Priority 1: URL parameter (highest priority)
    if (mode === "invoice") {
      if (!isInvoiceMode) {
        // GUARD: Only set if not already true

        setInvoiceMode(true);
      }
      initDoneRef.current = true;
      return; // Exit early - URL param takes precedence
    }

    // Priority 2: Restore from sessionStorage
    try {
      const invoiceDataStr = sessionStorage.getItem("invoiceData");
      if (invoiceDataStr) {
        const invoiceData = JSON.parse(invoiceDataStr);

        if (loadDraftData && invoiceData) {
          loadDraftData({
            selected_services: invoiceData.selectedServices || [],
            selected_items: invoiceData.selectedItems || {},
            form_data: invoiceData.formData || {},
            custom_adjustments: invoiceData.customAdjustments || [],
          });
        }

        if (!isInvoiceMode) {
          // GUARD: Only set if not already true
          console.info(
            "[BookingFlow] 📝 Enabling invoice mode from sessionStorage"
          );
          setInvoiceMode(true);
        }
        sessionStorage.removeItem("invoiceData");
        console.info(
          "[BookingFlow] ✅ Invoice data restored from sessionStorage"
        );
        initDoneRef.current = true;
        return; // Exit early - sessionStorage restoration takes precedence over admin auto-enable
      }
    } catch (error) {
      console.error("[BookingFlow] ❌ Failed to restore invoice data:", error);
      sessionStorage.removeItem("invoiceData");
    }

    // Priority 3: Auto-enable for admins (lowest priority, only if no URL param or sessionStorage)
    if (userRole === "admin" || userRole === "super-admin") {
      if (!isInvoiceMode) {
        // GUARD: Only set if not already true

        setInvoiceMode(true);
      }
    }

    initDoneRef.current = true;
  }, [mode, userRole, setInvoiceMode, isInvoiceMode, loadDraftData]); // Use mode value instead of searchParams object

  // Phase 1: Memoize getProcessedService for stable function reference
  const getProcessedService = useCallback((rawService: any) => {
    if (import.meta.env.DEV) {
      console.log(
        "[BookingFlow] 🔄 Processing service:",
        rawService.id || rawService.serviceId
      );
    }
    return processService(rawService);
  }, []); // No dependencies - processService is pure

  const handleChangeService = useCallback((serviceIndex: number) => {
    return () => {
      navigate("/vendor/new-proposal", {
        state: {
          changingService: true,
          serviceIndex: serviceIndex,
          currentServices: selectedServices,
          selectedItems: selectedItems,
          formData: formData,
          bookingMode: true,
          addingToExistingBooking: true,
          replaceService: true,
        },
      });
    };
  }, [navigate, selectedServices, selectedItems, formData]);

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

  // NEW: Handle combo selection properly by updating service state
  const handleComboSelection = useCallback(
    (payload: any) => {
      if (payload && "serviceId" in payload && "selections" in payload) {
        const { serviceId, selections } = payload;

        console.log("[BookingFlow] ✅ Combo selected:", {
          serviceId,
          comboName: selections.comboName,
          totalPrice: selections.totalPrice,
        });

        // Update the service by adding combo to comboSelectionsList
        setSelectedServices((prevServices) =>
          prevServices.map((service) => {
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
          })
        );
      } else {
        // Legacy format fallback
        console.warn("[BookingFlow] Legacy combo format used");
        const comboItemId = `combo_${payload.comboItemId}_${Date.now()}`;
        handleItemQuantityChange(comboItemId, 1);
      }
    },
    [setSelectedServices, handleItemQuantityChange]
  );

  const handleDeliveryRangeSelect = useCallback(
    (serviceIndex: number, range: { range: string; fee: number }) => {
      const service = selectedServices[serviceIndex];
      const serviceId = service?.id || service?.serviceId || `service-${serviceIndex}`;

      setServiceDeliveryFees((prev) => {
        // Skip if fee is already set for this service with same range
        if (prev[serviceId]?.range === range.range && prev[serviceId]?.fee === range.fee) {
          return prev;
        }

        const updated = {
          ...prev,
          [serviceId]: range,
        };
        // Persist to localStorage
        try {
          localStorage.setItem('serviceDeliveryFees', JSON.stringify(updated));
        } catch (error) {
          console.warn('[DeliveryFee] Failed to persist to localStorage:', error);
        }
        return updated;
      });

      toast.success(`Delivery fee of $${range.fee} automatically applied for ${range.range}`);
    },
    [selectedServices]
  );

  const getActiveTab = () => {
    if (userRole === "admin" || userRole === "super-admin") {
      return isInvoiceMode ? "invoices" : "vendors";
    }
    return "vendors";
  };

  const dashboardUserRole =
    userRole === "admin" || userRole === "super-admin" ? "admin" : "event-host";

  // Calculate distances for all services using useServiceDistances hook
  const destinationCoordinates = eventLocationData?.coordinates 
    ? { lat: eventLocationData.coordinates.lat, lng: eventLocationData.coordinates.lng }
    : null;
  
  // Enhance services with vendor addresses and coordinates for distance calculation
  const servicesWithAddresses = useMemo(() => {
    return selectedServices.map(service => {
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
  }, [selectedServices]);

  const { distancesByService, loading: distancesLoading } = useServiceDistances(
    servicesWithAddresses,
    formData.location || null,
    destinationCoordinates
  );

  // Auto-calculate delivery fees when distances are available
  // Use ref to avoid infinite loop (serviceDeliveryFees would cause re-trigger if in deps)
  const serviceDeliveryFeesRef = useRef(serviceDeliveryFees);
  serviceDeliveryFeesRef.current = serviceDeliveryFees;

  useEffect(() => {
    if (Object.keys(distancesByService).length === 0 || !formData.location) {
      return;
    }

    selectedServices.forEach((service) => {
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
          formData.location,
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
                console.warn('[VendorBookingFlow] Failed to persist delivery fees:', error);
              }
              return updated;
            });
          }
        }
      }
    });
  }, [distancesByService, formData.location, selectedServices]);

  // Handler for location selection to store coordinates
  const handleLocationSelected = useCallback((address: string, locationData?: LocationData) => {
    if (locationData) {
      setEventLocationData(locationData);
      // Persist to localStorage to survive page reloads
      try {
        localStorage.setItem('eventLocationData', JSON.stringify(locationData));
      } catch (error) {
        console.warn('[VendorBookingFlow] Failed to persist location data:', error);
      }
      console.log('[VendorBookingFlow] Location selected with coordinates:', locationData);
    }
  }, []);

  // Phase 2: Extract vendor cards mapping to stable top-level useMemo
  const vendorCards = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log(
        "[BookingFlow] 🔄 Processing services array, count:",
        selectedServices.length
      );
    }

    return selectedServices.map((service, index) => {
      const processedService = getProcessedService(service);

      // Safety guard: Skip rendering if service data is malformed
      if (!processedService || !processedService.rawData) {
        console.warn(
          "[BookingFlow] ⚠️ Skipping malformed service at index",
          index
        );
        return null;
      }

      const serviceId = service.id || service.serviceId || `service-${index}`;
      const calculatedDistance = distancesByService[serviceId] || null;
      const preselectedDeliveryFee = serviceDeliveryFees[serviceId] || null;

      return (
        <div
          key={serviceId}
          className="w-full max-w-full overflow-x-hidden"
        >
          <BookingVendorCard
            vendorImage={processedService.image}
            vendorName={processedService.name}
            vendorType={getServiceTypeLabel(processedService.serviceType)}
            vendorPrice={processedService.priceDisplay}
            serviceDetails={processedService.rawData}
            selectedItems={selectedItems}
            onItemQuantityChange={handleItemQuantityChange}
            onComboSelection={handleComboSelection}
            onRemoveService={() => handleRemoveService(index)}
            canRemove={Boolean(true)}
            serviceIndex={index}
            quantity={service?.quantity || 1}
            onQuantityChange={(quantity) =>
              handleUpdateServiceQuantity(index, quantity)
            }
            onChangeService={handleChangeService(index)}
            onDeliveryRangeSelect={handleDeliveryRangeSelect}
            calculatedDistance={calculatedDistance || undefined}
            preselectedDeliveryFee={preselectedDeliveryFee || undefined}
            guestCount={formData?.headcount || 1}
          />
        </div>
      );
    });
  }, [
    selectedServices,
    selectedItems,
    handleItemQuantityChange,
    handleRemoveService,
    handleUpdateServiceQuantity,
    getProcessedService,
    handleChangeService,
    handleDeliveryRangeSelect,
    serviceDeliveryFees,
    distancesByService,
    formData.location,
  ]);

  // Show loading indicator while loading invoice for edit
  if (isLoadingEdit) {
    return (
      <Dashboard userRole={dashboardUserRole} activeTab={getActiveTab()}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">
              Loading invoice data...
            </p>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <ErrorBoundary
      fallbackTitle="Booking Flow Error"
      fallbackMessage="There was an error with the booking flow. Please refresh and try again."
    >
       <VendorDashboard activeTab="dashboard">
        <div className="w-full max-w-full overflow-x-hidden">
          {/* Invoice Mode Indicator */}
          {isInvoiceMode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Invoice Creation Mode</span>
                <span className="text-sm">- Creating invoice for client</span>
              </div>
              {(userRole === "admin" || userRole === "super-admin") && (
                <AdminProposalActions
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  formData={formData}
                />
              )}
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 box-border overflow-x-hidden">
            <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
              <div className="w-full max-w-full overflow-x-hidden">
                <EnhancedCartManagement
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  formData={formData}
                  onLoadDraft={handleLoadDraft}
                />
              </div>

              <div className="w-full max-w-full overflow-x-hidden">
                <OrderTypeHeader
                  isGroupOrder={isGroupOrder}
                  onOrderTypeChange={handleOrderTypeChange}
                  isInvoiceMode={isInvoiceMode}
                />
              </div>

              <div className="h-px w-full bg-border"></div>

              <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
                {vendorCards}
              </div>

              <div className="w-full max-w-full overflow-x-hidden">
                <AdditionalServices
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  customAdjustments={customAdjustments}
                  onAddService={handleAddAdditionalService}
                  isTaxExempt={isTaxExempt}
                  isServiceFeeWaived={isServiceFeeWaived}
                  serviceDeliveryFees={serviceDeliveryFees}
                  serviceDistances={distancesByService}
                  guestCount={formData?.headcount || 1}
                />
              </div>

              <div className="w-full max-w-full overflow-x-hidden">
                <BookingForm
                  formData={formData}
                  onChange={handleChange}
                  onServiceStyleChange={handleServiceStyleChange}
                  selectedServices={selectedServices}
                  isInvoiceMode={isInvoiceMode}
                  onLocationSelected={handleLocationSelected}
                  eventLocationData={eventLocationData}
                />
              </div>

              {/* Admin-only: Tax & Fee Controls Panel */}
              {(userRole === "admin" ||
                userRole === "super-admin" ||
                userRole === "super_admin") && (
                <div className="w-full max-w-full overflow-x-hidden">
                  <AdminCustomAdjustments
                    selectedServices={selectedServices}
                    selectedItems={selectedItems}
                    formData={formData}
                    draftId={draftId}
                    adjustments={customAdjustments}
                    onChange={setCustomAdjustments}
                    isTaxExempt={isTaxExempt}
                    isServiceFeeWaived={isServiceFeeWaived}
                    adminNotes={adminNotes}
                    onTaxExemptChange={setIsTaxExempt}
                    onServiceFeeWaivedChange={setIsServiceFeeWaived}
                    onAdminNotesChange={setAdminNotes}
                  />
                </div>
              )}

              <div className="w-full max-w-full overflow-x-hidden">
                <BookingActions
                  isGroupOrder={isGroupOrder}
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Validate minimum guests and minimum order amount for catering services
                    const guestCount = formData?.headcount || 1;
                    for (const service of selectedServices) {
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
                            selectedItems,
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

                          console.log('[VendorBookingFlow] Minimum order amount validation:', {
                            serviceName,
                            serviceTotal,
                            minimumOrderAmount,
                            guestCount,
                            minimumGuests
                          });

                          // Validate minimum order amount
                          if (serviceTotal < minimumOrderAmount) {
                            toast.error(`Minimum order amount not met`, {
                              description: `${serviceName} requires a minimum order of $${minimumOrderAmount.toFixed(2)}. Your current total is $${serviceTotal.toFixed(2)}.`,
                              duration: 5000
                            });
                            return;
                          }
                        }
                      }
                    }

                    setIsSubmitting(true);

                    try {
                      // Helper function to map services with their items
                      const mapServiceWithItems = (service: any, index: number) => {
                        const serviceId = service.id || service.serviceId || "";
                        const serviceType = (
                          service.serviceType ||
                          service.type ||
                          ""
                        ).toLowerCase();
                        const details = service.service_details || {};
                        
                        // Get delivery fee for this service
                        const deliveryFee = serviceDeliveryFees[serviceId] || null;

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
                                            details?.image ||
                                            details?.serviceImage ||
                                            details?.venueImage ||
                                            "";
                          
                          // Extract vendor information
                          const venueVendor = typeof service.vendor === 'object' && service.vendor !== null 
                            ? service.vendor as any 
                            : (service.service_details?.vendor || null);
                          
                          // Always include price and quantity, even if quantity is 1
                          return {
                            serviceType: "venues",
                            serviceName: service.serviceName || service.name || "",
                            vendorId: service.vendor_id || service.vendorId || "",
                            price: price,
                            quantity: quantity,
                            totalPrice: price * quantity,
                            priceType: service.priceType || service.price_type || "flat",
                            image: venueImage,
                            vendor: venueVendor ? {
                              id: venueVendor.id || service.vendor_id,
                              name: venueVendor.name || venueVendor.business_name || venueVendor.vendorName,
                              address: venueVendor.full_address || venueVendor.address || venueVendor.street_address,
                              city: venueVendor.city,
                              state: venueVendor.state,
                              zipCode: venueVendor.zip_code || venueVendor.zipCode,
                              phone: venueVendor.phone || venueVendor.phone_number,
                              email: venueVendor.email
                            } : undefined,
                          };
                        }

                        // For non-catering services (venues, party_rentals, events_staff), skip item processing
                        // They should only send price, quantity, and totalPrice at service level
                        if (
                          serviceType === "party-rental" ||
                          serviceType === "party-rentals" ||
                          serviceType === "party_rentals" ||
                          serviceType === "staff" ||
                          serviceType === "events_staff"
                        ) {
                          // Normalize service type
                          let normalizedServiceType = serviceType;
                          if (serviceType === "party-rental" || serviceType === "party-rentals" || serviceType === "party_rentals") {
                            normalizedServiceType = "party_rentals";
                          } else if (serviceType === "staff" || serviceType === "events_staff") {
                            normalizedServiceType = "events_staff";
                          }

                          // Get quantity - always ensure it's at least 1
                          let quantity = service.quantity || 
                                       service.serviceQuantity || 
                                       (service as any).qty || 
                                       1;
                          
                          // Get base price - try multiple sources
                          let basePrice = parseFloat(String(service.servicePrice || service.price || "0"));
                          
                          // Get existing totalPrice if available
                          const existingTotalPrice = parseFloat(String(service.totalPrice || service.serviceTotalPrice || service.total || "0"));
                          
                          // If basePrice is 0 or not found, try to derive from totalPrice
                          if ((basePrice === 0 || isNaN(basePrice)) && existingTotalPrice > 0) {
                            // If we have totalPrice but no basePrice, derive basePrice from totalPrice / quantity
                            if (quantity > 0) {
                              basePrice = existingTotalPrice / quantity;
                            } else {
                              // If quantity is also missing, assume quantity is 1 and use totalPrice as basePrice
                              quantity = 1;
                              basePrice = existingTotalPrice;
                            }
                          }
                          
                          // If we still don't have a valid basePrice, ensure we have at least 0
                          if (isNaN(basePrice) || basePrice < 0) {
                            basePrice = 0;
                          }
                          
                          // Ensure quantity is at least 1
                          if (!quantity || quantity < 1) {
                            quantity = 1;
                          }
                          
                          // Calculate totalPrice (use existing if we derived price from it, otherwise calculate)
                          const totalPrice = existingTotalPrice > 0 && basePrice === existingTotalPrice 
                            ? existingTotalPrice 
                            : basePrice * quantity;

                          // Extract image from service
                          const serviceImage = service.image || 
                                            service.serviceImage || 
                                            service.vendorImage || 
                                            service.coverImage ||
                                            service.imageUrl ||
                                            service.image_url ||
                                            (service.service_details?.image) ||
                                            (service.service_details?.serviceImage) ||
                                            "";

                          // Extract vendor information
                          const nonCateringVendor = typeof service.vendor === 'object' && service.vendor !== null 
                            ? service.vendor as any 
                            : (service.service_details?.vendor || null);
                          
                          // Always include price and quantity, even if quantity is 1
                          // Ensure price and quantity are always numbers (not undefined/null)
                          const finalPrice = isNaN(basePrice) ? 0 : basePrice;
                          const finalQuantity = isNaN(quantity) || quantity < 1 ? 1 : quantity;
                          const finalTotalPrice = isNaN(totalPrice) ? finalPrice * finalQuantity : totalPrice;
                          
                          return {
                            serviceType: normalizedServiceType,
                            serviceName: service.serviceName || service.name || "",
                            vendorId: service.vendor_id || service.vendorId || "",
                            price: finalPrice,
                            quantity: finalQuantity,
                            totalPrice: finalTotalPrice,
                            priceType: service.priceType || service.price_type || "flat",
                            image: serviceImage,
                            vendor: nonCateringVendor ? {
                              id: nonCateringVendor.id || service.vendor_id,
                              name: nonCateringVendor.name || nonCateringVendor.business_name || nonCateringVendor.vendorName,
                              address: nonCateringVendor.full_address || nonCateringVendor.address || nonCateringVendor.street_address,
                              city: nonCateringVendor.city,
                              state: nonCateringVendor.state,
                              zipCode: nonCateringVendor.zip_code || nonCateringVendor.zipCode,
                              phone: nonCateringVendor.phone || nonCateringVendor.phone_number,
                              email: nonCateringVendor.email
                            } : undefined,
                          };
                        }

                        // Only catering services process items
                        // Get all available items for this service
                        let availableItems: any[] = [];
                        if (serviceType === "catering") {
                          availableItems =
                            details.menuItems ||
                            details.catering?.menuItems ||
                            details.menu?.items ||
                            details.menu?.menu_items ||
                            details.items ||
                            details.menu_items ||
                            details.menu ||
                            [];
                          // Add combo items if they exist
                          if (
                            details.catering?.combos &&
                            Array.isArray(details.catering.combos)
                          ) {
                            availableItems = [
                              ...availableItems,
                              ...details.catering.combos,
                            ];
                          }
                        } else if (
                          serviceType === "party-rental" ||
                          serviceType === "party-rentals"
                        ) {
                          availableItems =
                            details.rentalItems ||
                            details.rental?.items ||
                            details.rental_items ||
                            details.items ||
                            [];
                        } else if (
                          serviceType === "staff" ||
                          serviceType === "events_staff"
                        ) {
                          availableItems =
                            details.staffServices ||
                            details.services ||
                            details.staff?.services ||
                            [];
                        }

                        // Filter selectedItems that belong to this service
                        const serviceItems: any[] = [];
                        Object.entries(selectedItems).forEach(
                          ([itemId, quantity]) => {
                            // Ensure quantity is a valid number, default to 1 if missing
                            const validQuantity = quantity && typeof quantity === 'number' ? quantity : (quantity || 1);
                            // Skip items with zero or negative quantity (but allow 1 and above)
                            if (!validQuantity || validQuantity < 1) {
                              return;
                            }

                            // Check if this is a combo category item (format: comboId_categoryId_itemId)
                            if (itemId.includes('_') && itemId.split('_').length >= 3) {
                              const parts = itemId.split('_');
                              const comboId = parts[0];
                              const categoryId = parts[1];
                              const actualItemId = parts[2];
                              
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
                              
                              // Get item details or use fallback
                              const itemName = categoryItem?.name || categoryItem?.itemName || actualItemId;
                              const itemPrice = parseFloat(String(categoryItem?.price || 0));
                              const upchargePrice = parseFloat(String(categoryItem?.additionalCharge || categoryItem?.upcharge || 0));
                              const isUuidLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actualItemId);

                              // Skip dummy/placeholder combo category entries (UUID id, no matched item, zero price)
                              if (!categoryItem && isUuidLikeId && itemPrice <= 0) {
                                return;
                              }
                              
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

                              // Skip items with zero price (unless quantity is valid)
                              if (itemPrice === 0 && validQuantity > 0) {
                                // Still include if quantity > 0, as price might be 0 intentionally
                                // But ensure we're using the actual price from item data
                              }

                              if (serviceType === "catering") {
                                const resolvedItemName =
                                  item.name ||
                                  item.menuItemName ||
                                  item.itemName ||
                                  item.title ||
                                  "";
                                const isUuidLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemId);

                                // Skip dummy/placeholder selected items (UUID id, no display name, zero price)
                                if (!resolvedItemName && isUuidLikeId && itemPrice <= 0) {
                                  return;
                                }

                                // Extract image from item
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
                                    resolvedItemName ||
                                    itemId,
                                  price: itemPrice,
                                  quantity: validQuantity,
                                  totalPrice: itemPrice * validQuantity,
                                  cateringId: item.id || item.cateringId || itemId,
                                  serviceId: serviceId,
                                  image: itemImage,
                                });
                              }
                              // Note: party-rental and events_staff are now handled earlier and return early
                            }
                          }
                        );

                        // Also include combo selections if they exist
                        if (serviceType === "catering" && service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
                          // Get combo items from multiple possible locations
                          const comboItemsFromDetails = details.catering?.combos || [];
                          // availableItems already includes combos, so check there too
                          
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

                              // Only include combo when there is actual user selection.
                              // Prevent auto-adding combos with implicit default quantity.
                              const directQuantity = selectedItems[finalComboItemId];
                              const prefixedQuantity = selectedItems[`${serviceId}_${finalComboItemId}`];
                              const hasSelectedCategoryItems =
                                Array.isArray(combo.selections) &&
                                combo.selections.some(
                                  (category: any) =>
                                    Array.isArray(category.selectedItems) &&
                                    category.selectedItems.some((item: any) => (item.quantity || 0) > 0)
                                );

                              if (proteinQuantity === 0) {
                                proteinQuantity = directQuantity || prefixedQuantity || 0;
                              }

                              // Skip combo entirely when nothing was explicitly selected
                              if (!hasSelectedCategoryItems && proteinQuantity <= 0) {
                                return;
                              }

                              // If selected but protein quantity is unavailable, keep safe minimum of 1
                              const effectiveProteinQuantity = proteinQuantity > 0 ? proteinQuantity : 1;

                              // Get guest count for sides/toppings upcharges
                              const guestCount = parseInt(String(formData?.headcount || '1')) || 1;

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
                                console.log('[VendorBookingFlow] Combo pricing calculation:', {
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
                                            (service.service_details?.image) ||
                                            (service.service_details?.serviceImage) ||
                                            "";

                        // Extract vendor information
                        const vendor = typeof service.vendor === 'object' && service.vendor !== null 
                          ? service.vendor as any 
                          : (service.service_details?.vendor || null);
                        
                        const mappedService: any = {
                          serviceType: normalizedServiceType,
                          serviceName: service.serviceName || service.name || "",
                          vendorId: service.vendor_id || service.vendorId || "",
                          totalPrice: calculatedTotal,
                          priceType: service.priceType || service.price_type || "flat",
                          image: serviceImage,
                          // Include full vendor data for delivery calculations and vendor info
                          vendor: vendor ? {
                            id: vendor.id || service.vendor_id,
                            name: vendor.name || vendor.business_name || vendor.vendorName,
                            address: vendor.full_address || vendor.address || vendor.street_address,
                            city: vendor.city,
                            state: vendor.state,
                            zipCode: vendor.zip_code || vendor.zipCode,
                            phone: vendor.phone || vendor.phone_number,
                            email: vendor.email
                          } : undefined,
                        };

                        // Add items based on service type
                        // Only catering services should include arrays
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
                            console.log('[VendorBookingFlow] Delivery ranges for service:', {
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
                              selectedItems,
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

                            const guestCount = parseInt(String(formData?.headcount || '1')) || 1;

                            const cateringCalcResult = calculateCateringPrice(
                              basePricePerPerson,
                              additionalCharges,
                              guestCount,
                              comboCategoryItems
                            );

                            // Update totalPrice to use the calculated catering service total
                            mappedService.totalPrice = cateringCalcResult.finalTotal;

                            if (import.meta.env.DEV) {
                              console.log('[VendorBookingFlow] Catering service total calculation:', {
                                serviceName: service.serviceName || service.name,
                                basePricePerPerson,
                                guestCount,
                                basePriceTotal: cateringCalcResult.basePriceTotal,
                                additionalChargesTotal: cateringCalcResult.additionalChargesTotal,
                                totalPrice: cateringCalcResult.finalTotal
                              });
                            }
                          }
                        }
                        // Note: Non-catering services (venues, party_rentals, events_staff)
                        // are handled earlier and return early with price, quantity, totalPrice only

                        return mappedService;
                      };

                      // Try multiple possible company name fields
                      // Check both 'company' (regular booking) and 'clientCompany' (invoice mode)
                      const companyName = (formData as any)?.company || 
                                         formData?.clientCompany || 
                                         (formData as any)?.companyName || 
                                         (formData as any)?.organizationName || 
                                         '';
                      
                      // Debug logging
                      console.log('🔍 [AdminBookingFlow] Company name fields:', {
                        company: (formData as any)?.company,
                        clientCompany: formData?.clientCompany,
                        companyName: (formData as any)?.companyName,
                        organizationName: (formData as any)?.organizationName,
                        finalCompanyName: companyName
                      });
                      
                      // Build base invoice data
                      const baseInvoiceData: any = {
                        eventName: formData?.orderName || "Booking Event",
                        companyName: companyName,
                        eventLocation: formData?.location || "",
                        eventDate: formData?.date || "",
                        serviceTime: formData?.deliveryWindow || "",
                        guestCount: formData?.headcount || 1,
                        contactName: formData?.primaryContactName || "",
                        phoneNumber: formData?.primaryContactPhone || "",
                        emailAddress: formData?.primaryContactEmail || "",
                        additionalNotes: adminNotes || "",
                        services: selectedServices.map((service, index) => mapServiceWithItems(service, index)),
                      };

                      // Conditionally add fields based on isGroupOrder
                      let invoiceData: any;
                      if (isGroupOrder) {
                        // Group Order payload (second payload structure)
                        invoiceData = {
                          ...baseInvoiceData,
                          budgetPerPerson:
                            (formData as any)?.budgetPerPerson || 0,
                          budget: (formData as any)?.budget || 0,
                          selectItem:
                            (formData as any)?.selectItem ||
                            selectedServices[0]?.serviceName ||
                            selectedServices[0]?.name ||
                            "catering",
                          quantity:
                            (formData as any)?.quantity ||
                            formData?.headcount ||
                            1,
                          orderDeadline:
                            (formData as any)?.orderDeadline ||
                            formData?.date ||
                            "",
                          inviteFriends: (formData as any)?.inviteFriends || [],
                          paymentSettings:
                            (formData as any)?.paymentSettings ||
                            "host_pays_everything",
                        };
                      } else {
                        // Regular booking payload (first payload structure)
                        invoiceData = {
                          ...baseInvoiceData,
                          addBackupContact: formData?.hasBackupContact || false,
                          taxExemptStatus: isTaxExempt,
                          waiveServiceFee: isServiceFeeWaived,
                          customLineItems: customAdjustments.map((adj) => ({
                            label: adj.label || "",
                            type: adj.type || "fixed",
                            mode: adj.mode || "surcharge",
                            value: adj.value || 0,
                            taxable: adj.taxable || false,
                            statusForDrafting: (adj as any).statusForDrafting || false,
                          })),
                        };
                      }

                    //    console.log(JSON.stringify(invoiceData))

                      const response = await invoiceService.createInvoice(invoiceData);
                      const invoiceId = response?.data?.invoice?.id || response?.data?.id;
                      clearCart(true);
                      setServiceDeliveryFees({}); // Clear delivery fees on successful submission
                      // Clear from localStorage
                      try {
                        localStorage.removeItem('serviceDeliveryFees');
                        localStorage.removeItem('eventLocationData');
                      } catch (error) {
                        console.warn('[VendorBookingFlow] Failed to clear localStorage:', error);
                      }
                      toast.success(
                        "Invoice created successfully"
                      );
                      if (invoiceId) {
                        navigate(`/vendor/order-summary/${invoiceId}`);
                      }
                    } catch (error) {
                      console.error("Invoice creation failed:", error);
                      toast.error("Failed to create invoice");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  isInvoiceMode={isInvoiceMode}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </VendorDashboard>
    </ErrorBoundary>
  );
}

export default VendorBookingFlow;
