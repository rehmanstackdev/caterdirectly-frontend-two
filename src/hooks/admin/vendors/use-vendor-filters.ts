
import { useState, useMemo } from 'react';
import { VendorFilters } from './types';

export function useVendorFilters(vendors: any[]) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => 
    vendors.filter(vendor => 
      vendor.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [vendors, searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredVendors
  };
}
