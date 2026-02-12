import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wrench } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';

interface AdminFixOrderButtonProps {
  orderId: string;
  invoiceId: string;
  currentTotal?: number;
}

export function AdminFixOrderButton({ orderId, invoiceId, currentTotal }: AdminFixOrderButtonProps) {
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  // Only show for admins
  if (!isAdmin) {
    return null;
  }

  const handleFixOrder = async () => {
    try {
      setIsFixing(true);

      console.log('🔧 [AdminFixOrder] Starting fix for order:', orderId, 'invoice:', invoiceId);

      // Define payloads for different orders
      const orderPayloads: Record<string, any> = {
        '686baffd-0dcf-4d4c-a693-a08a62ac07b5': {
          orderId: '686baffd-0dcf-4d4c-a693-a08a62ac07b5',
          invoiceId: '33199188-7320-4b88-8530-20cec4e22f42',
          stripe: {
            payment_intent_id: 'pi_3QsGYSHWGWiV1Buo0naxuHRA',
            charge_id: 'ch_3QsGYSHWGWiV1Buo0YCngnDl',
            customer_id: 'cus_RaIh0S5fDgATnB',
            paid_at: new Date().toISOString()
          },
          pricingSnapshot: {
            subtotal: 5400,
            tax: 0,
            serviceFee: 91.25,
            total: 5491.25,
            overrides: {
              isTaxExempt: true,
              isServiceFeeWaived: false
            }
          },
          lineItems: [
            {
              id: '686baffd-0dcf-4d4c-a693-a08a62ac07b5',
              name: 'American Appetizers - Tray Service',
              description: 'Includes Spinach & Mushroom Mini Quiche (100), Pigs in a Blanket (100)',
              quantity: 1,
              price: 1800,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'catering',
              selected_menu_items: {
                '039ba4a1-483c-4cee-b9e2-91e186961521': 100,
                'b1130f28-6d14-4608-af78-3219765a6540': 100
              }
            },
            {
              id: '217ce273-f80f-4be0-b0e7-4c17004bd358',
              name: 'Server',
              description: 'Professional service staff - 5 hours each',
              quantity: 2,
              price: 900,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'staff',
              duration: 5
            },
            {
              id: '2cc9576a-9cba-445e-b8b7-2ce308707dcb',
              name: 'Bartender',
              description: 'Professional bar staff - 5 hours each',
              quantity: 2,
              price: 900,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'staff',
              duration: 5
            }
          ],
          staffing: {
            servers: 2,
            bartenders: 2
          }
        },
        'f8b1f546-591c-4973-bbd9-521252fb8ed2': {
          orderId: 'f8b1f546-591c-4973-bbd9-521252fb8ed2',
          invoiceId: 'fce7bdb5-b31f-4aed-8852-639bb2744b7d',
          stripe: {
            payment_intent_id: 'pi_3QsGYSHWGWiV1Buo0naxuHRA',
            charge_id: 'ch_3QsGYSHWGWiV1Buo0YCngnDl',
            customer_id: 'cus_RaIh0S5fDgATnB',
            paid_at: new Date().toISOString()
          },
          pricingSnapshot: {
            subtotal: 5400,
            tax: 0,
            serviceFee: 91.25,
            total: 5491.25,
            overrides: {
              isTaxExempt: true,
              isServiceFeeWaived: false
            }
          },
          lineItems: [
            {
              id: 'f8b1f546-591c-4973-bbd9-521252fb8ed2',
              name: 'American Appetizers - Tray Service',
              description: 'Includes Spinach & Mushroom Mini Quiche (100), Pigs in a Blanket (100)',
              quantity: 1,
              price: 1800,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'catering',
              selected_menu_items: {
                '039ba4a1-483c-4cee-b9e2-91e186961521': 100,
                'b1130f28-6d14-4608-af78-3219765a6540': 100
              }
            },
            {
              id: '217ce273-f80f-4be0-b0e7-4c17004bd358',
              name: 'Server',
              description: 'Professional service staff - 5 hours each',
              quantity: 2,
              price: 900,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'staff',
              duration: 5
            },
            {
              id: '2cc9576a-9cba-445e-b8b7-2ce308707dcb',
              name: 'Bartender',
              description: 'Professional bar staff - 5 hours each',
              quantity: 2,
              price: 900,
              total: 1800,
              vendor_id: '50815dcc-3bc2-450f-ac73-83bca3a1ffa0',
              service_type: 'staff',
              duration: 5
            }
          ],
          staffing: {
            servers: 2,
            bartenders: 2
          }
        }
      };

      // Use the payload for the current order, or fallback to first order
      const payload = orderPayloads[orderId];
      
      if (!payload) {
        toast({
          title: 'Unknown Order',
          description: `No fix configuration found for order ${orderId}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('📦 [AdminFixOrder] Using payload for order:', orderId, payload);

      const { data, error } = await supabase.functions.invoke('admin-fix-order', {
        body: payload,
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: 'Failed to fix order',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        console.error('Server error fixing order:', data);
        toast({
          title: 'Server error',
          description: `${data.error}${data.details ? ' - ' + JSON.stringify(data.details) : ''}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ [AdminFixOrder] Success:', data);

      const orderInfo = data.order || {};
      const invoiceInfo = data.invoice || {};
      
      toast({
        title: 'Order Fixed Successfully',
        description: `Order ${orderInfo.order_number || orderId} updated. Status: ${invoiceInfo.status || 'paid'}, Total: $${(orderInfo.total || payload.pricingSnapshot.total || 0).toFixed(2)}. Payment: ${invoiceInfo.payment_status || 'paid'}. Reloading...`,
      });

      // Reload the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error fixing order:', error);
      toast({
        title: 'Failed to fix order',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={handleFixOrder}
      disabled={isFixing}
      variant="outline"
      className="gap-2"
    >
      <Wrench className="h-4 w-4" />
      {isFixing ? 'Fixing...' : 'Admin: Fix Order Data'}
    </Button>
  );
}
