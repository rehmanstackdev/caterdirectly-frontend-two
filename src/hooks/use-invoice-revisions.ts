import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInvoiceRevisions(invoiceId: string) {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      loadRevisions();
    }
  }, [invoiceId]);

  const loadRevisions = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_revisions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('revision_number', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
      toast.error('Failed to load revision history');
    } finally {
      setLoading(false);
    }
  };

  const createRevision = async (
    currentInvoice: any,
    changesSummary: string,
    createdBy?: string
  ) => {
    try {
      // Get the latest revision number
      const latestRevision = revisions.length > 0 ? revisions[0].revision_number : 0;
      const newRevisionNumber = latestRevision + 1;

      const { error } = await supabase
        .from('invoice_revisions')
        .insert({
          invoice_id: invoiceId,
          revision_number: newRevisionNumber,
          items: currentInvoice.items,
          total: currentInvoice.total,
          service_date: currentInvoice.service_date,
          service_time: currentInvoice.service_time,
          delivery_notes: currentInvoice.delivery_notes,
          message: currentInvoice.message,
          changes_summary: changesSummary,
          created_by: createdBy
        });

      if (error) throw error;

      // Reload revisions
      await loadRevisions();
      
      return true;
    } catch (error) {
      console.error('Error creating revision:', error);
      toast.error('Failed to create revision');
      return false;
    }
  };

  return {
    revisions,
    loading,
    createRevision,
    loadRevisions
  };
}
