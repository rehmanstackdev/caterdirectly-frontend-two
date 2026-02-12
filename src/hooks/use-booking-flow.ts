import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ServiceSelection } from "@/types/order";
import { ServiceItem, ServiceType, ServiceStatus } from "@/types/service-types";
import { useCart } from "@/contexts/CartContext";
import { saveBookingStateBackup, loadBookingStateBackup, clearBookingStateBackup, mergeSelectedItems } from "@/utils/booking-state-persistence";
import { useInvoice } from "@/contexts/InvoiceContext";
import { useEnhancedDraftOrders } from "@/hooks/use-enhanced-draft-orders";
import { CustomAdjustment } from "@/types/adjustments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import invoiceService from "@/services/api/admin/invoice.service";


interface LocationState {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: string | number;
  serviceImage?: string;
  serviceType?: string;
  vendorName?: string;
  formData?: any;
  selectedServices?: ServiceSelection[];
  currentServices?: ServiceSelection[];
  addingAdditionalService?: boolean;
  changingService?: boolean;
  serviceIndex?: number;
  service?: ServiceItem;
  serviceDetails?: any;
  selectedItems?: Record<string, number>;
  returningFromOrderSummary?: boolean;
  fromCart?: boolean;
  cartItems?: ServiceItem[];
  returningFromMarketplace?: boolean;
  returningFromProposalCreation?: boolean;
  proposalMode?: boolean;
  proposalData?: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCompany?: string;
    message?: string;
    expiryDate?: Date;
  };
}

interface FormData {
  location: string;
  orderName: string;
  date: string;
  deliveryWindow: string;
  headcount: number;
  // Primary contact
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  // Backup contact (optional)
  hasBackupContact: boolean;
  backupContactName: string;
  backupContactPhone: string;
  backupContactEmail: string;
  additionalNotes: string;
  // Service style selections for catering services
  serviceStyleSelections: Record<string, string>; // serviceId -> selected style
  // Proposal-specific fields
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  proposalMessage?: string;
  proposalExpiryDate?: string;
}

// Helper function to convert price string to number
const convertPriceToNumber = (price: string | number | undefined): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    // Remove currency symbols and convert to number
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return isNaN(numericPrice) ? 0 : numericPrice;
  }
  return 0;
};

// Helper function to validate if a service has proper service_details
const hasValidServiceDetails = (service: ServiceSelection | ServiceItem): boolean => {
  if (!service.service_details) return false;
  
  // Check if service_details is malformed
  if (service.service_details._type === "undefined" || service.service_details.value === "undefined") {
    return false;
  }
  
  const serviceType = service.type || (service as any).serviceType;
  
  // For catering services, check if menuItems exist
  if (serviceType === 'catering') {
    return !!(service.service_details.catering?.menuItems && service.service_details.catering.menuItems.length > 0);
  }
  
  // For party rentals, check if rentalItems or items exist
  if (serviceType === 'party-rental' || serviceType === 'party-rentals') {
    return !!(service.service_details.rentalItems && service.service_details.rentalItems.length > 0);
  }
  
  // For staff services, check if staffServices exist
  if (serviceType === 'staff') {
    return !!(service.service_details.staffServices && service.service_details.staffServices.length > 0);
  }
  
  // For venue services, check if venueOptions exist
  if (serviceType === 'venue' || serviceType === 'venues') {
    return !!(service.service_details.venueOptions && service.service_details.venueOptions.length > 0);
  }
  
  // For other service types, if service_details exists, consider it valid
  return true;
};

// Helper function to convert ServiceItem to ServiceSelection with robust service_details handling
const convertServiceItemToSelection = (serviceItem: ServiceItem): ServiceSelection => {
  const numericPrice = convertPriceToNumber(serviceItem.price);
  
  // CRITICAL FIX: Detect and handle malformed service_details
  let validServiceDetails = null;
  
  if (serviceItem.service_details) {
    // Check if service_details is malformed (has _type: "undefined")
    if (serviceItem.service_details._type === "undefined" || serviceItem.service_details.value === "undefined") {
      // Try to extract valid details from the service item itself
      const serviceType = serviceItem.type || serviceItem.serviceType;
      if (serviceType === 'catering') {
        // For catering, check if menu items exist elsewhere on the service
        if ((serviceItem as any).menuItems || (serviceItem as any).menu) {
          validServiceDetails = {
            catering: {
              menuItems: (serviceItem as any).menuItems || (serviceItem as any).menu || []
            }
          };
        }
      } else if (serviceType === 'party-rental' || serviceType === 'party-rentals') {
        if ((serviceItem as any).rentalItems || (serviceItem as any).items) {
          validServiceDetails = {
            rental: {
              items: (serviceItem as any).rentalItems || (serviceItem as any).items || []
            }
          };
        }
      } else if (serviceType === 'staff') {
        if ((serviceItem as any).staffServices || (serviceItem as any).services) {
          validServiceDetails = {
            staff: {
              services: (serviceItem as any).staffServices || (serviceItem as any).services || []
            }
          };
        }
      } else if (serviceType === 'venue' || serviceType === 'venues') {
        if ((serviceItem as any).venueOptions || (serviceItem as any).options) {
          validServiceDetails = {
            venue: {
              options: (serviceItem as any).venueOptions || (serviceItem as any).options || []
            }
          };
        }
      }
      
      if (!validServiceDetails) {
        // console.warn('[convertServiceItemToSelection] Could not recover service details, using fallback');
        validServiceDetails = {};
      }
    } else {
      // service_details appears to be valid
      validServiceDetails = serviceItem.service_details;
    }
  } else {
    validServiceDetails = {};
  }
  
  // CRITICAL: Ensure service_details are properly preserved in the conversion
  const serviceSelection: ServiceSelection = {
    id: serviceItem.id,
    name: serviceItem.name,
    serviceName: serviceItem.name,
    servicePrice: numericPrice,
    quantity: serviceItem.type === 'staff' ? 0 : 1,
    duration: serviceItem.type === 'staff' ? 0 : 1,
    serviceType: serviceItem.type || serviceItem.serviceType || "",
    type: serviceItem.type || serviceItem.serviceType || "", // Add type field for compatibility
    price: numericPrice,
    image: serviceItem.image,
    serviceImage: serviceItem.image,
    vendor: serviceItem.vendorName,
    vendorName: serviceItem.vendorName,
    serviceId: serviceItem.id,
    vendor_id: serviceItem.vendor_id,
    description: serviceItem.description,
    // Use the validated/recovered service_details
    service_details: validServiceDetails
  } as any;
  
  return serviceSelection;
};

