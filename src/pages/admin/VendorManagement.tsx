import Dashboard from "@/components/dashboard/Dashboard";
import { VendorTableHeader } from "@/components/admin/vendors/VendorTableHeader";
import { VendorTable } from "@/components/admin/vendors/VendorTable";
import { useVendorManagement } from "@/hooks/admin/vendors/use-vendor-management";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { useBackendVendors } from "@/hooks/admin/use-backend-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

function BackendVendorsSection() {
  const { data: backendVendors, isLoading, error } = useBackendVendors();

  if (isLoading) return <div>Loading backend vendors...</div>;
  if (error) return <div className="text-red-500">Error loading backend vendors: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend Vendors ({backendVendors?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {backendVendors?.map((vendor) => (
            <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                //<div className="font-medium">{vendor.firstName} {vendor.lastName}</div>
                <div className="text-sm text-gray-600">{vendor.email}</div>
                {vendor.vendor && (
                  <div className="text-sm text-gray-500">
                    Business: {vendor.vendor.businessName} | Status: 
                    <Badge variant={vendor.vendor.status === 'approved' ? 'default' : vendor.vendor.status === 'pending' ? 'secondary' : 'destructive'}>
                      {vendor.vendor.status}
                    </Badge>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VendorManagement() {
  const { hasPageAccess, loading: permLoading } = useAdminPermissions();
  const {
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
    navigate
  } = useVendorManagement();

  if (permLoading) {
    return (
      <Dashboard userRole="admin" activeTab="vendors">
        <div>Loading permissions...</div>
      </Dashboard>
    );
  }

  if (!hasPageAccess('vendors')) {
    return (
      <Dashboard userRole="admin" activeTab="vendors">
        <AccessDenied />
      </Dashboard>
    );
  }
  
  return (
    <Dashboard userRole="admin" activeTab="vendors">
      <div className="space-y-6">
        <VendorTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          createNewVendor={createNewVendor}
        />


        
        <VendorTable
          loading={loading}
          filteredVendors={filteredVendors}
          toggleManagedStatus={toggleManagedStatus}
          updateVendorStatus={updateVendorStatus}
          updateCommissionRate={updateCommissionRate}
          deleteVendor={deleteVendor}
          viewVendorServices={viewVendorServices}
          navigate={navigate}
        />
      </div>
    </Dashboard>
  );
}

export default VendorManagement;
