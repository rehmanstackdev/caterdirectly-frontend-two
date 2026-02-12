import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VendorBrand {
  id: string;
  vendor_id: string;
  brand_name: string;
  brand_logo?: string | null;
  brand_website?: string | null;
  brand_description?: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

// Fetch approved brands for a vendor (vendors will only see approved due to RLS)
export function useVendorBrands(vendorId?: string) {
  const [brands, setBrands] = useState<VendorBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      if (!vendorId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('vendor_brands')
          .select('id, vendor_id, brand_name, brand_logo, brand_website, brand_description, status')
          .eq('vendor_id', vendorId)
          .eq('status', 'approved')
          .order('brand_name', { ascending: true });
        if (error) throw error;
        const parsed = (data || []).map((row: any) => ({
          ...row,
          status: row.status as 'pending' | 'approved' | 'rejected',
        })) as VendorBrand[];
        setBrands(parsed);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [vendorId]);

  return { brands, loading, error };
}
