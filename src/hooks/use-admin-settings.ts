import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminSettings {
  serviceFeePercentage: number;
  serviceFeeFixed: number;
  serviceFeeType: 'percentage' | 'fixed' | 'hybrid';
  taxCalculationMethod: 'stripe_automatic' | 'manual';
  enableMultiVendorOrders: boolean;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    serviceFeePercentage: 5.0,
    serviceFeeFixed: 0.00,
    serviceFeeType: 'percentage',
    taxCalculationMethod: 'stripe_automatic',
    enableMultiVendorOrders: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'service_fee_percentage',
          'service_fee_fixed', 
          'service_fee_type',
          'tax_calculation_method',
          'enable_multi_vendor_orders'
        ]);

      if (fetchError) throw fetchError;

      if (data?.length) {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, any>);

        setSettings({
          serviceFeePercentage: parseFloat(settingsMap.service_fee_percentage || '5.0'),
          serviceFeeFixed: parseFloat(settingsMap.service_fee_fixed || '0.00'),
          serviceFeeType: settingsMap.service_fee_type || 'percentage',
          taxCalculationMethod: settingsMap.tax_calculation_method || 'stripe_automatic',
          enableMultiVendorOrders: settingsMap.enable_multi_vendor_orders !== false
        });
      }
    } catch (err) {
      console.error('Error fetching admin settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
}