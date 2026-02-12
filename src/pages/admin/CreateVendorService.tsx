
import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import ServiceFormContainer from "@/components/vendor/services/form/ServiceFormContainer";

import { useLocation } from 'react-router-dom';
import { usersService } from '@/services/users.service';

function CreateVendorService() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vendorIdFromUrl = queryParams.get('vendorId') || queryParams.get('vendor');
  const brandIdFromUrl = queryParams.get('brandId');
  
  const [vendorId, setVendorId] = useState<string | null>(vendorIdFromUrl);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch vendor details
  useEffect(() => {
    if (!vendorId) return;
    
    const fetchVendorDetails = async () => {
      setIsLoading(true);
      try {
        const vendor = await usersService.getVendorById(vendorId);
        if (vendor?.businessName) {
          setVendorName(vendor.businessName);
          sessionStorage.setItem('selected_vendor_id', vendorId);
          sessionStorage.setItem('selected_vendor_name', vendor.businessName);
        }
      } catch (error) {
        console.error("Error fetching vendor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendorDetails();
  }, [vendorId]);
  
  if (!vendorId) {
    return (
      <Dashboard userRole="admin" activeTab="vendors">
        <div className="p-6 text-center">
          <p className="text-red-600">Vendor ID is required</p>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard userRole="admin" activeTab="vendors">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Create Service for Vendor</h1>
            {vendorName && (
              <div className="text-sm text-gray-500 mt-1">
                Vendor: {vendorName}
              </div>
            )}
          </div>
        </div>
        
        <ServiceFormContainer 
          mode="create" 
          adminContext={true}
          vendorId={vendorId}
          initialBrandId={brandIdFromUrl}
        />
      </div>
    </Dashboard>
  );
}

export default CreateVendorService;
