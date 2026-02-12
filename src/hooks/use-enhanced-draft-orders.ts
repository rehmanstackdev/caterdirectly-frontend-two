import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ServiceSelection } from '@/types/order';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { CustomAdjustment } from '@/types/adjustments';

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
  custom_adjustments?: CustomAdjustment[];
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
  custom_adjustments: (row.custom_adjustments as any) || [],
});

export function useEnhancedDraftOrders() {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { user } = useAuth();
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const loadDrafts = useCallback(async () => {
    if (!user) {
      setDrafts([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Draft load error:', error);
        throw error;
      }
      
      setDrafts((data || []).map(convertRowToDraftOrder));
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast.error('Failed to load saved drafts');
      setDrafts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveDraft = useCallback(async (
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>,
    formData: any,
    draftName?: string,
    draftId?: string,
    isAutoSave: boolean = false,
    customAdjustments?: CustomAdjustment[]
  ): Promise<string | null> => {
    if (!user) {
      if (!isAutoSave) {
        toast.error('You must be logged in to save drafts');
      }
      return null;
    }

    if (!selectedServices.length && !Object.keys(selectedItems).length && !Object.keys(formData).length && !(customAdjustments && customAdjustments.length)) {
      return null;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
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

      const draftData: any = {
        user_id: user.id,
        name: finalDraftName,
        selected_services: selectedServices as any,
        selected_items: selectedItems as any,
        form_data: formData as any,
        estimated_total: selectedServices.reduce((total, service) => {
          const price = parseFloat(service.price?.toString() || '0');
          const quantity = service.quantity || 1;
          return total + (price * quantity);
        }, 0),
        service_count: selectedServices.length,
        updated_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };

      if (customAdjustments) {
        draftData.custom_adjustments = customAdjustments as any;
      }

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

      if (result.error) {
        console.error('Draft save error:', result.error);
        throw result.error;
      }

      setSaveStatus('success');
      setLastSaveTime(new Date());
      retryCountRef.current = 0; // Reset retry count on success
      
      if (!draftId && !isAutoSave) {
        toast.success('Draft saved successfully!');
      }
      
      await loadDrafts(); // Refresh the list
      return (result.data as any).id;
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      setSaveStatus('error');
      
      if (!isAutoSave) {
        if (error.message?.includes('row-level security')) {
          toast.error('Permission denied. Please make sure you are logged in.');
        } else if (error.message?.includes('network')) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('Failed to save draft. Please try again.');
        }
      }
      
      return null;
    } finally {
      setIsSaving(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [user, loadDrafts]);

  const autoSave = useCallback(async (
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>,
    formData: any,
    draftId?: string,
    customAdjustments?: CustomAdjustment[]
  ): Promise<string | null> => {
    if (!user || (!selectedServices.length && !Object.keys(selectedItems).length && !(customAdjustments && customAdjustments.length))) {
      return null;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    return new Promise((resolve) => {
      // Debounce auto-save
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          // For auto-save, first check if user has existing auto-save draft
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

          const savedId = await saveDraft(
            selectedServices,
            selectedItems,
            formData,
            targetDraftId ? undefined : 'Auto-saved Draft',
            targetDraftId,
            true, // isAutoSave = true
            customAdjustments
          );
          
          if (savedId) {
            retryCountRef.current = 0;
            resolve(savedId); // Return the ID for the calling component to track
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
          
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const delay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
            setTimeout(async () => {
              const retryResult = await autoSave(selectedServices, selectedItems, formData, draftId, customAdjustments);
              resolve(retryResult);
            }, delay);
          } else {
            console.error('Auto-save failed after maximum retries');
            resolve(null);
          }
        }
      }, 2000); // 2 second debounce
    });
  }, [user, saveDraft]);

  const loadDraft = useCallback(async (draftId: string): Promise<DraftOrder | null> => {
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

      return convertRowToDraftOrder(data as any);
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [user]);

  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
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
  }, [user, loadDrafts]);

  const shareWithSales = useCallback(async (draftId: string, clientNotes?: string): Promise<string | null> => {
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
      return (data as any).share_token;
    } catch (error) {
      console.error('Failed to share draft:', error);
      toast.error('Failed to share draft with sales team');
      return null;
    }
  }, [user, loadDrafts]);

  const convertToOrder = useCallback(async (draftId: string): Promise<boolean> => {
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
  }, [user, loadDrafts]);

  useEffect(() => {
    if (user) {
      loadDrafts();
    } else {
      setDrafts([]);
    }
  }, [user, loadDrafts]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Add rename functionality for admin/vendor users
  const renameDraft = useCallback(async (draftId: string, newName: string): Promise<boolean> => {
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
  }, [user, loadDrafts]);

  return {
    drafts,
    isLoading,
    isSaving,
    saveStatus,
    lastSaveTime,
    saveDraft,
    loadDraft,
    deleteDraft,
    shareWithSales,
    convertToOrder,
    autoSave,
    loadDrafts,
    renameDraft,
  };
}
