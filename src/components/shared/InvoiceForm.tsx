import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateInvoicePricing } from '@/utils/invoice-calculations';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useServiceDistances } from '@/hooks/use-service-distances';

interface InvoiceFormProps {
  onBack?: () => void;
  userRole?: 'admin' | 'vendor';
}

export const InvoiceForm = ({ onBack, userRole }: InvoiceFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { settings: adminSettings } = useAdminSettings();
  
  // Helper function for default expiry date
  const defaultExpiryDate = (serviceDate: Date | null) => {
    if (serviceDate) {
      const expiry = new Date(serviceDate);
      expiry.setDate(expiry.getDate() - 1);
      return expiry;
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  };
  
  const [invoice, setInvoice] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    message: '',
    expiryDate: defaultExpiryDate(null),
    serviceDate: null as Date | null,
    serviceTime: '',
    deliveryNotes: '',
    vendorName: '',
    selectedServices: [] as any[],
    selectedItems: {} as Record<string, number>,
    formData: {} as any,
    vendor: null as any,
    total: 0
  });
  
  // ✅ Call hook at top level, not inside callback
  const { distancesByService } = useServiceDistances(
    invoice.selectedServices, 
    invoice.formData?.location
  );
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceToken, setInvoiceToken] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoiceData = async () => {
      // ✅ STEP 1: Check URL params for edit mode (database-only load)
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      
      if (editId) {
        // ✅ EDIT MODE: Load EVERYTHING from database (SSOT)
        console.log('[InvoiceForm] Edit mode - loading invoice from database:', editId);
        
        const { data: dbInvoice, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', editId)
          .single();
        
        if (error) {
          console.error('[InvoiceForm] Error loading invoice:', error);
          toast({ title: "Error", description: "Invoice not found", variant: "destructive" });
          navigate('/marketplace');
          return;
        }
        
        // Extract complete data from database
        const bookingDetails = (dbInvoice.booking_details || {}) as any;
        const pricingSnapshot = (dbInvoice.pricing_snapshot || {}) as any;
        
        // ✅ Reconstruct selectedItems from items array
        const reconstructedSelectedItems = ((dbInvoice.items as any[]) || []).reduce((acc: any, item: any) => {
          if (item.selected_items) {
            return { ...acc, ...item.selected_items };
          }
          return acc;
        }, {});
        
        setInvoiceId(dbInvoice.id);
        setInvoiceToken(dbInvoice.token);
        
        setInvoice({
          title: dbInvoice.title || '',
          message: dbInvoice.message || '',
          serviceDate: dbInvoice.service_date ? new Date(dbInvoice.service_date) : null,
          serviceTime: dbInvoice.service_time || '',
          deliveryNotes: dbInvoice.delivery_notes || '',
          expiryDate: dbInvoice.expires_at ? new Date(dbInvoice.expires_at) : defaultExpiryDate(null),
          
          selectedServices: (dbInvoice.items as any[]) || [],
          selectedItems: reconstructedSelectedItems,
          
          // ✅ Complete formData from database with custom adjustments from pricing_snapshot (SSOT)
          formData: {
            ...bookingDetails,
            customAdjustments: (pricingSnapshot.adjustmentsBreakdown as any[]) || [],
            isTaxExempt: dbInvoice.is_tax_exempt || false,
            isServiceFeeWaived: dbInvoice.service_fee_discounted || false,
            adminOverrides: {
              isTaxExempt: dbInvoice.is_tax_exempt || false,
              isServiceFeeWaived: dbInvoice.service_fee_discounted || false
            }
          },
          
          vendor: { name: dbInvoice.vendor_name },
          vendorName: dbInvoice.vendor_name || '',
          
          clientName: dbInvoice.client_name || '',
          clientEmail: dbInvoice.client_email || '',
          clientPhone: dbInvoice.client_phone || '',
          clientCompany: dbInvoice.client_company || '',
          
          total: dbInvoice.total || 0
        });
        
        console.log('[InvoiceForm] Loaded complete invoice from database:', {
          id: dbInvoice.id,
          title: dbInvoice.title,
          customAdjustmentsCount: ((pricingSnapshot.adjustmentsBreakdown as any[]) || []).length,
          servicesCount: ((dbInvoice.items as any[]) || []).length,
          isTaxExempt: dbInvoice.is_tax_exempt,
          isServiceFeeWaived: dbInvoice.service_fee_discounted
        });
        
        return; // Exit early - edit mode complete
      }
      
      // ✅ STEP 2: NEW invoice mode - load from sessionStorage (marketplace selections)
      const invoiceDataStr = sessionStorage.getItem('invoiceData');
      if (!invoiceDataStr) return;
      
      try {
        const data = JSON.parse(invoiceDataStr);
        
        setInvoice(prev => ({
          ...prev,
          title: data.title || '',
          message: data.message || '',
          serviceDate: data.serviceDate ? new Date(data.serviceDate) : null,
          serviceTime: data.serviceTime || '',
          deliveryNotes: data.deliveryNotes || '',
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : defaultExpiryDate(null),
          selectedServices: data.selectedServices || [],
          selectedItems: data.selectedItems || {},
          formData: {
            ...data.formData,
            customAdjustments: data.customAdjustments || data.formData?.customAdjustments || []
          },
          vendor: data.vendor || null,
          vendorName: data.vendor?.name || '',
          clientName: data.clientInfo?.primaryContactName || data.clientInfo?.clientName || '',
          clientEmail: data.clientInfo?.primaryContactEmail || data.clientInfo?.clientEmail || '',
          clientPhone: data.clientInfo?.primaryContactPhone || data.clientInfo?.clientPhone || '',
          clientCompany: data.clientInfo?.company || data.clientInfo?.clientCompany || '',
          total: data.selectedServices?.reduce((sum: number, service: any) => {
            const price = typeof service.price === 'string' 
              ? parseFloat(service.price.replace(/[^0-9.]/g, '')) 
              : service.price || 0;
            return sum + (price * (service.invoiceQuantity || 1));
          }, 0) || 0
        }));
        
        console.log('[InvoiceForm] Loaded new invoice from sessionStorage');
      } catch (error) {
        console.error('[InvoiceForm] Error loading invoice data:', error);
      }
    };
    
    loadInvoiceData();
  }, [userRole, navigate, toast]);

  useEffect(() => {
    if (invoice.serviceDate) {
      setInvoice(prev => ({ ...prev, expiryDate: defaultExpiryDate(invoice.serviceDate) }));
    }
  }, [invoice.serviceDate]);

  const handleSendInvoice = async () => {
    if (!invoice.title || !invoice.clientName || !invoice.clientEmail || !invoice.clientPhone || invoice.selectedServices.length === 0) {
      return;
    }

    setIsCreating(true);
    try {
      // Build complete form data with custom adjustments
      const formData = {
        ...invoice.formData,
        primaryContactName: invoice.clientName,
        primaryContactEmail: invoice.clientEmail,
        primaryContactPhone: invoice.clientPhone,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        company: invoice.clientCompany,
        eventDate: invoice.serviceDate,
        serviceDate: invoice.serviceDate,
        time: invoice.serviceTime,
        serviceTime: invoice.serviceTime,
        additionalNotes: invoice.deliveryNotes,
        location: invoice.formData?.location,
        customAdjustments: invoice.formData?.customAdjustments || []
      };

      // ✅ SSOT: Calculate pricing snapshot once using unified system (distancesByService from hook)
      const pricingSnapshot = calculateInvoicePricing(
        invoice.selectedServices,
        invoice.selectedItems,
        formData,
        adminSettings,
        formData.customAdjustments,
        distancesByService
      );

      console.info('[InvoiceForm] Created pricing snapshot for invoice', {
        total: pricingSnapshot.total,
        subtotal: pricingSnapshot.subtotal,
        adjustmentsTotal: pricingSnapshot.adjustmentsTotal,
        overrides: pricingSnapshot.overrides
      });

      const invoiceRecord = {
        title: invoice.title,
        client_name: invoice.clientName,
        client_email: invoice.clientEmail,
        client_phone: invoice.clientPhone,
        client_company: invoice.clientCompany,
        message: invoice.message,
        service_date: invoice.serviceDate ? invoice.serviceDate.toISOString() : null,
        service_time: invoice.serviceTime,
        delivery_notes: invoice.deliveryNotes,
        items: invoice.selectedServices,
        total: pricingSnapshot.total,
        expires_at: invoice.expiryDate ? invoice.expiryDate.toISOString() : null,
        booking_details: formData,
        pricing_snapshot: pricingSnapshot as any,
        is_tax_exempt: pricingSnapshot.overrides.isTaxExempt,
        service_fee_discounted: pricingSnapshot.overrides.isServiceFeeWaived
      };

      let result;
      
      // ✅ Check if we're updating existing invoice
      if (invoiceId && invoiceToken) {
        console.log('[InvoiceForm] Updating existing invoice:', invoiceId);
        
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceRecord)
          .eq('id', invoiceId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        toast({
          title: "Invoice Updated",
          description: "Your invoice has been updated successfully."
        });
      } else {
        console.log('[InvoiceForm] Creating new invoice');
        
        // Generate tokens for new invoice
        const newToken = crypto.randomUUID();
        const orderId = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('invoices')
          .insert([{
            ...invoiceRecord,
            token: newToken,
            order_id: orderId,
            status: 'draft'
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        toast({
          title: "Invoice Created",
          description: "Your invoice has been created successfully."
        });
      }

      sessionStorage.removeItem('invoiceData');
      navigate(`/invoices/${result.token}`);
      
    } catch (error) {
      console.error('[InvoiceForm] Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = () => {
    return invoice.title && invoice.clientName && invoice.clientEmail && invoice.clientPhone && invoice.selectedServices.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>
      </div>

      {/* Selected Services Preview */}
      {invoice.selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.selectedServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-600">by {service.vendorName}</p>
                      <p className="text-sm text-gray-600">Qty: {service.invoiceQuantity || 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#F07712]">{service.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">${invoice.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Invoice Title *</Label>
            <Input 
              id="title"
              value={invoice.title} 
              onChange={(e) => setInvoice(prev => ({ ...prev, title: e.target.value }))}
              placeholder="E.g., Wedding Catering Service"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input 
                id="clientName"
                value={invoice.clientName} 
                onChange={(e) => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Client full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="clientEmail">Client Email *</Label>
              <Input 
                id="clientEmail"
                type="email"
                value={invoice.clientEmail} 
                onChange={(e) => setInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="client@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientPhone">Client Phone *</Label>
              <Input 
                id="clientPhone"
                type="tel"
                value={invoice.clientPhone} 
                onChange={(e) => setInvoice(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="(123) 456-7890"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientCompany">Client Company</Label>
              <Input 
                id="clientCompany"
                value={invoice.clientCompany} 
                onChange={(e) => setInvoice(prev => ({ ...prev, clientCompany: e.target.value }))}
                placeholder="Company name (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoice.serviceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoice.serviceDate ? format(invoice.serviceDate, "PPP") : "Select event date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoice.serviceDate || undefined}
                    onSelect={(date) => setInvoice(prev => ({ ...prev, serviceDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="serviceTime">Event Time</Label>
              <Input 
                id="serviceTime"
                value={invoice.serviceTime} 
                onChange={(e) => setInvoice(prev => ({ ...prev, serviceTime: e.target.value }))}
                placeholder="e.g., 6:00 PM - 10:00 PM"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="message">Message to Client</Label>
            <Textarea 
              id="message"
              value={invoice.message} 
              onChange={(e) => setInvoice(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Personalized message..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="deliveryNotes">Service Notes</Label>
            <Textarea 
              id="deliveryNotes"
              value={invoice.deliveryNotes} 
              onChange={(e) => setInvoice(prev => ({ ...prev, deliveryNotes: e.target.value }))}
              placeholder="Special instructions or notes..."
              rows={3}
            />
          </div>

          <div>
            <Label>Invoice Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoice.expiryDate ? format(invoice.expiryDate, "PPP") : "Select expiry date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoice.expiryDate || undefined}
                  onSelect={(date) => setInvoice(prev => ({ ...prev, expiryDate: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="default"
          size="lg"
          className="bg-[#F07712] hover:bg-[#F07712]/90"
          disabled={!isFormValid() || isCreating}
          onClick={handleSendInvoice}
        >
          <Send className="mr-2 h-4 w-4" />
          {isCreating ? 'Sending...' : 'Send Invoice'}
        </Button>
      </div>
    </div>
  );
};
