import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Dashboard from "@/components/dashboard/Dashboard";
import OrderTypeHeader from "@/components/group-order/OrderTypeHeader";
import BookingVendorCard from "@/components/booking/BookingVendorCard";
import BookingForm from "@/components/booking/BookingForm";
import { Button } from "@/components/ui/button";
import AdditionalServices from "@/components/booking/AdditionalServices";
import AddServiceButton from "@/components/booking/order-summary/AddServiceButton";
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
import AdminTaxAndFeeControls from "@/components/booking/admin/AdminTaxAndFeeControls";
import { useServiceDistances } from "@/hooks/use-service-distances";
import { getServiceAddress } from "@/utils/delivery-calculations";
import { LocationData } from "@/components/shared/address/types";
import { calculateDeliveryFee } from "@/utils/delivery-calculations";
import {
  calculateCateringPrice,
  extractCateringItems,
} from "@/utils/catering-price-calculation";

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
  const [serviceDeliveryFees, setServiceDeliveryFees] = useState<
    Record<string, { range: string; fee: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("serviceDeliveryFees");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [eventLocationData, setEventLocationData] =
    useState<LocationData | null>(() => {
      try {
        const saved = localStorage.getItem("eventLocationData");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const {
    isGroupOrder,
    formData,
    selectedServices,
    selectedItems,
    isLoadingEdit,
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

  const handleAddAdditionalService = useCallback(() => {
    try {
      saveBookingStateBackup(selectedServices, selectedItems, formData);
    } catch (error) {
      console.warn(
        "[AdminBookingFlow] Failed to save state before navigation:",
        error,
      );
    }

    navigate("/admin/marketplace", {
      state: {
        addingAdditionalService: true,
        currentServices: selectedServices,
        addingToExistingBooking: true,
        currentBookingServices: selectedServices,
        selectedItems: selectedItems,
        formData,
        bookingMode: true,
        isGroupOrder: false,
        returnRoute: "/admin/booking",
      },
    });
  }, [selectedServices, selectedItems, formData, navigate]);

  const handleCreateInvoice = async (bookingData: any) => {
    try {
      const companyName =
        formData?.clientCompany ||
        (formData as any)?.companyName ||
        (formData as any)?.company ||
        (formData as any)?.organizationName ||
        "";

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
          totalPrice: parseFloat(
            String(service.servicePrice || service.price || "0"),
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

  const handleOrderTypeChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        navigate("/admin/group-order/setup", {
          state: {
            selectedServices,
            selectedItems,
            formData,
          },
        });
      } else {
        originalHandleOrderTypeChange(checked);
      }
    },
    [
      navigate,
      selectedServices,
      selectedItems,
      formData,
      originalHandleOrderTypeChange,
    ],
  );

  const initDoneRef = useRef(false);
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (initDoneRef.current) {
      return;
    }

    if (import.meta.env.DEV) {
      try {
        const storageSize =
          JSON.stringify(localStorage).length +
          JSON.stringify(sessionStorage).length;
      } catch (e) {}
    }

    if (mode === "invoice") {
      if (!isInvoiceMode) {
        setInvoiceMode(true);
      }
      initDoneRef.current = true;
      return;
    }

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
          console.info(
            "[BookingFlow] 📝 Enabling invoice mode from sessionStorage",
          );
          setInvoiceMode(true);
        }
        sessionStorage.removeItem("invoiceData");
        console.info(
          "[BookingFlow] ✅ Invoice data restored from sessionStorage",
        );
        initDoneRef.current = true;
        return;
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

  // No automatic cleanup - delivery fees persist until explicitly removed with the service

  // Phase 1: Memoize getProcessedService for stable function reference
  const getProcessedService = useCallback((rawService: any) => {
    if (import.meta.env.DEV) {
      console.log(
        "[BookingFlow] 🔄 Processing service:",
        rawService.id || rawService.serviceId,
      );
    }
    return processService(rawService);
  }, []); // No dependencies - processService is pure

  const handleChangeService = useCallback(
    (serviceIndex: number) => {
      return () => {
        navigate("/admin/marketplace", {
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
    },
    [navigate, selectedServices, selectedItems, formData],
  );

  const handleLoadDraft = (draft: any) => {
    console.log("Loading draft:", draft);
    if (
      window.confirm(
        `Load draft "${draft.name}"? This will replace your current selections.`,
      )
    ) {
      window.location.reload();
    }
  };

  // NEW: Handle combo selection properly by updating service state
  // Handle delivery range selection - store in service delivery fees state
  const handleDeliveryRangeSelect = useCallback(
    (serviceIndex: number, range: { range: string; fee: number }) => {
      const service = selectedServices[serviceIndex];
      const serviceId =
        service?.id || service?.serviceId || `service-${serviceIndex}`;

      console.log("[DeliveryFee] Storing delivery fee:", {
        serviceIndex,
        serviceId,
        service: service,
        range,
        currentFees: serviceDeliveryFees,
      });

      setServiceDeliveryFees((prev) => {
        // Skip if fee is already set for this service with same range
        if (
          prev[serviceId]?.range === range.range &&
          prev[serviceId]?.fee === range.fee
        ) {
          return prev;
        }

        const updated = {
          ...prev,
          [serviceId]: range,
        };
        console.log("[DeliveryFee] Updated fees state:", updated);
        // Persist to localStorage
        try {
          localStorage.setItem("serviceDeliveryFees", JSON.stringify(updated));
        } catch (error) {
          console.warn(
            "[DeliveryFee] Failed to persist to localStorage:",
            error,
          );
        }
        return updated;
      });

      toast.success(
        `Delivery fee of $${range.fee} automatically applied for ${range.range}`,
      );
    },
    [selectedServices, serviceDeliveryFees],
  );

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
          }),
        );
      } else {
        // Legacy format fallback
        console.warn("[BookingFlow] Legacy combo format used");
        const comboItemId = `combo_${payload.comboItemId}_${Date.now()}`;
        handleItemQuantityChange(comboItemId, 1);
      }
    },
    [setSelectedServices, handleItemQuantityChange],
  );

  const getActiveTab = () => {
    if (userRole === "admin" || userRole === "super-admin") {
      return isInvoiceMode ? "invoices" : "vendors";
    }
    return "vendors";
  };

  const dashboardUserRole =
    userRole === "admin" || userRole === "super-admin" ? "admin" : "event-host";

  // Enhance services with vendor addresses and coordinates for distance calculation
  const servicesWithAddresses = useMemo(() => {
    return selectedServices.map((service) => {
      const vendorAddress = getServiceAddress(service);
      const serviceAny = service as any;

      // Try to get vendor coordinates from various locations
      let vendorCoordinates = null;

      // Check for coordinates at top level
      if (serviceAny.vendorCoordinates) {
        vendorCoordinates = serviceAny.vendorCoordinates;
      }
      // Check vendor object for coordinates
      else if (service.vendor && typeof service.vendor === "object") {
        const vendor = service.vendor as any;
        if (
          vendor.coordinates &&
          typeof vendor.coordinates.lat === "number" &&
          typeof vendor.coordinates.lng === "number"
        ) {
          vendorCoordinates = vendor.coordinates;
        } else if (
          typeof vendor.lat === "number" &&
          typeof vendor.lng === "number"
        ) {
          vendorCoordinates = { lat: vendor.lat, lng: vendor.lng };
        }
      }
      // Check service_details for vendor coordinates
      else if (service.service_details?.vendor?.coordinates) {
        const coords = service.service_details.vendor.coordinates;
        if (typeof coords.lat === "number" && typeof coords.lng === "number") {
          vendorCoordinates = coords;
        }
      }

      // Add vendor address and coordinates to service for useServiceDistances hook
      return {
        ...service,
        vendorFullAddress: vendorAddress,
        vendorAddress: vendorAddress,
        ...(vendorCoordinates ? { vendorCoordinates } : {}),
      };
    });
  }, [selectedServices]);

  // Calculate distances for all services using useServiceDistances hook
  const destinationCoordinates = eventLocationData?.coordinates
    ? {
        lat: eventLocationData.coordinates.lat,
        lng: eventLocationData.coordinates.lng,
      }
    : null;

  const { distancesByService, loading: distancesLoading } = useServiceDistances(
    servicesWithAddresses,
    formData.location || null,
    destinationCoordinates,
  );

  // Log location restoration on mount
  useEffect(() => {
    if (eventLocationData && formData.location) {
      console.log(
        "[AdminBookingFlow] Location data restored from localStorage:",
        {
          address: formData.location,
          coordinates: eventLocationData.coordinates,
          hasCoordinates: !!destinationCoordinates,
        },
      );
    }
  }, []); // Run only once on mount

  // Clear delivery fees when location changes to allow recalculation
  const previousLocationRef = useRef<string>("");
  useEffect(() => {
    const currentLocation = formData.location || "";

    // If location has changed and is not empty, clear delivery fees
    if (
      previousLocationRef.current &&
      currentLocation &&
      previousLocationRef.current !== currentLocation
    ) {
      console.log(
        "[AdminBookingFlow] Location changed, clearing delivery fees for recalculation",
      );
      setServiceDeliveryFees({});
      try {
        localStorage.removeItem("serviceDeliveryFees");
      } catch (error) {
        console.warn(
          "[AdminBookingFlow] Failed to clear delivery fees from localStorage:",
          error,
        );
      }
    }

    previousLocationRef.current = currentLocation;
  }, [formData.location]);

  // Auto-calculate delivery fees when distances are available
  // Use ref to avoid infinite loop (serviceDeliveryFees would cause re-trigger if in deps)
  const serviceDeliveryFeesRef = useRef(serviceDeliveryFees);
  serviceDeliveryFeesRef.current = serviceDeliveryFees;

  useEffect(() => {
    console.log("[AdminBookingFlow] Auto-calculation useEffect triggered", {
      distanceCount: Object.keys(distancesByService).length,
      location: formData.location,
      selectedServicesCount: selectedServices.length,
      currentDeliveryFees: Object.keys(serviceDeliveryFeesRef.current).length,
    });

    if (Object.keys(distancesByService).length === 0 || !formData.location) {
      console.log(
        "[AdminBookingFlow] Skipping auto-calculation: no distances or location",
      );
      return;
    }

    const newFees: Record<string, { range: string; fee: number }> = {};

    selectedServices.forEach((service) => {
      const serviceId = service.id || service.serviceId;
      if (!serviceId) {
        console.log("[AdminBookingFlow] Skipping service: no serviceId");
        return;
      }

      const distance = distancesByService[serviceId];
      console.log(`[AdminBookingFlow] Checking service ${serviceId}:`, {
        serviceName: service.serviceName || service.name,
        distance,
        hasExistingFee: !!serviceDeliveryFeesRef.current[serviceId],
      });

      if (!distance || distance <= 0) {
        console.log(
          `[AdminBookingFlow] Skipping service ${serviceId}: no valid distance`,
        );
        return;
      }

      // Skip if delivery fee already selected for this service (use ref to avoid stale closure)
      if (serviceDeliveryFeesRef.current[serviceId]) {
        console.log(
          `[AdminBookingFlow] Skipping service ${serviceId}: fee already exists`,
        );
        return;
      }

      const deliveryOptions =
        service.service_details?.deliveryOptions ||
        service.service_details?.catering?.deliveryOptions;

      if (deliveryOptions?.delivery && deliveryOptions.deliveryRanges) {
        const deliveryResult = calculateDeliveryFee(
          formData.location,
          deliveryOptions,
          distance,
        );

        console.log(
          `[AdminBookingFlow] Delivery calculation result for ${serviceId}:`,
          deliveryResult,
        );

        if (deliveryResult.eligible && deliveryResult.fee >= 0) {
          const matchingRange = deliveryOptions.deliveryRanges.find(
            (range: any) => range.range === deliveryResult.range,
          );

          if (matchingRange) {
            newFees[serviceId] = matchingRange;
          } else {
            console.warn(
              `[AdminBookingFlow] No matching range found for ${serviceId}`,
            );
          }
        }
      }
    });

    // Apply all new fees at once if any were calculated
    if (Object.keys(newFees).length > 0) {
      console.log("[AdminBookingFlow] Applying new delivery fees:", newFees);
      setServiceDeliveryFees((prev) => {
        // Double-check to avoid duplicate updates
        const filteredNewFees: Record<string, { range: string; fee: number }> =
          {};
        Object.keys(newFees).forEach((serviceId) => {
          if (!prev[serviceId]) {
            filteredNewFees[serviceId] = newFees[serviceId];
          }
        });
        if (Object.keys(filteredNewFees).length === 0) {
          return prev;
        }
        const updated = { ...prev, ...filteredNewFees };

        try {
          localStorage.setItem("serviceDeliveryFees", JSON.stringify(updated));
          console.log(
            "[AdminBookingFlow] Persisted delivery fees to localStorage",
          );
        } catch (error) {
          console.warn(
            "[AdminBookingFlow] Failed to persist delivery fees:",
            error,
          );
        }
        return updated;
      });
    } else {
      console.log("[AdminBookingFlow] No new delivery fees to apply");
    }
  }, [distancesByService, formData.location, selectedServices]);

  const handleLocationSelected = useCallback(
    (address: string, locationData?: LocationData) => {
      if (locationData) {
        setEventLocationData(locationData);

        try {
          localStorage.setItem(
            "eventLocationData",
            JSON.stringify(locationData),
          );
        } catch (error) {
          console.warn(
            "[AdminBookingFlow] Failed to persist location data:",
            error,
          );
        }
        console.log(
          "[AdminBookingFlow] Location selected with coordinates:",
          locationData,
        );
      }
    },
    [],
  );

  const vendorCards = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log(
        "[BookingFlow] 🔄 Processing services array, count:",
        selectedServices.length,
      );
    }

    return selectedServices.map((service, index) => {
      const processedService = getProcessedService(service);

      if (!processedService || !processedService.rawData) {
        console.warn(
          "[BookingFlow] ⚠️ Skipping malformed service at index",
          index,
        );
        return null;
      }

      const serviceId = service.id || service.serviceId || `service-${index}`;
      const calculatedDistance = distancesByService[serviceId] || null;
      const preselectedDeliveryFee = serviceDeliveryFees[serviceId] || null;

      return (
        <div key={serviceId} className="w-full max-w-full overflow-x-hidden">
          <BookingVendorCard
            vendorImage={processedService.image}
            vendorName={processedService.name}
            vendorType={getServiceTypeLabel(processedService.serviceType)}
            vendorPrice={processedService.priceDisplay}
            serviceDetails={processedService.rawData}
            selectedItems={selectedItems}
            onItemQuantityChange={handleItemQuantityChange}
            onComboSelection={handleComboSelection}
            onRemoveService={() => {
              handleRemoveService(index);

              setServiceDeliveryFees((prev) => {
                const updated = { ...prev };
                delete updated[serviceId];

                try {
                  localStorage.setItem(
                    "serviceDeliveryFees",
                    JSON.stringify(updated),
                  );
                } catch (error) {
                  console.warn(
                    "[DeliveryFee] Failed to persist to localStorage:",
                    error,
                  );
                }
                return updated;
              });
            }}
            canRemove={Boolean(true)}
            serviceIndex={index}
            quantity={service?.quantity || 1}
            onQuantityChange={(quantity) =>
              handleUpdateServiceQuantity(index, quantity)
            }
            onDeliveryRangeSelect={handleDeliveryRangeSelect}
            calculatedDistance={calculatedDistance || undefined}
            preselectedDeliveryFee={preselectedDeliveryFee || undefined}
            guestCount={formData?.headcount || 1}
            onChangeService={handleChangeService(index)}
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
    handleDeliveryRangeSelect,
    handleChangeService,
    serviceDeliveryFees,
    distancesByService,
    formData.location,
  ]);

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
      <Dashboard userRole={"admin"} activeTab={getActiveTab()}>
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

          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 box-border overflow-x-hidden">
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

              <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
                <div className="xl:col-span-6">
                  <div className="border rounded-xl bg-white p-3 sm:p-4 shadow-sm w-full max-w-full overflow-x-hidden xl:h-[calc(100vh-2rem)] xl:overflow-y-auto">
                    <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden xl:pr-2">
                      {vendorCards}
                      <AddServiceButton
                        onAddService={handleAddAdditionalService}
                        hasServices={selectedServices.length > 0}
                      />

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

                      <div className="bg-white border rounded-lg p-6">
                        <AdminTaxAndFeeControls
                          isTaxExempt={isTaxExempt}
                          isServiceFeeWaived={isServiceFeeWaived}
                          adminNotes={adminNotes}
                          onTaxExemptChange={setIsTaxExempt}
                          onServiceFeeWaivedChange={setIsServiceFeeWaived}
                          onAdminNotesChange={setAdminNotes}
                        />
                      </div>

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
                    </div>
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <div className="border rounded-xl bg-white p-3 sm:p-4 shadow-sm xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto">
                    <div className="pr-1">
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
                        showAddServiceButton={false}
                      />

                      {Object.values(selectedItems).some(
                        (quantity) => Number(quantity) > 0,
                      ) && (
                        <div className="sticky bottom-0 bg-white w-full max-w-full overflow-x-hidden mt-4 pt-3 border-t border-gray-200">
                          <Button
                            onClick={async (e) => {
                              e.preventDefault();

                              const guestCount = formData?.headcount || 1;
                              for (const service of selectedServices) {
                                const serviceType = (
                                  service.serviceType ||
                                  service.type ||
                                  ""
                                ).toLowerCase();
                                if (serviceType === "catering") {
                                  const details = service.service_details || {};
                                  const cateringObj = details.catering || {};
                                  const serviceName =
                                    service.serviceName ||
                                    service.name ||
                                    "Catering service";

                                  const minimumGuests =
                                    Number(cateringObj.minimumGuests) || 0;

                                  if (
                                    minimumGuests > 0 &&
                                    guestCount < minimumGuests
                                  ) {
                                    toast.error(`Minimum guests not met`, {
                                      description: `${serviceName} requires at least ${minimumGuests} guests. You entered ${guestCount} guests.`,
                                      duration: 5000,
                                    });
                                    return;
                                  }

                                  const minimumOrderAmount =
                                    Number(cateringObj.minimumOrderAmount) || 0;
                                  if (minimumOrderAmount > 0 && details) {
                                    const {
                                      baseItems,
                                      additionalChargeItems,
                                      comboCategoryItems,
                                    } = extractCateringItems(
                                      selectedItems,
                                      details,
                                    );

                                    const basePricePerPerson = baseItems.reduce(
                                      (sum, item) => {
                                        return sum + item.price * item.quantity;
                                      },
                                      0,
                                    );

                                    const additionalCharges =
                                      additionalChargeItems.map((item) => ({
                                        name: item.name,
                                        quantity: item.quantity,
                                        unitPrice: item.price,
                                        additionalCharge: item.additionalCharge,
                                        isMenuItem: item.isMenuItem,
                                      }));

                                    const cateringCalcResult =
                                      calculateCateringPrice(
                                        basePricePerPerson,
                                        additionalCharges,
                                        guestCount,
                                        comboCategoryItems,
                                      );

                                    const serviceTotal =
                                      cateringCalcResult.finalTotal;

                                    console.log(
                                      "[AdminBookingFlow] Minimum order amount validation:",
                                      {
                                        serviceName,
                                        serviceTotal,
                                        minimumOrderAmount,
                                        guestCount,
                                        minimumGuests,
                                      },
                                    );

                                    if (serviceTotal < minimumOrderAmount) {
                                      toast.error(
                                        `Minimum order amount not met`,
                                        {
                                          description: `${serviceName} requires a minimum order of $${minimumOrderAmount.toFixed(2)}. Your current total is $${serviceTotal.toFixed(2)}.`,
                                          duration: 5000,
                                        },
                                      );
                                      return;
                                    }
                                  }
                                }
                              }

                              setIsSubmitting(true);

                              try {
                                const mapServiceWithItems = (
                                  service: any,
                                  index: number,
                                ) => {
                                  const serviceId =
                                    service.id || service.serviceId || "";
                                  const serviceType = (
                                    service.serviceType ||
                                    service.type ||
                                    ""
                                  ).toLowerCase();
                                  const details = service.service_details || {};

                                  const deliveryFee =
                                    serviceDeliveryFees[serviceId] || null;

                                  if (
                                    serviceType === "venues" ||
                                    serviceType === "venue"
                                  ) {
                                    const quantity =
                                      service.quantity ||
                                      service.serviceQuantity ||
                                      (service as any).qty ||
                                      1;

                                    let price = parseFloat(
                                      String(
                                        service.servicePrice ||
                                          service.price ||
                                          "0",
                                      ),
                                    );

                                    if (price === 0 || isNaN(price)) {
                                      const existingTotalPrice = parseFloat(
                                        String(
                                          service.totalPrice ||
                                            service.serviceTotalPrice ||
                                            "0",
                                        ),
                                      );
                                      if (
                                        existingTotalPrice > 0 &&
                                        quantity > 0
                                      ) {
                                        price = existingTotalPrice / quantity;
                                      }
                                    }

                                    const venueImage =
                                      service.image ||
                                      service.serviceImage ||
                                      service.vendorImage ||
                                      service.coverImage ||
                                      service.imageUrl ||
                                      service.image_url ||
                                      details?.image ||
                                      details?.serviceImage ||
                                      details?.venueImage ||
                                      "";

                                    return {
                                      serviceType: "venues",
                                      serviceName:
                                        service.serviceName ||
                                        service.name ||
                                        "",
                                      vendorId:
                                        service.vendor_id ||
                                        service.vendorId ||
                                        "",
                                      price: price,
                                      quantity: quantity,
                                      totalPrice: price * quantity,
                                      priceType:
                                        service.priceType ||
                                        service.price_type ||
                                        "flat",
                                      image: venueImage,
                                    };
                                  }

                                  if (
                                    serviceType === "party-rental" ||
                                    serviceType === "party-rentals" ||
                                    serviceType === "party_rentals" ||
                                    serviceType === "staff" ||
                                    serviceType === "events_staff"
                                  ) {
                                    let normalizedServiceType = serviceType;
                                    if (
                                      serviceType === "party-rental" ||
                                      serviceType === "party-rentals" ||
                                      serviceType === "party_rentals"
                                    ) {
                                      normalizedServiceType = "party_rentals";
                                    } else if (
                                      serviceType === "staff" ||
                                      serviceType === "events_staff"
                                    ) {
                                      normalizedServiceType = "events_staff";
                                    }

                                    let quantity =
                                      service.quantity ||
                                      service.serviceQuantity ||
                                      (service as any).qty ||
                                      1;

                                    let basePrice = parseFloat(
                                      String(
                                        service.servicePrice ||
                                          service.price ||
                                          "0",
                                      ),
                                    );

                                    const existingTotalPrice = parseFloat(
                                      String(
                                        service.totalPrice ||
                                          service.serviceTotalPrice ||
                                          service.total ||
                                          "0",
                                      ),
                                    );

                                    if (
                                      (basePrice === 0 || isNaN(basePrice)) &&
                                      existingTotalPrice > 0
                                    ) {
                                      if (quantity > 0) {
                                        basePrice =
                                          existingTotalPrice / quantity;
                                      } else {
                                        quantity = 1;
                                        basePrice = existingTotalPrice;
                                      }
                                    }

                                    if (isNaN(basePrice) || basePrice < 0) {
                                      basePrice = 0;
                                    }

                                    if (!quantity || quantity < 1) {
                                      quantity = 1;
                                    }

                                    const totalPrice =
                                      existingTotalPrice > 0 &&
                                      basePrice === existingTotalPrice
                                        ? existingTotalPrice
                                        : basePrice * quantity;

                                    const serviceImage =
                                      service.image ||
                                      service.serviceImage ||
                                      service.vendorImage ||
                                      service.coverImage ||
                                      service.imageUrl ||
                                      service.image_url ||
                                      service.service_details?.image ||
                                      service.service_details?.serviceImage ||
                                      "";

                                    const finalPrice = isNaN(basePrice)
                                      ? 0
                                      : basePrice;
                                    const finalQuantity =
                                      isNaN(quantity) || quantity < 1
                                        ? 1
                                        : quantity;
                                    const finalTotalPrice = isNaN(totalPrice)
                                      ? finalPrice * finalQuantity
                                      : totalPrice;

                                    return {
                                      serviceType: normalizedServiceType,
                                      serviceName:
                                        service.serviceName ||
                                        service.name ||
                                        "",
                                      vendorId:
                                        service.vendor_id ||
                                        service.vendorId ||
                                        "",
                                      price: finalPrice,
                                      quantity: finalQuantity,
                                      totalPrice: finalTotalPrice,
                                      priceType:
                                        service.priceType ||
                                        service.price_type ||
                                        "flat",
                                      image: serviceImage,
                                    };
                                  }

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

                                  const serviceItems: any[] = [];
                                  Object.entries(selectedItems).forEach(
                                    ([itemId, quantity]) => {
                                      const validQuantity =
                                        quantity && typeof quantity === "number"
                                          ? quantity
                                          : quantity || 1;

                                      if (!validQuantity || validQuantity < 1) {
                                        return;
                                      }

                                      if (
                                        itemId.includes("_") &&
                                        itemId.split("_").length >= 3
                                      ) {
                                        const parts = itemId.split("_");
                                        const comboId = parts[0];
                                        const categoryId = parts[1];
                                        const actualItemId = parts[2];

                                        let categoryItem = null;
                                        let categoryName = "Category";

                                        const combo = availableItems.find(
                                          (item) =>
                                            (item.id === comboId ||
                                              item.itemId === comboId) &&
                                            (item.comboCategories ||
                                              item.isCombo),
                                        );

                                        if (combo && combo.comboCategories) {
                                          const category =
                                            combo.comboCategories.find(
                                              (cat: any) =>
                                                cat.id === categoryId ||
                                                cat.categoryId === categoryId,
                                            );

                                          if (category) {
                                            categoryName =
                                              category.name ||
                                              category.categoryName ||
                                              "Category";

                                            if (category.items) {
                                              categoryItem =
                                                category.items.find(
                                                  (item: any) =>
                                                    item.id === actualItemId ||
                                                    item.itemId ===
                                                      actualItemId,
                                                );
                                            }
                                          }
                                        }

                                        const itemName =
                                          categoryItem?.name ||
                                          categoryItem?.itemName ||
                                          actualItemId;
                                        const itemPrice = parseFloat(
                                          String(categoryItem?.price || 0),
                                        );
                                        const upchargePrice = parseFloat(
                                          String(
                                            categoryItem?.additionalCharge ||
                                              categoryItem?.upcharge ||
                                              0,
                                          ),
                                        );
                                        const isUuidLikeId =
                                          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                                            actualItemId,
                                          );

                                        if (
                                          !categoryItem &&
                                          isUuidLikeId &&
                                          itemPrice <= 0
                                        ) {
                                          return;
                                        }

                                        const itemImage =
                                          categoryItem?.image ||
                                          categoryItem?.imageUrl ||
                                          categoryItem?.itemImage ||
                                          categoryItem?.image_url ||
                                          categoryItem?.photo ||
                                          categoryItem?.picture ||
                                          "";

                                        if (serviceType === "catering") {
                                          serviceItems.push({
                                            menuName: categoryName,
                                            menuItemName: itemName,
                                            price: itemPrice,
                                            quantity: validQuantity,
                                            totalPrice:
                                              itemPrice * validQuantity,
                                            cateringId: actualItemId,
                                            serviceId: serviceId,
                                            isComboCategoryItem: true,
                                            comboId: comboId,
                                            image: itemImage,
                                            premiumCharge: upchargePrice,
                                          });
                                        }
                                        return;
                                      }

                                      let item = availableItems.find(
                                        (item: any) =>
                                          item.id === itemId ||
                                          item.itemId === itemId ||
                                          item.name === itemId ||
                                          item.title === itemId ||
                                          `${serviceId}_${item.id}` ===
                                            itemId ||
                                          `${serviceId}_${item.itemId}` ===
                                            itemId,
                                      );

                                      if (
                                        !item &&
                                        serviceId &&
                                        itemId.startsWith(serviceId + "_")
                                      ) {
                                        const actualId = itemId.slice(
                                          (serviceId + "_").length,
                                        );
                                        item = availableItems.find(
                                          (it: any) =>
                                            it.id === actualId ||
                                            it.itemId === actualId ||
                                            it.name === actualId ||
                                            it.title === actualId,
                                        );
                                      }

                                      if (item || validQuantity >= 1) {
                                        if (!item) {
                                          if (
                                            serviceType === "party-rental" ||
                                            serviceType === "party-rentals"
                                          ) {
                                            serviceItems.push({
                                              name: itemId,
                                              quantity: validQuantity,
                                              eachPrice: 0,
                                              totalPrice: 0,
                                              rentalId: itemId,
                                            });
                                            return;
                                          }

                                          return;
                                        }

                                        const isComboItem =
                                          item.isCombo ||
                                          item.comboCategories ||
                                          item.pricePerPerson !== undefined;
                                        if (
                                          isComboItem &&
                                          service.comboSelectionsList &&
                                          Array.isArray(
                                            service.comboSelectionsList,
                                          )
                                        ) {
                                          const isInComboSelections =
                                            service.comboSelectionsList.some(
                                              (combo: any) =>
                                                combo.comboItemId === item.id ||
                                                combo.comboItemId ===
                                                  item.itemId,
                                            );
                                          if (isInComboSelections) {
                                            return;
                                          }
                                        }

                                        const itemPrice = parseFloat(
                                          String(
                                            item.pricePerPerson ||
                                              item.price ||
                                              item.itemPrice ||
                                              item.basePrice ||
                                              item.unitPrice ||
                                              0,
                                          ),
                                        );
                                        if (
                                          itemPrice === 0 &&
                                          validQuantity > 0
                                        ) {
                                        }

                                        if (serviceType === "catering") {
                                          const resolvedItemName =
                                            item.name ||
                                            item.menuItemName ||
                                            item.itemName ||
                                            item.title ||
                                            "";
                                          const isUuidLikeId =
                                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                                              itemId,
                                            );

                                          if (
                                            !resolvedItemName &&
                                            isUuidLikeId &&
                                            itemPrice <= 0
                                          ) {
                                            return;
                                          }

                                          const itemImage =
                                            item.image ||
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
                                              resolvedItemName || itemId,
                                            price: itemPrice,
                                            quantity: validQuantity,
                                            totalPrice:
                                              itemPrice * validQuantity,
                                            cateringId:
                                              item.id ||
                                              item.cateringId ||
                                              itemId,
                                            serviceId: serviceId,
                                            image: itemImage,
                                          });
                                        }
                                      }
                                    },
                                  );

                                  if (
                                    serviceType === "catering" &&
                                    service.comboSelectionsList &&
                                    Array.isArray(service.comboSelectionsList)
                                  ) {
                                    const comboItemsFromDetails =
                                      details.catering?.combos || [];

                                    service.comboSelectionsList.forEach(
                                      (combo: any) => {
                                        if (combo) {
                                          const comboItemId = combo.comboItemId;

                                          let originalComboItem =
                                            availableItems.find(
                                              (item: any) =>
                                                (item.id === comboItemId ||
                                                  item.itemId === comboItemId ||
                                                  item.comboItemId ===
                                                    comboItemId) &&
                                                (item.isCombo ||
                                                  item.comboCategories ||
                                                  item.pricePerPerson !==
                                                    undefined),
                                            );

                                          if (!originalComboItem) {
                                            originalComboItem =
                                              comboItemsFromDetails.find(
                                                (item: any) =>
                                                  item.id === comboItemId ||
                                                  item.itemId === comboItemId ||
                                                  item.comboItemId ===
                                                    comboItemId,
                                              );
                                          }

                                          const basePrice = parseFloat(
                                            String(
                                              originalComboItem?.pricePerPerson ||
                                                originalComboItem?.price ||
                                                combo.basePrice ||
                                                combo.pricePerPerson ||
                                                combo.price ||
                                                0,
                                            ),
                                          );

                                          const finalComboItemId =
                                            comboItemId ||
                                            originalComboItem?.id;

                                          let proteinQuantity = 0;

                                          if (
                                            combo.selections &&
                                            Array.isArray(combo.selections)
                                          ) {
                                            combo.selections.forEach(
                                              (category: any) => {
                                                const isProtein =
                                                  category.categoryName &&
                                                  (category.categoryName
                                                    .toLowerCase()
                                                    .includes("protein") ||
                                                    category.categoryName
                                                      .toLowerCase()
                                                      .includes("meat") ||
                                                    category.categoryName
                                                      .toLowerCase()
                                                      .includes("main"));

                                                if (
                                                  isProtein &&
                                                  category.selectedItems &&
                                                  Array.isArray(
                                                    category.selectedItems,
                                                  )
                                                ) {
                                                  category.selectedItems.forEach(
                                                    (item: any) => {
                                                      proteinQuantity +=
                                                        item.quantity || 0;
                                                    },
                                                  );
                                                }
                                              },
                                            );
                                          }

                                          const directQuantity =
                                            selectedItems[finalComboItemId];
                                          const prefixedQuantity =
                                            selectedItems[
                                              `${serviceId}_${finalComboItemId}`
                                            ];
                                          const hasSelectedCategoryItems =
                                            Array.isArray(combo.selections) &&
                                            combo.selections.some(
                                              (category: any) =>
                                                Array.isArray(
                                                  category.selectedItems,
                                                ) &&
                                                category.selectedItems.some(
                                                  (item: any) =>
                                                    (item.quantity || 0) > 0,
                                                ),
                                            );

                                          if (proteinQuantity === 0) {
                                            proteinQuantity =
                                              directQuantity ||
                                              prefixedQuantity ||
                                              0;
                                          }

                                          if (
                                            !hasSelectedCategoryItems &&
                                            proteinQuantity <= 0
                                          ) {
                                            return;
                                          }

                                          const effectiveProteinQuantity =
                                            proteinQuantity > 0
                                              ? proteinQuantity
                                              : 1;

                                          const guestCount =
                                            parseInt(
                                              String(
                                                formData?.headcount || "1",
                                              ),
                                            ) || 1;

                                          const baseTotal =
                                            basePrice *
                                            effectiveProteinQuantity;

                                          let totalUpcharges = 0;

                                          if (
                                            combo.selections &&
                                            Array.isArray(combo.selections)
                                          ) {
                                            combo.selections.forEach(
                                              (category: any) => {
                                                if (
                                                  category.selectedItems &&
                                                  Array.isArray(
                                                    category.selectedItems,
                                                  )
                                                ) {
                                                  category.selectedItems.forEach(
                                                    (categoryItem: any) => {
                                                      const upchargePrice =
                                                        parseFloat(
                                                          String(
                                                            categoryItem.upcharge ||
                                                              0,
                                                          ),
                                                        );

                                                      if (upchargePrice > 0) {
                                                        totalUpcharges +=
                                                          upchargePrice *
                                                          guestCount;
                                                      }
                                                    },
                                                  );
                                                }
                                              },
                                            );
                                          }
                                          const comboTotal =
                                            baseTotal + totalUpcharges;

                                          const comboQuantity =
                                            effectiveProteinQuantity;

                                          if (import.meta.env.DEV) {
                                            console.log(
                                              "[AdminBookingFlow] Combo pricing calculation:",
                                              {
                                                comboName: combo.comboName,
                                                comboItemId: comboItemId,
                                                basePrice: basePrice,
                                                proteinQuantity:
                                                  proteinQuantity,
                                                effectiveProteinQuantity:
                                                  effectiveProteinQuantity,
                                                guestCount: guestCount,
                                                baseTotal: baseTotal,
                                                totalUpcharges: totalUpcharges,
                                                comboTotal: comboTotal,
                                                formula: `(${basePrice} � ${effectiveProteinQuantity} proteins) + (${totalUpcharges / guestCount} upcharge � ${guestCount} guests) = ${comboTotal}`,
                                              },
                                            );
                                          }

                                          const comboImage =
                                            originalComboItem?.image ||
                                            originalComboItem?.imageUrl ||
                                            originalComboItem?.itemImage ||
                                            originalComboItem?.image_url ||
                                            originalComboItem?.photo ||
                                            originalComboItem?.picture ||
                                            combo?.image ||
                                            combo?.imageUrl ||
                                            "";
                                          const pricePerCombo =
                                            comboTotal / comboQuantity;

                                          serviceItems.push({
                                            menuName:
                                              combo.comboName ||
                                              originalComboItem?.category ||
                                              "Combo Items",
                                            menuItemName:
                                              combo.comboName ||
                                              originalComboItem?.name ||
                                              "",
                                            price: pricePerCombo,
                                            quantity: comboQuantity,
                                            totalPrice: comboTotal,
                                            cateringId:
                                              finalComboItemId ||
                                              combo.comboItemId ||
                                              originalComboItem?.id ||
                                              "",
                                            serviceId: serviceId,
                                            image: comboImage,
                                          });

                                          if (
                                            combo.selections &&
                                            Array.isArray(combo.selections)
                                          ) {
                                            combo.selections.forEach(
                                              (category: any) => {
                                                if (
                                                  category.selectedItems &&
                                                  Array.isArray(
                                                    category.selectedItems,
                                                  )
                                                ) {
                                                  category.selectedItems.forEach(
                                                    (categoryItem: any) => {
                                                      const upchargePrice =
                                                        parseFloat(
                                                          String(
                                                            categoryItem.additionalCharge ||
                                                              categoryItem.upcharge ||
                                                              0,
                                                          ),
                                                        );
                                                      const totalPrice =
                                                        parseFloat(
                                                          String(
                                                            categoryItem.price ||
                                                              0,
                                                          ),
                                                        );

                                                      const categoryItemImage =
                                                        categoryItem?.image ||
                                                        categoryItem?.imageUrl ||
                                                        categoryItem?.itemImage ||
                                                        categoryItem?.image_url ||
                                                        categoryItem?.photo ||
                                                        categoryItem?.picture ||
                                                        "";

                                                      // Use the selected quantity for all items (no guest count multiplication)
                                                      const itemQuantity =
                                                        categoryItem.quantity ||
                                                        1;
                                                      const itemTotalPrice =
                                                        totalPrice *
                                                        itemQuantity;

                                                      serviceItems.push({
                                                        menuName:
                                                          category.categoryName ||
                                                          "Category",
                                                        menuItemName:
                                                          categoryItem.name ||
                                                          categoryItem.itemName ||
                                                          categoryItem.id ||
                                                          "",
                                                        price: totalPrice,
                                                        quantity: itemQuantity,
                                                        totalPrice:
                                                          itemTotalPrice,
                                                        cateringId:
                                                          categoryItem.id ||
                                                          categoryItem.itemId ||
                                                          "",
                                                        serviceId: serviceId,
                                                        isComboCategoryItem: true,
                                                        comboId:
                                                          finalComboItemId ||
                                                          combo.comboItemId ||
                                                          originalComboItem?.id ||
                                                          "",
                                                        image:
                                                          categoryItemImage,
                                                        premiumCharge:
                                                          upchargePrice,
                                                      });
                                                    },
                                                  );
                                                }
                                              },
                                            );
                                          }
                                        }
                                      },
                                    );
                                  }

                                  const calculatedTotalPrice =
                                    serviceItems.reduce((sum, item) => {
                                      const itemTotal = parseFloat(
                                        String(item.totalPrice || 0),
                                      );
                                      return (
                                        sum + (isNaN(itemTotal) ? 0 : itemTotal)
                                      );
                                    }, 0);

                                  let normalizedServiceType = serviceType;
                                  if (
                                    serviceType === "party-rental" ||
                                    serviceType === "party-rentals"
                                  ) {
                                    normalizedServiceType = "party_rentals";
                                  } else if (
                                    serviceType === "staff" ||
                                    serviceType === "events_staff"
                                  ) {
                                    normalizedServiceType = "events_staff";
                                  } else if (
                                    serviceType === "venues" ||
                                    serviceType === "venue"
                                  ) {
                                    normalizedServiceType = "venues";
                                  }

                                  const quantity =
                                    service.quantity ||
                                    service.serviceQuantity ||
                                    (service as any).qty ||
                                    1;
                                  const basePrice = parseFloat(
                                    String(
                                      service.servicePrice ||
                                        service.price ||
                                        "0",
                                    ),
                                  );

                                  let calculatedTotal;
                                  if (normalizedServiceType === "catering") {
                                    calculatedTotal = calculatedTotalPrice;
                                  } else {
                                    calculatedTotal =
                                      calculatedTotalPrice > 0
                                        ? calculatedTotalPrice
                                        : basePrice * quantity;
                                  }

                                  const serviceImage =
                                    service.image ||
                                    service.serviceImage ||
                                    service.vendorImage ||
                                    service.coverImage ||
                                    service.imageUrl ||
                                    service.image_url ||
                                    service.service_details?.image ||
                                    service.service_details?.serviceImage ||
                                    "";

                                  const mappedService: any = {
                                    serviceType: normalizedServiceType,
                                    serviceName:
                                      service.serviceName || service.name || "",
                                    vendorId:
                                      service.vendor_id ||
                                      service.vendorId ||
                                      "",
                                    totalPrice: calculatedTotal,
                                    priceType:
                                      service.priceType ||
                                      service.price_type ||
                                      "flat",
                                    image: serviceImage,
                                  };

                                  if (normalizedServiceType === "catering") {
                                    mappedService.cateringItems = serviceItems;

                                    if (deliveryFee && deliveryFee.fee > 0) {
                                      mappedService.deliveryFee =
                                        deliveryFee.fee;
                                    }

                                    const deliveryOptions =
                                      service.service_details
                                        ?.deliveryOptions ||
                                      service.service_details?.catering
                                        ?.deliveryOptions;

                                    let deliveryRanges =
                                      deliveryOptions?.deliveryRanges ||
                                      service.service_details?.deliveryRanges ||
                                      service.service_details?.catering
                                        ?.deliveryRanges ||
                                      service.deliveryRanges;

                                    if (
                                      deliveryRanges &&
                                      Array.isArray(deliveryRanges) &&
                                      deliveryRanges.length > 0
                                    ) {
                                      const deliveryRangesRecord: Record<
                                        string,
                                        number
                                      > = {};
                                      deliveryRanges.forEach((range: any) => {
                                        if (
                                          range.range &&
                                          typeof range.fee === "number"
                                        ) {
                                          deliveryRangesRecord[range.range] =
                                            range.fee;
                                        }
                                      });
                                      if (
                                        Object.keys(deliveryRangesRecord)
                                          .length > 0
                                      ) {
                                        mappedService.deliveryRanges =
                                          deliveryRangesRecord;
                                      }
                                    } else if (
                                      deliveryRanges &&
                                      typeof deliveryRanges === "object" &&
                                      !Array.isArray(deliveryRanges)
                                    ) {
                                      mappedService.deliveryRanges =
                                        deliveryRanges;
                                    }

                                    if (import.meta.env.DEV) {
                                      console.log(
                                        "[AdminBookingFlow] Delivery ranges for service:",
                                        {
                                          serviceName:
                                            service.serviceName || service.name,
                                          deliveryOptions,
                                          deliveryRangesSource: deliveryRanges,
                                          mappedDeliveryRanges:
                                            mappedService.deliveryRanges,
                                          isArray:
                                            Array.isArray(deliveryRanges),
                                          isRecord:
                                            typeof deliveryRanges ===
                                              "object" &&
                                            !Array.isArray(deliveryRanges),
                                        },
                                      );
                                    }

                                    if (service.service_details) {
                                      const {
                                        baseItems,
                                        additionalChargeItems,
                                        comboCategoryItems,
                                      } = extractCateringItems(
                                        selectedItems,
                                        service.service_details,
                                      );

                                      const basePricePerPerson =
                                        baseItems.reduce((sum, item) => {
                                          return (
                                            sum + item.price * item.quantity
                                          );
                                        }, 0);

                                      const additionalCharges =
                                        additionalChargeItems.map((item) => ({
                                          name: item.name,
                                          quantity: item.quantity,
                                          unitPrice: item.price,
                                          additionalCharge:
                                            item.additionalCharge,
                                          isMenuItem: item.isMenuItem,
                                        }));

                                      const guestCount =
                                        parseInt(
                                          String(formData?.headcount || "1"),
                                        ) || 1;

                                      const cateringCalcResult =
                                        calculateCateringPrice(
                                          basePricePerPerson,
                                          additionalCharges,
                                          guestCount,
                                          comboCategoryItems,
                                        );

                                      mappedService.totalPrice =
                                        cateringCalcResult.finalTotal;

                                      if (import.meta.env.DEV) {
                                        console.log(
                                          "[AdminBookingFlow] Catering service total calculation:",
                                          {
                                            serviceName:
                                              service.serviceName ||
                                              service.name,
                                            basePricePerPerson,
                                            guestCount,
                                            basePriceTotal:
                                              cateringCalcResult.basePriceTotal,
                                            additionalChargesTotal:
                                              cateringCalcResult.additionalChargesTotal,
                                            totalPrice:
                                              cateringCalcResult.finalTotal,
                                          },
                                        );
                                      }
                                    }
                                  }

                                  return mappedService;
                                };

                                const companyName =
                                  (formData as any)?.company ||
                                  formData?.clientCompany ||
                                  (formData as any)?.companyName ||
                                  (formData as any)?.organizationName ||
                                  "";

                                console.log(
                                  "?? [AdminBookingFlow] Company name fields:",
                                  {
                                    company: (formData as any)?.company,
                                    clientCompany: formData?.clientCompany,
                                    companyName: (formData as any)?.companyName,
                                    organizationName: (formData as any)
                                      ?.organizationName,
                                    finalCompanyName: companyName,
                                  },
                                );

                                const baseInvoiceData: any = {
                                  eventName:
                                    formData?.orderName || "Booking Event",
                                  companyName: companyName,
                                  eventLocation: formData?.location || "",
                                  eventDate: formData?.date || "",
                                  serviceTime: formData?.deliveryWindow || "",
                                  guestCount: formData?.headcount || 1,
                                  contactName:
                                    formData?.primaryContactName || "",
                                  phoneNumber:
                                    formData?.primaryContactPhone || "",
                                  emailAddress:
                                    formData?.primaryContactEmail || "",
                                  additionalNotes: adminNotes || "",
                                  services: selectedServices.map(
                                    (service, index) =>
                                      mapServiceWithItems(service, index),
                                  ),
                                };

                                let invoiceData: any;
                                if (isGroupOrder) {
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
                                    inviteFriends:
                                      (formData as any)?.inviteFriends || [],
                                    paymentSettings:
                                      (formData as any)?.paymentSettings ||
                                      "host_pays_everything",
                                  };
                                } else {
                                  invoiceData = {
                                    ...baseInvoiceData,
                                    addBackupContact:
                                      formData?.hasBackupContact || false,
                                    taxExemptStatus: isTaxExempt,
                                    waiveServiceFee: isServiceFeeWaived,
                                    customLineItems: customAdjustments.map(
                                      (adj) => ({
                                        label: adj.label || "",
                                        type: adj.type || "fixed",
                                        mode: adj.mode || "surcharge",
                                        value: adj.value || 0,
                                        taxable: adj.taxable || false,
                                        statusForDrafting:
                                          (adj as any).statusForDrafting ||
                                          false,
                                      }),
                                    ),
                                  };
                                }

                                const response =
                                  await invoiceService.createInvoice(
                                    invoiceData,
                                  );
                                const invoiceId =
                                  response?.data?.invoice?.id ||
                                  response?.data?.id;
                                clearCart(true);
                                setServiceDeliveryFees({});

                                try {
                                  localStorage.removeItem(
                                    "serviceDeliveryFees",
                                  );
                                  localStorage.removeItem("eventLocationData");
                                } catch (error) {
                                  console.warn(
                                    "[AdminBookingFlow] Failed to clear localStorage:",
                                    error,
                                  );
                                }
                                toast.success("Invoice created successfully");
                                if (invoiceId) {
                                  navigate(`/admin/order-summary/${invoiceId}`);
                                }
                              } catch (error) {
                                console.error(
                                  "Invoice creation failed:",
                                  error,
                                );
                                toast.error("Failed to create invoice");
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="w-full bg-[#F07712] hover:bg-[#F07712]/90 text-white font-semibold min-h-[44px]"
                          >
                            {isSubmitting
                              ? "Processing..."
                              : isInvoiceMode
                                ? "Create Invoice"
                                : isGroupOrder
                                  ? "Continue to Group Setup"
                                  : "Book Now"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dashboard>
    </ErrorBoundary>
  );
}

export default VendorBookingFlow;
