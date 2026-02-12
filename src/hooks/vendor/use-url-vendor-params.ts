
import { useState, useEffect } from 'react';

/**
 * Custom hook to extract and validate vendor ID from URL parameters
 */
export function useUrlVendorParams() {
  const [vendorIdParam, setVendorIdParam] = useState<string | null>(null);
  const [sourcesChecked, setSourcesChecked] = useState(false);
  
  useEffect(() => {
    if (sourcesChecked) return;

    const queryParams = new URLSearchParams(window.location.search);
    
    // Check session storage first for persistent value
    const sessionVendorId = sessionStorage.getItem('selected_vendor_id');
    
    // Get vendor ID from URL params or query string as fallback
    const urlVendorId = queryParams.get('vendorId') || 
                        queryParams.get('vendor');
    
    // Use session storage value if available, otherwise use URL param
    // This prioritizes the persistent session storage value
    const effectiveVendorId = sessionVendorId || urlVendorId;
    
    // Log early to debug vendor ID tracking
    console.log('[useUrlVendorParams] Sources:', {
      fromQueryParamVendorId: queryParams.get('vendorId'),
      fromQueryParamVendor: queryParams.get('vendor'),
      fromSession: sessionVendorId,
      effective: effectiveVendorId
    });

    // If we have a vendor ID from URL but not in session, store it
    if (urlVendorId && !sessionVendorId) {
      console.log('[useUrlVendorParams] Storing URL vendor ID in session:', urlVendorId);
      sessionStorage.setItem('selected_vendor_id', urlVendorId);
    }
    
    setVendorIdParam(effectiveVendorId);
    setSourcesChecked(true);
  }, [sourcesChecked]);

  return { vendorIdParam, sourcesChecked };
}
