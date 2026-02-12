
import { supabase } from '@/integrations/supabase/client';

// Validates that a vendor with the given ID exists
export const validateVendor = async (vendorId: string): Promise<boolean> => {
  if (!vendorId) {
    console.error('Vendor ID is missing');
    return false;
  }

  try {
    console.log(`Validating vendor with ID: ${vendorId}`);
    
    const { data, error } = await supabase
      .from('vendors')
      .select('id, company_name')
      .eq('id', vendorId)
      .single();
    
    if (error) {
      console.error('Vendor validation error:', error);
      return false;
    }
    
    if (!data) {
      console.error('No vendor found with the given ID');
      return false;
    }
    
    console.log('Vendor validation successful:', data);
    return true;
  } catch (error) {
    console.error('Exception during vendor validation:', error);
    return false;
  }
};
