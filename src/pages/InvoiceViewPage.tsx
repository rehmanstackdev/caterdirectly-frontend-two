import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { Loader2, CheckCircle, XCircle, Edit, History, Copy, Download, ArrowLeft } from 'lucide-react';
import ProposalChangeRequestForm from '@/components/proposal/ProposalChangeRequestForm';
import ProposalRevisionHistory from '@/components/proposal/ProposalRevisionHistory';
import BookingDetailsCard from '@/components/order-summary/BookingDetailsCard';
import OrderItemsBreakdown from '@/components/order-summary/OrderItemsBreakdown';
import PaymentMethodCard from '@/components/order-summary/PaymentMethodCard';
import { ErrorBoundary as UIErrorBoundary } from '@/components/ui/error-boundary';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { calculateUnifiedOrderTotals } from '@/utils/unified-calculations';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';
import invoiceService from '@/services/api/invoice.Service';
import { generateInvoicePDF } from '@/utils/invoice-pdf-generator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
// Date display helper to avoid timezone shifts and ensure SSOT
const toDisplayDate = (val?: string | Date | null) => {
  if (!val) return '';
  try {
    if (typeof val === 'string') {
      const ymd = val.split('T')[0];
      const parts = ymd.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
          return format(new Date(y, m - 1, d), 'MMMM d, yyyy');
        }
      }
      const parsed = new Date(val);
      return Number.isNaN(parsed.getTime()) ? '' : format(parsed, 'MMMM d, yyyy');
    }
    return format(val, 'MMMM d, yyyy');
  } catch {
    return '';
  }
};

