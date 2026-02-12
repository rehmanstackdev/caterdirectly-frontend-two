
import { useNavigate } from 'react-router-dom';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { toast } from 'sonner';
import vendorsService from '@/services/api/admin/vendors.Service';
import { VendorStatus } from './types';

export function useVendorActions(setVendors: (updater: (prev: any[]) => any[]) => void, vendors: any[]) {
  const { hasPermission } = useAdminPermissions();
  const navigate = useNavigate();

  // Update vendor managed status (placeholder - not implemented in backend yet)
  const toggleManagedStatus = async (vendorId: string) => {
    toast.error("Managed status toggle is not implemented yet");
  };

  // Update vendor approval status
  const updateVendorStatus = async (vendorId: string, status: VendorStatus) => {
    if (!hasPermission('vendors', 'approve')) {
      toast.error("You don't have permission to approve vendors");
      return;
    }

    try {
      const result = await vendorsService.updateVendorStatus(vendorId, status);
      
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status }
            : vendor
        )
      );

      toast.success(result.message || `Vendor status updated to ${status}`);
    } catch (error: any) {
      console.error("Error updating vendor status:", error);
      const errorMessage = error.response?.data?.message || "Failed to update vendor status";
      toast.error(errorMessage);
    }
  };



  // Update vendor commission rate
  const updateCommissionRate = async (vendorId: string, rate: number) => {
    if (!hasPermission('vendors', 'update')) {
      toast.error("You don't have permission to update vendor commission rate");
      return;
    }

    try {
      const result = await vendorsService.updateCommissionRate(vendorId, rate);
      
      // Store percentage value (rate is already in percentage format from frontend)
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, commission_rate: rate, commissionRate: rate }
            : vendor
        )
      );

      toast.success(result.message || `Commission rate updated to ${rate}%`);
    } catch (error: any) {
      console.error("Error updating commission rate:", error);
      const errorMessage = error.response?.data?.message || "Failed to update commission rate";
      toast.error(errorMessage);
    }
  };

  // Delete vendor functionality
  const deleteVendor = async (vendorId: string, deleteServices: boolean = false) => {
    if (!hasPermission('vendors', 'delete')) {
      toast.error("You don't have permission to delete vendors");
      return;
    }

    try {
      // Find the vendor to get the user ID
      const vendorToDelete = vendors.find(v => v.id === vendorId);
      if (!vendorToDelete || !vendorToDelete.userId) {
        throw new Error('Vendor user ID not found');
      }

      const result = await vendorsService.deleteVendor(vendorToDelete.userId);
      
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));

      toast.success("Vendor deleted successfully");
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete vendor";
      toast.error(errorMessage);
    }
  };
  
  return {
    toggleManagedStatus,
    updateVendorStatus,
    updateCommissionRate,
    deleteVendor,
    navigate
  };
}
