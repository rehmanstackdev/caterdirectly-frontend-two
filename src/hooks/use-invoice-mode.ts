
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface InvoiceModeState {
  isInvoiceMode: boolean;
  selectedServices: any[];
  clientInfo: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
}

export function useInvoiceMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { toast } = useToast();
  
  const [invoiceMode, setInvoiceMode] = useState<InvoiceModeState>({
    isInvoiceMode: false,
    selectedServices: [],
    clientInfo: {
      name: '',
      email: '',
      company: '',
      phone: ''
    }
  });

  const [showVendorInfo, setShowVendorInfo] = useState(false);

  useEffect(() => {
    // Check if we're in invoice mode from URL params
    const urlParams = new URLSearchParams(location.search);
    const isInvoiceMode = urlParams.get('mode') === 'invoice';
    
    setInvoiceMode(prev => ({
      ...prev,
      isInvoiceMode
    }));

    // If entering invoice mode, show helpful message
    if (isInvoiceMode && !invoiceMode.isInvoiceMode) {
      const isVendorMode = urlParams.get('vendor') === 'true';
      
      if (isVendorMode && userRole === 'vendor') {
        // Check if vendor info should be shown
        const hasSeenVendorInfo = localStorage.getItem('vendor_invoice_info_dismissed') === 'true';
        if (!hasSeenVendorInfo) {
          setShowVendorInfo(true);
        }
      }
      
      toast({
        title: "Invoice Mode Active",
        description: isVendorMode 
          ? "Select services from your inventory to create an invoice for your client."
          : "Select services to create a custom invoice for your client.",
      });
    }
  }, [location.search]);

  const addServiceToInvoice = (service: any, quantity: number = 1, selectedItems?: any[]) => {
    if (!invoiceMode.isInvoiceMode) return;

    const serviceData = {
      ...service,
      invoiceQuantity: quantity,
      selectedItems: selectedItems || [],
      addedAt: new Date().toISOString()
    };

    setInvoiceMode(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices.filter(s => s.id !== service.id), serviceData]
    }));

    toast({
      title: "Service Added",
      description: `${service.name} added to invoice`,
    });
  };

  const removeServiceFromInvoice = (serviceId: string) => {
    setInvoiceMode(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
    }));
  };

  const updateClientInfo = (clientInfo: Partial<InvoiceModeState['clientInfo']>) => {
    setInvoiceMode(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...clientInfo }
    }));
  };

  const proceedToInvoiceCreation = () => {
    if (invoiceMode.selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service for the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Store invoice data in sessionStorage for the creation page
    sessionStorage.setItem('invoiceData', JSON.stringify(invoiceMode));
    
    // Navigate based on user role
    if (userRole === 'vendor') {
      navigate('/vendor/invoices/create');
    } else {
      navigate('/admin/invoices/create');
    }
  };

  const exitInvoiceMode = () => {
    // Navigate back to appropriate dashboard
    if (userRole === 'vendor') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
    
    setInvoiceMode({
      isInvoiceMode: false,
      selectedServices: [],
      clientInfo: {
        name: '',
        email: '',
        company: '',
        phone: ''
      }
    });
  };

  const isServiceSelected = (serviceId: string) => {
    return invoiceMode.selectedServices.some(s => s.id === serviceId);
  };

  const getSelectedServiceQuantity = (serviceId: string) => {
    const service = invoiceMode.selectedServices.find(s => s.id === serviceId);
    return service?.invoiceQuantity || 0;
  };

  const handleVendorInfoDismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('vendor_invoice_info_dismissed', 'true');
    }
    setShowVendorInfo(false);
  };

  return {
    ...invoiceMode,
    addServiceToInvoice,
    removeServiceFromInvoice,
    updateClientInfo,
    proceedToInvoiceCreation,
    exitInvoiceMode,
    isServiceSelected,
    getSelectedServiceQuantity,
    totalSelectedServices: invoiceMode.selectedServices.length,
    showVendorInfo,
    setShowVendorInfo,
    handleVendorInfoDismiss
  };
}
