import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { VendorSettings } from '@/types/vendor';

export function useVendorSettings() {
  const { user } = useAuth();
  const [vendorSettings, setVendorSettings] = useState<VendorSettings | null>(null);
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

  // Fetch vendor settings
  const fetchVendorSettings = async () => {
    try {
      setLoading(true);
      const vendorId = await fetchVendorId();
      if (!vendorId) return;

      const { data, error } = await supabase
        .from('vendors')
        .select(`
          delivery_fee_settings,
          lead_time_hours,
          minimum_order_amount,
          calendar_settings,
          availability_status,
          auto_accept_orders,
          max_orders_per_day
        `)
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      setVendorSettings({
        ...data,
        availability_status: (data.availability_status as 'available' | 'busy' | 'unavailable') || 'available',
        delivery_fee_settings: typeof data.delivery_fee_settings === 'string' 
          ? JSON.parse(data.delivery_fee_settings) 
          : data.delivery_fee_settings || { enabled: false, baseAmount: 0, ranges: [] },
        calendar_settings: typeof data.calendar_settings === 'string'
          ? JSON.parse(data.calendar_settings)
          : data.calendar_settings || { businessHours: {}, blockedDates: [], specialHours: [] }
      });
    } catch (error) {
      console.error('Error fetching vendor settings:', error);
      toast.error('Failed to load vendor settings');
    } finally {
      setLoading(false);
    }
  };

  // Save vendor settings
  const saveVendorSettings = async (settings: Partial<VendorSettings>) => {
    try {
      setSaving(true);
      const vendorId = await fetchVendorId();
      if (!vendorId) throw new Error('Vendor not found');

      const { error } = await supabase
        .from('vendors')
        .update(settings)
        .eq('id', vendorId);

      if (error) throw error;

      await fetchVendorSettings();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving vendor settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVendorSettings();
    }
  }, [user]);

  return {
    vendorSettings,
    loading,
    saving,
    saveVendorSettings,
    refetch: fetchVendorSettings
  };
}