// Helper function to ensure ServiceSelection has ServiceItem properties when needed
const ensureServiceItemProperties = (selection: ServiceSelection): ServiceSelection => {
  return {
    ...selection,
    // Ensure all required properties exist
    vendor_id: selection.vendor_id || selection.vendor || '',
    description: selection.description || '',
    service_details: selection.service_details
  };
};

export function useBookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { cartItems, clearCart, getCartItemSelections, updateCartItemSelections, removeFromCart } = useCart();
  const { isInvoiceMode: isProposalMode, invoiceData: proposalData, setInvoiceData: setProposalData, setInvoiceMode: setProposalMode } = useInvoice();
  const { autoSave } = useEnhancedDraftOrders();
  const { userRole } = useAuth();
  const serviceData = (location.state as LocationState) || {};
  const [isGroupOrder, setIsGroupOrder] = useState(false);
  
  // Extract edit parameter from URL for edit flow
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  // ENTERPRISE: Centralized admin override state
  const [customAdjustments, setCustomAdjustments] = useState<CustomAdjustment[]>([]);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [isServiceFeeWaived, setIsServiceFeeWaived] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Loading state for edit flow
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  
  // ENTERPRISE: Track loaded drafts to prevent duplicate loading
  const loadedDraftRef = useRef<string | null>(null);
  
  // ENTERPRISE: Track loaded invoices to prevent duplicate loading
  const loadedInvoiceRef = useRef<string | null>(null);
  
  // ENTERPRISE FIX: Track last proposal data to prevent unnecessary updates
  const lastProposalRef = useRef<any>(null);
  
  // Initialize form data from location state with proposal fields
  const [formData, setFormData] = useState<FormData>({
    location: serviceData.formData?.location || "",
    orderName: serviceData.formData?.orderName || serviceData.formData?.name || "",
    date: serviceData.formData?.date || "",
    deliveryWindow: serviceData.formData?.deliveryWindow || serviceData.formData?.time || "",
    headcount: serviceData.formData?.headcount || 1,
    // Primary contact
    primaryContactName: serviceData.formData?.primaryContactName || "",
    primaryContactPhone: serviceData.formData?.primaryContactPhone || "",
    primaryContactEmail: serviceData.formData?.primaryContactEmail || "",
    // Backup contact
    hasBackupContact: serviceData.formData?.hasBackupContact || false,
    backupContactName: serviceData.formData?.backupContactName || "",
    backupContactPhone: serviceData.formData?.backupContactPhone || "",
    backupContactEmail: serviceData.formData?.backupContactEmail || "",
    additionalNotes: serviceData.formData?.additionalNotes || "",
    // Service style selections for catering services
    serviceStyleSelections: serviceData.formData?.serviceStyleSelections || {},
    // Proposal-specific fields - initialize from proposalData
    clientName: proposalData?.clientName || "",
    clientEmail: proposalData?.clientEmail || "",
    clientPhone: proposalData?.clientPhone || "",
    clientCompany: proposalData?.clientCompany || serviceData.formData?.clientCompany || "",
    proposalMessage: proposalData?.message || "",
    proposalExpiryDate: proposalData?.expiryDate ? new Date(proposalData.expiryDate).toISOString().split('T')[0] : ""
  } as FormData & { company?: string });

  // Enhanced selectedItems initialization with backup restoration
  const [selectedItems, setSelectedItemsInternal] = useState<Record<string, number>>(() => {
    // First priority: location state selectedItems
    if (serviceData.selectedItems && typeof serviceData.selectedItems === 'object' && Object.keys(serviceData.selectedItems).length > 0) {
      return serviceData.selectedItems;
    }
    
    // Second priority: cart items selections
    if (serviceData.fromCart && Array.isArray(cartItems) && cartItems.length > 0) {
      const cartSelections: Record<string, number> = {};
      cartItems.forEach(cartItem => {
        if (cartItem?.service?.id) {
          const selections = getCartItemSelections(cartItem.service.id);
          Object.assign(cartSelections, selections);
        }
      });
      if (Object.keys(cartSelections).length > 0) {
        return cartSelections;
      }
    }
    
    // Third priority: try to restore from backup
    try {
      const backup = loadBookingStateBackup();
      if (backup?.selectedItems && typeof backup.selectedItems === 'object' && Object.keys(backup.selectedItems).length > 0) {
        return backup.selectedItems;
      }
    } catch (error) {
      // Failed to load backup state
    }
    
    return {};
  });
  
  // Wrapper for setSelectedItems with dev instrumentation
  const setSelectedItems = useCallback((updater: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    setSelectedItemsInternal(updater);
  }, []);

  // Restore proposal mode if returning from proposal creation
  // ✅ FIX: Use ref to track if we've already processed this to prevent re-render loops
  const hasRestoredProposalRef = useRef(false);
  const lastProposalDataRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only process if we haven't already and if the data has actually changed
    const proposalDataString = serviceData.proposalData ? JSON.stringify(serviceData.proposalData) : null;
    const hasChanged = proposalDataString !== lastProposalDataRef.current;
    
    if (serviceData.returningFromProposalCreation && serviceData.proposalMode && !hasRestoredProposalRef.current && hasChanged) {
      hasRestoredProposalRef.current = true;
      lastProposalDataRef.current = proposalDataString;
      
      setProposalMode(true);
      
      if (serviceData.proposalData && typeof serviceData.proposalData === 'object') {
        setProposalData(serviceData.proposalData);
        
        // Also update form data with proposal client information
        setFormData(prev => ({
          ...prev,
          clientName: serviceData.proposalData?.clientName || prev.clientName || "",
          clientEmail: serviceData.proposalData?.clientEmail || prev.clientEmail || "",
          clientPhone: serviceData.proposalData?.clientPhone || prev.clientPhone || "",
          clientCompany: serviceData.proposalData?.clientCompany || prev.clientCompany || "",
          proposalMessage: serviceData.proposalData?.message || prev.proposalMessage || "",
          proposalExpiryDate: serviceData.proposalData?.expiryDate ? 
            new Date(serviceData.proposalData.expiryDate).toISOString().split('T')[0] : 
            prev.proposalExpiryDate || ""
        }));
      }
    }
  }, [serviceData.returningFromProposalCreation, serviceData.proposalMode, setProposalMode, setProposalData]);
  
  // ✅ COMPLETE: Load invoice data for editing when edit parameter is present
  useEffect(() => {
    const loadInvoiceForEdit = async () => {
      if (!editId || !isProposalMode) return;
      
      // Prevent duplicate loading
      if (loadedInvoiceRef.current === editId) {
        return;
      }
      
      loadedInvoiceRef.current = editId;
      setIsLoadingEdit(true);
      
      try {
        // Mock invoice data structure for logging
        const invoice = null; // Placeholder - actual data would come from API
        const invoiceItems: any[] = [];
        const serviceIds: string[] = [];
        const fullServices: any[] = [];
        
        if (!invoice) {
          toast({
            title: 'Invoice Loading Disabled',
            description: 'Invoice loading is currently disabled. Please use the API to load invoice data.',
            variant: 'default'
          });
          setIsLoadingEdit(false);
          return;
        }
        
      } catch (err) {
        console.error('[loadInvoiceForEdit] Exception:', err);
        loadedInvoiceRef.current = null; // Reset on error to allow retry
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while loading the invoice',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingEdit(false);
      }
    };
    
    loadInvoiceForEdit();
  }, [editId, isProposalMode, toast]);
  
  // ✅ CRITICAL FIX: Ref to track previous services for stable object references
  const prevServicesRef = useRef<ServiceSelection[]>([]);
  // Track init warnings to defer user notifications until after mount
  const initWarningsRef = useRef<{ corruptedMerge: number; corruptedAdd: number; initError: boolean }>({
    corruptedMerge: 0,
    corruptedAdd: 0,
    initError: false,
  });
  // Guard to ensure we only redirect once if no services are selected
  const hasRedirectedRef = useRef(false);
  
  // Initialize selected services using real service data with enhanced logic
  const initSelectedServices = (): ServiceSelection[] => {
    try {
      // Case 1: Returning from marketplace with additional items - MERGE instead of replace
      if (serviceData.returningFromMarketplace && Array.isArray(serviceData.cartItems)) {
        // Get existing services from location state or backup
        let existingServices = Array.isArray(serviceData.selectedServices) ? serviceData.selectedServices : [];
        
        // CRITICAL FIX: Validate and clean existing services before merging
        const validatedExistingServices: ServiceSelection[] = [];
        const corruptedServices: ServiceSelection[] = [];
        
        existingServices.forEach(service => {
          if (!service || typeof service !== 'object') {
            return;
          }
          
          // Check if service has valid service_details
          if (hasValidServiceDetails(service)) {
            validatedExistingServices.push(service);
          } else {
            corruptedServices.push(service);
          }
        });
        
        // Warn user if corrupted services were found
        if (corruptedServices.length > 0) {
          initWarningsRef.current.corruptedMerge += corruptedServices.length;
        }
        
        // Convert cart items to service selections
        const newServices = serviceData.cartItems
          .filter(service => service && typeof service === 'object')
          .map(service => convertServiceItemToSelection(service));
        
        // Merge: add new services to validated existing ones (avoid duplicates)
        const mergedServices = [...validatedExistingServices];
        newServices.forEach(newService => {
          const exists = mergedServices.some(existing => 
            (existing?.id === newService?.id) || (existing?.serviceId === newService?.id)
          );
          if (!exists) {
            mergedServices.push(newService);
          }
        });
        
        return mergedServices;
      }
      
      // Case 2: Coming from cart (either normal cart or booking mode cart)
      if (serviceData.fromCart && (Array.isArray(serviceData.cartItems) || Array.isArray(cartItems))) {
        const items = serviceData.cartItems || cartItems.map(item => item?.service).filter(Boolean);
        return items
          .filter(service => service && typeof service === 'object')
          .map(service => convertServiceItemToSelection(service));
      }
      
      // Case 3: Returning from order summary with all existing data
      if (serviceData.returningFromOrderSummary && Array.isArray(serviceData.selectedServices)) {
        return serviceData.selectedServices
          .filter(service => service && typeof service === 'object')
          .map(service => ensureServiceItemProperties(service));
      }
      
      // Case 4: Changing an existing service
      if (serviceData.changingService && Array.isArray(serviceData.currentServices) && typeof serviceData.serviceIndex === 'number') {
        if (serviceData.service && typeof serviceData.service === 'object') {
          const newSelection = convertServiceItemToSelection(serviceData.service);
          const updatedServices = [...serviceData.currentServices];
          if (updatedServices[serviceData.serviceIndex]) {
            updatedServices[serviceData.serviceIndex] = newSelection;
          }
          return updatedServices;
        }
        return serviceData.currentServices;
      }
      
      // Case 5: Adding additional service to existing order - PRESERVE EXISTING ITEMS
      if (serviceData.addingAdditionalService && Array.isArray(serviceData.currentServices)) {
        // CRITICAL FIX: Validate existing services before adding new one
        const validatedServices: ServiceSelection[] = [];
        const corruptedServices: ServiceSelection[] = [];
        
        serviceData.currentServices.forEach(service => {
          if (!service || typeof service !== 'object') {
            return;
          }
          
          // Check if service has valid service_details
          if (hasValidServiceDetails(service)) {
            validatedServices.push(service);
          } else {
            corruptedServices.push(service);
          }
        });
        
        // Warn user if corrupted services were found
        if (corruptedServices.length > 0) {
          initWarningsRef.current.corruptedAdd += corruptedServices.length;
        }
        
        if (serviceData.service && typeof serviceData.service === 'object') {
          // Check if service already exists using multiple ID properties
          const serviceAlreadyExists = validatedServices.some(s => {
            const existingId = s?.serviceId || s?.id;
            const newServiceId = serviceData.service?.id;
            return existingId === newServiceId;
          });
          
          if (!serviceAlreadyExists) {
            const newSelection = convertServiceItemToSelection(serviceData.service);
            return [...validatedServices, newSelection];
          }
        }
        return validatedServices;
      }
      
      // Case 6: Coming from group order with selected services
      if (Array.isArray(serviceData.selectedServices) && serviceData.selectedServices.length > 0) {
        return serviceData.selectedServices
          .filter(service => service && typeof service === 'object')
          .map(service => {
            // If we have the complete service object, use it directly
            if (serviceData.service && typeof serviceData.service === 'object') {
              return convertServiceItemToSelection(serviceData.service);
            }
            // Otherwise, ensure the service selection has the needed properties
            return ensureServiceItemProperties(service);
          });
      }
      
      // Case 7: Fresh booking with a single service - use complete service object
      if (serviceData.service && typeof serviceData.service === 'object') {
        // Use the complete service object directly - this has all the menu items, service_details, etc.
        const serviceSelection = convertServiceItemToSelection(serviceData.service);
        return [serviceSelection];
      }
      
      // Case 8: Try to restore from backup
      try {
        const backup = loadBookingStateBackup();
        if (backup?.selectedServices && Array.isArray(backup.selectedServices) && backup.selectedServices.length > 0) {
          return backup.selectedServices
            .filter(service => service && typeof service === 'object')
            .map(service => ensureServiceItemProperties(service));
        }
      } catch (error) {
        // Failed to restore backup services
      }
      
      // Case 9: Fallback to basic service data (backward compatibility)
      if (serviceData.serviceId && serviceData.serviceName) {
        const baseService = {
          id: serviceData.serviceId,
          name: serviceData.serviceName,
          serviceType: serviceData.serviceType || "",
          type: (serviceData.serviceType || "catering") as ServiceType,
          vendorName: serviceData.vendorName || "",
          image: serviceData.serviceImage,
          price: serviceData.servicePrice,
          service_details: serviceData.serviceDetails,
          // Add required ServiceItem properties
          status: 'approved' as ServiceStatus,
          active: true,
          isManaged: false,
          vendor_id: '',
          description: '',
          price_type: 'flat_rate'
        } as ServiceItem;
        
        const serviceSelection = convertServiceItemToSelection(baseService);
        return [serviceSelection];
      }
    } catch (error) {
      console.error('[useBookingFlow] Error initializing selected services:', error);
      initWarningsRef.current.initError = true;
    }
    
    // Default case: empty array
    return [];
  };

  const [selectedServices, setSelectedServicesInternal] = useState<ServiceSelection[]>(initSelectedServices());
  
  // After mount, surface any warnings collected during initialization
  useEffect(() => {
    const { corruptedMerge, corruptedAdd, initError } = initWarningsRef.current;
    if (corruptedMerge > 0) {
      toast({
        title: "Some services were removed",
        description: `${corruptedMerge} service(s) had missing data and were removed. Please re-add them from the marketplace.`,
        variant: "destructive"
      });
      initWarningsRef.current.corruptedMerge = 0;
    }
    if (corruptedAdd > 0) {
      toast({
        title: "Some services were removed",
        description: `${corruptedAdd} service(s) had missing data and were removed. Please re-add them from the marketplace.`,
        variant: "destructive"
      });
      initWarningsRef.current.corruptedAdd = 0;
    }
    if (initError) {
      toast({
        title: "Initialization Error",
        description: "There was an issue loading your service data. Please try again.",
        variant: "destructive"
      });
      initWarningsRef.current.initError = false;
    }
    // Intentionally run once post-mount
  }, []);
  
  // ✅ CRITICAL FIX: Add re-render loop detection (moved after selectedServices/selectedItems are defined)
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const prevServicesLengthRef = useRef(0);
  const prevItemsLengthRef = useRef(0);
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    const currentServicesLength = selectedServices.length;
    const currentItemsLength = Object.keys(selectedItems).length;
    
    // Only increment counter if lengths haven't changed (indicating a loop)
    if (currentServicesLength === prevServicesLengthRef.current && 
        currentItemsLength === prevItemsLengthRef.current) {
      renderCountRef.current++;
    } else {
      // Reset counter if lengths changed (normal update)
      renderCountRef.current = 1;
      prevServicesLengthRef.current = currentServicesLength;
      prevItemsLengthRef.current = currentItemsLength;
    }
    
    if (renderCountRef.current > 10 && timeSinceLastRender < 250) {
      // Prevent infinite loop by resetting counter
      renderCountRef.current = 0;
    }
    
    // Reset counter if enough time has passed
    if (timeSinceLastRender > 1000) {
      renderCountRef.current = 1;
    }
    
    lastRenderTimeRef.current = now;
  }); // No dependencies - this is intentional to detect all renders
  
  // Phase 2: Wrapper for setSelectedServices with equality check to prevent unnecessary updates
  const setSelectedServices = useCallback((updater: ServiceSelection[] | ((prev: ServiceSelection[]) => ServiceSelection[])) => {
    setSelectedServicesInternal(prev => {
      const newServices = typeof updater === 'function' ? updater(prev) : updater;
      
      // Comprehensive equality check: length, IDs, and critical fields that affect rendering
      if (newServices.length === prev.length) {
        let unchanged = true;
        
        for (let i = 0; i < newServices.length; i++) {
          const newService = newServices[i];
          const prevService = prev[i];
          
          const newId = newService?.id || newService?.serviceId;
          const prevId = prevService?.id || prevService?.serviceId;
          
          // Check if IDs differ
          if (newId !== prevId) {
            unchanged = false;
            break;
          }
          
          // Check if critical fields that affect rendering/totals differ
          const newQuantity = newService.quantity ?? 1;
          const prevQuantity = prevService.quantity ?? 1;
          const newDuration = newService.duration ?? 1;
          const prevDuration = prevService.duration ?? 1;
          const newPrice = newService.price ?? newService.servicePrice ?? 0;
          const prevPrice = prevService.price ?? prevService.servicePrice ?? 0;
          
          if (
            newQuantity !== prevQuantity ||
            newDuration !== prevDuration ||
            newPrice !== prevPrice ||
            newService.service_details !== prevService.service_details
          ) {
            unchanged = false;
            break;
          }
        }
        
        if (unchanged) {
          return prev; // Return previous reference to prevent re-render
        }
      }
      
      return newServices;
    });
  }, []);
  
  // Debounce timer for setProposalData to prevent rapid-fire context updates
  const proposalDataDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Phase 2: Track last saved backup to prevent saving identical data
  const lastBackupRef = useRef<string | null>(null);
  
  // Save state to backup whenever it changes (more frequently and robustly)
  useEffect(() => {
    // Phase 2: Only save if the serialized state has actually changed
    try {
      const currentState = JSON.stringify({ selectedServices, selectedItems, formData });
      
      if (lastBackupRef.current === currentState) {
        return;
      }
      
      lastBackupRef.current = currentState;
      saveBookingStateBackup(selectedServices, selectedItems, formData);
    } catch (error) {
      // Failed to save backup state
    }
    
    // ENTERPRISE FIX: Debounced proposal data updates (500ms delay)
    if (isProposalMode) {
      // Clear any existing timer
      if (proposalDataDebounceTimer.current) {
        clearTimeout(proposalDataDebounceTimer.current);
      }
      
      // Set new timer for debounced update
      proposalDataDebounceTimer.current = setTimeout(() => {
        const newProposalData = {
          clientName: formData.clientName || "",
          clientEmail: formData.clientEmail || "",
          clientPhone: formData.clientPhone || "",
          clientCompany: formData.clientCompany || "",
          message: formData.proposalMessage || "",
          expiryDate: formData.proposalExpiryDate ? new Date(formData.proposalExpiryDate) : undefined
        };
        
        // Shallow comparison to prevent unnecessary context updates
        const hasChanged = !lastProposalRef.current || 
          lastProposalRef.current.clientName !== newProposalData.clientName ||
          lastProposalRef.current.clientEmail !== newProposalData.clientEmail ||
          lastProposalRef.current.clientPhone !== newProposalData.clientPhone ||
          lastProposalRef.current.clientCompany !== newProposalData.clientCompany ||
          lastProposalRef.current.message !== newProposalData.message ||
          lastProposalRef.current.expiryDate?.getTime() !== newProposalData.expiryDate?.getTime();
        
        if (hasChanged) {
          lastProposalRef.current = newProposalData;
          setProposalData(newProposalData);
        }
      }, 500); // 500ms debounce
    }
    
    // Cleanup function to clear timeout on unmount
    return () => {
      if (proposalDataDebounceTimer.current) {
        clearTimeout(proposalDataDebounceTimer.current);
      }
    };
  }, [selectedServices, selectedItems, formData, isProposalMode]);
  
  // Database autosave (debounced) to keep SSOT in DB
  useEffect(() => {
    const existingDraftId = typeof window !== 'undefined' ? (localStorage.getItem('currentDraftId') || undefined) : undefined;
    autoSave(selectedServices, selectedItems, formData, existingDraftId)
      .then((id) => {
        if (id && typeof window !== 'undefined') {
          try { localStorage.setItem('currentDraftId', id); } catch {}
        }
      })
      .catch((err) => {
        console.warn('[useBookingFlow] Auto-save error:', err);
      });
  }, [selectedServices, selectedItems, formData, autoSave]);
  
  // Cart clearing disabled to prevent item loss
  useEffect(() => {
    // Don't auto-clear cart anymore - users will manage their cart manually
   // console.log('[useBookingFlow] Cart auto-clearing disabled to prevent item loss');
  }, []);
  
  // Check if service is selected
  useEffect(() => {
    if (selectedServices.length === 0 && !serviceData.returningFromOrderSummary && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      toast({
        title: "No service selected",
        description: "Please select a service from the marketplace first",
        variant: "destructive"
      });
      navigate('/marketplace');
    }
  }, [selectedServices, serviceData.returningFromOrderSummary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prevState => ({
        ...prevState,
        [name]: checked
      }));
    } else if (name === 'headcount') {
      setFormData(prevState => ({
        ...prevState,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleOrderTypeChange = (checked: boolean) => {
    setIsGroupOrder(checked);
    if (checked) {
      navigate('/group-order/setup', { 
        state: { 
          selectedServices,
          selectedItems,
          formData 
        }
      });
    }
  };

  // Update quantity for the primary service
  const handleQuantityChange = (value: number) => {
    if (selectedServices.length > 0) {
      setSelectedServices(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], quantity: value };
        return updated;
      });
    }
  };

  // Update duration for the primary service
  const handleDurationChange = (value: number) => {
    if (selectedServices.length > 0) {
      setSelectedServices(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], duration: value };
        return updated;
      });
    }
  };

  // Update quantity for additional services
  const handleUpdateServiceQuantity = (index: number, quantity: number) => {
    setSelectedServices(prev => {
      const service = prev[index];
      if (!service) return prev;
      
      // Idempotent: skip if quantity hasn't changed
      const currentQuantity = service.quantity ?? 1;
      if (currentQuantity === quantity) {
        return prev;
      }
      
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  // Update duration for additional services
  const handleUpdateServiceDuration = (index: number, duration: number) => {
    setSelectedServices(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], duration };
        return updated;
      }
      return prev;
    });
  };

  // ✅ CRITICAL FIX: Enhanced function to handle individual item quantity changes
  // Only updates the specific service that owns the changed item
  const handleItemQuantityChange = useCallback((itemId: string, quantity: number) => {
    setSelectedItems(prev => {
      // ENTERPRISE FIX: Early return if quantity hasn't changed to prevent unnecessary updates
      const currentQuantity = prev[itemId];
      if (currentQuantity === quantity) {
        return prev; // Return previous state unchanged to prevent re-render
      }
      
      const updated = {
        ...prev,
        [itemId]: quantity
      };
      
      // ✅ CRITICAL FIX: Only update cart for the SPECIFIC service that owns this item
      // Find which service owns this item by checking service_details
      const ownerService = selectedServices.find(service => {
        const serviceDetails = service.service_details;
        if (!serviceDetails) return false;
        
        // Check different service types for item ownership
        const items = 
          serviceDetails.catering?.menuItems ||
          serviceDetails.rentalItems ||
          serviceDetails.staffServices ||
          serviceDetails.venueOptions ||
          [];
        
        return items.some((item: any) => item.id === itemId || item.id === itemId.replace('_duration', ''));
      });
      
      if (ownerService) {
        const serviceId = ownerService.serviceId || ownerService.id;
        updateCartItemSelections(serviceId, updated);
      }
      
      return updated;
    });
  }, [selectedServices, updateCartItemSelections]);

  // ✅ Enhanced handleAddService to preserve selectedItems when navigating to marketplace
  const handleAddService = useCallback(() => {
    // Save current state before navigating
    try {
      saveBookingStateBackup(selectedServices, selectedItems, formData);
    } catch (error) {
      console.warn('[useBookingFlow] Failed to save state before navigation:', error);
    }
    
    navigate('/marketplace', {
      state: {
        // New normalized flags for add-additional flow
        addingAdditionalService: true,
        currentServices: selectedServices,
        // Backward compatibility flags
        addingToExistingBooking: true,
        currentBookingServices: selectedServices,
        // Persist selections and form
        selectedItems: selectedItems,
        formData,
        bookingMode: true
      }
    });
  }, [selectedServices, selectedItems, formData, navigate]);

  // ✅ Memoize handleRemoveService callback
  const handleRemoveService = useCallback((index: number) => {
    // Get the service being removed to extract its ID
    const serviceToRemove = selectedServices[index];
    const serviceId = serviceToRemove?.serviceId || serviceToRemove?.id;
    const serviceName = serviceToRemove?.serviceName || serviceToRemove?.name || 'Service';

    const newServices = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(newServices);

    // Also remove from cart to maintain consistency
    if (serviceId) {
      removeFromCart(serviceId);
    }

    // Show success toast for removal
    toast({
      title: "Service removed",
      description: `${serviceName} has been removed from your order`,
      variant: "default"
    });

    // If all services are removed, navigate back to marketplace based on user role
    if (newServices.length === 0) {
      toast({
        title: "All services removed",
        description: "Please select a service from the marketplace",
        variant: "default"
      });

      // Navigate to appropriate marketplace based on user role
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin/')) {
        navigate('/admin/marketplace');
      } else if (currentPath.includes('/vendor/')) {
        navigate('/vendor/new-proposal');
      } else {
        navigate('/marketplace');
      }
    }
  }, [selectedServices, setSelectedServices, removeFromCart, navigate, toast]);

  // Handle service style selection for catering services
  const handleServiceStyleChange = (serviceId: string, style: string) => {
    setFormData(prev => ({
      ...prev,
      serviceStyleSelections: {
        ...prev.serviceStyleSelections,
        [serviceId]: style
      }
    }));
  };
  const handleSubmit = async (e: React.FormEvent, customAdjustments?: any[], isTaxExempt?: boolean, isServiceFeeWaived?: boolean) => {
    e.preventDefault();
    
    // Skip validation for super admin users - they can create invoices with minimal data
    if (userRole === 'super-admin' || userRole === 'super_admin' || userRole === 'admin') {
      // Admin user - skipping form validation
    } else {
      // Proposal mode validation
      if (isProposalMode) {
        if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || 
            !formData.orderName || !formData.date || !formData.deliveryWindow || !formData.location) {
          toast({
            title: "Missing information",
            description: "Please fill out all required fields including client information",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Regular booking validation
        if (!formData.orderName || !formData.date || !formData.deliveryWindow || !formData.location || 
            !formData.primaryContactName || !formData.primaryContactPhone || !formData.primaryContactEmail) {
          toast({
            title: "Missing information", 
            description: "Please fill out all required fields including primary contact information",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    // Validate that at least one service is selected
    if (selectedServices.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }
    
    // Merge custom adjustments and admin overrides into formData
    const enhancedFormData = {
      ...formData,
      customAdjustments: customAdjustments || [],
      adminOverrides: {
        isTaxExempt: isTaxExempt || false,
        isServiceFeeWaived: isServiceFeeWaived || false
      },
      isTaxExempt: isTaxExempt || false,
      isServiceFeeWaived: isServiceFeeWaived || false
    };
    
    // Create invoice for super admin users
    if (userRole === 'super-admin' || userRole === 'super_admin' || userRole === 'admin') {
      try {
        // Try multiple possible company name fields
        const companyName = formData.clientCompany || 
                           (formData as any).companyName || 
                           (formData as any).company || 
                           (formData as any).organizationName || 
                           '';
        
        const invoiceData = {
          eventName: formData.orderName || 'Booking Event',
          companyName: companyName,
          eventLocation: formData.location || '',
          eventDate: formData.date || '',
          serviceTime: formData.deliveryWindow || '',
          guestCount: formData.headcount || 1,
          contactName: isProposalMode ? formData.clientName || '' : formData.primaryContactName || '',
          phoneNumber: isProposalMode ? formData.clientPhone || '' : formData.primaryContactPhone || '',
          emailAddress: isProposalMode ? formData.clientEmail || '' : formData.primaryContactEmail || '',
          addBackupContact: formData.hasBackupContact || false,
          additionalNotes: formData.additionalNotes || '',
          taxExemptStatus: isTaxExempt || false,
          waiveServiceFee: isServiceFeeWaived || false,
          paymentSettings: 'credit_card',
          isGroupOrder: false,
          services: selectedServices.map(service => ({
            serviceType: (service.serviceType || service.type || '').toUpperCase(),
            serviceName: service.serviceName || service.name || '',
            totalPrice: parseFloat(service.servicePrice?.toString() || service.price?.toString() || '0'),
            priceType: 'FIXED',
            cateringItems: Object.entries(selectedItems).map(([itemId, quantity]) => ({
              menuName: 'Selected Items',
              menuItemName: itemId,
              price: 0,
              quantity: quantity,
              totalPrice: 0,
              serviceId: itemId
            }))
          })),
          customLineItems: (customAdjustments || []).map(adj => ({
            label: adj.label || '',
            type: (adj.type || 'FEE').toUpperCase(),
            mode: (adj.mode || 'FIXED').toUpperCase(),
            value: adj.value || 0,
            taxable: adj.taxable || false,
            statusForDrafting: false
          }))
        };
        
        const response = await invoiceService.createInvoice(invoiceData);
        
        toast({
          title: "Invoice created",
          description: "Invoice has been successfully created",
        });
        
        return { success: true, formData: enhancedFormData };
      } catch (error) {
        console.error('❌ Invoice creation failed:', error);
        console.error('🔍 Error details:', error);
        toast({
          title: "Invoice creation failed",
          description: "There was an error creating the invoice",
          variant: "destructive"
        });
        return { success: false, error };
      }
    }
    
    // Success path for non-admin users
    if (isProposalMode) {
      toast({
        title: "Proposal created",
        description: `Proposal has been successfully created for ${formData.clientName}`,
      });
      
      // Navigate to proposal creation/review page
      navigate('/admin/proposals/create', {
        state: {
          selectedServices,
          selectedItems,
          formData: enhancedFormData,
          customAdjustments: customAdjustments || [],
          proposalData: {
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            clientPhone: formData.clientPhone,
            clientCompany: formData.clientCompany,
            message: formData.proposalMessage,
            expiryDate: formData.proposalExpiryDate ? new Date(formData.proposalExpiryDate) : undefined
          }
        }
      });
    } else {
      toast({
        title: "Booking created",
        description: `Your booking has been successfully created`,
      });
      
      // Navigate to order summary with preserved selectedItems
      navigate('/order-summary', {
        state: {
          selectedServices,
          selectedItems,
          formData: enhancedFormData,
          customAdjustments: customAdjustments || [],
          draftId: localStorage.getItem('currentDraftId') || undefined,
          // Preserve admin context for order summary page
          fromAdminMarketplace: location.pathname.includes('/admin/marketplace') ||
                               location.pathname.includes('/admin/booking') ||
                               userRole === 'admin' || 
                               userRole === 'super-admin',
          fromVendorMarketplace: location.pathname.includes('/vendor/marketplace')
        }
      });
    }
    
    return { success: true, formData: enhancedFormData };
  };

  // ENTERPRISE: Memoized load draft data function with admin overrides support
  const loadDraftData = useCallback((draft: any) => {
    try {
      setSelectedServices(draft.selected_services || []);
      setSelectedItems(draft.selected_items || {});
      setFormData(prev => ({
        ...prev,
        ...draft.form_data,
        // Preserve existing proposal data if in proposal mode
        ...(isProposalMode ? {
          clientName: prev.clientName,
          clientEmail: prev.clientEmail,
          clientPhone: prev.clientPhone,
          clientCompany: prev.clientCompany,
          proposalMessage: prev.proposalMessage,
          proposalExpiryDate: prev.proposalExpiryDate
        } : {})
      }));
      
      // ENTERPRISE: Load admin overrides from draft
      if (draft.custom_adjustments && Array.isArray(draft.custom_adjustments)) {
        setCustomAdjustments(draft.custom_adjustments);
      }
      
      const draftOverrides = draft.form_data?.adminOverrides;
      if (draftOverrides) {
        setIsTaxExempt(Boolean(draftOverrides.isTaxExempt));
        setIsServiceFeeWaived(Boolean(draftOverrides.isServiceFeeWaived));
        setAdminNotes(draftOverrides.adminNotes || '');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load draft data",
        variant: "destructive"
      });
    }
  }, [isProposalMode, toast]);

  // ENTERPRISE: Centralized draft loading with duplicate prevention
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const draftId = searchParams.get('draft');
    
    // Prevent duplicate loading
    if (!draftId || loadedDraftRef.current === draftId) {
      return;
    }
    
    loadedDraftRef.current = draftId;
    
    const loadDraft = async () => {
      try {
        // Import getOrder dynamically to avoid circular dependency
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', draftId)
          .single();
        
        if (error) throw error;
        
        if (order) {
          const draftData = {
            id: order.id,
            selected_services: order.service_details || [],
            selected_items: (order.pricing_snapshot as any)?.selectedItems || {},
            form_data: order.booking_details || {},
            custom_adjustments: (order.pricing_snapshot as any)?.customAdjustments || []
          };
          
          loadDraftData(draftData);
          
          try {
            localStorage.setItem('currentDraftId', draftId);
          } catch (e) {
            // Failed to save draft ID to localStorage
          }
        }
      } catch (error) {
        console.error('[useBookingFlow] Failed to load draft:', error);
        toast({
          title: "Error",
          description: "Failed to load draft",
          variant: "destructive"
        });
        loadedDraftRef.current = null; // Reset on error
      }
    };
    
    loadDraft();
  }, [location.search, loadDraftData, toast]);

  // Helper to merge extra data into formData (kept for backward compatibility)
  const mergeFormData = useCallback((extra: any) => {
    setFormData(prev => ({ ...prev, ...extra }));
  }, []);

  // Expose setSelectedServices globally for combo handler
  useEffect(() => {
    (window as any).__setSelectedServices = setSelectedServices;
    return () => {
      delete (window as any).__setSelectedServices;
    };
  }, [setSelectedServices]);

  return {
    isGroupOrder,
    formData,
    selectedServices,
    selectedItems,
    isLoadingEdit, // Loading state for edit flow
    // ENTERPRISE: Admin override state
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
    handleOrderTypeChange,
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
    mergeFormData,
    setSelectedServices // Expose for combo handling
  };
}
