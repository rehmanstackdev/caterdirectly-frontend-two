
import { useState } from 'react';
import { VendorInfo } from './types/form-types';

export function useVendorInfo() {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({ 
    vendorName: '', 
    vendorId: '' 
  });
  const [isInitialized, setIsInitialized] = useState(false);

  return {
    vendorInfo,
    setVendorInfo,
    isInitialized,
    setIsInitialized
  };
}
