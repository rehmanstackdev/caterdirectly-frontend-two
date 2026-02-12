import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdminVendorBrand {
  id: string;
  vendor_id: string;
  brand_name: string;
  brand_logo?: string | null;
  brand_website?: string | null;
  brand_description?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export function useVendorBrandsAdmin(vendorId: string) {
  const [brands, setBrands] = useState<AdminVendorBrand[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_brands')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const parsed = (data || []).map((row: any) => ({
        ...row,
        status: row.status as 'pending' | 'approved' | 'rejected',
      })) as AdminVendorBrand[];
      setBrands(parsed);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchBrands();
  }, [vendorId]);

  const createBrand = async (payload: {
    brand_name: string;
    brand_logo?: string;
    brand_website?: string;
    brand_description?: string;
  }) => {
    try {
      const { error } = await supabase.from('vendor_brands').insert({
        vendor_id: vendorId,
        status: 'pending',
        ...payload,
      });
      if (error) throw error;
      toast({ title: 'Brand Created', description: 'Awaiting approval.' });
      fetchBrands();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('vendor_brands')
        .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Brand Updated', description: `Status set to ${status}.` });
      fetchBrands();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const removeBrand = async (id: string) => {
    try {
      const { error } = await supabase.from('vendor_brands').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Brand Deleted' });
      fetchBrands();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return { brands, loading, fetchBrands, createBrand, updateStatus, removeBrand };
}
