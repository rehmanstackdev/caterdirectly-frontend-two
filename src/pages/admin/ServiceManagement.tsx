
import { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBag, Search, CheckCircle, XCircle, MoreHorizontal, Plus, X, Eye, Edit, MenuSquare } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ServiceItem, ServiceStatus } from "@/types/service-types";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ServiceImage from "@/components/shared/ServiceImage";
import { getDisplayPrice, getServiceTypeLabel } from "@/utils/service-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersService, BackendVendor } from "@/services/users.service";
import ServicesService from "@/services/api/services.Service";
import GetService from "@/services/api/admin/service.Service";

function ServiceManagement() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // Support both 'vendorId' and 'vendor' query parameters for backward compatibility
  const vendorIdFromUrl = queryParams.get('vendorId') || queryParams.get('vendor');
  const navigate = useNavigate();
  
  // State for vendor details fetched from API
  const [vendorDetails, setVendorDetails] = useState<BackendVendor | null>(null);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  
  // Fetch vendor details when vendorId is present in URL
  useEffect(() => {
    if (!vendorIdFromUrl) {
      setVendorDetails(null);
      return;
    }

    const fetchVendorDetails = async () => {
      setIsLoadingVendor(true);
      try {
        const vendor = await usersService.getVendorById(vendorIdFromUrl);
        setVendorDetails(vendor);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
        toast.error("Failed to load vendor details");
        setVendorDetails(null);
      } finally {
        setIsLoadingVendor(false);
      }
    };

    fetchVendorDetails();
  }, [vendorIdFromUrl]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStatus = params.get('status') || 'all';
    const valid = ["all", "approved", "pending_approval", "rejected", "draft"];
    return (valid.includes(urlStatus) ? urlStatus : 'all') as ServiceStatus | 'all';
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Map frontend status to backend status format
  const getBackendStatus = (frontendStatus: ServiceStatus | "all"): 'pending' | 'drafted' | 'approved' | 'rejected' | undefined => {
    switch (frontendStatus) {
      case 'pending_approval': return 'pending';
      case 'draft': return 'drafted';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'all': return undefined;
      default: return undefined;
    }
  };

  const backendStatus = getBackendStatus(statusFilter);

  // Transform backend service data to match frontend ServiceItem interface
  const transformBackendService = (service: any): ServiceItem => {
    // Extract vendor name
    let vendorName = 'Unknown Vendor';
    if (service.vendor?.businessName) {
      vendorName = service.vendor.businessName;
    } else if (service.createdBy) {
      const { firstName, lastName } = service.createdBy;
      if (firstName && lastName) {
        vendorName = `${firstName} ${lastName}`;
      } else if (firstName || lastName) {
        vendorName = firstName || lastName;
      }
    }

    // Map backend status to frontend status
    const mapStatus = (backendStatus: string) => {
      switch (backendStatus) {
        case 'approved': return 'approved';
        case 'rejected': return 'rejected';
        case 'drafted': return 'draft';
        case 'pending': return 'pending_approval';
        default: return 'pending_approval';
      }
    };

    const isActive = service.status === 'approved' && service.visibleStatus === 'active';

    return {
      id: service.id,
      name: service.serviceName,
      type: service.serviceType,
      serviceType: service.serviceType,
      status: mapStatus(service.status),
      active: isActive,
      vendorName,
      vendor_id: service.vendor?.id || service.vendorId,
      price: service.catering?.minimumOrderAmount ? `$${service.catering.minimumOrderAmount}` :
             service.venue?.price ? `$${service.venue.price}` :
             service.partyRental?.price ? `$${service.partyRental.price}` :
             service.eventStaff?.price ? `$${service.eventStaff.price}` : 'Contact for pricing',
      image: service.catering?.menuPhoto ||
             service.venue?.serviceImage ||
             service.partyRental?.serviceImage ||
             service.eventStaff?.serviceImage ||
             (service.catering?.menuItems?.[0]?.imageUrl) || '',
      description: service.description || '',
      isManaged: service.manage ||
                 service.catering?.manage ||
                 service.venue?.manage ||
                 service.partyRental?.manage ||
                 service.eventStaff?.manage ||
                 false,
      service_details: {
        ...service.catering,
        ...service.venue,
        ...service.partyRental,
        ...service.eventStaff,
        ...(service.createdBy && { createdBy: service.createdBy }),
        ...(service.vendor && { vendor: service.vendor })
      },
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };
  };

  // State for services data
  const [allServicesFromQuery, setAllServicesFromQuery] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, vendorIdFromUrl]);

  // Fetch services on status filter or page change
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        let response;
        if (vendorIdFromUrl) {
          const filters = backendStatus ? { status: backendStatus } : undefined;
          response = await ServicesService.getServicesByVendor(vendorIdFromUrl, filters);
        } else {
          response = await GetService.getAllServices(backendStatus, currentPage, itemsPerPage);
        }

        // Handle nested data structure
        // Response structure: { status, response, message, data: { data: [...], pagination: {...} } }
        const responseData = response?.data;
        const servicesData = responseData?.data || response?.data || response;
        const paginationData = responseData?.pagination;

        const transformedServices = Array.isArray(servicesData) ? servicesData.map(transformBackendService) : [];
        setAllServicesFromQuery(transformedServices);

        // Set total items and pages from pagination metadata
        if (paginationData?.totalItems) {
          setTotalItems(paginationData.totalItems);
          setTotalPages(paginationData.totalPages || Math.ceil(paginationData.totalItems / itemsPerPage));
        } else if (responseData?.total) {
          setTotalItems(responseData.total);
          setTotalPages(Math.ceil(responseData.total / itemsPerPage));
        } else if (Array.isArray(servicesData)) {
          setTotalItems(servicesData.length);
          setTotalPages(Math.ceil(servicesData.length / itemsPerPage));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
        setAllServicesFromQuery([]);
        // Don't reset totalItems on error to keep pagination visible
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [statusFilter, vendorIdFromUrl, currentPage, itemsPerPage, backendStatus]);

  const { hasPermission } = useAdminPermissions();

  // Use loading state from services hook or vendor loading
  const loading = servicesLoading || isLoadingVendor;
  const hasShownVendorToast = useRef(false);

  // Filter services by search query only (status filtering is done at API level)
  const filteredServices = useMemo(() => {
    if (!allServicesFromQuery || !Array.isArray(allServicesFromQuery)) {
      return [];
    }

    let filtered = [...allServicesFromQuery];

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allServicesFromQuery, searchQuery]);

  // Separate useEffect for toast notification
  useEffect(() => {
    if (vendorIdFromUrl && filteredServices.length === 0 && !loading && !hasShownVendorToast.current) {
      hasShownVendorToast.current = true;
      const vendorName = vendorDetails?.vendor?.businessName || vendorDetails?.businessName || 'this vendor';
    }
    
    if (!vendorIdFromUrl) {
      hasShownVendorToast.current = false;
    }
  }, [vendorIdFromUrl, filteredServices.length, loading, vendorDetails]);


  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Skip on initial mount since statusFilter is already initialized from URL
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const params = new URLSearchParams(location.search);
    if (statusFilter === 'all') {
      params.delete('status');
    } else {
      params.set('status', statusFilter);
    }
    navigate({ pathname: '/admin/services', search: params.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);


  const refreshServicesList = async () => {
    setServicesLoading(true);
    try {
      let response: any;
      if (vendorIdFromUrl) {
        const filters = backendStatus ? { status: backendStatus } : undefined;
        response = await ServicesService.getServicesByVendor(vendorIdFromUrl, filters);
      } else {
        response = await GetService.getAllServices(backendStatus, currentPage, itemsPerPage);
      }

      const responseData = response?.data;
      const servicesData = responseData?.data || response?.data || response;
      const paginationData = responseData?.pagination;

      const transformedServices = Array.isArray(servicesData) ? servicesData.map(transformBackendService) : [];
      setAllServicesFromQuery(transformedServices);

      if (paginationData?.totalItems) {
        setTotalItems(paginationData.totalItems);
        setTotalPages(paginationData.totalPages || Math.ceil(paginationData.totalItems / itemsPerPage));
      } else if (responseData?.total) {
        setTotalItems(responseData.total);
        setTotalPages(Math.ceil(responseData.total / itemsPerPage));
      } else if (Array.isArray(servicesData)) {
        setTotalItems(servicesData.length);
        setTotalPages(Math.ceil(servicesData.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to refresh services");
    } finally {
      setServicesLoading(false);
    }
  };

  const handleApproveService = async (id: string) => {
    if (!hasPermission('services', 'approve')) {
      toast.error("You don't have permission to approve services.");
      return;
    }

    try {
      await ServicesService.updateServiceStatus(id, 'approved');
      toast.success('Service approved successfully');
      await refreshServicesList();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to approve service';
      toast.error(message);
    }
  };

  const handleRejectService = async (id: string) => {
    if (!hasPermission('services', 'approve')) {
      toast.error("You don't have permission to reject services.");
      return;
    }

    try {
      await ServicesService.updateServiceStatus(id, 'rejected');
      toast.success('Service rejected successfully');
      await refreshServicesList();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to reject service';
      toast.error(message);
    }
  };

  const handleToggleManagedStatus = async (id: string) => {
    if (!hasPermission('services', 'manage')) {
      toast.error("You don't have permission to change service management status.");
      return;
    }

    // Find the service in our local filtered list to get current managed status
    const service = filteredServices.find(s => s.id === id);
    if (!service) {
      toast.error("Service not found");
      return;
    }

    try {
      await ServicesService.updateServiceManage(id, !service.isManaged);
      toast.success('Managed status updated successfully');
      await refreshServicesList();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update managed status';
      toast.error(message);
    }
  };

  // Add a function to clear the vendor filter - use standardized parameter naming
  const clearVendorFilter = () => {
    navigate('/admin/services');
  };

  // When redirecting to create service, use standardized parameter naming
  const createNewService = () => {
    if (!hasPermission('services', 'manage')) {
      toast.error("You don't have permission to create services.");
      return;
    }
    
    // If in vendor-filtered view, create a service for that vendor
    // Use standardized parameter naming
    if (vendorIdFromUrl) {
      navigate(`/admin/create-vendor-service?vendorId=${vendorIdFromUrl}`);
    } else {
      navigate(`/admin/create-vendor-service`);
    }
  };
  
  // Get vendor name for display
  const vendorName = vendorDetails?.vendor?.businessName || vendorDetails?.businessName || null;

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
    }
  };

  // Function to check if a catering service has a menu image
  const hasMenuImage = (service: ServiceItem) => {
    if (!service || service.type !== 'catering') return false;
    
    // Check all possible locations for menu images
    if (service.service_details) {
      // Direct path
      if (service.service_details.menuImage) {
        console.log('Found menu image at service_details.menuImage:', service.service_details.menuImage);
        return true;
      }
      
      // Nested in catering object
      if (service.service_details.catering && service.service_details.catering.menuImage) {
        console.log('Found menu image at service_details.catering.menuImage:', service.service_details.catering.menuImage);
        return true;
      }
      
      // Check if it might be in menu array
      if (service.service_details.menu && Array.isArray(service.service_details.menu)) {
        const hasMenuWithImage = service.service_details.menu.some(item => item && item.image);
        if (hasMenuWithImage) {
          console.log('Found menu image in menu array');
          return true;
        }
      }
    }
    
    return false;
  };

  // Function to get the menu image URL from a service
  const getMenuImageUrl = (service: ServiceItem): string | null => {
    if (!service || service.type !== 'catering' || !service.service_details) {
      return null;
    }
    
    // Try different possible locations for the menu image
    if (service.service_details.menuImage) {
      console.log('Using menuImage from service_details.menuImage');
      return service.service_details.menuImage;
    }
    
    if (service.service_details.catering && service.service_details.catering.menuImage) {
      console.log('Using menuImage from service_details.catering.menuImage');
      return service.service_details.catering.menuImage;
    }
    
    // Check for first menu item with an image
    if (service.service_details.menu && Array.isArray(service.service_details.menu)) {
      const menuItemWithImage = service.service_details.menu.find(item => item && item.image);
      if (menuItemWithImage) {
        console.log('Using image from first menu item');
        return menuItemWithImage.image;
      }
    }
    
    console.log('No menu image found for service:', service.id);
    return null;
  };

  return (
    <Dashboard userRole="admin" activeTab="services">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Service Management</h1>
            {vendorIdFromUrl && (
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">
                  {vendorName ? (
                    <>Filtering by vendor: <span className="font-medium">{vendorName}</span></>
                  ) : (
                    <>Filtering by vendor ID: {vendorIdFromUrl}</>
                  )}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearVendorFilter}
                  className="ml-2 h-6 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {/* {hasPermission('services', 'manage') && (
            <Button onClick={createNewService}>
              <Plus className="mr-2 h-4 w-4" />
              Create Service
            </Button>
          )} */}
        </div>

          <div className="w-full">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ServiceStatus | "all")}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending_approval">Pending Approval</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
        </div>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Managed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading || servicesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 animate-pulse"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {(!allServicesFromQuery || allServicesFromQuery.length === 0) ? (
                        <div>
                          <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p>No services available on the platform yet.</p>
                          {/* {vendorFilter && (
                            <Button
                              onClick={createNewService}
                              variant="outline"
                              className="mt-4"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create First Service for This Vendor
                            </Button>
                          )} */}
                        </div>
                      ) : (
                        <p>No services match your filters. Try adjusting your search.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md overflow-hidden relative flex-shrink-0">
                            <ServiceImage
                              src={service.image}
                              alt={service.name}
                              className="h-full w-full object-cover"
                              imageId={`service-thumb-${service.id}`}
                            />
                            
                            {/* Menu image indicator for catering services */}
                            {hasMenuImage(service) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="absolute bottom-0 right-0 bg-white rounded-tl-md p-0.5 shadow-sm">
                                      <MenuSquare className="h-3.5 w-3.5 text-[#F07712]" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent align="center" side="right" sideOffset={5} className="p-0 overflow-hidden w-64 rounded-md">
                                    <div className="p-1 flex flex-col items-center">
                                      <div className="w-full h-40 mb-1">
                                        <ServiceImage 
                                          src={getMenuImageUrl(service)} 
                                          alt={`Menu for ${service.name}`}
                                          className="rounded-t-sm"
                                          imageId={`menu-${service.id}`}
                                          showLoadingPlaceholder={true}
                                        />
                                      </div>
                                      <p className="text-xs py-1 px-2 text-center w-full bg-gray-50 border-t">
                                        Menu photo
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <button 
                            onClick={() => navigate(`/admin/services/${service.id}`)}
                            className="truncate max-w-[150px] text-left underline-offset-2 hover:underline"
                          >
                            {service.name}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>{service.vendorName}</TableCell>
                      <TableCell>{getServiceTypeLabel(service.type)}</TableCell>
                      <TableCell>{getDisplayPrice(service)}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(service.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {service.isManaged ? (
                          <CheckCircle className="inline-block h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="inline-block h-5 w-5 text-gray-300" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleToggleManagedStatus(service.id)}
                              disabled={!hasPermission('services', 'manage')}
                            >
                              {service.isManaged ? "Remove Managed Status" : "Mark as Managed"}
                            </DropdownMenuItem>
                            
                            {service.status === 'pending_approval' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleApproveService(service.id)}
                                  disabled={!hasPermission('services', 'approve')}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Approve Service
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRejectService(service.id)}
                                  disabled={!hasPermission('services', 'approve')}
                                >
                                  <X className="mr-2 h-4 w-4 text-red-600" />
                                  Reject Service
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuItem onClick={() => navigate(`/admin/services/${service.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Service Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => navigate(`/admin/services/edit/${service.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Service
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {servicesLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> services
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {servicesLoading ? (
                  <>
                    {/* Skeleton for pagination buttons */}
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to first page</span>
                      &laquo;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push(1);

                          if (currentPage > 3) {
                            pages.push('...');
                          }

                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            if (!pages.includes(i)) {
                              pages.push(i);
                            }
                          }

                          if (currentPage < totalPages - 2) {
                            pages.push('...');
                          }

                          if (!pages.includes(totalPages)) {
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((page, index) =>
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page as number)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          )
                        );
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to last page</span>
                      &raquo;
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Dashboard>
  );
}

export default ServiceManagement;
