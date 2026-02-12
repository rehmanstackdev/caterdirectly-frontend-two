import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createDetailedLineItems, validateLineItems, TaxableLineItem } from '@/utils/stripe-tax-codes';
import { calculateUnifiedOrderTotals } from '@/utils/unified-calculations';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useServiceDistances } from '@/hooks/use-service-distances';

interface StripeTaxResult {
  taxAmount: number;
  totalAmount: number;
  breakdown: any[];
  calculationId?: string;
  error?: string;
}

interface UseStripeTaxReturn {
  taxData: StripeTaxResult | null;
  isCalculating: boolean;
  error: string | null;
  calculateTax: (params: {
    services: any[];
    selectedItems: Record<string, number>;
    billingAddress?: any;
    formData?: any;
  }) => Promise<void>;
  clearTax: () => void;
}

export const useStripeTax = (): UseStripeTaxReturn => {
  const [taxData, setTaxData] = useState<StripeTaxResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { settings: adminSettings } = useAdminSettings();
  const serviceDistances = useServiceDistances();

  const calculateTax = useCallback(async ({
    services,
    selectedItems,
    billingAddress,
    formData
  }: {
    services: any[];
    selectedItems: Record<string, number>;
    billingAddress?: any;
    formData?: any;
  }) => {
    // Check if event location is available for tax calculation (preferred for service businesses)
    const eventLocation = formData?.location;
    const hasBillingAddress = billingAddress?.address?.postal_code;
    
    if (!eventLocation && !hasBillingAddress) {
      setError('Event location or billing address is required for tax calculation');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Calculate order totals without tax
      const actualDistanceMiles = undefined; // Simplified for now
      const actualDistancesByService = {} as Record<string, number>;

      const orderTotals = calculateUnifiedOrderTotals(
        services,
        selectedItems,
        eventLocation,
        adminSettings,
        actualDistanceMiles,
        undefined, // no adjustments for now
        actualDistancesByService
      );

      // Check admin setting for tax calculation method
      const taxCalculationMethod = adminSettings?.taxCalculationMethod || 'stripe_automatic';
      
      if (taxCalculationMethod === 'manual') {
        console.info('[use-stripe-tax] Using local ZIP-based tax calculation');
        
        // Use local tax calculation system
        const { calculateTax: localCalculateTax } = await import('@/utils/tax-calculation');
        
        // Determine tax address for location-based calculation
        let taxLocationString = '';
        
        if (eventLocation) {
          // Try to geocode event location for ZIP extraction
          try {
            const { geocodeEventLocationForTax } = await import('@/utils/event-tax-address');
            const taxAddress = await geocodeEventLocationForTax(eventLocation);
            if (taxAddress) {
              taxLocationString = `${taxAddress.line1 || ''} ${taxAddress.city || ''}, ${taxAddress.state || ''} ${taxAddress.postal_code || ''}`.trim();
              console.log('[use-stripe-tax] Using geocoded event location:', taxLocationString);
            }
          } catch (geocodeError) {
            console.warn('[use-stripe-tax] Failed to geocode event location, using direct string:', geocodeError);
          }
          
          // Fallback to using event location string directly
          if (!taxLocationString) {
            taxLocationString = eventLocation;
          }
        } else if (billingAddress?.address) {
          // Use billing address as fallback
          const addr = billingAddress.address;
          taxLocationString = `${addr.line1 || ''} ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}`.trim();
          console.log('[use-stripe-tax] Using billing address for tax calculation');
        }
        
        // Calculate tax using local system on full pre-tax amount
        const preTaxTotal = orderTotals.subtotal + orderTotals.serviceFee + (orderTotals.deliveryFee || 0);
        const localTaxResult = localCalculateTax(preTaxTotal, taxLocationString);
        
        const nextTaxData: StripeTaxResult = {
          taxAmount: localTaxResult.amount,
          totalAmount: preTaxTotal + localTaxResult.amount,
          breakdown: [{
            tax_rate: localTaxResult.taxData.rate,
            jurisdiction: localTaxResult.taxData.description,
            amount: localTaxResult.amount
          }],
          calculationId: `local_${Date.now()}`
        };
        
        console.info('[use-stripe-tax] Local tax calculation result:', {
          preTaxTotal,
          taxAmount: nextTaxData.taxAmount,
          totalAmount: nextTaxData.totalAmount,
          jurisdiction: localTaxResult.taxData.jurisdiction,
          rate: (localTaxResult.taxData.rate * 100).toFixed(2) + '%'
        });
        
        setTaxData(nextTaxData);
        return;
      }

      // Original Stripe Tax API logic for stripe_automatic method
      // Create detailed line items for Stripe Tax
      const lineItems = createDetailedLineItems(
        services,
        selectedItems,
        orderTotals.serviceFee,
        orderTotals.deliveryFee,
        0 // adjustments
      );

      // Validate line items before sending
      if (!validateLineItems(lineItems)) {
        throw new Error('Invalid line items for tax calculation');
      }

      // Prioritize event location for tax calculation (correct for service businesses)
      let taxAddress = null;
      let addressSource = 'billing';
      
      if (eventLocation) {
        // Import here to avoid circular dependencies
        const { geocodeEventLocationForTax } = await import('@/utils/event-tax-address');
        taxAddress = await geocodeEventLocationForTax(eventLocation);
        if (taxAddress) {
          addressSource = 'shipping'; // Use shipping for service delivery location
          console.log('[use-stripe-tax] Using event location for tax calculation:', { eventLocation, taxAddress });
        }
      }
      
      // Fallback to billing address if event location geocoding failed
      if (!taxAddress && billingAddress?.address) {
        taxAddress = billingAddress.address;
        addressSource = 'billing';
        console.log('[use-stripe-tax] Falling back to billing address for tax calculation');
      }
      
      if (!taxAddress) {
        throw new Error('Unable to determine tax calculation address');
      }

      // Call Stripe Tax API via edge function
      console.info('[use-stripe-tax] Invoking stripe-estimate-tax with:', {
        line_items_count: lineItems.length,
        address: taxAddress,
        address_source: addressSource,
        delivery_fee: orderTotals.deliveryFee,
        currency: 'usd'
      });
      const { data, error: taxError } = await supabase.functions.invoke('stripe-estimate-tax', {
        body: {
          line_items: lineItems,
          address: taxAddress,
          address_source: addressSource,
          delivery_fee: orderTotals.deliveryFee,
          currency: 'usd'
        }
      });

      if (taxError) {
        throw new Error(taxError.message || 'Failed to calculate tax');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const nextTaxData: StripeTaxResult = {
        taxAmount: data.tax_amount || 0,
        totalAmount: data.total_amount || 0,
        breakdown: data.breakdown || [],
        calculationId: data.calculation_id
      };
      console.info('[use-stripe-tax] Stripe Tax result:', nextTaxData);
      
      // Bay Area fallback: Use enhanced tax calculation if Stripe returns $0
      if ((nextTaxData.taxAmount ?? 0) === 0 && taxAddress) {
        const { calculateTax: localCalculateTax } = await import('@/utils/tax-calculation');
        const addressString = `${taxAddress.line1 || ''} ${taxAddress.city || ''}, ${taxAddress.state || ''} ${taxAddress.postal_code || ''}`.trim();
        const preTaxTotal = orderTotals.subtotal + orderTotals.serviceFee + (orderTotals.deliveryFee || 0);
        const fallbackTax = localCalculateTax(preTaxTotal, addressString);
        
        if (fallbackTax.amount > 0) {
          console.warn(`[use-stripe-tax] Using Bay Area fallback tax rate for ${fallbackTax.taxData.jurisdiction}: ${(fallbackTax.taxData.rate * 100).toFixed(2)}%`);
          nextTaxData.taxAmount = fallbackTax.amount;
          nextTaxData.totalAmount = preTaxTotal + fallbackTax.amount;
        } else {
          console.warn('[use-stripe-tax] Stripe returned $0 tax. Check tax registrations and tax codes.', {
            calculationId: nextTaxData.calculationId
          });
        }
      }

      setTaxData(nextTaxData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate tax';
      console.error('Tax calculation error:', err);
      setError(errorMessage);
      setTaxData(null);
    } finally {
      setIsCalculating(false);
    }
  }, [adminSettings]);

  const clearTax = useCallback(() => {
    setTaxData(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    taxData,
    isCalculating,
    error,
    calculateTax,
    clearTax
  };
};