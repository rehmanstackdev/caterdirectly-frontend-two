import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Invoice } from '@/types/invoice-types';
import invoiceService from '@/services/api/invoice.Service';

export function useInvoicePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const processInvoicePayment = async (
    invoice: Invoice,
    paymentMethodId: string
  ) => {
    console.log('[InvoicePayment] Starting payment process:', {
      invoiceId: invoice.id,
      paymentMethodId,
      total: invoice.total,
      itemCount: invoice.items.length
    });

    if (!invoice.items.length) {
      console.error('[InvoicePayment] No items in invoice');
      throw new Error('No items in invoice');
    }

    try {
      setIsProcessing(true);

      // Fetch vendor information for each service to preserve vendor context
      const serviceIds = invoice.items.map(item => item.serviceId);
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, vendor_id, vendor_name')
        .in('id', serviceIds);

      // Transform invoice items to services format with vendor information
      const services = invoice.items.map(item => {
        const serviceInfo = serviceData?.find(s => s.id === item.serviceId);
        return {
          id: item.serviceId,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          servicePrice: item.price,
          total: item.total,
          vendor_id: serviceInfo?.vendor_id,
          vendor_name: serviceInfo?.vendor_name
        };
      });

      // Create order data from invoice
      const orderData = {
        orderName: invoice.title,
        name: invoice.title,
        location: invoice.serviceDate ? `Event on ${invoice.serviceDate.toDateString()}` : 'Event Location',
        date: invoice.serviceDate?.toISOString().split('T')[0] || '',
        deliveryWindow: invoice.serviceTime || '',
        time: invoice.serviceTime || '',
        headcount: 1, // Default for invoices
        guests: 1,
        primaryContactName: invoice.clientName,
        primaryContactPhone: invoice.clientPhone,
        primaryContactEmail: invoice.clientEmail,
        additionalNotes: invoice.message || '',
        contact: invoice.clientName
      };

      console.log('[InvoicePayment] Invoking process-payment edge function');

      // Process payment using existing edge function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderData,
          services,
          selectedItems: {},
          paymentMethodId,
          totalAmount: invoice.total,
          invoiceId: invoice.id
        }
      });

      console.log('[InvoicePayment] Edge function response:', { data, error });

      if (error) {
        console.error('[InvoicePayment] Payment processing error:', error);
        throw new Error(error.message || 'Failed to process payment');
      }

      if (!data?.success) {
        console.error('[InvoicePayment] Payment failed:', data);
        throw new Error(data?.error || 'Payment processing failed');
      }
      
      // Validate Payment Intent was created and succeeded
      if (!data.paymentIntentId) {
        console.error('[InvoicePayment] No Payment Intent ID returned');
        throw new Error('Payment validation failed - no payment confirmation received');
      }
      
      if (data.status !== 'succeeded') {
        console.error('[InvoicePayment] Payment Intent status is not succeeded:', data.status);
        throw new Error(`Payment incomplete - status: ${data.status}`);
      }

      console.log('[InvoicePayment] Payment successful:', {
        orderId: data.orderId,
        paymentIntentId: data.paymentIntentId,
        amountCharged: data.amountCharged,
        status: data.status
      });

      // Store order ID and payment intent ID before any async operations
      const orderId = data.orderId;
      const paymentIntentId = data.paymentIntentId;

      // Update invoice status to 'paid' after successful payment (don't let this block navigation)
      try {
        console.log('[InvoicePayment] Updating invoice status to paid');
        await invoiceService.markAsPaidStripe(invoice.id, {
          paymentIntentId: paymentIntentId,
        });

        console.log('[InvoicePayment] Invoice status updated successfully');
      } catch (err) {
        console.error('[InvoicePayment] Failed to update invoice:', err);
        // Don't throw - payment succeeded
      }
      
      // ALWAYS navigate regardless of invoice update success
      console.log('[InvoicePayment] Navigating to order confirmation with orderId:', orderId);
      
      // Use setTimeout to ensure React state updates complete
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { 
            orderId: orderId,
            fromInvoice: true,
            invoiceId: invoice.id,
            paymentIntentId: paymentIntentId
          },
          replace: true // Replace current history entry to prevent back button issues
        });
      }, 100);
      
      return { id: orderId, orderId: orderId };
    } catch (error) {
      console.error('[InvoicePayment] Error processing invoice payment:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processInvoicePayment,
    isProcessing
  };
}
