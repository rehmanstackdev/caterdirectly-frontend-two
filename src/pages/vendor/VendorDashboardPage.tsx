
import React from "react";
import VendorDashboard from "@/components/vendor/dashboard/VendorDashboard";
import VendorActionButtons from "@/components/vendor/action-buttons/VendorActionButtons"; 
import VendorSalesCommandCenter from "@/components/vendor/dashboard/VendorSalesCommandCenter";
import VendorSalesMetrics from "@/components/vendor/dashboard/VendorSalesMetrics";
import VendorSalesPipeline from "@/components/vendor/dashboard/VendorSalesPipeline";
import VendorCustomerService from "@/components/vendor/dashboard/VendorCustomerService";
import { useVendorData } from "@/hooks/vendor/use-vendor-data";

const VendorDashboardPage = () => {
  const { vendorData } = useVendorData();
  
  return (
    <VendorDashboard activeTab="dashboard">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#F07712]">{vendorData?.companyName || 'Vendor'}</h1>
            <p className="text-gray-600">Drive sales, serve clients, and grow your business</p>
          </div>
          {/* <VendorActionButtons /> */}
        </div>
        
        <div className="space-y-6">
          {/* Sales Command Center */}
          <VendorSalesCommandCenter />
          
          {/* Sales Metrics */}
          <VendorSalesMetrics />
          
          {/* Sales Pipeline and Customer Service */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VendorSalesPipeline />
            <VendorCustomerService />
          </div>
        </div>
      </div>
    </VendorDashboard>
  );
};

export default VendorDashboardPage;
