import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRebuildInvoice = () => {
  const [isRebuilding, setIsRebuilding] = useState(false);

  const rebuildInvoice = async (invoiceId: string) => {
    setIsRebuilding(true);
    
    try {
      console.log('[useRebuildInvoice] Starting rebuild for invoice:', invoiceId);
      
      const { data, error } = await supabase.functions.invoke('rebuild-invoice', {
        body: { invoiceId }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to rebuild invoice');
      }

      console.log('[useRebuildInvoice] Rebuild successful:', data.summary);
      
      toast.success('Invoice rebuilt successfully', {
        description: `${data.summary.selectedItemsCount} items added, Total: $${data.summary.total.toFixed(2)}`
      });

      return data;
    } catch (error: any) {
      console.error('[useRebuildInvoice] Error:', error);
      toast.error('Failed to rebuild invoice', {
        description: error.message
      });
      throw error;
    } finally {
      setIsRebuilding(false);
    }
  };

  const rebuildAllIncompletePricingSnapshots = async () => {
    setIsRebuilding(true);
    
    try {
      console.log('[useRebuildInvoice] Starting bulk rebuild of incomplete pricing snapshots');
      
      const { data, error } = await supabase.functions.invoke('rebuild-invoice-pricing-snapshots');

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to rebuild pricing snapshots');
      }

      console.log('[useRebuildInvoice] Bulk rebuild successful:', data.results);
      
      toast.success('Pricing snapshots rebuilt successfully', {
        description: `${data.results.updated} invoices updated, ${data.results.failed} failed, ${data.results.skipped} skipped`
      });

      return data;
    } catch (error: any) {
      console.error('[useRebuildInvoice] Bulk rebuild error:', error);
      toast.error('Failed to rebuild pricing snapshots', {
        description: error.message
      });
      throw error;
    } finally {
      setIsRebuilding(false);
    }
  };

  return {
    rebuildInvoice,
    rebuildAllIncompletePricingSnapshots,
    isRebuilding
  };
};
