
import { useVendorsData } from './use-vendors-data';
import { useVendorFilters } from './use-vendor-filters';
import { useVendorActions } from './use-vendor-actions';
import { useVendorNavigation } from './use-vendor-navigation';

export function useVendorManagement() {
  const { vendors, loading, setVendors } = useVendorsData();
  const { searchQuery, setSearchQuery, filteredVendors } = useVendorFilters(vendors);
  const { toggleManagedStatus, updateVendorStatus, updateCommissionRate, deleteVendor, navigate } = useVendorActions(setVendors, vendors);
  const { createNewVendor, viewVendorServices, viewVendorProfile } = useVendorNavigation();

  return {
    vendors: filteredVendors,
    loading,
    searchQuery,
    setSearchQuery,
    toggleManagedStatus,
    updateVendorStatus,
    updateCommissionRate,
    deleteVendor,
    createNewVendor,
    viewVendorServices,
    viewVendorProfile,
    navigate
  };
}