const InvoiceViewPage = () => {
  const { id } = useParams();
  const token = id;
  const { settings: adminSettings } = useAdminSettings();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showChangeRequestForm, setShowChangeRequestForm] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [billingAddress, setBillingAddress] = useState<string | null>(null);
  const [stripeTax, setStripeTax] = useState<any | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [additionalTip, setAdditionalTip] = useState<number | null>(null);
  const { processInvoicePayment, isProcessing: isProcessingPayment } = useInvoicePayment();

  // Transformed invoice data state
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [isLoadingInvoiceSummary, setIsLoadingInvoiceSummary] = useState(false);

  // Extract admin overrides from invoice data
  const { isTaxExempt, isServiceFeeWaived } = useMemo(() => {
    if (!invoice) {
      return {
        isTaxExempt: false,
        isServiceFeeWaived: false
      };
    }
    
    return {
      isTaxExempt: Boolean(invoice.taxExemptStatus || invoice.isTaxExempt || false),
      isServiceFeeWaived: Boolean(invoice.waiveServiceFee || invoice.isServiceFeeWaived || false)
    };
  }, [invoice]);

  // Calculate pricing data from invoice
  const pricingData = useMemo(() => {
    if (!invoice || !selectedServices.length) return null;
    
    try {
      // Use pricing snapshot if available
      if (invoice.pricing_snapshot) {
        const snapshot = invoice.pricing_snapshot as any;

        // Calculate total including tax (snapshot.total might not include tax)
        const snapshotTotal = snapshot.subtotal + snapshot.serviceFee + snapshot.deliveryFee +
                              (snapshot.adjustmentsTotal || 0) + (snapshot.tax || 0);

        return {
          subtotal: snapshot.subtotal,
          serviceFee: snapshot.serviceFee,
          deliveryFee: snapshot.deliveryFee,
          adjustmentsTotal: snapshot.adjustmentsTotal || 0,
          adjustmentsBreakdown: snapshot.adjustmentsBreakdown || [],
          tax: snapshot.tax,
          taxRate: snapshot.taxRate,
          taxLocation: snapshot.taxLocation,
          total: snapshotTotal,
          isTaxExempt: snapshot.overrides?.isTaxExempt || false,
          isServiceFeeWaived: snapshot.overrides?.isServiceFeeWaived || false,
          fromSnapshot: true
        };
      }
      
      // Fallback: Calculate live
      const orderTotals = calculateUnifiedOrderTotals(
        selectedServices,
        selectedItems,
        formData?.location,
        adminSettings,
        undefined,
        formData?.customAdjustments || [],
        undefined,
        isTaxExempt,
        isServiceFeeWaived
      );
      
      // Calculate total delivery fees from all services (same as HostOrderSummaryPage)
      const totalDeliveryFees = selectedServices.reduce((total, service) => {
        const deliveryFee = parseFloat((service as any).deliveryFee || '0') || 0;
        return total + deliveryFee;
      }, 0);
      
      const taxableAdjustments = (orderTotals.adjustmentsBreakdown || [])
        .filter(adj => adj.taxable !== false)
        .reduce((sum, adj) => sum + adj.amount, 0);

      const preTaxTotal = orderTotals.subtotal + orderTotals.serviceFee + totalDeliveryFees + taxableAdjustments;

      // Use location-based tax calculation (orderTotals.tax includes location-based tax)
      const tax = isTaxExempt ? 0 : orderTotals.tax;
      const taxRate = orderTotals.taxData?.rate || 0;

      return {
        subtotal: orderTotals.subtotal,
        serviceFee: orderTotals.serviceFee,
        deliveryFee: totalDeliveryFees,
        adjustmentsTotal: orderTotals.adjustmentsTotal || 0,
        adjustmentsBreakdown: orderTotals.adjustmentsBreakdown || [],
        tax,
        taxRate,
        taxLocation: formData?.location || '',
        total: preTaxTotal + tax,
        isTaxExempt,
        isServiceFeeWaived,
        fromSnapshot: false
      };
    } catch (error) {
      console.error('[InvoiceViewPage] Error getting pricing data:', error);
      return null;
    }
  }, [invoice, selectedServices, selectedItems, formData, adminSettings, isTaxExempt, isServiceFeeWaived]);

  // Create tax override from pricing data for OrderItemsBreakdown
  const getProposalTaxOverride = () => {
    if (!pricingData) return null;
    
    return {
      amount: pricingData.tax,
      rate: pricingData.taxRate,
      location: pricingData.taxLocation,
      breakdown: [{
        tax_rate: pricingData.taxRate,
        taxable_amount: pricingData.subtotal + pricingData.serviceFee + pricingData.deliveryFee + 
          (pricingData.adjustmentsBreakdown?.filter((adj: any) => adj.taxable !== false).reduce((sum: number, adj: any) => sum + adj.amount, 0) || 0),
        tax_amount: pricingData.tax
      }]
    };
  };

  // Load invoice data from API
  useEffect(() => {
    const loadInvoice = async () => {
      if (!token) {
        toast.error('No invoice token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setIsLoadingInvoiceSummary(true);
        
        // Get invoice summary using token (same as OrderSummaryPage uses invoiceId)
        const response = await invoiceService.getInvoiceOrderSummary(token);
        
        if (!response?.data?.invoice) {
          toast.error('Invoice not found');
          setLoading(false);
          setIsLoadingInvoiceSummary(false);
          return;
        }

        const summaryInvoiceData = response.data.invoice;
        const summaryData = response.data;
        
        // Set invoice data (token is preserved in summaryInvoiceData if available)
        const mergedInvoice = {
          ...summaryInvoiceData,
          token: summaryInvoiceData.token || token,
          status: summaryInvoiceData.status,
          message: summaryInvoiceData.message,
          expires_at: summaryInvoiceData.expires_at,
          pricing_snapshot: summaryInvoiceData.pricing_snapshot
        };
        
        setInvoice(mergedInvoice);
        
        // Map services from API to ServiceSelection format (same as HostOrderSummaryPage)
        const mappedSelectedItems: Record<string, number> = {};
        
        const mappedServices: ServiceSelection[] = (summaryInvoiceData.services || []).map((service: any) => {
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
              const comboCategoryItems = (summaryInvoiceData.services || []).flatMap((s: any) => 
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
            const allComboCategoryItems = (summaryInvoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
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
            // Map comboCategoryItems from API to the format expected by calculation
            const mappedComboCategoryItems = (service.comboCategoryItems || []).map((item: any) => ({
              id: item.id,
              name: item.menuItemName || item.name,
              menuName: item.menuName,
              price: parseFloat(item.price) || 0,
              quantity: item.quantity || 1,
              additionalCharge: item.premiumCharge ? parseFloat(item.premiumCharge) : 0,
              comboId: item.comboId,
              cateringId: item.cateringId,
              image: item.image || item.imageUrl || ''
            }));

            // Add image field to menuItems for display
            const menuItemsWithImages = menuItems.map((mi: any) => ({
              ...mi,
              image: mi.image || mi.imageUrl || ''
            }));

            serviceDetails = {
              catering: {
                menuItems: menuItemsWithImages
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
        
        // Map custom line items to custom adjustments
        const mappedAdjustments: CustomAdjustment[] = (summaryInvoiceData.customLineItems || []).map((item: any) => ({
          id: item.id,
          label: item.label,
          type: item.type === 'percentage' ? 'percentage' : 'fixed',
          mode: item.mode === 'surcharge' ? 'surcharge' : 'discount',
          value: parseFloat(item.value) || 0,
          taxable: item.taxable !== false
        }));
        
        // Map invoice data to formData
        const mappedFormData = {
          invoiceId: summaryInvoiceData.id,
          eventName: summaryInvoiceData.eventName || '',
          company: summaryInvoiceData.companyName || '',
          location: summaryInvoiceData.eventLocation || '',
          date: summaryInvoiceData.eventDate || '',
          time: summaryInvoiceData.serviceTime || '',
          headcount: summaryInvoiceData.guestCount || 1,
          primaryContactName: summaryInvoiceData.contactName || '',
          primaryContactPhone: summaryInvoiceData.phoneNumber || '',
          primaryContactEmail: summaryInvoiceData.emailAddress || '',
          additionalNotes: summaryInvoiceData.additionalNotes || '',
          customAdjustments: mappedAdjustments,
          adminOverrides: {
            isTaxExempt: summaryInvoiceData.taxExemptStatus || false,
            isServiceFeeWaived: summaryInvoiceData.waiveServiceFee || false
          },
          isTaxExempt: summaryInvoiceData.taxExemptStatus || false,
          isServiceFeeWaived: summaryInvoiceData.waiveServiceFee || false
        };
        
        // Add combo category items to selectedItems
        const allComboCategoryItems = (summaryInvoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
        allComboCategoryItems.forEach((item: any) => {
          const itemKey = `${item.comboId}_${item.menuName}_${item.cateringId}`;
          mappedSelectedItems[itemKey] = item.quantity;
        });
        
        // Set state from API data
        setSelectedServices(mappedServices);
        setSelectedItems(mappedSelectedItems);
        setFormData(mappedFormData);
        
        // Store payment intent data (same as OrderSummaryPage)
        if (summaryData.paymentIntentId) {
          setPaymentIntentId(summaryData.paymentIntentId);
        }
        if (summaryData.clientSecret) {
          setClientSecret(summaryData.clientSecret);
        }
        
        // Fetch associated order if available
        if (mergedInvoice.order_id) {
          // Order data would come from API if needed
          setOrder({ id: mergedInvoice.order_id, payment_status: mergedInvoice.payment_status });
        }
        
        setLoading(false);
        setIsLoadingInvoiceSummary(false);
      } catch (error: any) {
        console.error('Error loading invoice:', error);
        toast.error(error.message || 'Failed to load invoice');
        setLoading(false);
        setIsLoadingInvoiceSummary(false);
      }
    };

    loadInvoice();
  }, [token]);

  const handleApproveProposal = async () => {
    setShowPaymentForm(true);
  };

  const calculateTotal = () => {
    // Calculate from state - exclude tax (same as OrderSummaryPage)
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
      undefined, // distancesByService removed - API provides this
      isTaxExempt,
      isServiceFeeWaived
    );
    
    // Calculate total delivery fees from all services (same as HostOrderSummaryPage)
    const totalDeliveryFees = selectedServices.reduce((total, service) => {
      const deliveryFee = parseFloat((service as any).deliveryFee || '0') || 0;
      return total + deliveryFee;
    }, 0);

    // Include tax in the total calculation
    return baseTotals.subtotal + baseTotals.serviceFee + totalDeliveryFees + (baseTotals.adjustmentsTotal || 0) + baseTotals.tax;
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log('[InvoiceViewPage] Payment successful, order created:', orderId);
    // Navigate to order confirmation (same as OrderSummaryPage)
   // window.location.href = `/order-confirmation?orderId=${orderId}`;
   navigate('/proposals/thank-you')
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  const handleDecline = async () => {
    if (!invoice?.id) {
      toast.error('Invoice ID not found');
      return;
    }

    setDeclining(true);
    
    try {
      await invoiceService.updateInvoiceStatus(invoice.id, 'declined');
      toast.success('Proposal declined successfully');
      
      // Navigate to declined confirmation page
      navigate('/invoices/declined');
    } catch (error: any) {
      console.error('Error declining invoice:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to decline invoice. Please try again.';
      toast.error(errorMessage);
      setDeclining(false);
    }
  };

  const handleCopyLink = async () => {
    setCopyingLink(true);
    const currentUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    } finally {
      setCopyingLink(false);
    }
  };

  const handleDownloadPDF = async () => {
    const invoiceId = invoice?.id;
    
    if (!invoiceId) {
      toast.error("No Invoice Available", {
        description: "Cannot download invoice. No invoice ID found."
      });
      return;
    }

    setGeneratingPdf(true);
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
      console.error('Error generating PDF:', error);
      toast.error("Download Failed", {
        description: error instanceof Error ? error.message : "Failed to download invoice"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleRequestChanges = () => {
    setShowChangeRequestForm(true);
  };

  const handleChangeRequestBack = () => {
    setShowChangeRequestForm(false);
    // Reload invoice to get updated status
    window.location.reload();
  };

  const handleToggleRevisionHistory = () => {
    setShowRevisionHistory(!showRevisionHistory);
  };

  if (loading || isLoadingInvoiceSummary) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header hideNavigation={true} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header hideNavigation={true} />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
            <p className="text-gray-600">This invoice may have expired or the link is invalid.</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideNavigation={true} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {showChangeRequestForm ? (
            <ProposalChangeRequestForm 
              proposal={invoice}
              onBack={handleChangeRequestBack}
            />
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  {(order?.payment_status === 'paid' || invoice.status === 'paid') ? '🧾 RECEIPT' : '📋 PROPOSAL'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Proposal for {invoice.contactName || invoice.client_name}</h1>
                <p className="text-gray-600 text-sm sm:text-base">From {invoice.vendorName || 'CaterDirectly'}</p>
                
                {/* Action buttons for sharing and downloading */}
                <div className={`flex ${isMobile ? 'flex-col' : 'justify-center'} gap-3 mt-4 sm:mt-6`}>
                  <Button
                    variant="outline"
                    size={isMobile ? "default" : "sm"}
                    onClick={handleCopyLink}
                    disabled={copyingLink}
                    className={`flex items-center gap-2 ${isMobile ? 'justify-center min-h-[44px]' : ''}`}
                  >
                    <Copy className="h-4 w-4" />
                    {copyingLink ? 'Copying...' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    size={isMobile ? "default" : "sm"}
                    onClick={handleDownloadPDF}
                    disabled={generatingPdf}
                    className={`flex items-center gap-2 ${isMobile ? 'justify-center min-h-[44px]' : ''}`}
                  >
                    <Download className="h-4 w-4" />
                    {generatingPdf ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
                {invoice.status === 'revision_requested' && (
                  <Card className="mt-4 p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800 font-medium">⏳ Change Request Submitted</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      We're reviewing your requested changes and will send you an updated proposal soon.
                    </p>
                  </Card>
                )}
                {invoice.message && (
                  <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
                    <p className="text-blue-800">{invoice.message}</p>
                  </Card>
                )}
              </div>
              
              {/* Rich booking details and itemized breakdown */}
              <UIErrorBoundary 
                fallbackTitle="Unable to display proposal details" 
                fallbackMessage="We're showing a simplified view for now. Please refresh or contact support if this persists."
                showDetails={false}
              >
                <div className="space-y-4 sm:space-y-6">
                  <BookingDetailsCard formData={formData} />
                  <OrderItemsBreakdown
                    services={selectedServices}
                    selectedItems={selectedItems}
                    formData={formData}
                    billingAddress={invoice.eventLocation || invoice.location || null}
                    taxOverride={getProposalTaxOverride()}
                    serviceFeeOverride={{
                      serviceFeePercentage: adminSettings?.serviceFeePercentage || 3.0,
                      serviceFeeFixed: adminSettings?.serviceFeeFixed || 0.00,
                      serviceFeeType: adminSettings?.serviceFeeType || 'percentage',
                    }}
                    isTaxExempt={invoice?.pricing_snapshot?.overrides?.isTaxExempt ?? isTaxExempt}
                    isServiceFeeWaived={invoice?.pricing_snapshot?.overrides?.isServiceFeeWaived ?? isServiceFeeWaived}
                    pricingSnapshot={invoice?.pricing_snapshot ? pricingData : null}
                  />
                </div>
              </UIErrorBoundary>

              {showRevisionHistory && (
                <ProposalRevisionHistory proposalId={invoice.id} currentProposal={invoice} />
              )}

              {/* Payment Form - Show when approved */}
              {showPaymentForm ? (
                !pricingData ? (
                  <Card className="p-6 text-center">
                    <p className="text-red-600 font-semibold mb-2">Cannot process payment</p>
                    <p className="text-sm text-gray-600">
                      This invoice is missing pricing information. Please contact support.
                    </p>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelPayment}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Proposal
                        </Button>
                      </div>
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">Complete Your Payment</h3>
                        <p className="text-gray-600">
                          You're approving this proposal. Complete payment to confirm your order.
                        </p>
                      </div>

                      <Card className="p-4 sm:p-6 mb-6">
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
                        totalAmount={pricingData.total}
                        additionalTip={additionalTip ?? 0}
                        onPaymentSuccess={handlePaymentSuccess}
                        isProcessing={isProcessingPayment}
                        disabled={isProcessingPayment}
                        orderData={{
                          orderName: invoice.eventName || invoice.title,
                          name: invoice.eventName || invoice.title,
                          location: invoice.eventLocation || invoice.location || 'Event Location',
                          date: invoice.eventDate || invoice.service_date
                            ? (typeof (invoice.eventDate || invoice.service_date) === 'string'
                                ? (invoice.eventDate || invoice.service_date).split('T')[0]
                                : format(invoice.eventDate || invoice.service_date, 'yyyy-MM-dd'))
                            : '',
                          deliveryWindow: invoice.serviceTime || invoice.service_time || '',
                          time: invoice.serviceTime || invoice.service_time || '',
                          headcount: invoice.guestCount || invoice.headcount || 1,
                          guests: invoice.guestCount || invoice.headcount || 1,
                          primaryContactName: invoice.contactName || invoice.client_name,
                          primaryContactPhone: invoice.phoneNumber || invoice.client_phone,
                          primaryContactEmail: invoice.emailAddress || invoice.client_email,
                          additionalNotes: invoice.message || invoice.additionalNotes || '',
                          contact: invoice.contactName || invoice.client_name
                        }}
                        services={selectedServices}
                        selectedItems={selectedItems}
                        onBillingAddressChange={setBillingAddress}
                        onStripeTaxUpdate={setStripeTax}
                        clientSecret={clientSecret || undefined}
                        paymentIntentId={paymentIntentId || undefined}
                        invoiceId={invoice.id}
                        preTaxBreakdown={pricingData ? {
                          subtotal: pricingData.subtotal,
                          serviceFee: pricingData.serviceFee,
                          deliveryFee: pricingData.deliveryFee,
                          adjustmentsTotal: pricingData.adjustmentsTotal || 0,
                          tax: pricingData.tax,
                          taxRate: pricingData.taxRate,
                          currency: 'usd'
                        } : {
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
                            undefined, // distancesByService removed - API provides this
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
                            undefined, // distancesByService removed - API provides this
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
                            undefined, // distancesByService removed - API provides this
                            isTaxExempt,
                            isServiceFeeWaived
                          ).adjustmentsTotal || 0,
                          tax: 0,
                          taxRate: 0,
                          currency: 'usd'
                        }}
                        proposal={invoice}
                      />
                    </div>
                  </Card>
                )
              ) : invoice.status !== 'accepted' && invoice.status !== 'declined' && invoice.status !== 'revision_requested' && invoice.status !== 'paid' ? (
                /* Response Buttons - Show when not in payment mode and not finalized */
                <Card className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Your Response</h3>
                    <p className="text-gray-600">Please review the proposal and let us know your decision.</p>
                    <div className={`flex ${isMobile ? 'flex-col' : 'justify-center'} gap-4`}>
                      <Button
                        onClick={handleApproveProposal}
                        disabled={responding}
                        className={`${isMobile ? 'w-full min-h-[44px]' : ''} bg-green-600 hover:bg-green-700 text-white`}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {responding ? 'Processing...' : 'Approve & Pay'}
                      </Button>
                        <Button
                          variant="outline"
                          onClick={handleRequestChanges}
                          className={`${isMobile ? 'w-full min-h-[44px]' : ''}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Request Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDecline}
                          disabled={declining}
                          className={`${isMobile ? 'w-full min-h-[44px]' : ''}`}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {declining ? 'Processing...' : 'Decline'}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleToggleRevisionHistory}
                        className="mt-2"
                      >
                        <History className="mr-2 h-4 w-4" />
                        {showRevisionHistory ? 'Hide' : 'View'} Revision History
                      </Button>
                    </div>
                  </Card>
              ) : null}

              {invoice.status === 'paid' && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <p className="text-green-800 font-medium text-center text-xl">✅ Paid in Full</p>
                  <p className="text-green-700 text-sm text-center mt-1">
                    Payment received. Thank you for your business!
                  </p>
                </Card>
              )}

              {invoice.status === 'accepted' && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <p className="text-green-800 font-medium text-center">✅ Proposal Accepted</p>
                  <p className="text-green-700 text-sm text-center mt-1">
                    Thank you for accepting this proposal! We will contact you soon to finalize the details.
                  </p>
                </Card>
              )}

              {(invoice.status === 'declined' || invoice.status === 'revision_requested') && (
                <Card className="p-6 bg-gray-50 border-gray-200">
                  <p className="text-gray-800 font-medium text-center">
                    {invoice.status === 'revision_requested' ? '📝 Revision Requested' : '❌ Proposal Declined'}
                  </p>
                  <p className="text-gray-700 text-sm text-center mt-1">
                    {invoice.status === 'revision_requested'
                      ? 'Your change request is being reviewed. We will send you an updated proposal soon.'
                      : 'This proposal has been declined.'}
                  </p>
                </Card>
              )}
              
              {(invoice.expires_at || invoice.expiryDate) && (
                <p className="text-center text-sm text-gray-500">
                  This proposal expires on {toDisplayDate(invoice.expires_at || invoice.expiryDate)}
                </p>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InvoiceViewPage;
