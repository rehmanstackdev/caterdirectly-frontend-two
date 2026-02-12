
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorInfo } from './types/form-types';

/**
 * This hook is responsible for loading/updating vendor names when only the ID is available
 */
export function useVendorNameLoader(
  vendorInfo: VendorInfo, 
  setVendorInfo: (info: VendorInfo) => void
) {
  useEffect(() => {
    // If vendor info has an ID but no name or name is 'Unknown Vendor', try to fetch the name
    if (vendorInfo.vendorId && (!vendorInfo.vendorName || vendorInfo.vendorName === "Unknown Vendor")) {
      const fetchVendorName = async () => {
        try {
          console.log("[useVendorNameLoader] Fetching vendor name for ID:", vendorInfo.vendorId);
          const { data, error } = await supabase
            .from('vendors')
            .select('company_name')
            .eq('id', vendorInfo.vendorId)
            .single();
            
          if (error) {
            console.error("[useVendorNameLoader] Error fetching vendor name:", error);
            
            // If we can't get the company name, at least use a generated name based on ID
            setVendorInfo({
              ...vendorInfo,
              vendorName: `Vendor ${vendorInfo.vendorId.substring(0, 8)}`
            });
            return;
          }
          
          if (data && data.company_name) {
            console.log("[useVendorNameLoader] Found vendor name:", data.company_name);
            setVendorInfo({
              ...vendorInfo,
              vendorName: data.company_name
            });
          } else {
            // If company_name is null, use a generated name based on ID
            setVendorInfo({
              ...vendorInfo,
              vendorName: `Vendor ${vendorInfo.vendorId.substring(0, 8)}`
            });
          }
        } catch (err) {
          console.error("[useVendorNameLoader] Error in fetchVendorName:", err);
        }
      };
      
      fetchVendorName();
    }
  }, [vendorInfo, setVendorInfo]);
}
