
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { ServiceSelection, OrderInfo } from '@/types/order';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useVendorAvailabilityCheck } from '@/hooks/vendor/use-vendor-availability-check';

export function useOrderSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkMultipleVendorsAvailability } = useVendorAvailabilityCheck();

  // Helper function to transform booking form data to order data format
  const transformOrderData = (formData: any): OrderInfo => {
    return {
      // Use orderName or fallback to name for backward compatibility
      orderName: formData.orderName || formData.name || '',
      name: formData.orderName || formData.name || '', // Legacy support
      
      location: formData.location || '',
      date: formData.date || '',
      
      // Use deliveryWindow or fallback to time for backward compatibility
      deliveryWindow: formData.deliveryWindow || formData.time || '',
      time: formData.deliveryWindow || formData.time || '', // Legacy support
      
      headcount: formData.headcount || 0,
      guests: formData.headcount || 0, // Legacy support
      
      // Primary contact information
      primaryContactName: formData.primaryContactName || '',
      primaryContactPhone: formData.primaryContactPhone || '',
      primaryContactEmail: formData.primaryContactEmail || '',
      
      // Backup contact information
      hasBackupContact: formData.hasBackupContact || false,
      backupContactName: formData.backupContactName || '',
      backupContactPhone: formData.backupContactPhone || '',
      backupContactEmail: formData.backupContactEmail || '',
      
      // Additional information
      additionalNotes: formData.additionalNotes || '',
      
      // Legacy contact field for backward compatibility
      contact: formData.primaryContactName || formData.contact || ''
    };
  };

  /**
   * Submit an individual order with Stripe payment method
   */
  const submitIndividualOrder = async (
    orderData: OrderInfo | any, 
    services: ServiceSelection[], 
    selectedItems: Record<string, number> = {},
    paymentMethodId?: string,
    billingAddress?: any,
    totalAmount?: number,
    pricingSnapshot?: any
  ) => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return null;
    }

    try {
      setIsSubmitting(true);

      // Transform the order data to ensure consistent format
      const transformedOrderData = transformOrderData(orderData);

      // Final availability check before payment processing
      const vendorIds = [...new Set(services.map(s => s.vendor_id).filter(Boolean))];
      
      if (vendorIds.length > 0 && transformedOrderData.date) {
        const { allAvailable, unavailableVendors } = await checkMultipleVendorsAvailability(
          vendorIds,
          transformedOrderData.date,
          transformedOrderData.deliveryWindow
        );

        if (!allAvailable) {
          const errorMessage = unavailableVendors
            .map(v => `${v.vendorName}: ${v.reason}`)
            .join('\n');
          
          toast.error('Cannot complete booking', {
            description: `The following vendors are unavailable:\n\n${errorMessage}`,
            duration: 6000
          });
          
          setIsSubmitting(false);
          return null;
        }
      }

      // Create payment with payment method - send the calculated total
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderData: transformedOrderData,
          services,
          selectedItems,
          paymentMethodId,
          billingAddress,
          totalAmount, // Send the pre-calculated total from frontend
          pricingSnapshot // Send full pricing breakdown including custom adjustments
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        throw new Error(error.message || 'Failed to process payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment failed');
      }

      // Navigate to success page
      navigate('/order-confirmation', { 
        state: { orderId: data.orderId } 
      });
      
      return { id: data.orderId };
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Submit a group order with Stripe payment method
   */
  const submitGroupOrder = async (
    orderData: OrderInfo | any, 
    services: ServiceSelection[], 
    guestOrders: any[] = [],
    paymentMethodId?: string,
    totalAmount?: number,
    pricingSnapshot?: any
  ) => {
    if (!user) {
      toast.error('You must be logged in to place a group order');
      return null;
    }

    try {
      setIsSubmitting(true);

      // Transform the order data to ensure consistent format
      const transformedOrderData = transformOrderData(orderData);

      // Final availability check before payment processing
      const vendorIds = [...new Set(services.map(s => s.vendor_id).filter(Boolean))];
      
      if (vendorIds.length > 0 && transformedOrderData.date) {
        const { allAvailable, unavailableVendors } = await checkMultipleVendorsAvailability(
          vendorIds,
          transformedOrderData.date,
          transformedOrderData.deliveryWindow
        );

        if (!allAvailable) {
          const errorMessage = unavailableVendors
            .map(v => `${v.vendorName}: ${v.reason}`)
            .join('\n');
          
          toast.error('Cannot complete group booking', {
            description: `The following vendors are unavailable:\n\n${errorMessage}`,
            duration: 6000
          });
          
          setIsSubmitting(false);
          return null;
        }
      }

      // For group orders, we'll extend this later to handle multiple payments
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderData: {
            ...transformedOrderData,
            isGroupOrder: true
          },
          services,
          guestOrders,
          paymentMethodId,
          totalAmount, // Send the pre-calculated total from frontend
          pricingSnapshot // Send full pricing breakdown including custom adjustments
        }
      });

      if (error) {
        console.error('Group payment processing error:', error);
        throw new Error(error.message || 'Failed to process group payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Group payment failed');
      }

      // Navigate to success page
      navigate('/order-confirmation', { 
        state: { orderId: data.orderId } 
      });
      
      return { id: data.orderId };
    } catch (error) {
      console.error('Error submitting group order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process group payment. Please try again.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify payment status after processing
   */
  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(error.message || 'Failed to verify payment');
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment status');
      return null;
    }
  };

  /**
   * Navigate to order confirmation
   */
  const navigateToConfirmation = (orderId?: string) => {
    navigate('/order-confirmation', { 
      state: { orderId } 
    });
  };

  return {
    submitIndividualOrder,
    submitGroupOrder,
    verifyPayment,
    navigateToConfirmation,
    isSubmitting
  };
}
