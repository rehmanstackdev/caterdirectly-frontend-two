import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { VendorBusinessRules } from '@/types/vendor';

export function useVendorPreferences() {
  const { user } = useAuth();
  const [rules, setRules] = useState<VendorBusinessRules[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get vendor ID for current user
  const fetchVendorId = async () => {
    if (!user) return null;
    
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    return vendor?.id;
  };

  // Fetch vendor business rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      const vendorId = await fetchVendorId();
      if (!vendorId) return;

      const { data, error } = await supabase
        .from('vendor_order_preferences')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching vendor rules:', error);
      toast.error('Failed to load business rules');
    } finally {
      setLoading(false);
    }
  };

  // Save vendor business rules
  const saveRules = async (newRules: VendorBusinessRules) => {
    try {
      setSaving(true);
      const vendorId = await fetchVendorId();
      if (!vendorId) throw new Error('Vendor not found');

      const ruleData = {
        ...newRules,
        vendor_id: vendorId
      };

      if (newRules.id) {
        // Update existing rule
        const { error } = await supabase
          .from('vendor_order_preferences')
          .update(ruleData)
          .eq('id', newRules.id);
        
        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('vendor_order_preferences')
          .insert(ruleData);
        
        if (error) throw error;
      }

      await fetchRules();
      toast.success('Business rules saved successfully');
    } catch (error) {
      console.error('Error saving vendor rules:', error);
      toast.error('Failed to save business rules');
    } finally {
      setSaving(false);
    }
  };

  // Delete business rule
  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_order_preferences')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      await fetchRules();
      toast.success('Business rule deleted');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete business rule');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user]);

  return {
    rules,
    loading,
    saving,
    saveRules,
    deleteRule,
    refetch: fetchRules
  };
}