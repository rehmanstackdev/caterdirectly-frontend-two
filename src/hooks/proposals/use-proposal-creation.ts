import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceSelection } from '@/types/order';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { getSiteUrl } from '@/utils/adminSettings';
import { getTaxRateByLocation } from '@/utils/tax-calculation';
import { CustomAdjustment } from '@/types/adjustments';
import { calculateInvoicePricing } from '@/utils/invoice-calculations';

interface ProposalCreationData {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  vendor?: any;
  proposalTitle?: string;
  message?: string;
  expiryDate?: Date;
  deliveryNotes?: string;
  calculatedTotal?: number;
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  adminNotes?: string;
  customAdjustments?: CustomAdjustment[];
  distancesByService?: Record<string, number>;
  proposalId?: string; // If provided, update existing proposal instead of creating new
  token?: string; // Reuse existing token when updating
}

export function useProposalCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { settings: adminSettings } = useAdminSettings();

  const createProposal = async (data: ProposalCreationData) => {
    if (isCreating) return null;
    
    const isUpdate = !!data.proposalId;
    console.log(`📝 useProposalCreation: ${isUpdate ? 'Updating' : 'Creating'} proposal with data:`, data);
    
    setIsCreating(true);
    
    try {
      const {
        selectedServices,
        selectedItems,
        formData,
        vendor,
        proposalTitle,
        message,
        expiryDate,
        deliveryNotes,
        isTaxExempt = false,
        isServiceFeeWaived = false,
        adminNotes = '',
        proposalId,
        token: existingToken
      } = data;

      // Validate essential data
      console.log('📝 useProposalCreation: Validating data...');
      console.log('📝 useProposalCreation: selectedServices count:', selectedServices?.length || 0);
      console.log('📝 useProposalCreation: formData keys:', Object.keys(formData || {}));
      console.log('📝 useProposalCreation: vendor provided:', !!vendor);
      
      if (!selectedServices || selectedServices.length === 0) {
        console.error('📝 useProposalCreation: No services selected');
        throw new Error('No services selected for proposal');
      }
      
      if (!formData) {
        console.error('📝 useProposalCreation: No formData provided');
        throw new Error('Missing form data for proposal');
      }

      // Compute effective vendor - fallback to first service's vendor if not provided
      let effectiveVendor = vendor;
      if (!effectiveVendor && selectedServices.length > 0) {
        const firstService = selectedServices[0];
        effectiveVendor = {
          id: firstService.vendor_id,
          name: firstService.vendorName || 'Unknown Vendor',
          vendor_name: firstService.vendorName || 'Unknown Vendor'
        };
        console.log('📝 useProposalCreation: Using fallback vendor from first service:', effectiveVendor);
      }
      
      console.log('📝 useProposalCreation: Effective vendor:', effectiveVendor);
      
      const clientName = formData.primaryContactName || formData.clientName || formData.name;
      const clientEmail = formData.primaryContactEmail || formData.clientEmail || formData.email;
      
      console.log('📝 useProposalCreation: Client info resolved - name:', clientName, 'email:', clientEmail);
      
      if (!clientName) {
        console.error('📝 useProposalCreation: Missing client contact name');
        throw new Error('Missing client contact information - name is required');
      }
      
      if (!clientEmail) {
        console.error('📝 useProposalCreation: Missing client email');
        throw new Error('Missing client email address');
      }
      
      console.log('📝 useProposalCreation: Validation passed!');
      
      console.log('📝 useProposalCreation: FormData received:', formData);
      console.log('📝 useProposalCreation: SelectedItems received:', selectedItems);

      // ✅ SSOT: Calculate comprehensive pricing snapshot using the same function as preview
      const pricingSnapshot = calculateInvoicePricing(
        selectedServices as any,
        selectedItems as any,
        {
          ...formData,
          adminOverrides: {
            isTaxExempt,
            isServiceFeeWaived
          }
        },
        {
          serviceFeePercentage: adminSettings.serviceFeePercentage,
          serviceFeeFixed: adminSettings.serviceFeeFixed,
          serviceFeeType: adminSettings.serviceFeeType,
        },
        data.customAdjustments || [],
        data.distancesByService
      );

      // Store tax-inclusive total
      const totalAmount = data.calculatedTotal ?? pricingSnapshot.total;

      console.info('[useProposalCreation] Pricing snapshot created:', {
        subtotal: pricingSnapshot.subtotal,
        serviceFee: pricingSnapshot.serviceFee,
        deliveryFee: pricingSnapshot.deliveryFee,
        adjustmentsTotal: pricingSnapshot.adjustmentsTotal,
        tax: pricingSnapshot.tax,
        total: pricingSnapshot.total
      });
      
      // ✅ AUTH GUARD: Verify user is authenticated before any database operations
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (!currentUser || !currentUser.id) {
        console.error('❌ [useProposalCreation] No authenticated user found');
        throw new Error('You must be signed in to create proposals');
      }
      
      console.log('✅ [useProposalCreation] Authenticated user:', currentUser.id, currentUser.email);

      // If updating, fetch existing proposal to preserve status and order_id
      let existingProposal = null;
      let existingOrderId = null;
      if (isUpdate && proposalId) {
        const { data: existing, error: fetchError} = await supabase
          .from('invoices')
          .select('id, order_id, status, token')
          .eq('id', proposalId)
          .maybeSingle();
        
        if (fetchError) {
          console.warn('📝 useProposalCreation: Failed to fetch existing proposal:', fetchError);
        } else if (existing) {
          existingProposal = existing;
          existingOrderId = existing.order_id;
          console.log('📝 useProposalCreation: Found existing proposal:', { id: existing.id, order_id: existing.order_id, status: existing.status });
          
          // SAFETY: If proposal is already paid, preserve its status and order_id
          if (existing.status === 'paid') {
            console.log('⚠️ Proposal is already paid, preserving payment status');
            // Don't allow changing the status or order_id for paid proposals
            // Update will still proceed but will preserve critical paid state
          }
        }
      }

      // Check for existing PAID order before creating a new one
      let existingPaidOrder = null;
      if (!existingOrderId && formData?.primaryContactEmail) {
        const serviceDate = formData?.date || formData?.eventDate || formData?.serviceDate;
        
        if (serviceDate) {
          console.log('📝 Checking for existing paid order:', {
            clientEmail: formData.primaryContactEmail,
            serviceDate
          });
          
          const { data: paidOrders, error: searchError } = await supabase
            .from('orders')
            .select('id, title, payment_status, status, price, date')
            .eq('host_id', currentUser.id)
            .eq('payment_status', 'paid')
            .eq('date', serviceDate)
            .neq('status', 'canceled')
            .neq('status', 'declined');
          
          if (!searchError && paidOrders && paidOrders.length > 0) {
            // Find matching order by comparing booking details
            for (const paidOrder of paidOrders) {
              try {
                const bookingDetailsRaw = (paidOrder as any).booking_details;
                let existingBooking = {};
                if (typeof bookingDetailsRaw === 'string') {
                  existingBooking = JSON.parse(bookingDetailsRaw);
                } else {
                  existingBooking = bookingDetailsRaw || {};
                }
                
                const existingEmail = (existingBooking as any).primaryContactEmail || (existingBooking as any).clientEmail;
                
                if (existingEmail && existingEmail.toLowerCase() === formData.primaryContactEmail.toLowerCase()) {
                  existingPaidOrder = paidOrder;
                  console.log('✅ Found existing paid order:', paidOrder.id);
                  break;
                }
              } catch (e) {
                console.warn('Failed to parse booking details for order:', paidOrder.id);
              }
            }
          }
        }
      }

      // If we found an existing paid order, use it instead of creating a new one
      if (existingPaidOrder) {
        console.log('🔗 Linking invoice to existing paid order:', existingPaidOrder.id);
        existingOrderId = existingPaidOrder.id;
      }

      // Create or update order
      const orderData = {
        title: proposalTitle || `Proposal for ${formData?.primaryContactName || formData?.clientName || 'Client'}`,
        status: 'draft' as const,
        host_id: currentUser?.id,
        vendor_id: effectiveVendor?.id || null,
        vendor_name: effectiveVendor?.name || effectiveVendor?.vendor_name || 'Unknown Vendor',
        price: totalAmount,
        location: formData?.location || '',
        date: formData?.date || formData?.eventDate || formData?.serviceDate,
        guests: formData?.headcount || 1,
        service_details: JSON.stringify(selectedServices),
        booking_details: JSON.stringify({
          primaryContactName: formData?.primaryContactName || formData?.clientName,
          primaryContactEmail: formData?.primaryContactEmail || formData?.clientEmail,
          primaryContactPhone: formData?.primaryContactPhone || formData?.clientPhone,
          backupContactName: formData?.backupContactName,
          backupContactEmail: formData?.backupContactEmail,
          backupContactPhone: formData?.backupContactPhone,
          eventName: formData?.eventName,
          eventType: formData?.eventType,
          company: formData?.company || formData?.clientCompany,
          specialRequests: formData?.specialRequests,
          additionalNotes: formData?.additionalNotes || deliveryNotes,
          headcount: formData?.headcount,
          location: formData?.location,
          deliveryWindow: formData?.deliveryWindow || formData?.time || formData?.serviceTime,
        }),
        is_group_order: false,
        order_number: `PROP-${Date.now()}`,
        revision_number: 0,
      };

      // ✅ TRANSACTION SAFETY: Wrap order + invoice creation with rollback on failure
      let order;
      let orderError = null;
      let orderJustCreated = false;

      if (existingOrderId) {
        console.log('📝 [useProposalCreation] Updating existing order:', existingOrderId);
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', existingOrderId)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ [useProposalCreation] Order UPDATE failed:', {
            error: updateError,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code,
            existingOrderId,
            orderData: {
              title: orderData.title,
              host_id: orderData.host_id,
              vendor_id: orderData.vendor_id,
              price: orderData.price,
              status: orderData.status
            }
          });
          orderError = updateError;
        } else {
          order = updatedOrder;
          console.log('✅ [useProposalCreation] Order updated successfully:', order.id);
        }
      } else {
        console.log('📝 [useProposalCreation] Creating new order with data:', {
          title: orderData.title,
          host_id: orderData.host_id,
          vendor_id: orderData.vendor_id,
          price: orderData.price,
          status: orderData.status,
          currentUser: currentUser?.id
        });
        
        const { data: newOrder, error: insertError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (insertError) {
          console.error('❌ [useProposalCreation] Order INSERT failed:', {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
            currentUser: currentUser?.id,
            orderData: {
              title: orderData.title,
              host_id: orderData.host_id,
              vendor_id: orderData.vendor_id,
              price: orderData.price,
              status: orderData.status
            }
          });
          orderError = insertError;
        } else {
          order = newOrder;
          orderJustCreated = true;
          console.log('✅ [useProposalCreation] Order created successfully:', order.id);
        }
      }

      // ✅ CRITICAL: Don't proceed if order creation failed
      if (!order || !order.id) {
        const errorMsg = orderError?.message || 'Unknown order creation error';
        const errorDetails = orderError?.details || '';
        const errorHint = orderError?.hint || '';
        throw new Error(`Failed to create/update order: ${errorMsg}${errorDetails ? ` (${errorDetails})` : ''}${errorHint ? ` Hint: ${errorHint}` : ''}. Cannot proceed without order_id.`);
      }

      // Use existing token or generate new one
      const token = existingToken || existingProposal?.token || crypto.randomUUID();
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30); // 30 days default

      // Map selected items to services with staff duration/quantity support
      const itemsWithSelectedItems = selectedServices.map(service => {
        let serviceDetails: any = (service as any).service_details;
        if (typeof serviceDetails === 'string') {
          try { 
            serviceDetails = JSON.parse(serviceDetails); 
          } catch { 
            serviceDetails = {}; 
          }
        }
        
        const serviceType = service.serviceType || (service as any).type || 'catering';
        const menuItems = serviceDetails?.catering?.menuItems || serviceDetails?.menuItems || [];
        const idSet = new Set<string>(menuItems.map((mi: any) => mi.id).filter(Boolean));
        const nameToId = new Map<string, string>();
        menuItems.forEach((mi: any) => { 
          if (mi?.name && mi?.id) nameToId.set(String(mi.name), String(mi.id)); 
        });

        const filtered: Record<string, number> = {};
        
        // For staff services, extract quantity and duration
        let resolvedQuantity = service.quantity || 0;
        let resolvedDuration = service.duration || 0;
        
        if (serviceType === 'staff') {
          // Extract staff quantity from selectedItems[serviceId]
          if (selectedItems[service.id]) {
            resolvedQuantity = selectedItems[service.id];
            filtered[service.id] = resolvedQuantity;
          }
          
          // Extract staff duration from selectedItems[serviceId_duration]
          const durationKey = `${service.id}_duration`;
          if (selectedItems[durationKey]) {
            resolvedDuration = selectedItems[durationKey];
            filtered[durationKey] = resolvedDuration;
          }
          
          // Fallback to minimum hours if still 0
          if (resolvedDuration === 0 && serviceDetails?.staff?.minimumHours) {
            resolvedDuration = serviceDetails.staff.minimumHours;
          }
          
          console.info('[createProposal] Staff service data resolved:', {
            serviceName: service.name,
            serviceId: service.id,
            quantity: resolvedQuantity,
            duration: resolvedDuration,
            selectedItemsKeys: Object.keys(filtered)
          });
        } else {
          // For non-staff services, filter menu items
          Object.entries(selectedItems || {}).forEach(([key, qty]) => {
            if (typeof qty !== 'number' || qty <= 0) return;
            if (idSet.has(key)) {
              filtered[key] = qty;
            } else if (nameToId.has(key)) {
              const mappedId = nameToId.get(key)!;
              filtered[mappedId] = (filtered[mappedId] || 0) + qty;
            }
          });
        }

        return {
          ...service,
          quantity: resolvedQuantity || service.quantity || 0,
          duration: resolvedDuration || service.duration || 0,
          selected_items: filtered
        };
      });

      // Create comprehensive proposal record
      const proposalRecord: any = {
        order_id: order.id,
        title: orderData.title,
        client_email: formData?.primaryContactEmail || formData?.clientEmail || '',
        client_name: formData?.primaryContactName || formData?.clientName || '',
        client_phone: formData?.primaryContactPhone || formData?.clientPhone || null,
        client_company: formData?.company || formData?.clientCompany || null,
        vendor_name: orderData.vendor_name,
        status: 'draft',
        token: token,
        expires_at: (expiryDate || defaultExpiryDate).toISOString(),
        message: message || null,
        service_date: (formData?.date || formData?.eventDate || formData?.serviceDate)
          ? new Date(formData?.date || formData?.eventDate || formData?.serviceDate).toISOString()
          : null,
        service_time: formData?.deliveryWindow || formData?.time || formData?.serviceTime || null,
        delivery_notes: deliveryNotes || formData?.additionalNotes || null,
        location: formData?.location || null,
        headcount: formData?.headcount || null,
        booking_details: {
          primaryContactName: formData?.primaryContactName || formData?.clientName,
          primaryContactEmail: formData?.primaryContactEmail || formData?.clientEmail,
          primaryContactPhone: formData?.primaryContactPhone || formData?.clientPhone,
          backupContactName: formData?.backupContactName || null,
          backupContactEmail: formData?.backupContactEmail || null,
          backupContactPhone: formData?.backupContactPhone || null,
          eventName: formData?.eventName || null,
          eventType: formData?.eventType || null,
          company: formData?.company || formData?.clientCompany || null,
          specialRequests: formData?.specialRequests || null,
          additionalNotes: formData?.additionalNotes || deliveryNotes || null,
          headcount: formData?.headcount || null,
          location: formData?.location || null,
          deliveryWindow: formData?.deliveryWindow || formData?.time || formData?.serviceTime || null,
          // Include all original formData to preserve any additional fields
          ...formData,
        },
        items: itemsWithSelectedItems,
        total: totalAmount,
        created_by: currentUser?.id,
        is_tax_exempt: isTaxExempt,
        service_fee_discounted: isServiceFeeWaived,
        admin_override_notes: adminNotes || null,
        pricing_snapshot: {
          ...pricingSnapshot,
          selectedServices: itemsWithSelectedItems.map((s: any) => ({
            id: s.id,
            type: s.serviceType || s.type || 'catering',
            unitPrice: Number(s.price || s.servicePrice || 0),
            quantity: s.quantity || 1,
            duration: s.duration || 1
          })),
          snapshotVersion: 1
        },
      };
      
      console.info('📝 useProposalCreation: Final proposal pricing snapshot:', {
        subtotal: pricingSnapshot.subtotal,
        serviceFee: pricingSnapshot.serviceFee,
        deliveryFee: pricingSnapshot.deliveryFee,
        adjustmentsTotal: pricingSnapshot.adjustmentsTotal,
        adjustmentsCount: pricingSnapshot.adjustmentsBreakdown?.length || 0,
        tax: pricingSnapshot.tax,
        taxRate: pricingSnapshot.taxRate,
        total: pricingSnapshot.total,
        overrides: pricingSnapshot.overrides,
        selectedServicesCount: itemsWithSelectedItems.length
      });
      console.log('📝 useProposalCreation: Full proposal record:', proposalRecord);

      // ✅ TRANSACTION SAFETY: Create invoice with automatic rollback on failure
      let proposal;
      try {
        if (isUpdate && proposalId) {
          // Update existing proposal, preserve critical fields for paid proposals
          const updateRecord = {
            ...proposalRecord,
            status: existingProposal?.status || proposalRecord.status, // Preserve existing status (especially 'paid')
            token: token, // Keep same token
            order_id: existingOrderId || proposalRecord.order_id // Preserve existing order link
          };
          
          const { data: updatedProposal, error: proposalError } = await supabase
            .from('invoices')
            .update(updateRecord)
            .eq('id', proposalId)
            .select()
            .single();

          if (proposalError) throw proposalError;
          proposal = updatedProposal;
          console.log('📝 useProposalCreation: Updated existing proposal:', proposalId);
        } else {
          // Create new proposal with retry logic
          let retryCount = 0;
          let proposalError = null;
          
          while (retryCount < 3) {
            const { data: newProposal, error } = await supabase
              .from('invoices')
              .insert(proposalRecord)
              .select()
              .single();

            if (!error) {
              proposal = newProposal;
              console.log('✅ useProposalCreation: Created new proposal:', newProposal.id);
              break;
            }
            
            proposalError = error;
            retryCount++;
            console.warn(`⚠️ Invoice creation attempt ${retryCount} failed:`, error);
            
            if (retryCount < 3) {
              // Wait before retry (exponential backoff: 500ms, 1s, 2s)
              await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount - 1)));
            }
          }

          if (!proposal) {
            // ROLLBACK: Delete the order we just created if invoice creation failed
            if (orderJustCreated && order?.id) {
              console.error('💥 ROLLBACK: Invoice creation failed after 3 attempts, deleting order:', order.id);
              await supabase.from('orders').delete().eq('id', order.id);
            }
            throw proposalError || new Error('Failed to create invoice after 3 attempts');
          }
        }
      } catch (invoiceError) {
        // ROLLBACK: Delete the order we just created if invoice creation failed
        if (orderJustCreated && order?.id) {
          console.error('💥 ROLLBACK: Invoice creation failed, deleting order:', order.id);
          await supabase.from('orders').delete().eq('id', order.id);
        }
        throw invoiceError;
      }

      // PHASE 1: Verify persistence - check that staff data was saved correctly
      const { data: verificationData, error: verificationError } = await supabase
        .from('invoices')
        .select('id, items, pricing_snapshot')
        .eq('id', proposal.id)
        .single();
      
      let verified = false;
      if (verificationError) {
        console.warn('[createProposal] Verification query failed:', verificationError);
      } else {
        verified = true;
        const items = verificationData.items as any[];
        const snapshot = verificationData.pricing_snapshot as any;
        
        console.info('[createProposal] Verification check:', {
          proposalId: verificationData.id,
          itemsCount: items?.length || 0,
          hasSelectedServices: !!snapshot?.selectedServices,
          snapshotVersion: snapshot?.snapshotVersion
        });
        
        // Check staff services specifically
        const staffItems = items?.filter((item: any) => 
          item.serviceType === 'staff' || item.type === 'staff'
        ) || [];
        
        if (staffItems.length > 0) {
          staffItems.forEach((item: any) => {
            const hasValidData = item.quantity > 0 && item.duration > 0 && 
              Object.keys(item.selected_items || {}).length > 0;
            
            console.info('[createProposal] Staff item verification:', {
              serviceName: item.name,
              quantity: item.quantity,
              duration: item.duration,
              selectedItemsKeys: Object.keys(item.selected_items || {}),
              isValid: hasValidData
            });
            
            if (!hasValidData) {
              console.warn('[createProposal] Staff data incomplete for item:', item.name);
              verified = false;
            }
          });
        }
      }

      // ✅ SYNC: Write complete data to orders_v2 for redundancy and unified access
      console.log('[createProposal] Syncing to orders_v2...');
      const orders_v2_data = {
        host_id: currentUser.id,
        user_id: currentUser.id,
        title: proposalRecord.title,
        order_number: order.order_number || `INV-${proposal.id.slice(0, 8)}`,
        order_status: 'draft',
        payment_status: 'pending',
        total: totalAmount,
        subtotal: pricingSnapshot.subtotal,
        tax: pricingSnapshot.tax,
        service_fee: pricingSnapshot.serviceFee,
        delivery_fee: pricingSnapshot.deliveryFee,
        services: itemsWithSelectedItems, // Full services array with selected_items
        selected_items: selectedItems, // Complete item selections
        form_data: formData, // All form data including admin overrides
        pricing_snapshot: pricingSnapshot, // Complete pricing snapshot
        invoice_id: proposal.id, // Link back to invoice
        order_id: order.id, // Link to old orders table
        vendor_id: effectiveVendor?.id || null,
        vendor_name: effectiveVendor?.name || effectiveVendor?.vendor_name || 'Unknown Vendor'
      };
      
      const { error: syncError } = await supabase
        .from('orders_v2')
        .upsert([orders_v2_data as any], {
          onConflict: 'invoice_id'
        });
      
      if (syncError) {
        console.warn('[createProposal] orders_v2 sync failed:', syncError);
        // Don't fail the entire operation if sync fails
      } else {
        console.log('[createProposal] Successfully synced to orders_v2');
      }

      return {
        proposal,
        order,
        token,
        totalAmount,
        persisted: true,
        verified
      };

    } catch (error) {
      console.error('Error creating proposal:', error);
      
      // Extract specific error details for better user feedback
      let errorMessage = "Failed to create proposal. Please try again.";
      if (error && typeof error === 'object' && 'message' in error) {
        const msg = (error as any).message;
        if (msg.includes('vendor_id')) {
          errorMessage = "Missing vendor information. Please select a service first.";
        } else if (msg.includes('not-null')) {
          errorMessage = "Missing required information. Please check all fields are filled.";
        } else if (msg.includes('violates')) {
          errorMessage = "Data validation failed. Please check your input.";
        } else if (msg.includes('permission')) {
          errorMessage = "Permission denied. Please check your access rights.";
        } else {
          errorMessage = `Creation failed: ${msg}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createAndSendProposal = async (data: ProposalCreationData) => {
    try {
      const result = await createProposal(data);
      if (!result) return null;

      const { proposal, token, totalAmount } = result;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          templateName: 'proposal_notification',
          recipientEmail: data.formData?.primaryContactEmail || data.formData?.clientEmail,
          recipientName: data.formData?.primaryContactName || data.formData?.clientName,
          variables: {
            client_name: data.formData?.primaryContactName || data.formData?.clientName,
            proposal_title: data.proposalTitle || proposal.title,
            vendor_name: data.vendor?.name || data.vendor?.vendor_name || 'Cater Directly',
            proposal_total: totalAmount.toFixed(2),
            service_date: data.formData?.date || data.formData?.eventDate || data.formData?.serviceDate 
              ? new Date(data.formData.date || data.formData.eventDate || data.formData.serviceDate).toLocaleDateString() 
              : 'TBD',
            proposal_url: `${await getSiteUrl()}/proposals/${token}`,
            expiry_date: (() => {
              const expiryDate = data.expiryDate;
              if (expiryDate) return expiryDate.toLocaleDateString();
              
              // Default: day before service date if available, otherwise 30 days from now
              if (data.formData?.date || data.formData?.eventDate || data.formData?.serviceDate) {
                const serviceDate = new Date(data.formData.date || data.formData.eventDate || data.formData.serviceDate);
                serviceDate.setDate(serviceDate.getDate() - 1);
                return serviceDate.toLocaleDateString();
              }
              
              return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
            })(),
          },
          userId: (await supabase.auth.getUser()).data.user?.id,
        },
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: 'Proposal created',
          description: 'Proposal was saved but email failed. You can resend it from the proposal list.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Proposal sent successfully',
          description: `Proposal has been sent to ${data.formData?.primaryContactEmail || data.formData?.clientEmail}`,
        });
      }

      // Update proposal status to 'sent'
      await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', proposal.id);

      return { ...result, emailSent: !emailError };

    } catch (error) {
      console.error('Error creating and sending proposal:', error);
      throw error;
    }
  };

  const copyProposalLink = async (data: ProposalCreationData) => {
    try {
      const result = await createProposal(data);
      if (!result) return null;

      const { token } = result;
      const siteUrl = await getSiteUrl();
      const proposalUrl = `${siteUrl}/proposals/${token}`;
      
      // Try clipboard, but don't fail if it doesn't work
      try {
        await navigator.clipboard.writeText(proposalUrl);
        toast({
          title: "Proposal Link Copied!",
          description: "Share this link with your client to view the proposal.",
        });
      } catch (clipboardError) {
        console.warn('Clipboard access failed:', clipboardError);
        toast({
          title: "Proposal Created!",
          description: "Link generated successfully. Copy it manually from below.",
        });
      }

      return { ...result, proposalUrl };

    } catch (error) {
      console.error('Error copying proposal link:', error);
      throw error;
    }
  };

  return {
    createProposal,
    createAndSendProposal,
    copyProposalLink,
    isCreating
  };
}