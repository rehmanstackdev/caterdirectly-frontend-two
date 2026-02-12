import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ServiceSelection } from '@/types/order';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DraftOrderRow = Tables<'draft_orders'>;

export interface DraftOrder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  selected_services: ServiceSelection[];
  selected_items: Record<string, number>;
  form_data: any;
  estimated_total: number;
  service_count: number;
  shared_with_sales: boolean;
  sales_notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  status: 'draft' | 'shared' | 'in_review' | 'approved' | 'converted';
  share_token?: string;
  expires_at?: string;
}

// Helper function to convert database row to typed DraftOrder
const convertRowToDraftOrder = (row: DraftOrderRow): DraftOrder => ({
  ...row,
  selected_services: (row.selected_services as any) || [],
  selected_items: (row.selected_items as any) || {},
  form_data: (row.form_data as any) || {},
  estimated_total: row.estimated_total || 0,
  service_count: row.service_count || 0,
  shared_with_sales: row.shared_with_sales || false,
  status: (row.status as any) || 'draft',
  created_at: row.created_at,
  updated_at: row.updated_at,
  last_accessed_at: row.last_accessed_at || row.created_at,
});

export function useDraftOrders() {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Load user's drafts
  const loadDrafts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts((data || []).map(convertRowToDraftOrder));
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast.error('Failed to load saved drafts');
    } finally {
      setIsLoading(false);
    }
  };

  // Save a new draft or update existing one with smart naming
  const saveDraft = async (
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>,
    formData: any,
    draftName?: string,
    draftId?: string,
    isAutoSave: boolean = false
  ): Promise<string | null> => {
    if (!user) {
      if (!isAutoSave) {
        toast.error('You must be logged in to save drafts');
      }
      return null;
    }

    setIsSaving(true);
    try {
      // Generate smart draft name if not provided
      let finalDraftName = draftName;
      if (!draftName) {
        try {
          const { data: smartName } = await supabase
            .rpc('generate_smart_draft_name', {
              form_data_param: formData as any,
              selected_services_param: selectedServices as any,
              fallback_name_param: `Draft ${new Date().toLocaleDateString()}`
            });
          finalDraftName = smartName || `Draft ${new Date().toLocaleDateString()}`;
        } catch (error) {
          console.warn('Failed to generate smart name, using fallback:', error);
          finalDraftName = `Draft ${new Date().toLocaleDateString()}`;
        }
      }

      const draftData = {
        user_id: user.id,
        name: finalDraftName,
        selected_services: selectedServices as any,
        selected_items: selectedItems as any,
        form_data: formData as any,
        service_count: selectedServices.length,
        estimated_total: calculateEstimatedTotal(selectedServices, selectedItems),
      };

      let result;
      if (draftId) {
        // Update existing draft
        result = await supabase
          .from('draft_orders')
          .update(draftData)
          .eq('id', draftId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new draft
        result = await supabase
          .from('draft_orders')
          .insert(draftData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (!isAutoSave) {
        toast.success(draftId ? 'Draft updated successfully!' : 'Draft saved successfully!');
      }
      await loadDrafts(); // Refresh the list
      return result.data.id;
    } catch (error) {
      console.error('Failed to save draft:', error);
      if (!isAutoSave) {
        toast.error('Failed to save draft. Please try again.');
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to calculate estimated total
  const calculateEstimatedTotal = (
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>
  ): number => {
    let total = 0;
    
    // Add service costs
    selectedServices.forEach(service => {
      const price = parseFloat(service.price?.toString() || '0');
      const quantity = service.quantity || 1;
      total += price * quantity;
    });
    
    // Add item costs (placeholder calculation)
    Object.entries(selectedItems).forEach(([_, quantity]) => {
      total += quantity * 10; // placeholder
    });
    
    return Math.round(total * 100) / 100;
  };

  // Load a specific draft
  const loadDraft = async (draftId: string): Promise<DraftOrder | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('draft_orders')
        .select('*')
        .eq('id', draftId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading draft:', error);
        toast.error('Failed to load draft');
        return null;
      }

      if (!data) {
        console.warn('No draft found for id:', draftId);
        return null;
      }

      // Update last accessed time
      await supabase
        .from('draft_orders')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', draftId);

      return convertRowToDraftOrder(data);
    } catch (error) {
      console.error('Failed to load draft:', error);
      // Avoid showing toast repeatedly for transient failures
      return null;
    }
  };

  // Delete a draft
  const deleteDraft = async (draftId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('draft_orders')
        .delete()
        .eq('id', draftId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Draft deleted successfully');
      await loadDrafts(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast.error('Failed to delete draft');
      return false;
    }
  };

  // Share draft with sales team
  const shareWithSales = async (draftId: string, clientNotes?: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('draft_orders')
        .update({
          shared_with_sales: true,
          client_notes: clientNotes,
          status: 'shared',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', draftId)
        .eq('user_id', user.id)
        .select('share_token')
        .single();

      if (error) throw error;

      toast.success('Draft shared with sales team successfully!');
      await loadDrafts(); // Refresh the list
      return data.share_token;
    } catch (error) {
      console.error('Failed to share draft:', error);
      toast.error('Failed to share draft with sales team');
      return null;
    }
  };

  // Convert draft to actual order
  const convertToOrder = async (draftId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('draft_orders')
        .update({ status: 'converted' })
        .eq('id', draftId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadDrafts(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to convert draft:', error);
      return false;
    }
  };

  // Auto-save functionality with duplicate prevention
  const autoSave = async (
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>,
    formData: any,
    draftId?: string
  ): Promise<string | null> => {
    if (!user || (!selectedServices.length && !Object.keys(selectedItems).length)) return null;

    try {
      // For auto-save, check if user has existing auto-save draft
      let targetDraftId = draftId;
      
      if (!targetDraftId) {
        try {
          const { data: existingAutoId } = await supabase
            .rpc('find_user_auto_draft', { user_id_param: user.id });
          
          targetDraftId = existingAutoId;
        } catch (error) {
          console.warn('Failed to find existing auto-draft:', error);
        }
      }

      // Use existing draft ID or create new auto-saved draft
      const savedId = await saveDraft(
        selectedServices,
        selectedItems,
        formData,
        targetDraftId ? undefined : 'Auto-saved Draft',
        targetDraftId,
        true // isAutoSave = true
      );
      
      return savedId; // Return ID for tracking
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save failures
      return null;
    }
  };

  // Add rename functionality
  const renameDraft = async (draftId: string, newName: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('draft_orders')
        .update({ name: newName.trim() })
        .eq('id', draftId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Draft renamed successfully');
      await loadDrafts();
      return true;
    } catch (error) {
      console.error('Failed to rename draft:', error);
      toast.error('Failed to rename draft');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadDrafts();
    }
  }, [user]);

  return {
    drafts,
    isLoading,
    isSaving,
    saveDraft,
    loadDraft,
    deleteDraft,
    shareWithSales,
    convertToOrder,
    autoSave,
    loadDrafts,
    renameDraft,
    calculateEstimatedTotal,
  };
}