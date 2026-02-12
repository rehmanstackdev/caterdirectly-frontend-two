
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import ServiceCard from './ServiceCard';
import EmptyServiceState from './EmptyServiceState';
import { useServiceManagement } from '@/hooks/services/use-service-management';
import { Badge } from '@/components/ui/badge';
import MarketplacePagination from '@/components/marketplace/MarketplacePagination';

const ServiceManagement: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    loading,
    filteredServices,
    toggleServiceStatus,
    handleEdit,
    handleView,
    handleDelete,
    handleCreateService,
    handleSubmitForApproval,
    refreshServices,
    vendorIdFromUrl,
    vendorName,
    clearVendorFilter,
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange
  } = useServiceManagement();
  
  // Refresh services when the component mounts
  useEffect(() => {
    // console.log("ServiceManagement: Refreshing services, vendorIdFromUrl:", vendorIdFromUrl);
    refreshServices();
  }, [refreshServices, vendorIdFromUrl]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Services</CardTitle>
          <CardDescription>
            Manage your service listings
            {vendorName && (
              <span className="ml-2">
                - Filtered by vendor: <Badge variant="outline">{vendorName}</Badge>
                <Button
                  variant="ghost" 
                  size="sm" 
                  onClick={clearVendorFilter} 
                  className="ml-2 h-6 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </span>
            )}
          </CardDescription>
        </div>
        {/* <Button 
          onClick={handleCreateService}
          className="bg-[#F07712] hover:bg-[#F07712]/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Service
        </Button> */}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F07712] mb-4"></div>
                <span className="text-gray-600 font-medium">Loading services...</span>
                <span className="text-sm text-gray-400 mt-1">Please wait while we fetch your services</span>
              </div>
            ) : filteredServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onToggle={toggleServiceStatus}
                      onEdit={handleEdit}
                      onView={handleView}
                      onDelete={handleDelete}
                      onSubmit={handleSubmitForApproval}
                      activeTab={activeTab}
                    />
                  ))}
                </div>
                <MarketplacePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  isLoading={loading}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <EmptyServiceState
                activeTab={activeTab}
                onCreateService={handleCreateService}
                vendorName={vendorName}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ServiceManagement;
