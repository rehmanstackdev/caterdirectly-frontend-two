import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const VendorProposalEditRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProposalAndRedirect = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Proposal ID is missing",
          variant: "destructive"
        });
        navigate('/vendor/proposals');
        return;
      }

      try {
        // Fetch invoice data including token
        const { data: proposal, error } = await supabase
          .from('invoices')
          .select('*, token')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!proposal) {
          toast({
            title: "Error",
            description: "Proposal not found",
            variant: "destructive"
          });
          navigate('/vendor/proposals');
          return;
        }

        // Transform proposal to booking format
        const selectedServices = Array.isArray(proposal.items) ? proposal.items : [];
        
        // PHASE 1: Properly derive selectedItems from proposal items with staff duration support
        const selectedItems: Record<string, number> = {};
        if (proposal.items && Array.isArray(proposal.items)) {
          proposal.items.forEach((item: any) => {
            // Extract item metadata
            const itemId = item.id || item.serviceId;
            const itemType = item.type || item.serviceType;
            const itemQuantity = item.quantity || 1;
            const itemDuration = item.duration || 1;
            
            // For staff services, create both quantity and duration keys
            if (itemType === 'staff' || itemType === 'Staff') {
              selectedItems[itemId] = itemQuantity;
              selectedItems[`${itemId}_duration`] = itemDuration;
              console.info('[VendorProposalEditRedirect] Staff service detected:', {
                itemId,
                quantity: itemQuantity,
                duration: itemDuration
              });
            } else {
              // For non-staff services, just set quantity
              selectedItems[itemId] = itemQuantity;
            }
            
            // Also merge any existing selected_items from the item
            if (item.selected_items && typeof item.selected_items === 'object') {
              Object.assign(selectedItems, item.selected_items);
            }
          });
        }
        
        // Merge with pricing_snapshot selectedItems if available (preserves existing selections)
        const pricingSnapshot = proposal.pricing_snapshot as any;
        if (pricingSnapshot?.selectedItems) {
          Object.assign(selectedItems, pricingSnapshot.selectedItems);
        }
        
        console.info('[VendorProposalEditRedirect] Final selectedItems:', selectedItems);

        // Prepare formData from booking_details
        const bookingDetails = (proposal.booking_details || {}) as any;
        const formData = {
          location: bookingDetails.location || '',
          orderName: bookingDetails.eventName || bookingDetails.orderName || '',
          date: bookingDetails.date || bookingDetails.eventDate || '',
          deliveryWindow: bookingDetails.time || bookingDetails.deliveryWindow || '',
          headcount: bookingDetails.headcount || 0,
          primaryContactName: proposal.client_name || '',
          primaryContactEmail: proposal.client_email || '',
          primaryContactPhone: proposal.client_phone || '',
          hasBackupContact: false,
          backupContactName: '',
          backupContactPhone: '',
          backupContactEmail: '',
          additionalNotes: bookingDetails.notes || bookingDetails.additionalNotes || '',
          serviceStyleSelections: {},
          clientName: proposal.client_name || '',
          clientEmail: proposal.client_email || '',
          clientPhone: proposal.client_phone || '',
          clientCompany: proposal.client_company || '',
          proposalMessage: proposal.message || '',
          proposalExpiryDate: proposal.expires_at || ''
        };

        // Get custom adjustments from pricing_snapshot
        const customAdjustments = pricingSnapshot?.customAdjustments || [];

        // PHASE 2: Extract admin overrides from proposal for single source of truth
        const overrides = {
          isTaxExempt: proposal.is_tax_exempt || false,
          isServiceFeeWaived: proposal.service_fee_discounted || false
        };

        // Store in sessionStorage including token for SSOT
        const invoiceData = {
          invoiceId: proposal.id,
          proposalId: proposal.id, // Keep for backward compatibility
          token: (proposal as any).token, // Preserve token for updates
          selectedServices,
          selectedItems,
          formData: {
            ...formData,
            customAdjustments,
            adminOverrides: overrides,
            isTaxExempt: overrides.isTaxExempt,
            isServiceFeeWaived: overrides.isServiceFeeWaived
          },
          customAdjustments,
          overrides,
          vendor: {
            name: proposal.vendor_name,
            id: (proposal as any).vendor_id || ''
          }
        };

        sessionStorage.setItem('invoiceData', JSON.stringify(invoiceData));

        console.log('[VendorInvoiceEditRedirect] Redirecting to booking with data:', invoiceData);

        // Navigate to booking in invoice mode
        navigate('/booking?mode=invoice', { replace: true });

      } catch (error) {
        console.error('[VendorProposalEditRedirect] Error loading proposal:', error);
        toast({
          title: "Error",
          description: "Failed to load proposal for editing",
          variant: "destructive"
        });
        navigate('/vendor/proposals');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposalAndRedirect();
  }, [id, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading proposal...</p>
      </div>
    </div>
  );
};

export default VendorProposalEditRedirect;
