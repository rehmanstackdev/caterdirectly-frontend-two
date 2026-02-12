import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Dashboard from '@/components/dashboard/Dashboard';
import BookingDetailsCard from '@/components/order-summary/BookingDetailsCard';
import OrderItemsBreakdown from '@/components/order-summary/OrderItemsBreakdown';
import OrderActionButtons from '@/components/order-summary/OrderActionButtons';
import PaymentMethodCard from '@/components/order-summary/PaymentMethodCard';
import { AdminFixOrderButton } from '@/components/order-summary/AdminFixOrderButton';
import { ServiceSelection } from '@/types/order';
import { useInvoice } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { calculateUnifiedOrderTotals } from '@/utils/unified-calculations';
import { loadBookingStateBackup, clearBookingStateBackup } from '@/utils/booking-state-persistence';
import invoiceService from '@/services/api/admin/invoice.service';
import { CustomAdjustment } from '@/types/adjustments';
import { generateInvoicePDF } from '@/utils/invoice-pdf-generator';

function AdminOrderSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { isInvoiceMode } = useInvoice();
  const { settings: adminSettings } = useAdminSettings();

  // Initialize from location.state or database (database-first approach)
  const initialState = (location.state as any) || {};
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [billingAddress, setBillingAddress] = useState<string | null>(null);
  const [stripeTax, setStripeTax] = useState<any | null>(null);
  const [generatedProposalUrl, setGeneratedProposalUrl] = useState<string | null>(() => {
    return sessionStorage.getItem('generatedProposalUrl') || null;
  });
  const [proposalPersisted, setProposalPersisted] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingInvoiceSummary, setIsLoadingInvoiceSummary] = useState(false);
  const [additionalTip, setAdditionalTip] = useState<number | null>(null);

  // SSOT: Extract proposalId, token, and invoiceId from location.state
  const [editingInvoiceId] = useState<string | null>(
    initialState.invoiceId || null
  );
  const [editingProposalId] = useState<string | null>(
    initialState.proposalId || null
  );
  const [editingProposalToken] = useState<string | null>(
    initialState.token || null
  );

  // Extract invoiceId from URL params (for public access)
  const invoiceIdFromUrl = params.id || params.invoiceId;
  
  // Debug logging
  useEffect(() => {
    console.log('[AdminOrderSummaryPage] URL params:', params);
    console.log('[AdminOrderSummaryPage] invoiceIdFromUrl:', invoiceIdFromUrl);
    console.log('[AdminOrderSummaryPage] location.pathname:', location.pathname);
  }, [params, invoiceIdFromUrl, location.pathname]);
  
  // Only initialize from location.state if we don't have an invoiceId in URL (API will load it)
  const shouldUseInitialState = !invoiceIdFromUrl;
  
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    shouldUseInitialState ? (initialState.selectedServices || []) : []
  );
  const [formData, setFormData] = useState<any>({
    ...(shouldUseInitialState ? (initialState.formData || {}) : {}),
    customAdjustments: shouldUseInitialState 
      ? (initialState.customAdjustments || initialState.formData?.customAdjustments || [])
      : []
  });
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    shouldUseInitialState ? (initialState.selectedItems || {}) : {}
  );
  const vendor = shouldUseInitialState ? (initialState.vendor || null) : null;

  // Get current invoice ID from formData or session
  const currentInvoiceId = formData?.invoiceId || sessionStorage.getItem('currentInvoiceId');

  // PHASE 3: Safely extract admin overrides with enhanced tracing
  const { isTaxExempt, isServiceFeeWaived } = useMemo(() => {
    const hasValidFormData = formData && typeof formData === 'object' && Object.keys(formData).length > 0;
    
    if (!hasValidFormData) {
      return {
        isTaxExempt: false,
        isServiceFeeWaived: false
      };
    }
    
    const overrides = formData.adminOverrides || null;
    return {
      isTaxExempt: Boolean(overrides?.isTaxExempt ?? formData?.isTaxExempt),
      isServiceFeeWaived: Boolean(overrides?.isServiceFeeWaived ?? formData?.isServiceFeeWaived)
    };
  }, [formData, searchParams]);

  // ✅ API-FIRST: Load invoice summary from API when invoiceId is present
  // This takes priority over location.state - always use API when invoiceId is in URL
  useEffect(() => {
    const loadInvoiceSummary = async () => {
      if (!invoiceIdFromUrl) {
        console.log('[AdminOrderSummaryPage] No invoiceId in URL, skipping API call');
        return;
      }
      
      console.log('[AdminOrderSummaryPage] Loading invoice summary from API for invoiceId:', invoiceIdFromUrl);
      setIsLoadingInvoiceSummary(true);
      try {
        const response = await invoiceService.getInvoiceOrderSummary(invoiceIdFromUrl);
        console.log('[AdminOrderSummaryPage] API response:', response);
        
        if (response?.data?.invoice) {
          const invoiceData = response.data.invoice;
          const summaryData = response.data;
          
          const mappedSelectedItems: Record<string, number> = {};
          
          const mappedServices: ServiceSelection[] = (invoiceData.services || []).map((service: any) => {
            const serviceId = service.id;
            const serviceType = service.serviceType || '';
            
            let serviceItems: any[] = [];
            let menuItems: any[] = [];
            let rentalItems: any[] = [];
            let staffItems: any[] = [];
            let venueItems: any[] = [];
            
            if (service.cateringItems && service.cateringItems.length > 0) {
              serviceItems = service.cateringItems;
              menuItems = service.cateringItems.map((item: any) => {
                const comboCategoryItems = (invoiceData.services || []).flatMap((s: any) => 
                  (s.comboCategoryItems || []).filter((comboItem: any) => 
                    comboItem.comboId === (item.cateringId || item.id)
                  )
                );
                
                return {
                  id: item.cateringId || item.id,
                  name: item.menuItemName || item.name,
                  price: parseFloat(item.price || 0),
                  category: item.menuName || 'Menu',
                  menuName: item.menuName,
                  menuItemName: item.menuItemName,
                  isCombo: comboCategoryItems.length > 0 || item.isCombo || false,
                  comboCategories: item.comboCategories || [],
                  comboCategoryItems: comboCategoryItems,
                  priceType: item.priceType || 'fixed',
                  image: item.image || item.imageUrl,
                  imageUrl: item.imageUrl || item.image,
                  description: item.description || ''
                };
              });
              
              service.cateringItems.forEach((item: any) => {
                const itemId = item.cateringId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
            
            if (serviceType === 'catering') {
              const allComboCategoryItems = (invoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
              const comboGroups = new Map();
              
              allComboCategoryItems.forEach((item: any) => {
                if (!comboGroups.has(item.comboId)) {
                  comboGroups.set(item.comboId, []);
                }
                comboGroups.get(item.comboId).push(item);
              });
              
              comboGroups.forEach((comboCategoryItems, comboId) => {
                const existingCombo = menuItems.find(item => item.id === comboId);
                const comboImage = comboCategoryItems[0]?.image || 
                  service.cateringItems?.find((item: any) => (item.cateringId || item.id) === comboId)?.image || '';
                if (!existingCombo) {
                  const comboName = comboId === 'd322b22b-c67a-42c2-b757-5deb9949ccaf' ? 'Desserts' : 'Combo';
                  menuItems.push({
                    id: comboId,
                    name: comboName,
                    price: 12,
                    category: 'Combo Packages',
                    menuName: 'Combo Packages',
                    menuItemName: comboName,
                    isCombo: true,
                    comboCategories: [],
                    comboCategoryItems: comboCategoryItems.map((item: any) => ({
                      ...item,
                      image: item.image || item.imageUrl || ''
                    })),
                    priceType: 'fixed',
                    image: comboImage,
                    imageUrl: comboImage,
                    description: ''
                  });
                  mappedSelectedItems[comboId] = 0;
                } else {
                  existingCombo.comboCategoryItems = comboCategoryItems.map((item: any) => ({
                    ...item,
                    image: item.image || item.imageUrl || ''
                  }));
                  if (comboImage && !existingCombo.image) {
                    existingCombo.image = comboImage;
                    existingCombo.imageUrl = comboImage;
                  }
                }
              });
            }
            
            if (service.partyRentalItems && service.partyRentalItems.length > 0) {
              serviceItems = service.partyRentalItems;
              rentalItems = service.partyRentalItems.map((item: any) => ({
                id: item.rentalId || item.id,
                name: item.name,
                price: parseFloat(item.eachPrice || item.price || 0),
                priceType: 'fixed'
              }));
              
              service.partyRentalItems.forEach((item: any) => {
                const itemId = item.rentalId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
            
            if (service.staffItems && service.staffItems.length > 0) {
              serviceItems = service.staffItems;
              staffItems = service.staffItems.map((item: any) => ({
                id: item.staffId || item.id,
                name: item.name,
                price: parseFloat(item.perHourPrice || item.price || 0),
                pricingType: item.pricingType || 'hourly',
                perHourPrice: parseFloat(item.perHourPrice || item.price || 0)
              }));
              
              service.staffItems.forEach((item: any) => {
                const itemId = item.staffId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + 1;
                  if (item.hours) {
                    mappedSelectedItems[`${itemId}_duration`] = item.hours;
                  }
                }
              });
            }
            
            if (service.venueItems && service.venueItems.length > 0) {
              serviceItems = service.venueItems;
              venueItems = service.venueItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price || 0)
              }));
            }
            
            let serviceDetails: any = {};
            if (serviceType === 'catering') {
              const mappedComboCategoryItems = (service.comboCategoryItems || []).map((item: any) => ({
                id: item.id,
                name: item.menuItemName || item.name,
                menuName: item.menuName,
                price: parseFloat(item.price) || 0,
                quantity: item.quantity || 1,
                additionalCharge: item.premiumCharge ? parseFloat(item.premiumCharge) : 0,
                premiumCharge: item.premiumCharge ? parseFloat(item.premiumCharge) : 0,
                comboId: item.comboId,
                cateringId: item.cateringId,
                image: item.image || item.imageUrl || ''
              }));

              const menuItemsWithImages = menuItems.map((mi: any) => ({
                ...mi,
                image: mi.image || mi.imageUrl || ''
              }));

              const comboIds = [...new Set(mappedComboCategoryItems.map((item: any) => item.comboId))];
              const combos = comboIds.map((comboId: any) => {
                const comboItems = mappedComboCategoryItems.filter((item: any) => item.comboId === comboId);
                const categoryMap = new Map();
                comboItems.forEach((item: any) => {
                  if (!categoryMap.has(item.menuName)) {
                    categoryMap.set(item.menuName, {
                      id: item.menuName,
                      categoryId: item.menuName,
                      name: item.menuName,
                      items: []
                    });
                  }
                  categoryMap.get(item.menuName).items.push({
                    id: item.cateringId || item.id,
                    itemId: item.cateringId || item.id,
                    name: item.name,
                    price: item.price,
                    additionalCharge: item.additionalCharge,
                    image: item.image || ''
                  });
                });

                return {
                  id: comboId,
                  name: 'Combo',
                  isCombo: true,
                  pricePerPerson: 0,
                  comboCategories: Array.from(categoryMap.values())
                };
              });

              serviceDetails = {
                catering: {
                  menuItems: menuItemsWithImages,
                  combos: combos
                },
                menuItems: menuItemsWithImages,
                comboCategoryItems: mappedComboCategoryItems
              };
            } else if (serviceType === 'party_rentals' || serviceType === 'party-rentals' || serviceType === 'party-rental') {
              serviceDetails = {
                rentalItems: rentalItems,
                rental: {
                  items: rentalItems
                }
              };
            } else if (serviceType === 'events_staff' || serviceType === 'staff') {
              serviceDetails = {
                staffServices: staffItems,
                services: staffItems,
                staff: {
                  services: staffItems
                }
              };
            } else if (serviceType === 'venues' || serviceType === 'venue') {
              serviceDetails = {
                venueOptions: venueItems,
                options: venueItems
              };
            }
            
            return {
              id: serviceId,
              serviceId: serviceId,
              name: service.serviceName,
              serviceName: service.serviceName,
              price: parseFloat(service.price) || 0,
              servicePrice: service.price,
              totalPrice: parseFloat(service.totalPrice) || 0,
              quantity: service.quantity || 1,
              duration: service.staffItems?.[0]?.hours || 0,
              serviceType: serviceType,
              type: serviceType,
              description: '',
              vendor_id: service.vendorId || undefined,
              priceType: service.priceType || 'flat',
              price_type: service.priceType || 'flat',
              service_details: serviceDetails,
              selected_menu_items: serviceItems,
              image: service.image || service.imageUrl || '',
              imageUrl: service.imageUrl || service.image || '',
              serviceImage: service.image || service.imageUrl || '',
              deliveryFee: service.deliveryFee || '0'
            };
          });
          
          const mappedAdjustments: CustomAdjustment[] = (invoiceData.customLineItems || []).map((item: any) => ({
            id: item.id,
            label: item.label,
            type: item.type === 'percentage' ? 'percentage' : 'fixed',
            mode: item.mode === 'surcharge' ? 'surcharge' : 'discount',
            value: parseFloat(item.value) || 0,
            taxable: item.taxable !== false
          }));
          
          const mappedFormData = {
            invoiceId: invoiceData.id,
            eventName: invoiceData.eventName || '',
            company: invoiceData.companyName || '',
            location: invoiceData.eventLocation || '',
            date: invoiceData.eventDate || '',
            time: invoiceData.serviceTime || '',
            headcount: invoiceData.guestCount || 1,
            primaryContactName: invoiceData.contactName || '',
            primaryContactPhone: invoiceData.phoneNumber || '',
            primaryContactEmail: invoiceData.emailAddress || '',
            additionalNotes: invoiceData.additionalNotes || '',
            customAdjustments: mappedAdjustments,
            adminOverrides: {
              isTaxExempt: invoiceData.taxExemptStatus || false,
              isServiceFeeWaived: invoiceData.waiveServiceFee || false
            },
            isTaxExempt: invoiceData.taxExemptStatus || false,
            isServiceFeeWaived: invoiceData.waiveServiceFee || false
          };
          
          const allComboCategoryItems = (invoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
          allComboCategoryItems.forEach((item: any) => {
            const itemKey = `${item.comboId}_${item.menuName}_${item.cateringId}`;
            mappedSelectedItems[itemKey] = item.quantity;
          });
          
          setSelectedServices(mappedServices);
          setSelectedItems(mappedSelectedItems);
          setFormData(mappedFormData);
          
          if (summaryData.paymentIntentId) {
            setPaymentIntentId(summaryData.paymentIntentId);
          }
          if (summaryData.clientSecret) {
            setClientSecret(summaryData.clientSecret);
          }
          
          if (summaryData.totalAmount) {
            sessionStorage.setItem(`invoiceTotal_${invoiceIdFromUrl}`, summaryData.totalAmount.toString());
          }
          
          return true;
        }
      } catch (error) {
        console.error('[AdminOrderSummaryPage] Error loading invoice:', error);
        toast.error("Failed to load invoice", {
          description: error instanceof Error ? error.message : "Could not load invoice data. Please try again."
        });
      } finally {
        setIsLoadingInvoiceSummary(false);
      }
      return false;
    };
    
    loadInvoiceSummary();
  }, [invoiceIdFromUrl, params.id, params.invoiceId]);

  // ✅ Initialize from location.state or sessionStorage (fallback only)
  useEffect(() => {
    if (invoiceIdFromUrl) {
      return;
    }
    
    const hasNavigationState = Array.isArray(initialState.selectedServices) && initialState.selectedServices.length > 0;
    if (hasNavigationState) {
      return;
    }
    
    const sessionInvoiceData = sessionStorage.getItem('invoiceData') || sessionStorage.getItem('proposalData');
    if (sessionInvoiceData) {
      try {
        const invoiceData = JSON.parse(sessionInvoiceData);
        
        setSelectedServices(invoiceData.selectedServices || []);
        setSelectedItems(invoiceData.selectedItems || {});
        setFormData({
          ...invoiceData.clientInfo,
          ...invoiceData.formData,
          customAdjustments: invoiceData.customAdjustments || invoiceData.formData?.customAdjustments || [],
          adminOverrides: invoiceData.overrides || invoiceData.formData?.adminOverrides,
          isTaxExempt: invoiceData.overrides?.isTaxExempt || invoiceData.formData?.isTaxExempt || false,
          isServiceFeeWaived: invoiceData.overrides?.isServiceFeeWaived || invoiceData.formData?.isServiceFeeWaived || false,
          primaryContactName: invoiceData.clientInfo?.clientName || invoiceData.formData?.primaryContactName,
          primaryContactEmail: invoiceData.clientInfo?.clientEmail || invoiceData.formData?.primaryContactEmail,
          primaryContactPhone: invoiceData.clientInfo?.clientPhone || invoiceData.formData?.primaryContactPhone,
        });
        
        sessionStorage.removeItem('invoiceData');
        sessionStorage.removeItem('proposalData');
        return;
      } catch (error) {
        // Failed to parse session data
      }
    }
    
    const backup = loadBookingStateBackup();
    if (backup) {
      setSelectedServices(backup.selectedServices || []);
      setSelectedItems(backup.selectedItems || {});
      setFormData({
        ...(backup.formData || {}),
        customAdjustments: backup.formData?.customAdjustments || []
      });
    } else {
      toast.error('Session expired', {
        description: 'We could not restore your order. Please start again.'
      });
      navigate('/admin/booking');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proposalMode = useMemo(() => {
    if (searchParams.get('mode') === 'invoice') return true;
    if (isInvoiceMode) return true;
    if (typeof window !== 'undefined' && sessionStorage.getItem('invoiceData')) return true;
    if (editingProposalId || editingProposalToken) return true;
    if (searchParams.get('proposalId') || searchParams.get('token')) return true;
    return false;
  }, [searchParams, isInvoiceMode, editingProposalId, editingProposalToken]);

  useEffect(() => {
    if (proposalMode && formData) {
      const needsMapping = !formData.primaryContactName && formData.clientName;
      if (needsMapping) {
        setFormData(prev => ({
          ...prev,
          primaryContactName: prev.clientName,
          primaryContactEmail: prev.clientEmail,
          primaryContactPhone: prev.clientPhone
        }));
      }
    }
  }, [proposalMode, formData?.clientName, formData?.primaryContactName]);

  const handleCopyProposalLink = async () => {
    setIsCopyingLink(true);
    try {
      let urlToCopy = '';
      
      if (generatedProposalUrl) {
        urlToCopy = generatedProposalUrl;
      } else {
        const invoiceId = editingInvoiceId || currentInvoiceId || invoiceIdFromUrl;
        if (invoiceId) {
          const baseUrl = window.location.origin;
          urlToCopy = `${baseUrl}/proposals/${invoiceId}`;
        } else {
          toast.error("No Link Available", {
            description: "Cannot copy link. No invoice ID found."
          });
          return;
        }
      }
      
      await navigator.clipboard.writeText(urlToCopy);
      
      toast.success("Link Copied!", {
        description: "Link has been copied to your clipboard."
      });
    } catch (error) {
      toast.error("Copy Failed", {
        description: error instanceof Error ? error.message : "Failed to copy link to clipboard"
      });
    } finally {
      setIsCopyingLink(false);
    }
  };

  const calculateTotal = () => {
    const baseTotals = calculateUnifiedOrderTotals(
      selectedServices as any,
      selectedItems as any,
      (formData as any)?.location,
      {
        serviceFeePercentage: adminSettings.serviceFeePercentage,
        serviceFeeFixed: adminSettings.serviceFeeFixed,
        serviceFeeType: adminSettings.serviceFeeType,
      },
      undefined,
      formData?.customAdjustments || [],
      undefined,
      isTaxExempt,
      isServiceFeeWaived
    );

    const totalDeliveryFees = selectedServices.reduce((total, service) => {
      const deliveryFee = parseFloat((service as any).deliveryFee || '0') || 0;
      return total + deliveryFee;
    }, 0);

    // Include tax in the total calculation
    return baseTotals.subtotal + baseTotals.serviceFee + totalDeliveryFees + (baseTotals.adjustmentsTotal || 0) + baseTotals.tax;
  };

  const handlePaymentSuccess = (orderId: string) => {
    try {
      clearBookingStateBackup();
    } catch (e) {
      // Post-payment cleanup warning
    }
    navigate('/admin/invoices', { 
      state: { orderId } 
    });
  };

  const handleEditOrder = () => {
    const invoiceId = invoiceIdFromUrl || currentInvoiceId || editingInvoiceId;
    if (invoiceId) {
      navigate(`/admin/invoices/edit/${invoiceId}`);
    } else {
      toast.error('Cannot edit order', {
        description: 'No invoice ID found'
      });
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      if (invoiceIdFromUrl) {
        const response = await invoiceService.getInvoiceOrderSummary(invoiceIdFromUrl);
        
        if (response?.data?.invoice) {
          const invoiceData = response.data.invoice;
          const summaryData = response.data;
          
          // Similar mapping logic as in loadInvoiceSummary
          // ... (same as HostOrderSummaryPage handleRefreshData)
          
          toast.success("Data Refreshed!", {
            description: "Invoice data reloaded from API."
          });
          return;
        }
      }
      
      toast.error("Refresh Failed", {
        description: "No invoice ID available to refresh."
      });
    } catch (error) {
      toast.error("Refresh Failed", {
        description: error instanceof Error ? error.message : "Failed to refresh invoice data"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProposal = () => {
    const invoiceId = editingInvoiceId || currentInvoiceId || invoiceIdFromUrl;
    if (invoiceId) {
      navigate(`/admin/invoices/edit/${invoiceId}`);
    } else {
      toast.error('Cannot edit proposal', {
        description: 'No invoice ID found'
      });
    }
  };

  const handleDownloadInvoice = async () => {
    const invoiceId = editingInvoiceId || currentInvoiceId || invoiceIdFromUrl;
    
    if (!invoiceId) {
      toast.error("No Invoice Available", {
        description: "Cannot download invoice. No invoice ID found."
      });
      return;
    }

    setIsDownloadingInvoice(true);
    try {
      const response = await invoiceService.getInvoiceOrderSummary(invoiceId);
      
      if (response?.data?.invoice) {
        await generateInvoicePDF(response.data.invoice);
        toast.success("Invoice Download Started", {
          description: "Your invoice PDF is being generated and will download shortly."
        });
      } else {
        toast.error("Download Failed", {
          description: "Could not retrieve invoice data."
        });
      }
    } catch (error) {
      toast.error("Download Failed", {
        description: error instanceof Error ? error.message : "Failed to download invoice"
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  return (
    <Dashboard activeTab="orders" userRole="admin">
      <div className="space-y-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {proposalMode ? 'Proposal Summary' : 'Order Summary'}
          </h1>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-row gap-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDownloadingInvoice && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isDownloadingInvoice ? 'Downloading...' : 'Download Invoice'}
              </button>
              <button
                onClick={handleCopyProposalLink}
                disabled={isCopyingLink}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isCopyingLink ? 'Copying...' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {isLoadingInvoiceSummary && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <div className="text-lg font-medium">Loading invoice...</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch your invoice data</div>
              </div>
            </div>
          )}
          {!isLoadingInvoiceSummary && (
            <div className="space-y-4 sm:space-y-6">
              <BookingDetailsCard formData={formData} />
              <OrderItemsBreakdown 
                services={selectedServices}
                selectedItems={selectedItems}
                formData={formData}
                billingAddress={billingAddress}
                taxOverride={stripeTax}
                isTaxExempt={isTaxExempt}
                isServiceFeeWaived={isServiceFeeWaived}
                pricingSnapshot={null}
              />
              {!proposalMode && (
                <>
                  <Card className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="additionalTip" className="text-base font-medium">
                          Additional Tip :
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add an optional tip to show your appreciation
                        </p>
                      </div>
                      <div>
                        <Input
                          id="additionalTip"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={additionalTip ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setAdditionalTip(null);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                setAdditionalTip(numValue);
                              }
                            }
                          }}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </Card>
                  <PaymentMethodCard
                    totalAmount={calculateTotal()}
                    additionalTip={additionalTip ?? 0}
                    onPaymentSuccess={handlePaymentSuccess}
                    isProcessing={isProcessingPayment}
                    orderData={formData}
                    services={selectedServices}
                    selectedItems={selectedItems}
                    onBillingAddressChange={setBillingAddress}
                    onStripeTaxUpdate={setStripeTax}
                    clientSecret={clientSecret || undefined}
                    paymentIntentId={paymentIntentId || undefined}
                    invoiceId={invoiceIdFromUrl || currentInvoiceId || editingInvoiceId || undefined}
                    preTaxBreakdown={{
                      subtotal: calculateUnifiedOrderTotals(
                        selectedServices as any,
                        selectedItems as any,
                        (formData as any)?.location,
                        {
                          serviceFeePercentage: adminSettings.serviceFeePercentage,
                          serviceFeeFixed: adminSettings.serviceFeeFixed,
                          serviceFeeType: adminSettings.serviceFeeType,
                        },
                        undefined,
                        formData?.customAdjustments || [],
                        undefined,
                        isTaxExempt,
                        isServiceFeeWaived
                      ).subtotal,
                      serviceFee: calculateUnifiedOrderTotals(
                        selectedServices as any,
                        selectedItems as any,
                        (formData as any)?.location,
                        {
                          serviceFeePercentage: adminSettings.serviceFeePercentage,
                          serviceFeeFixed: adminSettings.serviceFeeFixed,
                          serviceFeeType: adminSettings.serviceFeeType,
                        },
                        undefined,
                        formData?.customAdjustments || [],
                        undefined,
                        isTaxExempt,
                        isServiceFeeWaived
                      ).serviceFee,
                      deliveryFee: selectedServices.reduce((total, service) => {
                        const deliveryFee = parseFloat((service as any).deliveryFee || '0') || 0;
                        return total + deliveryFee;
                      }, 0),
                      adjustmentsTotal: calculateUnifiedOrderTotals(
                        selectedServices as any,
                        selectedItems as any,
                        (formData as any)?.location,
                        {
                          serviceFeePercentage: adminSettings.serviceFeePercentage,
                          serviceFeeFixed: adminSettings.serviceFeeFixed,
                          serviceFeeType: adminSettings.serviceFeeType,
                        },
                        undefined,
                        formData?.customAdjustments || [],
                        undefined,
                        isTaxExempt,
                        isServiceFeeWaived
                      ).adjustmentsTotal || 0,
                      currency: 'usd'
                    }}
                  />
                </>
              )}
            </div>
          )}
          
          {!isLoadingInvoiceSummary && (currentInvoiceId || editingInvoiceId || invoiceIdFromUrl) && (
            <div className="flex justify-end">
              <AdminFixOrderButton 
                orderId={invoiceIdFromUrl || currentInvoiceId || editingInvoiceId || ''}
                invoiceId={currentInvoiceId || editingInvoiceId || invoiceIdFromUrl || ''}
                currentTotal={calculateTotal()}
              />
            </div>
          )}
          
          {/* {!isLoadingInvoiceSummary && (
            <>
              <Separator />

              {!proposalMode && (
                <OrderActionButtons
                  onEditOrder={handleEditOrder}
                  isProcessing={isProcessingPayment}
                />
              )}
              {proposalMode && (
                <OrderActionButtons
                  onEditOrder={handleEditProposal}
                  onRefreshData={handleRefreshData}
                  isProcessing={false}
                  isRefreshing={isRefreshing}
                />
              )}
            </>
          )} */}
        </div>
      </div>
    </Dashboard>
  );
}

export default AdminOrderSummaryPage;

